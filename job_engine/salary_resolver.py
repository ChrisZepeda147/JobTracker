"""Fetch job posting pages and extract compensation when boards omit it."""

from __future__ import annotations

import json
import logging
import re
import time
from typing import Any

from job_engine.normalizer import annualize_salary, extract_salary_from_text, strip_html

logger = logging.getLogger("job_engine.salary_resolver")

try:
    from curl_cffi import requests as cffi_requests

    HAS_CURL_CFFI = True
except ImportError:
    cffi_requests = None  # type: ignore[assignment,misc]
    HAS_CURL_CFFI = False

try:
    import requests as std_requests
except ImportError:
    std_requests = None  # type: ignore[assignment]

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None  # type: ignore[assignment,misc]

_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)
_MAX_HTML_BYTES = 1_500_000
from job_engine.posting_fetch import fetch_posting_html as _fetch_posting_html
from job_engine.posting_fetch import set_fetch_budget as _set_fetch_budget


def set_fetch_budget(limit: int | None) -> None:
    """Limit posting fetches per worker run (None = unlimited for backfill)."""
    _set_fetch_budget(limit)


def fetch_posting_html(url: str, *, timeout: float = 18.0) -> str | None:
    """Download a job posting page for salary extraction."""
    return _fetch_posting_html(url, timeout=timeout)


def _parse_json_ld_salary(node: Any) -> tuple[float | None, float | None]:
    if isinstance(node, list):
        for item in node:
            found = _parse_json_ld_salary(item)
            if found[0] is not None or found[1] is not None:
                return found
        return None, None

    if not isinstance(node, dict):
        return None, None

    node_type = node.get("@type")
    types: list[str] = []
    if isinstance(node_type, str):
        types = [node_type]
    elif isinstance(node_type, list):
        types = [str(t) for t in node_type]

    if any("JobPosting" in t for t in types):
        base = node.get("baseSalary")
        if isinstance(base, dict):
            unit = str(base.get("unitText") or "").strip()
            value = base.get("value")
            if isinstance(value, dict):
                lo = value.get("minValue")
                hi = value.get("maxValue") or value.get("value")
                salary_min = annualize_salary(_safe_float(lo), unit)
                salary_max = annualize_salary(_safe_float(hi), unit)
                if salary_min or salary_max:
                    return salary_min, salary_max
            amount = _safe_float(base.get("value"))
            if amount:
                annual = annualize_salary(amount, unit)
                return annual, annual

    for value in node.values():
        if isinstance(value, (dict, list)):
            found = _parse_json_ld_salary(value)
            if found[0] is not None or found[1] is not None:
                return found
    return None, None


def _safe_float(value: Any) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


_PLAUSIBLE_SALARY_MIN = 25_000.0
_PLAUSIBLE_SALARY_MAX = 400_000.0


def _sanitize_salary_range(
    salary_min: float | None,
    salary_max: float | None,
) -> tuple[float | None, float | None]:
    """Drop values outside a plausible US annual compensation band."""
    lo = salary_min
    hi = salary_max
    if lo is not None and (lo < _PLAUSIBLE_SALARY_MIN or lo > _PLAUSIBLE_SALARY_MAX):
        lo = None
    if hi is not None and (hi < _PLAUSIBLE_SALARY_MIN or hi > _PLAUSIBLE_SALARY_MAX):
        hi = None
    if lo is None and hi is None:
        return None, None
    return lo, hi


def _extract_linkedin_embedded_salary(html: str) -> tuple[float | None, float | None]:
    """LinkedIn salaryInsights blocks when present (ignore generic minValue/maxValue noise)."""
    match = re.search(
        r'"minSalary"\s*:\s*(?P<min>[\d.]+)[\s\S]{0,800}?"maxSalary"\s*:\s*(?P<max>[\d.]+)',
        html,
    )
    if not match:
        return None, None
    salary_min = annualize_salary(_safe_float(match.group("min")), "YEAR")
    salary_max = annualize_salary(_safe_float(match.group("max")), "YEAR")
    return _sanitize_salary_range(salary_min, salary_max)


def extract_salary_from_html(html: str) -> tuple[float | None, float | None]:
    """Extract annual salary from posting HTML (JSON-LD, meta, visible text)."""
    if not html:
        return None, None

    linkedin_salary = _extract_linkedin_embedded_salary(html)
    if linkedin_salary[0] is not None or linkedin_salary[1] is not None:
        return linkedin_salary

    if BeautifulSoup is not None:
        soup = BeautifulSoup(html, "html.parser")
        for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
            raw = script.string or script.get_text() or ""
            if not raw.strip():
                continue
            try:
                payload = json.loads(raw)
            except json.JSONDecodeError:
                continue
            salary_min, salary_max = _sanitize_salary_range(*_parse_json_ld_salary(payload))
            if salary_min is not None or salary_max is not None:
                return salary_min, salary_max

        for meta in soup.find_all("meta"):
            prop = (meta.get("property") or meta.get("name") or "").lower()
            content = meta.get("content") or ""
            if "salary" in prop or "compensation" in prop:
                salary_min, salary_max = _sanitize_salary_range(*extract_salary_from_text(content))
                if salary_min is not None or salary_max is not None:
                    return salary_min, salary_max

        text = soup.get_text("\n", strip=True)
    else:
        text = strip_html(html)
        for match in re.finditer(
            r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>([\s\S]*?)</script>',
            html,
            re.IGNORECASE,
        ):
            try:
                payload = json.loads(match.group(1))
            except json.JSONDecodeError:
                continue
            salary_min, salary_max = _sanitize_salary_range(*_parse_json_ld_salary(payload))
            if salary_min is not None or salary_max is not None:
                return salary_min, salary_max

    return _sanitize_salary_range(*extract_salary_from_text(text))

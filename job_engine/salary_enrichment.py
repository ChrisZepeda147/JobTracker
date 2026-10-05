"""Fetch posting pages and enrich jobs with compensation before salary filtering."""

from __future__ import annotations

import logging
import re
from typing import Any
from urllib.parse import unquote

from job_engine.models import RawJob
from job_engine.normalizer import extract_salary_from_text, strip_tracking_params
from job_engine.salary_resolver import (
    _sanitize_salary_range,
    extract_salary_from_html,
    fetch_posting_html,
)

logger = logging.getLogger("job_engine.salary_enrichment")

# LinkedIn header formats: $163.8K/yr - $306K/yr or $163,800.00/yr - $306,000.00/yr
_LINKEDIN_K_YR_RANGE = re.compile(
    r"\$?\s*(?P<min>\d[\d,]*(?:\.\d+)?)\s*[kK]\s*/?\s*yr"
    r"\s*[-–—]\s*"
    r"\$?\s*(?P<max>\d[\d,]*(?:\.\d+)?)\s*[kK]\s*/?\s*yr",
    re.IGNORECASE,
)
_LINKEDIN_FULL_YR_RANGE = re.compile(
    r"\$\s*(?P<min>\d{1,3}(?:,\d{3})+(?:\.\d+)?)\s*/?\s*yr"
    r"\s*[-–—]\s*"
    r"\$\s*(?P<max>\d{1,3}(?:,\d{3})+(?:\.\d+)?)\s*/?\s*yr",
    re.IGNORECASE,
)
_LINKEDIN_PER_YEAR_RANGE = re.compile(
    r"\$\s*(?P<min>\d{1,3}(?:,\d{3})+(?:\.\d+)?)\s*[-–—]\s*"
    r"\$\s*(?P<max>\d{1,3}(?:,\d{3})+(?:\.\d+)?)\s*per\s+year",
    re.IGNORECASE,
)
_COMPENSATION_BLOCK = re.compile(
    r"provided pay range[\s\S]{0,2500}?(?P<body>[\s\S]{0,1200})",
    re.IGNORECASE,
)
_LINKEDIN_K_YR_SINGLE = re.compile(
    r"\$?\s*(?P<value>[\d,]+(?:\.\d+)?)\s*[kK]\s*/?\s*yr",
    re.IGNORECASE,
)
# Embedded JSON compensation (annual dollars, not monthly noise)
_LINKEDIN_JSON_RANGE = re.compile(
    r'"(?:minSalary|minimumSalary|salaryMin|compensationMin)"\s*:\s*(?P<min>[\d.]+)'
    r'[\s\S]{0,400}?'
    r'"(?:maxSalary|maximumSalary|salaryMax|compensationMax)"\s*:\s*(?P<max>[\d.]+)',
    re.IGNORECASE,
)
_APPLY_URL_PATTERNS = (
    re.compile(r'"externalApply(?:Url|Link)"\s*:\s*"(?P<url>https?:[^"]+)"', re.I),
    re.compile(r'"companyApplyUrl"\s*:\s*"(?P<url>https?:[^"]+)"', re.I),
    re.compile(r'"applyUrl"\s*:\s*"(?P<url>https?:[^"]+)"', re.I),
    re.compile(r'"directApplyUrl"\s*:\s*"(?P<url>https?:[^"]+)"', re.I),
)

# url -> (salary_min, salary_max, page_checked)
_salary_cache: dict[str, tuple[float | None, float | None, bool]] = {}


def clear_salary_cache() -> None:
    """Clear in-memory posting salary cache (tests)."""
    _salary_cache.clear()


def _parse_k_token(raw: str | None) -> float | None:
    if not raw:
        return None
    text = str(raw).strip().replace(",", "")
    try:
        return float(text) * 1000.0
    except ValueError:
        return None


def _parse_dollar_token(raw: str | None) -> float | None:
    if not raw:
        return None
    text = str(raw).strip().replace(",", "").replace("$", "")
    try:
        return float(text)
    except ValueError:
        return None


def _annual_from_json_amount(value: float) -> float:
    """Values under 10k are likely monthly; otherwise treat as annual."""
    if value < 10_000:
        return value * 12.0
    return value


_LOOSE_ANNUAL_RANGE = re.compile(
    r"\$\s*(?P<min>\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d{2,3}(?:\.\d+)?[kK]?)"
    r"\s*[-–—]\s*"
    r"\$\s*(?P<max>\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d{2,3}(?:\.\d+)?[kK]?)"
    r"(?:\s*(?:per\s+year|/yr|annually|a\s+year))?",
    re.IGNORECASE,
)


def extract_compensation_from_text(text: str | None) -> tuple[float | None, float | None]:
    """Parse salary from posting body text (LinkedIn formats, pay lines, generic hints)."""
    if not text or not text.strip():
        return None, None

    linkedin = extract_linkedin_salary(text)
    if linkedin[0] is not None or linkedin[1] is not None:
        return linkedin

    general = extract_salary_from_text(text)
    if general[0] is not None or general[1] is not None:
        return _sanitize_salary_range(general[0], general[1])

    match = _LOOSE_ANNUAL_RANGE.search(text)
    if match:

        def token(raw: str) -> float | None:
            cleaned = raw.replace("$", "").strip()
            if not cleaned:
                return None
            if cleaned.lower().endswith("k") or "k" in cleaned.lower():
                return _parse_k_token(cleaned.rstrip("kK"))
            return _parse_dollar_token(cleaned)

        return _sanitize_salary_range(token(match.group("min")), token(match.group("max")))

    return None, None


def extract_linkedin_salary(text: str) -> tuple[float | None, float | None]:
    """Parse LinkedIn-specific compensation strings and embedded JSON."""
    if not text:
        return None, None

    for pattern, parser in (
        (_LINKEDIN_FULL_YR_RANGE, _parse_dollar_token),
        (_LINKEDIN_PER_YEAR_RANGE, _parse_dollar_token),
        (_LINKEDIN_K_YR_RANGE, _parse_k_token),
    ):
        match = pattern.search(text)
        if match:
            return _sanitize_salary_range(
                parser(match.group("min")),
                parser(match.group("max")),
            )

    json_match = _LINKEDIN_JSON_RANGE.search(text)
    if json_match:
        lo = _annual_from_json_amount(float(json_match.group("min")))
        hi = _annual_from_json_amount(float(json_match.group("max")))
        return _sanitize_salary_range(lo, hi)

    singles = list(_LINKEDIN_K_YR_SINGLE.finditer(text))
    if len(singles) >= 2:
        lo = _parse_k_token(singles[0].group("value"))
        hi = _parse_k_token(singles[1].group("value"))
        return _sanitize_salary_range(lo, hi)
    if len(singles) == 1:
        val = _parse_k_token(singles[0].group("value"))
        return _sanitize_salary_range(val, val)

    return None, None


def _linkedin_compensation_text(html: str) -> str:
    """Prefer the visible pay-range block over full-page text (avoids ID noise)."""
    block = _COMPENSATION_BLOCK.search(html)
    if block is not None:
        return block.group("body")
    return ""


def extract_salary_from_page(html: str, *, site: str = "") -> tuple[float | None, float | None]:
    """Extract annual salary from HTML using board-specific and generic parsers."""
    if not html:
        return None, None

    is_linkedin = "linkedin" in site.lower() or "linkedin.com" in html[:5000].lower()

    if is_linkedin:
        compensation_html = _linkedin_compensation_text(html)
        if compensation_html:
            linkedin = extract_linkedin_salary(compensation_html)
            if linkedin[0] is not None or linkedin[1] is not None:
                return linkedin

        linkedin = extract_linkedin_salary(html)
        if linkedin[0] is not None or linkedin[1] is not None:
            return linkedin

    found = extract_salary_from_html(html)
    if found[0] is not None or found[1] is not None:
        return found

    soup_cls = _optional_soup()
    if soup_cls is not None:
        text = soup_cls(html, "html.parser").get_text("\n", strip=True)
    else:
        from job_engine.normalizer import strip_html

        text = strip_html(html)

    if is_linkedin:
        compensation_text = _linkedin_compensation_text(text)
        if compensation_text:
            linkedin = extract_linkedin_salary(compensation_text)
            if linkedin[0] is not None or linkedin[1] is not None:
                return linkedin

        linkedin = extract_linkedin_salary(text)
        if linkedin[0] is not None or linkedin[1] is not None:
            return linkedin
        return None, None

    linkedin = extract_linkedin_salary(text)
    if linkedin[0] is not None or linkedin[1] is not None:
        return linkedin

    return _sanitize_salary_range(*extract_salary_from_text(text))


def _optional_soup():
    try:
        from bs4 import BeautifulSoup

        return BeautifulSoup
    except ImportError:
        return None


def _decode_json_url(raw: str) -> str:
    cleaned = raw.replace("\\/", "/").replace("\\u0026", "&").replace("\\u003d", "=")
    return unquote(cleaned)


def _extract_external_apply_urls(html: str) -> list[str]:
    urls: list[str] = []
    seen: set[str] = set()
    for pattern in _APPLY_URL_PATTERNS:
        for match in pattern.finditer(html):
            url = strip_tracking_params(_decode_json_url(match.group("url")))
            if not url or "linkedin.com" in url.lower():
                continue
            if url in seen:
                continue
            seen.add(url)
            urls.append(url)
    return urls[:2]


def _source_label(url: str, site: str) -> str:
    lower = url.lower()
    if "linkedin.com" in lower or site.lower() == "linkedin":
        return "LinkedIn detail page"
    return "company application page"


def _log_found(job: RawJob, salary_min: float | None, salary_max: float | None, source: str) -> None:
    company = (job.company or "Unknown").strip()
    if salary_min is not None and salary_max is not None:
        amount = f"${salary_min:.0f}-${salary_max:.0f}"
    elif salary_min is not None:
        amount = f"${salary_min:.0f}+"
    elif salary_max is not None:
        amount = f"up to ${salary_max:.0f}"
    else:
        amount = "unknown"
    logger.info("[SALARY] %s — found %s from %s", company, amount, source)


def _resolve_from_html(
    job: RawJob,
    html: str,
    url: str,
) -> tuple[float | None, float | None]:
    salary_min, salary_max = extract_salary_from_page(html, site=job.site or url)
    if salary_min is not None or salary_max is not None:
        _log_found(job, salary_min, salary_max, _source_label(url, job.site))
        return salary_min, salary_max

    if "linkedin.com" in url.lower():
        for apply_url in _extract_external_apply_urls(html):
            ext_html = fetch_posting_html(apply_url)
            if not ext_html:
                continue
            salary_min, salary_max = extract_salary_from_page(ext_html, site=apply_url)
            if salary_min is not None or salary_max is not None:
                _log_found(job, salary_min, salary_max, "company application page")
                return salary_min, salary_max

    return None, None


def resolve_salary_from_posting(job: RawJob, url: str) -> tuple[float | None, float | None, bool]:
    """Fetch a posting URL (cached) and extract compensation."""
    canonical = strip_tracking_params(url)
    if not canonical:
        return None, None, False

    cached = _salary_cache.get(canonical)
    if cached is not None:
        return cached[0], cached[1], cached[2]

    html = fetch_posting_html(canonical)
    page_checked = html is not None
    if html is None:
        _salary_cache[canonical] = (None, None, False)
        return None, None, False

    salary_min, salary_max = _resolve_from_html(job, html, canonical)
    _salary_cache[canonical] = (salary_min, salary_max, page_checked)
    return salary_min, salary_max, page_checked


def _apply_stored_salary(job: RawJob, row: dict[str, Any]) -> bool:
    salary_min = row.get("salary_min")
    salary_max = row.get("salary_max")
    if salary_min is None and salary_max is None:
        return False
    job.salary_min = float(salary_min) if salary_min is not None else None
    job.salary_max = float(salary_max) if salary_max is not None else None
    return True


def enrich_job_salary(job: RawJob, *, database: Any | None = None, stored: dict[str, dict] | None = None) -> bool:
    """
    Resolve missing salary on a job from description and posting pages.

    Returns True when salary_min or salary_max was newly populated.
    """
    if job.salary_min is not None or job.salary_max is not None:
        return False

    if stored and job.normalized_url_hash:
        row = stored.get(job.normalized_url_hash)
        if row and _apply_stored_salary(job, row):
            return True

    body = "\n".join(part for part in (job.title or "", job.description or "") if part)
    desc_min, desc_max = extract_compensation_from_text(body)
    if desc_min is not None or desc_max is not None:
        job.salary_min, job.salary_max = desc_min, desc_max
        _log_found(job, desc_min, desc_max, "posting text")
        return True

    if not job.job_url:
        return False

    page_min, page_max, page_checked = resolve_salary_from_posting(job, job.job_url)
    job.salary_page_checked = page_checked
    if page_min is not None or page_max is not None:
        job.salary_min, job.salary_max = page_min, page_max
        return True

    return False


def enrich_jobs_salaries(jobs: list[RawJob], *, database: Any | None = None) -> int:
    """Enrich all jobs missing salary. Returns count newly resolved."""
    stored: dict[str, dict[str, Any]] = {}
    if database is not None and jobs:
        hashes = [job.normalized_url_hash for job in jobs if job.normalized_url_hash]
        stored = database.load_stored_salaries_by_hashes(hashes)

    enriched = 0
    for job in jobs:
        if enrich_job_salary(job, database=database, stored=stored):
            enriched += 1
    return enriched

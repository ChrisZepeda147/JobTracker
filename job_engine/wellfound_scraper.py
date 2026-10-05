"""Best-effort Wellfound scrape (often blocked without proxy or official API access)."""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Callable
from urllib.parse import quote_plus, urljoin

from job_engine.models import RawJob
from job_engine.normalizer import strip_html

logger = logging.getLogger("job_engine.wellfound")

_WELLFOUND_ORIGIN = "https://wellfound.com"


def fetch_wellfound_jobs(
    *,
    search_term: str,
    results_wanted: int,
    http_get: Callable[[str], Any],
    api_key: str = "",
) -> list[RawJob]:
    """
    Attempt to load Wellfound listings.

    Wellfound frequently returns HTTP 403 (bot protection) from datacenter IPs.
    Optional WELLFOUND_API_KEY is reserved for a future official integration.
    """
    if api_key:
        logger.info("[wellfound] WELLFOUND_API_KEY is set but official API wiring is not implemented yet")

    query = quote_plus(search_term.strip() or "software engineer")
    urls = (
        f"{_WELLFOUND_ORIGIN}/jobs?query={query}",
        f"{_WELLFOUND_ORIGIN}/jobs?role=Software+Engineer&query={query}",
    )

    for url in urls:
        try:
            response = http_get(url)
            status = getattr(response, "status_code", 0)
            if status == 403:
                logger.warning(
                    "[wellfound] blocked by Wellfound security (HTTP 403). "
                    "Try PROXY_LIST in .env or an official Wellfound API key when available."
                )
                return []
            if status != 200:
                logger.info("[wellfound] HTTP %s for %s", status, url[:80])
                continue
            html = getattr(response, "text", "") or ""
            jobs = _parse_wellfound_html(html, results_wanted)
            if jobs:
                logger.info("[wellfound] parsed %s job(s)", len(jobs))
                return jobs
        except Exception:
            logger.exception("[wellfound] fetch failed for %s", url[:80])
            continue

    logger.info("[wellfound] no jobs parsed (site may require browser login or API access)")
    return []


def _parse_wellfound_html(html: str, limit: int) -> list[RawJob]:
    jobs: list[RawJob] = []
    jobs.extend(_jobs_from_next_data(html))
    if not jobs:
        jobs.extend(_jobs_from_json_ld(html))
    return jobs[:limit]


def _jobs_from_next_data(html: str) -> list[RawJob]:
    match = re.search(
        r'<script[^>]+id="__NEXT_DATA__"[^>]*>(?P<payload>[\s\S]*?)</script>',
        html,
        re.IGNORECASE,
    )
    if not match:
        return []
    try:
        payload = json.loads(match.group("payload"))
    except json.JSONDecodeError:
        return []
    return _collect_jobs_from_json(payload)


def _jobs_from_json_ld(html: str) -> list[RawJob]:
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        return []

    soup = BeautifulSoup(html, "html.parser")
    jobs: list[RawJob] = []
    for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
        raw = script.string or script.get_text() or ""
        if not raw.strip():
            continue
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            continue
        jobs.extend(_collect_jobs_from_json(payload))
    return jobs


def _collect_jobs_from_json(node: Any) -> list[RawJob]:
    found: list[RawJob] = []
    if isinstance(node, list):
        for item in node:
            found.extend(_collect_jobs_from_json(item))
        return found
    if not isinstance(node, dict):
        return found

    node_type = node.get("@type")
    types: list[str] = []
    if isinstance(node_type, str):
        types = [node_type]
    elif isinstance(node_type, list):
        types = [str(t) for t in node_type]

    if any("JobPosting" in t for t in types):
        job = _job_posting_from_dict(node)
        if job:
            found.append(job)

    for value in node.values():
        if isinstance(value, (dict, list)):
            found.extend(_collect_jobs_from_json(value))
    return found


def _job_posting_from_dict(node: dict[str, Any]) -> RawJob | None:
    title = str(node.get("title") or "").strip()
    url = str(node.get("url") or node.get("sameAs") or "").strip()
    if not title or not url:
        return None
    if not url.startswith("http"):
        url = urljoin(_WELLFOUND_ORIGIN, url)

    org = node.get("hiringOrganization")
    company = ""
    if isinstance(org, dict):
        company = str(org.get("name") or "").strip()
    elif isinstance(org, str):
        company = org.strip()

    location = ""
    job_location = node.get("jobLocation")
    if isinstance(job_location, dict):
        address = job_location.get("address")
        if isinstance(address, dict):
            parts = [
                str(address.get("addressLocality") or ""),
                str(address.get("addressRegion") or ""),
            ]
            location = ", ".join(p for p in parts if p).strip()
        elif isinstance(address, str):
            location = address.strip()
    elif isinstance(job_location, list) and job_location:
        location = str(job_location[0]) if not isinstance(job_location[0], dict) else ""

    description = strip_html(str(node.get("description") or ""))
    return RawJob(
        title=title,
        company=company or "Wellfound",
        location=location or "Unspecified",
        job_url=url,
        description=description,
        site="wellfound",
    )

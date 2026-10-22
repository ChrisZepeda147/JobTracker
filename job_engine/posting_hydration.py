"""Fetch and attach full posting text before strict hard filters."""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass, field
from urllib.parse import urlparse

from job_engine.models import RawJob
from job_engine.normalizer import strip_html
from job_engine.posting_fetch import fetch_posting, get_cached_posting

logger = logging.getLogger("job_engine.posting_hydration")

_MIN_DESCRIPTION_CHARS = 120


@dataclass
class HydrationStats:
    attempted: int = 0
    hydrated: int = 0
    failed: int = 0
    skipped_already_rich: int = 0
    failed_by_domain: dict[str, int] = field(default_factory=dict)


def _domain_label(job: RawJob) -> str:
    site = (job.site or "").strip().lower()
    if site:
        return site
    try:
        host = urlparse(job.job_url or "").netloc.lower()
        return host.removeprefix("www.") or "unknown"
    except Exception:
        return "unknown"


def _record_hydration_failure(out: HydrationStats, job: RawJob) -> None:
    out.failed += 1
    label = _domain_label(job)
    out.failed_by_domain[label] = out.failed_by_domain.get(label, 0) + 1


def _extract_from_json_ld(html: str) -> str | None:
    for block in re.findall(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html,
        flags=re.IGNORECASE | re.DOTALL,
    ):
        try:
            data = json.loads(block.strip())
        except json.JSONDecodeError:
            continue
        nodes = data if isinstance(data, list) else [data]
        for node in nodes:
            if not isinstance(node, dict):
                continue
            if str(node.get("@type") or "").lower() != "jobposting":
                continue
            desc = node.get("description")
            if isinstance(desc, str) and len(desc.strip()) >= _MIN_DESCRIPTION_CHARS:
                return strip_html(desc)
    return None


def extract_description_from_html(html: str, site: str = "") -> str | None:
    """Best-effort posting body from HTML."""
    del site
    from_json = _extract_from_json_ld(html)
    if from_json:
        return from_json

    try:
        from bs4 import BeautifulSoup
    except ImportError:
        BeautifulSoup = None  # type: ignore[assignment,misc]

    if BeautifulSoup is not None:
        soup = BeautifulSoup(html, "html.parser")
        for selector in (
            {"class": re.compile(r"description|show-more-less-html|job-view-layout", re.I)},
            {"id": re.compile(r"job-description|jobDescriptionText", re.I)},
        ):
            node = soup.find(["div", "section"], selector)
            if node:
                text = strip_html(str(node))
                if len(text) >= _MIN_DESCRIPTION_CHARS:
                    return text
        article = soup.find("article")
        if article:
            text = strip_html(str(article))
            if len(text) >= _MIN_DESCRIPTION_CHARS:
                return text

    text = strip_html(html)
    if len(text) >= _MIN_DESCRIPTION_CHARS:
        return text
    return None


def _description_rich(job: RawJob) -> bool:
    return len((job.description or "").strip()) >= _MIN_DESCRIPTION_CHARS


def hydrate_job_postings(
    jobs: list[RawJob],
    *,
    max_fetches: int | None = None,
    stats: HydrationStats | None = None,
) -> HydrationStats:
    """
    Mark hydration attempted for every job; fetch posting pages when description is thin.
    Reuses posting_fetch cache (shared with salary / availability).
    """
    out = stats or HydrationStats()
    fetches = 0

    for job in jobs:
        job.hydration_attempted = True
        out.attempted += 1

        if _description_rich(job):
            out.skipped_already_rich += 1
            continue

        if not job.job_url:
            _record_hydration_failure(out, job)
            continue

        if max_fetches is not None and fetches >= max_fetches:
            _record_hydration_failure(out, job)
            continue

        cached = get_cached_posting(job.job_url)
        if cached and cached.html:
            body = extract_description_from_html(cached.html, job.site or "")
            if body:
                job.description = body
                out.hydrated += 1
                continue

        result = fetch_posting(job.job_url, purpose="hydration", use_budget=True)
        fetches += 1
        if not result.html:
            _record_hydration_failure(out, job)
            continue

        body = extract_description_from_html(result.html, job.site or "")
        if body:
            job.description = body
            out.hydrated += 1
            logger.debug("[HYDRATE] %s @ %s (%s chars)", job.title, job.company, len(body))
        else:
            _record_hydration_failure(out, job)

    logger.info(
        "[HYDRATE] attempted=%s hydrated=%s failed=%s skipped_rich=%s",
        out.attempted,
        out.hydrated,
        out.failed,
        out.skipped_already_rich,
    )
    return out

"""Public Greenhouse job board API (no API key required per board slug)."""

from __future__ import annotations

import logging
import re
from typing import Any, Callable
from job_engine.models import RawJob
from job_engine.normalizer import strip_html

logger = logging.getLogger("job_engine.greenhouse")

DEFAULT_GREENHOUSE_BOARD_SLUGS = (
    "stripe",
    "gitlab",
    "anthropic",
    "figma",
    "airbnb",
    "coinbase",
    "discord",
    "datadog",
    "cloudflare",
    "mongodb",
)

_SEARCH_STOPWORDS = frozenset({"and", "the", "for", "with", "or"})


def parse_board_slug_list(raw: str) -> list[str]:
    slugs: list[str] = []
    seen: set[str] = set()
    for part in raw.split(","):
        slug = part.strip().lower().replace(" ", "-")
        if not slug or slug in seen:
            continue
        seen.add(slug)
        slugs.append(slug)
    return slugs


def _search_tokens(search_term: str) -> list[str]:
    tokens = [t for t in re.split(r"\W+", search_term.lower()) if len(t) > 2]
    return [t for t in tokens if t not in _SEARCH_STOPWORDS]


def title_matches_search(title: str, search_term: str) -> bool:
    tokens = _search_tokens(search_term)
    if not tokens:
        return True
    title_lower = title.lower()
    return any(token in title_lower for token in tokens)


def _location_matches(job_location: str, *, is_remote: bool) -> bool:
    if not is_remote:
        return True
    text = job_location.lower()
    return "remote" in text or "anywhere" in text or text.strip() == ""


def _parse_posted_date(updated_at: str | None) -> str | None:
    if not updated_at:
        return None
    return updated_at[:10] if len(updated_at) >= 10 else updated_at


def _board_company_name(slug: str, metadata: dict[str, Any] | None) -> str:
    if metadata and metadata.get("name"):
        return str(metadata["name"]).strip()
    return slug.replace("-", " ").title()


def fetch_greenhouse_jobs(
    *,
    search_term: str,
    is_remote: bool,
    results_wanted: int,
    board_slugs: list[str],
    http_get: Callable[[str], Any],
) -> list[RawJob]:
    """Aggregate jobs from configured Greenhouse boards."""
    if not board_slugs:
        logger.warning("[company_career_pages] no GREENHOUSE_BOARD_SLUGS configured")
        return []

    per_board = max(3, (results_wanted // max(len(board_slugs), 1)) + 2)
    collected: list[RawJob] = []

    for slug in board_slugs:
        if len(collected) >= results_wanted:
            break
        board_url = f"https://boards-api.greenhouse.io/v1/boards/{slug}"
        jobs_url = f"{board_url}/jobs"
        try:
            board_meta: dict[str, Any] | None = None
            meta_resp = http_get(board_url)
            if getattr(meta_resp, "status_code", 0) == 200:
                board_meta = meta_resp.json()
            jobs_resp = http_get(jobs_url)
            status = getattr(jobs_resp, "status_code", 0)
            if status != 200:
                logger.info("[company_career_pages] %s board unavailable (HTTP %s)", slug, status)
                continue
            payload = jobs_resp.json()
            company = _board_company_name(slug, board_meta)
            raw_jobs = payload.get("jobs") if isinstance(payload, dict) else None
            if not isinstance(raw_jobs, list):
                continue

            added = 0
            for row in raw_jobs:
                if added >= per_board or len(collected) >= results_wanted:
                    break
                if not isinstance(row, dict):
                    continue
                title = str(row.get("title") or "").strip()
                if not title or not title_matches_search(title, search_term):
                    continue
                location_node = row.get("location")
                if isinstance(location_node, dict):
                    location = str(location_node.get("name") or "").strip()
                else:
                    location = str(location_node or "").strip()
                if not _location_matches(location, is_remote=is_remote):
                    continue
                job_url = str(row.get("absolute_url") or "").strip()
                if not job_url:
                    continue
                description = strip_html(str(row.get("content") or ""))
                collected.append(
                    RawJob(
                        title=title,
                        company=company,
                        location=location or "Unspecified",
                        job_url=job_url,
                        description=description,
                        site="company_career_pages",
                        posted_date=_parse_posted_date(str(row.get("updated_at") or "")),
                    )
                )
                added += 1
            if added:
                logger.info("[company_career_pages] %s contributed %s job(s)", slug, added)
        except Exception:
            logger.exception("[company_career_pages] failed board %s", slug)
            continue

    return collected[:results_wanted]

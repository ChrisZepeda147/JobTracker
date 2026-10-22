"""Detect whether a job posting is still open (strict mode display gate)."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone

from job_engine.posting_fetch import PostingFetchResult, fetch_posting, get_cached_posting
from job_engine.normalizer import strip_html, strip_tracking_params

_CLOSED_STATUS_CODES = frozenset({404, 410})

_CLOSED_TEXT_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(r"job\s+is\s+no\s+longer\s+available", re.IGNORECASE),
    re.compile(r"no\s+longer\s+accepting\s+applications", re.IGNORECASE),
    re.compile(r"position\s+has\s+been\s+filled", re.IGNORECASE),
    re.compile(r"job\s+has\s+expired", re.IGNORECASE),
    re.compile(r"this\s+job\s+is\s+closed", re.IGNORECASE),
    re.compile(r"posting\s+has\s+expired", re.IGNORECASE),
    re.compile(r"page\s+not\s+found", re.IGNORECASE),
)

_ATS_CLOSED_SNIPPETS = (
    "job not found",
    "opening not found",
    "position is no longer open",
    "no longer open",
)


@dataclass
class ListingAvailability:
    status: str  # open | closed | unknown
    reason: str = ""
    checked_at: str | None = None


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _text_haystack(html: str | None) -> str:
    if not html:
        return ""
    plain = strip_html(html)
    return plain[:80_000]


def _json_ld_job_closed(html: str) -> bool:
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
            status = str(node.get("validThrough") or "")
            title = str(node.get("@type") or "")
            if title.lower() == "jobposting" and node.get("title") is None and node.get("description") is None:
                return True
            if str(node.get("employmentType") or "").lower() == "closed":
                return True
            del status
    return False


def evaluate_availability_from_fetch(result: PostingFetchResult) -> ListingAvailability:
    """Classify listing from an existing fetch (no extra network)."""
    checked_at = _now_iso()
    code = result.status_code

    if code in _CLOSED_STATUS_CODES:
        return ListingAvailability("closed", f"HTTP {code}", checked_at)

    if result.error in ("timeout", "blocked", "budget"):
        label = result.error or "unknown"
        return ListingAvailability("unknown", f"availability check inconclusive ({label})", checked_at)

    if code is not None and code not in (200, 404, 410):
        if code in (403, 429):
            return ListingAvailability("unknown", f"HTTP {code} (blocked)", checked_at)
        if code >= 500:
            return ListingAvailability("unknown", f"HTTP {code} (server error)", checked_at)

    haystack = _text_haystack(result.html)
    if haystack:
        lower = haystack.lower()
        for snippet in _ATS_CLOSED_SNIPPETS:
            if snippet in lower and "job" in lower[:500]:
                return ListingAvailability("closed", f"posting text: {snippet}", checked_at)
        for pattern in _CLOSED_TEXT_PATTERNS:
            if pattern.search(haystack):
                return ListingAvailability("closed", pattern.pattern.replace("\\s+", " "), checked_at)
        if result.html and _json_ld_job_closed(result.html):
            return ListingAvailability("closed", "structured data indicates closed", checked_at)

    if result.ok_html:
        return ListingAvailability("open", "posting page loaded", checked_at)

    return ListingAvailability("unknown", "could not confirm listing status", checked_at)


def check_job_listing_availability(job_url: str | None, *, reuse_cache: bool = True) -> ListingAvailability:
    """Fetch (or reuse cache) and classify job URL availability."""
    if not job_url:
        return ListingAvailability("unknown", "missing job URL", _now_iso())

    canonical = strip_tracking_params(job_url)
    if reuse_cache:
        cached = get_cached_posting(canonical)
        if cached is not None:
            return evaluate_availability_from_fetch(cached)

    result = fetch_posting(canonical, purpose="availability", use_budget=True)
    return evaluate_availability_from_fetch(result)

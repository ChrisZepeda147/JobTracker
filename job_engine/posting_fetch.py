"""Unified job posting HTTP fetch with URL cache (hydration, salary, availability)."""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from typing import Literal

from job_engine.normalizer import strip_tracking_params

logger = logging.getLogger("job_engine.posting_fetch")

_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)
_MAX_HTML_BYTES = 1_500_000
_MIN_FETCH_INTERVAL = 1.25
_CACHE_TTL_SECONDS = 4 * 3600

_last_fetch_at = 0.0
_fetch_budget: int | None = None
_cache: dict[str, tuple[float, "PostingFetchResult"]] = {}


FetchPurpose = Literal["hydration", "salary", "availability", "general"]


@dataclass(frozen=True)
class PostingFetchResult:
    url: str
    status_code: int | None
    html: str | None
    error: str | None = None  # timeout | blocked | budget | invalid_url

    @property
    def ok_html(self) -> bool:
        return bool(self.html) and self.status_code == 200


def clear_posting_cache() -> None:
    """Test helper — drop cached responses."""
    _cache.clear()


def set_fetch_budget(limit: int | None) -> None:
    """Limit posting fetches per worker run (None = unlimited)."""
    global _fetch_budget
    _fetch_budget = limit


def _throttle_fetches() -> None:
    global _last_fetch_at
    elapsed = time.monotonic() - _last_fetch_at
    if elapsed < _MIN_FETCH_INTERVAL:
        time.sleep(_MIN_FETCH_INTERVAL - elapsed)
    _last_fetch_at = time.monotonic()


def get_cached_posting(url: str) -> PostingFetchResult | None:
    canonical = strip_tracking_params(url)
    if not canonical:
        return None
    entry = _cache.get(canonical)
    if not entry:
        return None
    fetched_at, result = entry
    if time.time() - fetched_at > _CACHE_TTL_SECONDS:
        del _cache[canonical]
        return None
    return result


def cache_posting_result(url: str, result: PostingFetchResult) -> None:
    canonical = strip_tracking_params(url)
    if not canonical:
        return
    _cache[canonical] = (time.time(), result)


def fetch_posting(
    url: str,
    *,
    timeout: float = 12.0,
    purpose: FetchPurpose = "general",
    use_budget: bool = True,
) -> PostingFetchResult:
    """GET a posting URL; reuse cache; record non-200 status for availability."""
    del purpose  # reserved for future per-purpose policy
    canonical = strip_tracking_params(url)
    if not canonical or not canonical.startswith(("http://", "https://")):
        return PostingFetchResult(url=url or "", status_code=None, html=None, error="invalid_url")

    cached = get_cached_posting(canonical)
    if cached is not None:
        return cached

    global _fetch_budget
    if use_budget and _fetch_budget is not None:
        if _fetch_budget <= 0:
            result = PostingFetchResult(url=canonical, status_code=None, html=None, error="budget")
            cache_posting_result(canonical, result)
            return result
        _fetch_budget -= 1

    _throttle_fetches()
    headers = {"User-Agent": _USER_AGENT, "Accept": "text/html,application/xhtml+xml"}
    status_code: int | None = None
    html: str | None = None
    error: str | None = None

    try:
        try:
            from curl_cffi import requests as cffi_requests

            response = cffi_requests.get(
                canonical,
                headers=headers,
                timeout=timeout,
                impersonate="chrome",
                allow_redirects=True,
            )
        except ImportError:
            import requests as std_requests

            response = std_requests.get(
                canonical,
                headers=headers,
                timeout=timeout,
                allow_redirects=True,
            )

        status_code = int(getattr(response, "status_code", 0) or 0)
        if status_code == 200:
            content = response.content[:_MAX_HTML_BYTES]
            encoding = getattr(response, "encoding", None) or "utf-8"
            html = content.decode(encoding, errors="replace")
        elif status_code in (403, 429):
            error = "blocked"
        else:
            # Still capture error-page HTML for closed-text detection when small.
            content = getattr(response, "content", b"")[:_MAX_HTML_BYTES]
            if content:
                encoding = getattr(response, "encoding", None) or "utf-8"
                html = content.decode(encoding, errors="replace")
    except Exception:
        logger.debug("Posting fetch failed for %s", canonical[:80], exc_info=True)
        error = "timeout"

    result = PostingFetchResult(url=canonical, status_code=status_code, html=html, error=error)
    cache_posting_result(canonical, result)
    return result


def fetch_posting_html(url: str, *, timeout: float = 18.0) -> str | None:
    """Backward-compatible helper: HTML only on HTTP 200."""
    result = fetch_posting(url, timeout=timeout, purpose="salary", use_budget=True)
    if result.ok_html:
        return result.html
    return None

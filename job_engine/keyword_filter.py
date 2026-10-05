"""Hard keyword filter from job preferences (case-insensitive)."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass

from job_engine.models import RawJob

logger = logging.getLogger("job_engine.keyword_filter")


@dataclass
class KeywordResult:
    passed: bool
    status: str  # pass | rejected
    matched_keyword: str | None = None
    reason: str = ""


def _compile_keyword_patterns(keywords: list[str]) -> list[tuple[str, re.Pattern[str]]]:
    seen: set[str] = set()
    patterns: list[tuple[str, re.Pattern[str]]] = []
    for raw in keywords:
        keyword = raw.strip()
        if not keyword:
            continue
        key = keyword.lower()
        if key in seen:
            continue
        seen.add(key)
        escaped = re.escape(keyword)
        # Short stems like "grad" should also catch graduate / graduation titles.
        if len(key) <= 4 and key.isalpha():
            body = rf"\b{escaped}(?:uate|uation|s)?\b"
        else:
            body = rf"\b{escaped}\b"
        patterns.append((keyword, re.compile(body, re.IGNORECASE)))
    return patterns


def job_keyword_haystack(job: RawJob) -> str:
    return "\n".join(
        part
        for part in (job.title or "", job.company or "", job.description or "")
        if part
    )


def find_excluded_keyword(job: RawJob, keywords: list[str]) -> str | None:
    """Return the first excluded keyword matched in title/company/description."""
    if not keywords:
        return None
    haystack = job_keyword_haystack(job)
    if not haystack.strip():
        return None
    for label, pattern in _compile_keyword_patterns(keywords):
        if pattern.search(haystack):
            return label
    return None


def evaluate_job_keywords(job: RawJob, keywords: list[str]) -> KeywordResult:
    matched = find_excluded_keyword(job, keywords)
    if matched:
        logger.info("[FILTER] rejected: excluded keyword %r", matched)
        return KeywordResult(
            False,
            "rejected",
            matched_keyword=matched,
            reason=f"excluded keyword: {matched}",
        )
    return KeywordResult(True, "pass")

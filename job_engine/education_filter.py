"""Reject postings with a hard computer-science degree requirement."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass

from job_engine.models import RawJob

logger = logging.getLogger("job_engine.education_filter")

# Hard requirements only — not "preferred" or "or equivalent experience".
_CS_DEGREE_REQUIRED_RES: tuple[re.Pattern[str], ...] = (
    re.compile(
        r"\b(?:bachelor(?:'s)?|b\.s\.|bs)\b[^.\n]{0,80}\b(?:in|of)\b[^.\n]{0,40}"
        r"\b(?:computer science|comp\.?\s*sci\.?|\bcs\b)\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(?:master(?:'s)?|m\.s\.|ms)\b[^.\n]{0,80}\b(?:in|of)\b[^.\n]{0,40}"
        r"\b(?:computer science|comp\.?\s*sci\.?|\bcs\b)\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\bdegree\s+in\s+(?:computer science|comp\.?\s*sci\.?|\bcs\b)\b[^.\n]{0,40}"
        r"\b(?:required|must|mandatory)\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(?:computer science|comp\.?\s*sci\.?|\bcs\b)\s+degree\b[^.\n]{0,40}"
        r"\b(?:required|must|mandatory)\b",
        re.IGNORECASE,
    ),
    re.compile(r"\bcs\s+major\b[^.\n]{0,40}\b(?:required|must|mandatory)\b", re.IGNORECASE),
    re.compile(
        r"\b(?:required|must have)\b[^.\n]{0,60}\b(?:bachelor(?:'s)?)\b[^.\n]{0,60}"
        r"\b(?:computer science|comp\.?\s*sci\.?|\bcs\b)\b",
        re.IGNORECASE,
    ),
)

_SOFT_EDUCATION_RE = re.compile(
    r"\b(?:preferred|plus|nice to have|or equivalent|equivalent experience|"
    r"or related(?:\s+field)?|related field|strongly preferred|is a plus)\b",
    re.IGNORECASE,
)


@dataclass
class EducationResult:
    passed: bool
    status: str  # pass | rejected
    reason: str = ""


def education_haystack(job: RawJob) -> str:
    return "\n".join(
        part for part in (job.title or "", job.description or "") if part
    )


def requires_cs_degree(text: str | None) -> bool:
    if not text or not text.strip():
        return False
    for pattern in _CS_DEGREE_REQUIRED_RES:
        match = pattern.search(text)
        if not match:
            continue
        window = text[max(0, match.start() - 40) : match.end() + 80]
        if _SOFT_EDUCATION_RE.search(window):
            continue
        return True
    return False


def evaluate_job_education(job: RawJob) -> EducationResult:
    haystack = education_haystack(job)
    if requires_cs_degree(haystack):
        logger.info("[FILTER] rejected: CS/computer science degree required")
        return EducationResult(
            False,
            "rejected",
            reason="requires computer science degree",
        )
    return EducationResult(True, "pass", reason="no hard CS degree requirement")

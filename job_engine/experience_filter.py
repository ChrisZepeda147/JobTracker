"""Hard experience filter using max_preferred_experience_years from job preferences."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass

from job_engine.models import RawJob

logger = logging.getLogger("job_engine.experience_filter")

# Minimum years of experience explicitly required in posting text.
_EXPERIENCE_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(
        r"(?P<n>\d{1,2})\s*\+?\s*years?\s+of\s+(?:[\w\s,./-]{0,60})?(?:experience|exp\.?)\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"(?:minimum|min\.?|at least|least)\s+(?P<n>\d{1,2})\s*\+?\s*years?\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"(?P<n>\d{1,2})\s*[-–]\s*\d{1,2}\s*years?\s+(?:of\s+)?(?:[\w\s,./-]{0,40})?(?:experience|exp\.?)\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"(?P<n>\d{1,2})\s*\+?\s*years?\s+(?:of\s+)?(?:professional|software|relevant|industry|work)\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"(?P<n>\d{1,2})\s*\+?\s*years?\s+(?:in|with)\s+[\w\s,./-]{0,40}\b",
        re.IGNORECASE,
    ),
    re.compile(r"(?P<n>\d{1,2})\+\s*(?:years?|yrs?)\b", re.IGNORECASE),
    re.compile(
        r"(?:experience|qualifications|requirements)\s*[:\-]\s*(?P<n>\d{1,2})\s*\+?\s*(?:years?|yrs?)",
        re.IGNORECASE,
    ),
    re.compile(
        r"(?P<n>\d{1,2})\s*to\s*\d{1,2}\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp\.?)\b",
        re.IGNORECASE,
    ),
)

_TITLE_IMPLICIT_YOE: tuple[tuple[re.Pattern[str], int], ...] = (
    (re.compile(r"\b(?:principal|distinguished)\b", re.IGNORECASE), 10),
    (re.compile(r"\bstaff\b", re.IGNORECASE), 8),
    (re.compile(r"\b(?:senior|sr\.?)\b", re.IGNORECASE), 5),
)

_MAX_REASONABLE_YOE = 25


@dataclass(frozen=True)
class ExperienceContext:
    max_preferred_years: int | None


@dataclass
class ExperienceResult:
    passed: bool
    status: str  # pass | rejected | unknown
    required_years: int | None = None
    reason: str = ""


def experience_context_from_prefs(prefs: dict | None) -> ExperienceContext:
    prefs = prefs or {}
    raw = prefs.get("max_preferred_experience_years")
    max_years = int(raw) if raw is not None else None
    return ExperienceContext(max_preferred_years=max_years)


def _normalize_experience_text(text: str) -> str:
    """Unescape board markup so patterns like 9\\+ years still match."""
    return (
        text.replace("\\+", "+")
        .replace("\\-", "-")
        .replace("\\*", "*")
        .replace("\\_", "_")
    )


def experience_haystack(job: RawJob) -> str:
    parts = [part for part in (job.title or "", job.description or "") if part]
    return _normalize_experience_text("\n".join(parts))


def infer_required_years_from_title(title: str | None) -> int | None:
    """Map seniority in the title to a conservative minimum years estimate."""
    if not title or not title.strip():
        return None
    inferred: list[int] = []
    for pattern, years in _TITLE_IMPLICIT_YOE:
        if pattern.search(title):
            inferred.append(years)
    if not inferred:
        return None
    return max(inferred)


def extract_required_years(text: str | None) -> int | None:
    """Return the highest explicit minimum years of experience in posting text."""
    if not text or not text.strip():
        return None

    text = _normalize_experience_text(text)
    found: list[int] = []
    for pattern in _EXPERIENCE_PATTERNS:
        for match in pattern.finditer(text):
            try:
                years = int(match.group("n"))
            except (TypeError, ValueError):
                continue
            if 1 <= years <= _MAX_REASONABLE_YOE:
                found.append(years)

    if not found:
        return None
    return max(found)


def extract_required_years_for_job(job: RawJob) -> int | None:
    """Highest years required from description/title combined."""
    from_text = extract_required_years(experience_haystack(job))
    from_title = infer_required_years_from_title(job.title)
    candidates = [value for value in (from_text, from_title) if value is not None]
    if not candidates:
        return None
    return max(candidates)


def format_experience_requirement(years: int | None) -> str | None:
    if years is None:
        return None
    return f"{years}+ years"


def evaluate_job_experience(job: RawJob, ctx: ExperienceContext) -> ExperienceResult:
    """Reject when posting requires more years than the user's max preference."""
    if ctx.max_preferred_years is None:
        return ExperienceResult(True, "pass", reason="no experience preference")

    required = extract_required_years_for_job(job)
    if required is None:
        return ExperienceResult(True, "unknown", reason="experience requirement not listed")

    if required > ctx.max_preferred_years:
        label = format_experience_requirement(required)
        logger.info(
            "[FILTER] rejected: requires %s, user max preferred %s years",
            label,
            ctx.max_preferred_years,
        )
        return ExperienceResult(
            False,
            "rejected",
            required_years=required,
            reason=f"requires {label}, max preferred {ctx.max_preferred_years} years",
        )

    return ExperienceResult(
        True,
        "pass",
        required_years=required,
        reason=f"requires {required} years within max preferred {ctx.max_preferred_years}",
    )

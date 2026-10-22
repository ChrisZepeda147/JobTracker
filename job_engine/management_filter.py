"""Hard filters for engineering-management roles and IC seniority titles (strict SWE search)."""

from __future__ import annotations

import re
from dataclasses import dataclass

from job_engine.models import RawJob

# Clear management / senior IC titles (title-only).
_STRICT_TITLE_REJECT_RES: tuple[re.Pattern[str], ...] = (
    re.compile(r"\bengineering\s+manager\b", re.IGNORECASE),
    re.compile(r"\bsoftware\s+engineering\s+manager\b", re.IGNORECASE),
    re.compile(r"\bdevelopment\s+manager\b", re.IGNORECASE),
    re.compile(r"\bdirector\s+of\s+engineering\b", re.IGNORECASE),
    re.compile(r"\bhead\s+of\s+engineering\b", re.IGNORECASE),
    re.compile(r"\bvp\s+(?:of\s+)?engineering\b", re.IGNORECASE),
    re.compile(r"\bstaff\s+engineer\b", re.IGNORECASE),
    re.compile(r"\bprincipal\s+engineer\b", re.IGNORECASE),
    re.compile(r"\bsenior\s+software\s+engineer\b", re.IGNORECASE),
    re.compile(r"\bsenior\s+engineer\b", re.IGNORECASE),
    re.compile(r"\blead\s+software\s+engineer\b", re.IGNORECASE),
    re.compile(r"\blead\s+engineer\b", re.IGNORECASE),
    re.compile(r"\b(?:sr\.?|senior)\s+(?:swe|sde|software\s+developer)\b", re.IGNORECASE),
)

# Candidate must perform management — not collaboration phrases.
_MANAGEMENT_REQUIREMENT_RES: tuple[re.Pattern[str], ...] = (
    re.compile(r"\d{1,2}\s*\+?\s*years?\s+of\s+engineering\s+management", re.IGNORECASE),
    re.compile(r"\bengineering\s+management\s+experience\b", re.IGNORECASE),
    re.compile(r"\bpeople\s+management\s+experience\b", re.IGNORECASE),
    re.compile(r"\b(?:as\s+a\s+|serve\s+as\s+a\s+)?people\s+manager\b", re.IGNORECASE),
    re.compile(
        r"\bmanaged\s+a\s+team\s+of\s+(?:[\w\s,./-]{0,40})?(?:engineers|developers)\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\d{1,2}\s*\+?\s*years?\s+(?:of\s+)?(?:[\w\s,./-]{0,30})?"
        r"managing\s+(?:a\s+team\s+of\s+)?(?:engineers|developers)\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\d{1,2}\s*\+?\s*years?\s+of\s+[\w\s,./-]{0,40}managing\s+engineers\b",
        re.IGNORECASE,
    ),
)

_COLLABORATION_LINE_RES = re.compile(
    r"\b(?:work\s+with|collaborate\s+with|partner\s+with|report\s+to|"
    r"support\s+the)\s+[\w\s,./-]{0,60}(?:manager|managers|leadership)\b",
    re.IGNORECASE,
)


@dataclass
class ManagementResult:
    passed: bool
    status: str  # pass | rejected
    reason: str = ""


@dataclass
class SeniorityTitleResult:
    passed: bool
    status: str  # pass | rejected
    reason: str = ""


def _posting_haystack(job: RawJob) -> str:
    return "\n".join(part for part in (job.title or "", job.description or "") if part)


def _line_is_collaboration_only(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return False
    if not _COLLABORATION_LINE_RES.search(stripped):
        return False
    for pattern in _MANAGEMENT_REQUIREMENT_RES:
        if pattern.search(stripped):
            return False
    return True


def find_management_requirement(text: str) -> str | None:
    """Return a short label if the posting requires people/engineering management."""
    if not text.strip():
        return None
    for line in text.splitlines():
        if _line_is_collaboration_only(line):
            continue
        for pattern in _MANAGEMENT_REQUIREMENT_RES:
            match = pattern.search(line)
            if match:
                return match.group(0).strip()
    # Multi-line: full-text scan when not clearly collaboration-only context.
    for pattern in _MANAGEMENT_REQUIREMENT_RES:
        match = pattern.search(text)
        if not match:
            continue
        start = max(0, match.start() - 80)
        snippet = text[start : match.end() + 40]
        if _COLLABORATION_LINE_RES.search(snippet) and "experience" not in snippet.lower():
            continue
        return match.group(0).strip()
    return None


def evaluate_management_requirements(job: RawJob) -> ManagementResult:
    label = find_management_requirement(_posting_haystack(job))
    if label:
        return ManagementResult(
            False,
            "rejected",
            reason=f"management requirement: {label}",
        )
    return ManagementResult(True, "pass")


def evaluate_strict_seniority_title(job: RawJob) -> SeniorityTitleResult:
    title = job.title or ""
    for pattern in _STRICT_TITLE_REJECT_RES:
        if pattern.search(title):
            return SeniorityTitleResult(
                False,
                "rejected",
                reason=f"seniority title excluded: {title}",
            )
    return SeniorityTitleResult(True, "pass")

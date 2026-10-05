"""Learn search filters and scoring hints from applied and skipped jobs."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from typing import Any

from job_engine.keyword_filter import evaluate_job_keywords
from job_engine.matcher import (
    UserProfile,
    _SENIOR_TITLE_RES,
    _extract_technical_requirements,
    _normalize,
    _title_word_set,
)
from job_engine.models import RawJob

logger = logging.getLogger("job_engine.job_feedback")

_SKIP_REASON_LABELS = {
    "salary_too_low": "salary too low",
    "salary_too_high": "salary too high",
    "too_senior": "too senior",
    "experience_requirement": "experience requirement",
    "wrong_location": "wrong location",
    "tech_stack": "tech stack mismatch",
    "education_requirement": "education requirement",
    "employment_type": "employment type",
    "company": "company",
    "not_interested": "not interested",
    "other": "other",
}

_EDUCATION_HINTS = (
    "phd",
    "doctorate",
    "doctoral",
    "master's required",
    "masters required",
    "mba required",
    "degree required",
)

_EMPLOYMENT_HINTS = (
    "contract",
    "contractor",
    "part-time",
    "part time",
    "temporary",
    "1099",
    "c2c",
)


@dataclass
class FeedbackJob:
    status: str
    skip_reason: str | None
    user_notes: str
    title: str
    company: str
    location: str
    description: str
    salary_min: float | None
    salary_max: float | None


@dataclass
class JobFeedbackContext:
    applied: list[FeedbackJob] = field(default_factory=list)
    skipped: list[FeedbackJob] = field(default_factory=list)
    avoid_companies: list[str] = field(default_factory=list)
    avoid_locations: list[str] = field(default_factory=list)
    avoid_keywords: list[str] = field(default_factory=list)
    reject_senior_titles: bool = False
    applied_summary: str = ""
    skipped_summary: str = ""


def _row_to_feedback(row: dict[str, Any]) -> FeedbackJob | None:
    job = row.get("jobs") or {}
    if not job:
        return None
    salary_min = job.get("salary_min")
    salary_max = job.get("salary_max")
    return FeedbackJob(
        status=str(row.get("status") or ""),
        skip_reason=str(row.get("skip_reason") or "").strip() or None,
        user_notes=str(row.get("user_notes") or "").strip(),
        title=str(job.get("title") or "").strip(),
        company=str(job.get("company") or "").strip(),
        location=str(job.get("location") or "").strip(),
        description=str(job.get("description") or "").strip(),
        salary_min=float(salary_min) if salary_min is not None else None,
        salary_max=float(salary_max) if salary_max is not None else None,
    )


def load_job_feedback(database: Any, user_id: str) -> JobFeedbackContext:
    """Load applied/skipped history and derive search constraints."""
    ctx = JobFeedbackContext()
    try:
        response = (
            database.client.table("user_job_states")
            .select(
                "status, skip_reason, user_notes, "
                "jobs(title, company, location, description, salary_min, salary_max)"
            )
            .eq("user_id", user_id)
            .in_("status", ["applied", "skipped"])
            .execute()
        )
    except Exception:
        logger.exception("Failed to load job feedback for user %s", user_id)
        return ctx

    avoid_companies: set[str] = set()
    avoid_locations: set[str] = set()
    avoid_keywords: set[str] = set()

    for row in response.data or []:
        feedback = _row_to_feedback(row)
        if not feedback:
            continue
        if feedback.status == "applied":
            ctx.applied.append(feedback)
            continue
        if feedback.status != "skipped":
            continue
        ctx.skipped.append(feedback)

        reason = feedback.skip_reason or "other"
        company_key = _normalize(feedback.company)
        location_key = _normalize(feedback.location)

        if reason in {"company", "not_interested"} and company_key:
            avoid_companies.add(company_key)
        elif reason == "wrong_location" and location_key:
            city = location_key.split(",")[0].strip()
            if city:
                avoid_locations.add(city)
        elif reason == "too_senior":
            ctx.reject_senior_titles = True
        elif reason == "tech_stack":
            title_words = _title_word_set(feedback.title)
            for term in _extract_technical_requirements(feedback.description, title_words):
                if len(term) >= 3:
                    avoid_keywords.add(term)
        elif reason == "education_requirement":
            haystack = f"{feedback.title} {feedback.description}".lower()
            for hint in _EDUCATION_HINTS:
                if hint in haystack:
                    avoid_keywords.add(hint)
        elif reason == "employment_type":
            haystack = f"{feedback.title} {feedback.description}".lower()
            for hint in _EMPLOYMENT_HINTS:
                if hint in haystack:
                    avoid_keywords.add(hint)
        elif reason == "experience_requirement":
            for match in re.finditer(r"\b(\d+)\+?\s*years?\b", feedback.description, re.IGNORECASE):
                avoid_keywords.add(f"{match.group(1)}+ years")
        elif reason == "other" and feedback.user_notes:
            for token in re.split(r"[,;\n]+", feedback.user_notes):
                word = token.strip()
                if len(word) >= 3:
                    avoid_keywords.add(word)

    ctx.avoid_companies = sorted(avoid_companies)
    ctx.avoid_locations = sorted(avoid_locations)
    ctx.avoid_keywords = sorted(avoid_keywords)[:40]
    ctx.applied_summary = _format_summary(ctx.applied, positive=True)
    ctx.skipped_summary = _format_summary(ctx.skipped, positive=False)
    logger.info(
        "[FEEDBACK] applied=%s skipped=%s avoid_companies=%s avoid_locations=%s avoid_keywords=%s senior=%s",
        len(ctx.applied),
        len(ctx.skipped),
        len(ctx.avoid_companies),
        len(ctx.avoid_locations),
        len(ctx.avoid_keywords),
        ctx.reject_senior_titles,
    )
    return ctx


def _format_summary(jobs: list[FeedbackJob], *, positive: bool) -> str:
    lines: list[str] = []
    for job in jobs[:10]:
        if positive:
            line = f"- {job.title} at {job.company or 'unknown'}"
            if job.location:
                line += f" ({job.location})"
        else:
            reason = _SKIP_REASON_LABELS.get(job.skip_reason or "", job.skip_reason or "skipped")
            line = f"- {job.title} at {job.company or 'unknown'}: {reason}"
            if job.user_notes:
                line += f" — {job.user_notes[:120]}"
        lines.append(line)
    return "\n".join(lines)


def apply_feedback_to_profile(profile: UserProfile, feedback: JobFeedbackContext) -> UserProfile:
    """Merge historical job decisions into the profile used for filtering/scoring."""
    merged_blacklist = list(dict.fromkeys([*profile.blacklisted_companies, *feedback.avoid_companies]))
    profile.blacklisted_companies = merged_blacklist
    profile.applied_job_summary = feedback.applied_summary
    profile.skipped_job_summary = feedback.skipped_summary
    profile.applied_titles = [job.title for job in feedback.applied if job.title]
    profile.applied_companies = sorted(
        {_normalize(job.company) for job in feedback.applied if _normalize(job.company)}
    )
    profile.feedback_avoid_locations = feedback.avoid_locations
    profile.feedback_avoid_keywords = feedback.avoid_keywords
    profile.feedback_reject_senior = feedback.reject_senior_titles
    return profile


def evaluate_job_feedback(job: RawJob, feedback: JobFeedbackContext) -> tuple[bool, str]:
    """Hard-filter using learned skip patterns."""
    company_key = _normalize(job.company)
    if company_key and company_key in feedback.avoid_companies:
        return False, f"company previously skipped: {job.company}"

    location_key = _normalize(job.location)
    if location_key and feedback.avoid_locations:
        city = location_key.split(",")[0].strip()
        for avoided in feedback.avoid_locations:
            if avoided and (avoided == city or avoided in location_key):
                return False, f"location previously skipped: {job.location}"

    if feedback.avoid_keywords:
        matched = evaluate_job_keywords(job, feedback.avoid_keywords)
        if matched.status == "rejected":
            return False, matched.reason

    if feedback.reject_senior_titles:
        title = job.title or ""
        for pattern in _SENIOR_TITLE_RES:
            if pattern.search(title):
                return False, f"senior title excluded from prior skips: {title}"

    return True, ""


def feedback_score_adjustment(job: RawJob, profile: UserProfile) -> float:
    """Small scoring nudge from applied (positive) and skipped (negative) history."""
    adjustment = 0.0
    company_key = _normalize(job.company)
    title_key = _normalize(job.title)

    if company_key and company_key in profile.applied_companies:
        adjustment += 0.06

    for applied_title in profile.applied_titles:
        applied_key = _normalize(applied_title)
        if not applied_key or not title_key:
            continue
        if applied_key == title_key or applied_key in title_key or title_key in applied_key:
            adjustment += 0.08
            break

    if company_key and company_key in profile.blacklisted_companies:
        adjustment -= 0.20

    if profile.feedback_avoid_locations:
        location_key = _normalize(job.location)
        city = location_key.split(",")[0].strip() if location_key else ""
        if city and city in profile.feedback_avoid_locations:
            adjustment -= 0.12

    if profile.feedback_avoid_keywords:
        matched = evaluate_job_keywords(job, profile.feedback_avoid_keywords)
        if matched.status == "rejected":
            adjustment -= 0.10

    return max(-0.25, min(0.20, adjustment))

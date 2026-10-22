"""Hard filters extended with per-search-request constraints."""

from __future__ import annotations

import logging
import re
from typing import TYPE_CHECKING

from job_engine.education_filter import evaluate_job_education
from job_engine.experience_filter import (
    ExperienceContext,
    evaluate_job_experience,
    extract_required_years_for_job,
    format_experience_requirement,
    has_junior_compatible_title,
)
from job_engine.rejection_audit import RejectionAudit
from job_engine.keyword_filter import evaluate_job_keywords
from job_engine.location_filter import (
    LocationContext,
    effective_work_mode,
    evaluate_job_location,
    geographic_job_location,
    location_context_from_prefs,
)
from job_engine.location_utils import state_abbr_from_location
from job_engine.management_filter import evaluate_management_requirements, evaluate_strict_seniority_title
from job_engine.matcher import FilterVerdict, HardFilter, _normalize
from job_engine.models import RawJob
from job_engine.salary_filter import SalaryContext, evaluate_job_salary
from job_engine.job_feedback import evaluate_job_feedback
from job_engine.user_context import UserSearchContext

if TYPE_CHECKING:
    from job_engine.filter_stats import SearchFilterStats

logger = logging.getLogger("job_engine.search_filters")

# Level II+ title patterns (title-only). Level I / 1 remain allowed.
_LEVEL_TWO_PLUS_TITLE_RES = (
    re.compile(r"\bsoftware engineer\s+(?:ii|iii|iv|2|3|4)\b", re.IGNORECASE),
    re.compile(r"\b(?:swe|sde)\s+(?:ii|iii|iv|2|3|4)\b", re.IGNORECASE),
    re.compile(r"\b(?:swe|sde)(?:ii|iii|iv|2|3|4)\b", re.IGNORECASE),
    re.compile(r"\bengineer\s+(?:ii|iii|iv|2|3|4)\b", re.IGNORECASE),
)


def _set_filter_reason(job: RawJob, reason: str) -> None:
    if reason:
        job.filter_reason = reason


class SearchRequestFilter(HardFilter):
    """Applies profile hard filters plus the queued search request constraints."""

    def __init__(
        self,
        ctx: UserSearchContext,
        database=None,
        user_suppressed_hashes: set[str] | None = None,
        salary_database=None,
        stats: SearchFilterStats | None = None,
        audit: RejectionAudit | None = None,
    ) -> None:
        super().__init__(ctx.profile, database=database)
        self.ctx = ctx
        self._user_suppressed = user_suppressed_hashes or set()
        self._salary_database = salary_database
        self._stats = stats
        self._audit = audit or RejectionAudit()
        self._strict = ctx.strict_filtering
        self._seniority = [
            re.compile(rf"\b{re.escape(_normalize(s))}\b", re.IGNORECASE)
            for s in ctx.excluded_seniority
            if _normalize(s)
        ]
        self._excluded_keywords = list(ctx.excluded_keywords)
        self._location_ctx = location_context_from_prefs(
            {
                "home_zip": ctx.origin_zip.zip_code if ctx.origin_zip else None,
                "max_commute_miles": ctx.max_commute_miles,
                "remote_allowed": ctx.prefs_remote_allowed,
                "hybrid_allowed": ctx.prefs_hybrid_allowed,
                "onsite_allowed": ctx.prefs_onsite_allowed,
                "preferred_locations": ctx.profile.preferred_cities,
            }
        )
        self._salary_ctx = SalaryContext(
            salary_min=ctx.prefs_salary_min,
            salary_max=ctx.prefs_salary_max,
        )
        self._experience_base = ExperienceContext(
            max_preferred_years=ctx.max_preferred_experience_years,
            strict=self._strict,
        )

    def evaluate(self, job: RawJob) -> FilterVerdict:
        """Location commute filter runs before scoring and before legacy text matching."""
        job.filter_reason = None
        for check in (
            self._check_blacklist,
            self._check_strict_seniority_title,
            self._check_management,
            self._check_excluded_keywords,
            self._check_experience,
            self._check_education,
            self._check_location,
            self._check_salary,
            self._check_suppressed,
        ):
            verdict = check(job)
            if not verdict.passed:
                _set_filter_reason(job, verdict.reason)
                return verdict

        for check in (
            self._check_user_history,
            self._check_learned_feedback,
            self._check_title_level,
            self._check_request_work_mode,
            self._check_excluded_seniority,
        ):
            verdict = check(job)
            if not verdict.passed:
                _set_filter_reason(job, verdict.reason)
                return verdict
        return FilterVerdict(True)

    def apply(self, jobs):  # type: ignore[override]
        survivors: list[RawJob] = []
        rejections: dict[str, int] = {}
        for job in jobs:
            verdict = self.evaluate(job)
            if verdict.passed:
                survivors.append(job)
                continue
            bucket = (verdict.reason or "rejected").split(":")[0]
            rejections[bucket] = rejections.get(bucket, 0) + 1
        if self._stats:
            self._stats.hard_filter_survivors = len(survivors)
        self._audit.log_samples(logger)
        return survivors, rejections

    def _experience_context_for(self, job: RawJob) -> ExperienceContext:
        hydration_attempted = bool(
            getattr(job, "hydration_attempted", False)
            or len((job.description or "").strip()) >= 120
        )
        return ExperienceContext(
            max_preferred_years=self._experience_base.max_preferred_years,
            strict=self._experience_base.strict,
            hydration_attempted=hydration_attempted,
        )

    def _check_location(self, job: RawJob) -> FilterVerdict:
        result = evaluate_job_location(job, self._location_ctx)
        job.commute_miles = result.miles
        job.work_arrangement = result.arrangement
        job.location_status = result.status

        if result.passed:
            return FilterVerdict(True, result.reason)

        if result.status == "unverified":
            if self._stats:
                self._stats.location_rejected += 1
            self._audit.add("location_rejected", job, "location unverified")
            return FilterVerdict(False, "location unverified")

        if self._stats:
            self._stats.location_rejected += 1
        self._audit.add("location_rejected", job, result.reason)
        return FilterVerdict(False, result.reason)

    def _check_experience(self, job: RawJob) -> FilterVerdict:
        result = evaluate_job_experience(job, self._experience_context_for(job))
        job.experience_status = result.status
        if result.required_years is not None:
            job.experience_requirement = format_experience_requirement(result.required_years)
        if result.passed:
            if result.status == "unknown":
                detail = "no YoE parsed"
                if has_junior_compatible_title(job.title):
                    detail += "; junior-compatible title"
                if self._stats:
                    self._stats.experience_unknown_kept += 1
                self._audit.add("experience_unknown_kept", job, detail)
            return FilterVerdict(True, result.reason)
        if self._stats:
            self._stats.experience_rejected += 1
        parsed = result.required_years if result.required_years is not None else extract_required_years_for_job(job)
        self._audit.add("experience_rejected", job, f"parsed_required_years={parsed}")
        return FilterVerdict(False, result.reason)

    def _check_management(self, job: RawJob) -> FilterVerdict:
        if not self._strict:
            job.management_status = "pass"
            return FilterVerdict(True)
        result = evaluate_management_requirements(job)
        job.management_status = result.status
        if result.passed:
            return FilterVerdict(True)
        if self._stats:
            self._stats.management_rejected += 1
        self._audit.add("management_rejected", job, result.reason)
        return FilterVerdict(False, result.reason)

    def _check_strict_seniority_title(self, job: RawJob) -> FilterVerdict:
        if not self._strict:
            job.seniority_status = "pass"
            return FilterVerdict(True)
        result = evaluate_strict_seniority_title(job)
        job.seniority_status = result.status
        if result.passed:
            return FilterVerdict(True)
        if self._stats:
            self._stats.seniority_rejected += 1
        self._audit.add("seniority_rejected", job, result.reason)
        return FilterVerdict(False, result.reason)

    def _check_education(self, job: RawJob) -> FilterVerdict:
        result = evaluate_job_education(job)
        job.education_status = result.status
        if result.passed:
            return FilterVerdict(True, result.reason)
        if self._stats:
            self._stats.education_rejected += 1
        self._audit.add("education_rejected", job, result.reason)
        return FilterVerdict(False, result.reason)

    def _check_salary(self, job: RawJob) -> FilterVerdict:
        result = evaluate_job_salary(
            job,
            self._salary_ctx,
            fetch_page=False,
            database=self._salary_database,
        )
        job.salary_status = result.status
        if result.passed:
            return FilterVerdict(True, result.reason)
        if self._stats:
            self._stats.salary_rejected += 1
        self._audit.add("salary_rejected", job, result.reason)
        return FilterVerdict(False, result.reason)

    def _check_title_level(self, job: RawJob) -> FilterVerdict:
        """Exclude titles that clearly indicate level II or higher."""
        title = job.title or ""
        for pattern in _LEVEL_TWO_PLUS_TITLE_RES:
            if pattern.search(title):
                return FilterVerdict(False, f"title level II+ excluded: {title}")
        return FilterVerdict(True)

    def _check_user_history(self, job: RawJob) -> FilterVerdict:
        if job.normalized_url_hash in self._user_suppressed:
            return FilterVerdict(False, "previously applied or skipped by user")
        return FilterVerdict(True)

    def _check_learned_feedback(self, job: RawJob) -> FilterVerdict:
        passed, reason = evaluate_job_feedback(job, self.ctx.feedback)
        if passed:
            return FilterVerdict(True)
        return FilterVerdict(False, reason)

    def _check_request_work_mode(self, job: RawJob) -> FilterVerdict:
        mode = effective_work_mode(job)
        allowed = {
            "remote": self.ctx.request_remote_allowed,
            "hybrid": self.ctx.request_hybrid_allowed,
            "onsite": self.ctx.request_onsite_allowed,
        }
        if mode == "unknown":
            geo = geographic_job_location(job.location or "")
            job_state = state_abbr_from_location(geo)
            home = self._location_ctx.preferred_state
            if job_state and home and job_state != home:
                return FilterVerdict(
                    False,
                    f"work mode unknown in {job_state}, home state {home}",
                )
            if not (self.ctx.request_hybrid_allowed or self.ctx.request_onsite_allowed):
                if geo and job_state:
                    return FilterVerdict(False, "work mode unknown for specific city (remote-only search)")
            return FilterVerdict(True)
        if allowed.get(mode, False):
            return FilterVerdict(True)
        return FilterVerdict(False, f"work mode not allowed: {mode}")

    def _check_excluded_keywords(self, job: RawJob) -> FilterVerdict:
        result = evaluate_job_keywords(job, self._excluded_keywords)
        job.keyword_status = result.status
        if result.passed:
            return FilterVerdict(True)
        if self._stats:
            self._stats.excluded_keyword_rejected += 1
        self._audit.add("excluded_keyword_rejected", job, result.reason)
        return FilterVerdict(False, result.reason)

    def _check_excluded_seniority(self, job: RawJob) -> FilterVerdict:
        haystack = f"{job.title} {(job.description or '')[:800]}"
        for pattern in self._seniority:
            if pattern.search(haystack):
                return FilterVerdict(False, f"excluded seniority: {pattern.pattern}")
        return FilterVerdict(True)

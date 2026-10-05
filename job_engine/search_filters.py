"""Hard filters extended with per-search-request constraints."""

from __future__ import annotations

import logging
import re

from job_engine.education_filter import evaluate_job_education
from job_engine.experience_filter import ExperienceContext, evaluate_job_experience, format_experience_requirement
from job_engine.keyword_filter import evaluate_job_keywords
from job_engine.location_filter import (
    LocationContext,
    effective_work_mode,
    evaluate_job_location,
    geographic_job_location,
    location_context_from_prefs,
)
from job_engine.location_utils import state_abbr_from_location
from job_engine.matcher import FilterVerdict, HardFilter, _normalize
from job_engine.models import RawJob
from job_engine.salary_filter import SalaryContext, evaluate_job_salary
from job_engine.job_feedback import evaluate_job_feedback
from job_engine.user_context import UserSearchContext

logger = logging.getLogger("job_engine.search_filters")

# Level II+ title patterns (title-only). Level I / 1 remain allowed.
_LEVEL_TWO_PLUS_TITLE_RES = (
    re.compile(r"\bsoftware engineer\s+(?:ii|iii|iv|2|3|4)\b", re.IGNORECASE),
    re.compile(r"\b(?:swe|sde)\s+(?:ii|iii|iv|2|3|4)\b", re.IGNORECASE),
    re.compile(r"\b(?:swe|sde)(?:ii|iii|iv|2|3|4)\b", re.IGNORECASE),
    re.compile(r"\bengineer\s+(?:ii|iii|iv|2|3|4)\b", re.IGNORECASE),
)


class SearchRequestFilter(HardFilter):
    """Applies profile hard filters plus the queued search request constraints."""

    def __init__(
        self,
        ctx: UserSearchContext,
        database=None,
        user_suppressed_hashes: set[str] | None = None,
        salary_database=None,
    ) -> None:
        super().__init__(ctx.profile, database=database)
        self.ctx = ctx
        self._user_suppressed = user_suppressed_hashes or set()
        self._salary_database = salary_database
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
        self._experience_ctx = ExperienceContext(
            max_preferred_years=ctx.max_preferred_experience_years,
        )

    def evaluate(self, job: RawJob) -> FilterVerdict:
        """Location commute filter runs before scoring and before legacy text matching."""
        for check in (
            self._check_blacklist,
            self._check_excluded_keywords,
            self._check_experience,
            self._check_education,
            self._check_location,
            self._check_salary,
            self._check_suppressed,
        ):
            verdict = check(job)
            if not verdict.passed:
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
                return verdict
        return FilterVerdict(True)

    def _check_location(self, job: RawJob) -> FilterVerdict:
        result = evaluate_job_location(job, self._location_ctx)
        job.commute_miles = result.miles
        job.work_arrangement = result.arrangement
        job.location_status = result.status

        if result.passed:
            return FilterVerdict(True, result.reason)

        if result.status == "unverified":
            return FilterVerdict(False, "location unverified")

        return FilterVerdict(False, result.reason)

    def _check_experience(self, job: RawJob) -> FilterVerdict:
        result = evaluate_job_experience(job, self._experience_ctx)
        job.experience_status = result.status
        if result.required_years is not None:
            job.experience_requirement = format_experience_requirement(result.required_years)
        if result.passed:
            return FilterVerdict(True, result.reason)
        return FilterVerdict(False, result.reason)

    def _check_education(self, job: RawJob) -> FilterVerdict:
        result = evaluate_job_education(job)
        job.education_status = result.status
        if result.passed:
            return FilterVerdict(True, result.reason)
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
        return FilterVerdict(False, result.reason)

    def _check_excluded_seniority(self, job: RawJob) -> FilterVerdict:
        haystack = f"{job.title} {(job.description or '')[:800]}"
        for pattern in self._seniority:
            if pattern.search(haystack):
                return FilterVerdict(False, f"excluded seniority: {pattern.pattern}")
        return FilterVerdict(True)

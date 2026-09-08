"""Hard filters extended with per-search-request constraints."""

from __future__ import annotations

import logging
import re

from job_engine.location_utils import distance_from_origin
from job_engine.matcher import FilterVerdict, HardFilter, _REMOTE_RE, detect_work_mode, _normalize
from job_engine.models import RawJob
from job_engine.user_context import UserSearchContext

logger = logging.getLogger("job_engine.search_filters")

_MAX_LOCATION_LOGS = 8

_US_COUNTRY_RE = re.compile(
    r"\b(united states|usa|u\.?s\.?a?\.?|america|remote\s*[-–—]?\s*us|us\s*[-–—]?\s*remote|remote\s*\(\s*us\s*\))\b",
    re.IGNORECASE,
)
_NON_US_RE = re.compile(
    r"\b("
    r"united kingdom|\buk\b|england|scotland|wales|northern ireland|ireland|"
    r"canada|toronto|vancouver|montreal|calgary|ottawa|"
    r"india|bangalore|bengaluru|hyderabad|mumbai|delhi|pune|"
    r"germany|berlin|munich|frankfurt|"
    r"france|paris|lyon|"
    r"australia|sydney|melbourne|brisbane|"
    r"netherlands|amsterdam|"
    r"spain|madrid|barcelona|"
    r"italy|rome|milan|"
    r"poland|warsaw|krakow|"
    r"remote\s*[-–—]?\s*(uk|eu|europe|canada|india|apac|emea)|"
    r"\beu\b|\bemea\b|\bapac\b|"
    r"london,\s*uk|dublin,\s*ireland"
    r")\b",
    re.IGNORECASE,
)
_US_STATE_ABBR_RE = re.compile(
    r",\s*(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|"
    r"MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b"
)
_US_STATE_NAMES = frozenset(
    name.lower()
    for name in (
        "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
        "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
        "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
        "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
        "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
        "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
        "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
        "Wisconsin", "Wyoming", "District of Columbia",
    )
)

# Level II+ title patterns (title-only). Level I / 1 remain allowed.
_LEVEL_TWO_PLUS_TITLE_RES = (
    re.compile(r"\bsoftware engineer\s+(?:ii|iii|iv|2|3|4)\b", re.IGNORECASE),
    re.compile(r"\b(?:swe|sde)\s+(?:ii|iii|iv|2|3|4)\b", re.IGNORECASE),
    re.compile(r"\b(?:swe|sde)(?:ii|iii|iv|2|3|4)\b", re.IGNORECASE),
    re.compile(r"\bengineer\s+(?:ii|iii|iv|2|3|4)\b", re.IGNORECASE),
)


class SearchRequestFilter(HardFilter):
    """Applies profile hard filters plus the queued search request constraints."""

    def __init__(self, ctx: UserSearchContext, database=None, user_suppressed_hashes: set[str] | None = None) -> None:
        super().__init__(ctx.profile, database=database)
        self.ctx = ctx
        self._user_suppressed = user_suppressed_hashes or set()
        self._seniority = [
            re.compile(rf"\b{re.escape(_normalize(s))}\b", re.IGNORECASE)
            for s in ctx.excluded_seniority
            if _normalize(s)
        ]
        self._excluded_kw = [k.lower() for k in ctx.excluded_keywords if k.strip()]
        self._location_log_count = 0

    def evaluate(self, job: RawJob) -> FilterVerdict:
        base = super().evaluate(job)
        if not base.passed:
            return base

        for check in (
            self._check_user_history,
            self._check_title_level,
            self._check_request_salary_min,
            self._check_request_salary_max,
            self._check_request_work_mode,
            self._check_excluded_seniority,
            self._check_excluded_keywords,
        ):
            verdict = check(job)
            if not verdict.passed:
                return verdict
        return FilterVerdict(True)

    def _log_location(self, job: RawJob, verdict: FilterVerdict) -> None:
        if self._location_log_count >= _MAX_LOCATION_LOGS:
            return
        self._location_log_count += 1
        detail = verdict.reason or ("pass" if verdict.passed else "reject")
        logger.info(
            "[LOCATION] %s | mode=%s | loc=%r | %s",
            "pass" if verdict.passed else "fail",
            detect_work_mode(job),
            job.location or "",
            detail,
        )

    @staticmethod
    def _is_explicitly_non_us(location: str) -> bool:
        return bool(location and _NON_US_RE.search(location))

    @staticmethod
    def _is_us_location(location: str) -> bool:
        if not location:
            return True
        if _US_COUNTRY_RE.search(location):
            return True
        if _US_STATE_ABBR_RE.search(location):
            return True
        if "metropolitan area" in location.lower():
            return True
        normalized = _normalize(location)
        if normalized in _US_STATE_NAMES:
            return True
        city_part = normalized.split(",")[0].strip()
        return city_part in _US_STATE_NAMES

    def _is_us_eligible(self, location: str, mode: str) -> bool:
        """True when a remote/unknown posting plausibly belongs to a US search."""
        if self._is_explicitly_non_us(location):
            return False
        if not location:
            return True
        if mode == "remote" or _REMOTE_RE.search(location):
            return True
        return self._is_us_location(location)

    def _commute_limit(self) -> int | None:
        return self.ctx.max_onsite_miles

    def _is_broad_location(self, location: str) -> bool:
        """Nationwide or unspecified locations — only acceptable for remote roles."""
        if not location:
            return True
        if _REMOTE_RE.search(location):
            return True
        if _US_COUNTRY_RE.search(location):
            return True
        normalized = _normalize(location)
        if normalized in _US_STATE_NAMES:
            return True
        city_part = normalized.split(",")[0].strip()
        return city_part in _US_STATE_NAMES

    def _within_commute_range(self, location: str) -> tuple[bool, str]:
        """On-site and hybrid jobs must be within the user's selected commute radius."""
        origin = self.ctx.origin_zip
        max_miles = self._commute_limit()

        if not origin:
            return False, "onsite/hybrid requires a zip code to verify commute range"
        if not max_miles:
            return False, "onsite/hybrid requires a max commute distance"

        if self._is_broad_location(location):
            return False, "onsite/hybrid requires a specific location within commute range"

        miles = distance_from_origin(origin, location)
        if miles is not None:
            if miles <= max_miles:
                return True, f"within commute radius ({miles:.0f} mi)"
            return False, f"outside commute radius: {miles:.0f} mi (max {max_miles} mi)"

        loc_lower = location.lower()
        if origin.city and origin.city.lower() in loc_lower:
            return True, f"matches origin city ({origin.city})"

        return False, "could not verify onsite/hybrid location within commute range"

    def _check_location(self, job: RawJob) -> FilterVerdict:
        """Geography and work arrangement are evaluated separately for queued searches."""
        location = (job.location or "").strip()
        mode = detect_work_mode(job)

        if self._is_explicitly_non_us(location):
            verdict = FilterVerdict(False, "non-US location")
            self._log_location(job, verdict)
            return verdict

        if mode == "remote":
            if self.ctx.request_remote_allowed and self._is_us_eligible(location, mode):
                verdict = FilterVerdict(True, "remote allowed, US-eligible anywhere")
                self._log_location(job, verdict)
                return verdict
            verdict = FilterVerdict(False, "remote not allowed or outside US")
            self._log_location(job, verdict)
            return verdict

        if mode in ("hybrid", "onsite"):
            ok, reason = self._within_commute_range(location)
            verdict = FilterVerdict(ok, reason if ok else f"{mode} {reason}")
            self._log_location(job, verdict)
            return verdict

        # Unknown arrangement
        if self._is_broad_location(location):
            if self.ctx.request_remote_allowed and self._is_us_eligible(location, "remote"):
                verdict = FilterVerdict(True, "unknown broad location, remote allowed anywhere")
                self._log_location(job, verdict)
                return verdict
            verdict = FilterVerdict(False, "unknown broad location requires remote work mode")
            self._log_location(job, verdict)
            return verdict

        if self.ctx.request_hybrid_allowed or self.ctx.request_onsite_allowed:
            ok, reason = self._within_commute_range(location)
            if ok:
                verdict = FilterVerdict(True, f"unknown arrangement, {reason}")
                self._log_location(job, verdict)
                return verdict
            verdict = FilterVerdict(False, f"unknown arrangement, {reason}")
            self._log_location(job, verdict)
            return verdict

        if self.ctx.request_remote_allowed and self._is_us_eligible(location, mode):
            verdict = FilterVerdict(True, "unknown arrangement, remote allowed")
            self._log_location(job, verdict)
            return verdict

        verdict = FilterVerdict(True, "unknown arrangement, no confirmed conflict")
        self._log_location(job, verdict)
        return verdict

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

    def _check_request_salary_min(self, job: RawJob) -> FilterVerdict:
        floor = self.ctx.profile.min_salary
        if floor <= 0:
            return FilterVerdict(True)

        ceiling = job.salary_max or job.salary_min
        if ceiling is None:
            return FilterVerdict(True)
        if ceiling < floor:
            return FilterVerdict(False, f"below search salary_min: {job.salary_display()}")
        return FilterVerdict(True)

    def _check_request_salary_max(self, job: RawJob) -> FilterVerdict:
        cap = self.ctx.request_salary_max
        if cap is None or cap <= 0:
            return FilterVerdict(True)

        floor = job.salary_min or job.salary_max
        if floor is None:
            return FilterVerdict(True)
        if floor > cap:
            return FilterVerdict(False, f"above search salary_max: {job.salary_display()}")
        return FilterVerdict(True)

    def _check_request_work_mode(self, job: RawJob) -> FilterVerdict:
        mode = detect_work_mode(job)
        allowed = {
            "remote": self.ctx.request_remote_allowed,
            "hybrid": self.ctx.request_hybrid_allowed,
            "onsite": self.ctx.request_onsite_allowed,
        }
        if mode == "unknown":
            return FilterVerdict(True)
        if allowed.get(mode, False):
            return FilterVerdict(True)
        return FilterVerdict(False, f"work mode not allowed: {mode}")

    def _check_excluded_seniority(self, job: RawJob) -> FilterVerdict:
        haystack = f"{job.title} {(job.description or '')[:800]}"
        for pattern in self._seniority:
            if pattern.search(haystack):
                return FilterVerdict(False, f"excluded seniority: {pattern.pattern}")
        return FilterVerdict(True)

    def _check_excluded_keywords(self, job: RawJob) -> FilterVerdict:
        title = job.title.lower()
        description = (job.description or "").lower()
        for keyword in self._excluded_kw:
            if keyword in title or keyword in description:
                return FilterVerdict(False, f"excluded keyword: {keyword}")
        return FilterVerdict(True)

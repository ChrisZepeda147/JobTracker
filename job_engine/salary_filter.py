"""Hard salary filter using job preferences and posting-page compensation."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

from job_engine.models import RawJob
from job_engine.normalizer import normalize_salary
from job_engine.salary_enrichment import enrich_job_salary, extract_compensation_from_text

logger = logging.getLogger("job_engine.salary_filter")


@dataclass(frozen=True)
class SalaryContext:
    salary_min: float | None
    salary_max: float | None


@dataclass
class SalaryResult:
    passed: bool
    status: str  # pass | rejected | unknown
    reason: str = ""
    page_checked: bool = False


def salary_context_from_prefs(prefs: dict | None) -> SalaryContext:
    prefs = prefs or {}
    pref_min = prefs.get("salary_min")
    pref_max = prefs.get("salary_max")
    return SalaryContext(
        salary_min=float(pref_min) if pref_min is not None else None,
        salary_max=float(pref_max) if pref_max is not None else None,
    )


def _normalize_bounds(
    job_min: float | None,
    job_max: float | None,
) -> tuple[float | None, float | None]:
    lo = normalize_salary(job_min)
    hi = normalize_salary(job_max)
    if lo is not None and hi is not None and lo > hi:
        lo, hi = hi, lo
    return lo, hi


def format_salary_range_short(
    salary_min: float | None,
    salary_max: float | None,
) -> str:
    def token(value: float) -> str:
        if value >= 1000:
            whole = int(round(value / 1000))
            return f"${whole}k"
        return f"${value:,.0f}"

    if salary_min is not None and salary_max is not None:
        if int(salary_min) == int(salary_max):
            return token(salary_min)
        return f"{token(salary_min)}–{token(salary_max)}"
    if salary_min is not None:
        return f"{token(salary_min)}+"
    if salary_max is not None:
        return f"up to {token(salary_max)}"
    return "unknown"


def below_salary_floor(
    job_min: float | None,
    job_max: float | None,
    user_min: float | None,
) -> bool:
    """True when the job's high end is below the user's minimum."""
    if user_min is None:
        return False
    top = job_max if job_max is not None else job_min
    if top is None:
        return False
    return top < user_min


def ranges_overlap(
    job_min: float | None,
    job_max: float | None,
    user_min: float | None,
    user_max: float | None,
) -> bool:
    """True when any part of the job range overlaps the user's saved range."""
    effective_job_min = job_min if job_min is not None else job_max
    effective_job_max = job_max if job_max is not None else job_min
    if effective_job_min is None and effective_job_max is None:
        return True

    floor = user_min if user_min is not None else 0.0
    ceiling = user_max if user_max is not None else float("inf")

    assert effective_job_min is not None or effective_job_max is not None
    j_min = effective_job_min if effective_job_min is not None else effective_job_max
    j_max = effective_job_max if effective_job_max is not None else effective_job_min
    assert j_min is not None and j_max is not None

    return not (j_max < floor or j_min > ceiling)


def resolve_job_salary(
    job: RawJob,
    *,
    fetch_page: bool = False,
    database: Any | None = None,
) -> tuple[float | None, float | None, bool]:
    """
    Resolve annual salary for a job.

    Posting-page fetch is handled by salary_enrichment.enrich_job_salary before
    filtering in normal search/refilter flows. fetch_page=True remains for
    one-off backfill calls.
    """
    job.salary_min, job.salary_max = _normalize_bounds(job.salary_min, job.salary_max)
    if job.salary_min is not None or job.salary_max is not None:
        return job.salary_min, job.salary_max, False

    if fetch_page:
        enriched = enrich_job_salary(job, database=database)
        if enriched or job.salary_min is not None or job.salary_max is not None:
            return job.salary_min, job.salary_max, True

    body = "\n".join(part for part in (job.title or "", job.description or "") if part)
    desc_min, desc_max = extract_compensation_from_text(body)
    if desc_min is not None or desc_max is not None:
        job.salary_min, job.salary_max = desc_min, desc_max
        return job.salary_min, job.salary_max, False

    return None, None, fetch_page


def evaluate_job_salary(
    job: RawJob,
    ctx: SalaryContext,
    *,
    fetch_page: bool = False,
    database: Any | None = None,
) -> SalaryResult:
    """Hard-filter a job against saved salary_min / salary_max from preferences."""
    if ctx.salary_min is None and ctx.salary_max is None:
        return SalaryResult(True, "pass", "no salary preferences")

    job_min, job_max, page_checked = resolve_job_salary(
        job,
        fetch_page=fetch_page,
        database=database,
    )

    if job_min is None and job_max is None:
        checked = page_checked or bool(getattr(job, "salary_page_checked", False))
        if checked:
            return SalaryResult(True, "unknown", "salary not listed on posting", page_checked=True)
        return SalaryResult(True, "unknown", "salary could not be verified", page_checked=False)

    if below_salary_floor(job_min, job_max, ctx.salary_min):
        job_range = format_salary_range_short(job_min, job_max)
        user_floor = format_salary_range_short(ctx.salary_min, None)
        logger.info(
            "[FILTER] rejected: salary %s below your min %s",
            job_range,
            user_floor,
        )
        return SalaryResult(
            False,
            "rejected",
            f"salary {job_range} below your min {user_floor}",
            page_checked=page_checked,
        )

    if ranges_overlap(job_min, job_max, ctx.salary_min, ctx.salary_max):
        return SalaryResult(
            True,
            "pass",
            f"salary {format_salary_range_short(job_min, job_max)} overlaps user range",
            page_checked=page_checked,
        )

    job_range = format_salary_range_short(job_min, job_max)
    user_range = format_salary_range_short(ctx.salary_min, ctx.salary_max)
    logger.info(
        "[FILTER] rejected: salary %s outside user's saved range %s",
        job_range,
        user_range,
    )
    return SalaryResult(
        False,
        "rejected",
        f"salary {job_range} outside user's saved range {user_range}",
        page_checked=page_checked,
    )

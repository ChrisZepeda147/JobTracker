"""Mark borderline jobs as stretch (show lower) instead of hard-rejecting."""

from __future__ import annotations

from job_engine.experience_filter import extract_required_years_for_job
from job_engine.models import RawJob
from job_engine.salary_filter import SalaryContext, ranges_overlap


def compute_is_stretch(job: RawJob, salary_ctx: SalaryContext, max_preferred_years: int | None) -> bool:
    """True when the job passed hard filters but is a borderline fit."""
    if max_preferred_years is not None:
        required = extract_required_years_for_job(job)
        if required is not None and required == max_preferred_years:
            return True

    job_min = job.salary_min
    job_max = job.salary_max
    if job_min is not None or job_max is not None:
        if ranges_overlap(job_min, job_max, salary_ctx.salary_min, salary_ctx.salary_max):
            ceiling = salary_ctx.salary_max
            floor = salary_ctx.salary_min
            hi = job_max if job_max is not None else job_min
            lo = job_min if job_min is not None else job_max
            if ceiling is not None and hi is not None and hi > ceiling:
                return True
            if floor is not None and lo is not None and lo < floor:
                return True

    missing = list(job.missing_skills or [])
    if len(missing) == 1:
        return True

    return False

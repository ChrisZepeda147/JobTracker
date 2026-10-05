"""Load candidate context from Supabase for the search worker."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

from job_engine.job_feedback import JobFeedbackContext, apply_feedback_to_profile, load_job_feedback
from job_engine.location_utils import ZipInfo, resolve_us_zip, scraper_location
from job_engine.matcher import UserProfile
from job_engine.search_models import SearchRequest

logger = logging.getLogger("job_engine.user_context")


def _work_preference(remote: bool, hybrid: bool, onsite: bool) -> str:
    if remote and not hybrid and not onsite:
        return "remote"
    if onsite and not remote and not hybrid:
        return "onsite"
    if hybrid:
        return "hybrid"
    if remote:
        return "remote"
    return "remote"


def _format_projects_text(projects: list[dict[str, Any]]) -> str:
    parts: list[str] = []
    for project in projects:
        block = [
            str(project.get("name") or "").strip(),
            str(project.get("readme_text") or "").strip(),
            str(project.get("personal_contribution") or "").strip(),
            str(project.get("ai_notes") or "").strip(),
            " ".join(str(t) for t in (project.get("technologies") or []) if str(t).strip()),
        ]
        text = "\n".join(part for part in block if part)
        if text:
            parts.append(text)
    return "\n\n".join(parts)


def _format_profile_text(profile_row: dict[str, Any] | None) -> tuple[list[str], str]:
    if not profile_row:
        return [], ""

    technical_skills = [
        str(skill).strip()
        for skill in (profile_row.get("technical_skills") or [])
        if str(skill).strip()
    ]
    strengths = [
        str(item).strip()
        for item in (profile_row.get("professional_strengths") or [])
        if str(item).strip()
    ]
    parts = [
        str(profile_row.get("current_title") or "").strip(),
        str(profile_row.get("professional_summary") or "").strip(),
        str(profile_row.get("education") or "").strip(),
        str(profile_row.get("additional_context") or "").strip(),
        " ".join(strengths),
    ]
    profile_text = "\n".join(part for part in parts if part)
    return technical_skills, profile_text


def build_profile_from_supabase(
    request: SearchRequest,
    prefs: dict[str, Any] | None,
    resume_text: str,
    candidate_profile: dict[str, Any] | None = None,
    projects: list[dict[str, Any]] | None = None,
) -> UserProfile:
    """Merge job_preferences, active resume, and search request into a UserProfile."""
    prefs = prefs or {}

    salary_floor = request.salary_min
    pref_min = prefs.get("salary_min")
    if pref_min is not None:
        pref_min = float(pref_min)
        salary_floor = max(salary_floor or 0, pref_min) if salary_floor else pref_min

    target_roles = list(prefs.get("target_roles") or [])
    for title in request.search_titles():
        if title not in target_roles:
            target_roles.insert(0, title)

    preferred_cities = list(prefs.get("preferred_locations") or [])
    home_zip = prefs.get("home_zip") or request.location_zip
    resolved_location = scraper_location(request.location, home_zip)
    if resolved_location and resolved_location not in preferred_cities:
        preferred_cities.insert(0, resolved_location)
    elif request.location.strip() and request.location.strip() not in preferred_cities:
        preferred_cities.insert(0, request.location.strip())

    search_titles = request.search_titles()
    primary_title = search_titles[0] if search_titles else "Software Engineer"

    technical_skills, profile_text = _format_profile_text(candidate_profile)
    projects_text = _format_projects_text(projects or [])

    return UserProfile(
        resume_text=resume_text,
        technical_skills=technical_skills,
        profile_text=profile_text,
        projects_text=projects_text,
        target_titles=target_roles or search_titles,
        min_salary=float(salary_floor or 0),
        work_location_preference=_work_preference(
            request.remote_allowed,
            request.hybrid_allowed,
            request.onsite_allowed,
        ),
        preferred_cities=preferred_cities,
        blacklisted_companies=[],
        min_match_score=60,
        top_n=10,
        require_salary_data=False,
        search={
            "search_term": primary_title,
            "location": resolved_location,
            "is_remote": request.remote_allowed and not request.onsite_allowed,
            "results_wanted": 10,
            "hours_old": request.hours_old(),
        },
    )


@dataclass
class UserSearchContext:
    profile: UserProfile
    feedback: JobFeedbackContext
    excluded_seniority: list[str]
    excluded_keywords: list[str]
    request_salary_max: float | None
    request_remote_allowed: bool
    request_hybrid_allowed: bool
    request_onsite_allowed: bool
    prefs_remote_allowed: bool
    prefs_hybrid_allowed: bool
    prefs_onsite_allowed: bool
    prefs_salary_min: float | None
    prefs_salary_max: float | None
    max_preferred_experience_years: int | None
    origin_zip: ZipInfo | None
    max_commute_miles: int | None


def load_user_rescore_profile(database: Any, user_id: str) -> UserProfile:
    """Build a UserProfile from stored preferences and candidate context (no scrape)."""
    feedback = load_job_feedback(database, user_id)
    prefs = database.load_job_preferences(user_id) or {}
    resume_text = database.load_active_resume_text(user_id)
    candidate_profile = database.load_candidate_profile(user_id)
    projects = database.load_user_projects(user_id)

    technical_skills, profile_text = _format_profile_text(candidate_profile)
    projects_text = _format_projects_text(projects)

    target_roles = [str(role).strip() for role in (prefs.get("target_roles") or []) if str(role).strip()]
    if not target_roles:
        target_roles = ["Software Engineer"]

    preferred_cities = [
        str(city).strip() for city in (prefs.get("preferred_locations") or []) if str(city).strip()
    ]

    salary_floor = prefs.get("salary_min")

    profile = UserProfile(
        resume_text=resume_text,
        technical_skills=technical_skills,
        profile_text=profile_text,
        projects_text=projects_text,
        target_titles=target_roles,
        min_salary=float(salary_floor or 0),
        work_location_preference=_work_preference(
            bool(prefs.get("remote_allowed", True)),
            bool(prefs.get("hybrid_allowed", True)),
            bool(prefs.get("onsite_allowed", False)),
        ),
        preferred_cities=preferred_cities,
        blacklisted_companies=[],
        min_match_score=60,
        top_n=10,
        require_salary_data=False,
        search={},
    )
    return apply_feedback_to_profile(profile, feedback)


def load_user_search_context(database: Any, user_id: str, request: SearchRequest) -> UserSearchContext:
    feedback = load_job_feedback(database, user_id)
    prefs = database.load_job_preferences(user_id)
    resume_text = database.load_active_resume_text(user_id)
    candidate_profile = database.load_candidate_profile(user_id)
    projects = database.load_user_projects(user_id)
    profile = apply_feedback_to_profile(
        build_profile_from_supabase(
            request,
            prefs,
            resume_text,
            candidate_profile=candidate_profile,
            projects=projects,
        ),
        feedback,
    )

    salary_max = request.salary_max
    if salary_max is None and prefs and prefs.get("salary_max") is not None:
        salary_max = float(prefs["salary_max"])

    home_zip = (prefs or {}).get("home_zip") or request.location_zip
    zip_info = resolve_us_zip(home_zip)

    max_commute = (prefs or {}).get("max_commute_miles")
    if max_commute is not None:
        max_commute = int(max_commute)
    elif request.max_onsite_miles is not None:
        max_commute = int(request.max_onsite_miles)

    salary_floor = prefs.get("salary_min")
    pref_max = prefs.get("salary_max")

    return UserSearchContext(
        profile=profile,
        feedback=feedback,
        excluded_seniority=list((prefs or {}).get("excluded_seniority") or []),
        excluded_keywords=list((prefs or {}).get("excluded_keywords") or []),
        request_salary_max=salary_max,
        request_remote_allowed=request.remote_allowed,
        request_hybrid_allowed=request.hybrid_allowed,
        request_onsite_allowed=request.onsite_allowed,
        prefs_remote_allowed=bool((prefs or {}).get("remote_allowed", True)),
        prefs_hybrid_allowed=bool((prefs or {}).get("hybrid_allowed", True)),
        prefs_onsite_allowed=bool((prefs or {}).get("onsite_allowed", False)),
        prefs_salary_min=float(salary_floor) if salary_floor is not None else None,
        prefs_salary_max=float(pref_max) if pref_max is not None else None,
        max_preferred_experience_years=(
            int((prefs or {})["max_preferred_experience_years"])
            if (prefs or {}).get("max_preferred_experience_years") is not None
            else None
        ),
        origin_zip=zip_info,
        max_commute_miles=max_commute,
    )

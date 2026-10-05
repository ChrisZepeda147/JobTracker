"""Process a queued job_search_requests row through the existing pipeline."""

from __future__ import annotations

import logging
from typing import Any

from job_engine.config import get_settings
from job_engine.database import JobDatabase
from job_engine.matcher import build_scorer, select_candidates
from job_engine.models import RawJob
from job_engine.normalizer import normalize_jobs
from job_engine.scraper_engine import RateLimitError, ScraperConfig, ScraperEngine
from job_engine.location_utils import scraper_location
from job_engine.education_filter import evaluate_job_education
from job_engine.experience_filter import evaluate_job_experience, experience_context_from_prefs
from job_engine.keyword_filter import evaluate_job_keywords
from job_engine.location_filter import evaluate_job_location, location_context_from_prefs
from job_engine.salary_enrichment import enrich_jobs_salaries
from job_engine.salary_filter import evaluate_job_salary, salary_context_from_prefs, SalaryContext
from job_engine.salary_resolver import set_fetch_budget
from job_engine.stretch import compute_is_stretch
from job_engine.search_filters import SearchRequestFilter
from job_engine.search_models import SCRAPER_TO_UI, SearchRequest
from job_engine.user_context import load_user_rescore_profile, load_user_search_context

logger = logging.getLogger("job_engine.search_worker")

log = logging.getLogger("worker")

_REVIEWED_STATUSES = frozenset({"applied", "skipped", "opened", "apply_later"})


def _score_sort_key(job: RawJob) -> tuple[int, int]:
    score = job.match_score if job.match_score is not None else -1
    return (0 if job.match_score is not None else 1, -score)


def _trim_to_top_matches(jobs: list[RawJob], limit: int) -> list[RawJob]:
    """Keep only the highest-scoring jobs after ranking."""
    if limit <= 0 or len(jobs) <= limit:
        return jobs
    return sorted(jobs, key=_score_sort_key)[:limit]


def select_jobs_to_show(
    survivors: list[RawJob],
    hash_to_id: dict[str, str],
    state_map: dict[str, str],
    limit: int,
) -> list[str]:
    """Pick up to `limit` unseen jobs, highest match_score first."""
    ranked = sorted(survivors, key=_score_sort_key)
    selected: list[str] = []
    for job in ranked:
        job_id = hash_to_id.get(job.normalized_url_hash)
        if not job_id:
            continue
        status = state_map.get(job_id)
        if status in _REVIEWED_STATUSES or status is not None:
            continue
        selected.append(job_id)
        if len(selected) >= limit:
            break
    return selected


def _apply_stored_scores(jobs: list[RawJob], stored: dict[str, dict[str, Any]]) -> tuple[list[RawJob], list[RawJob]]:
    """Split jobs into those needing fresh scoring vs. reuse stored scores."""
    reuse: list[RawJob] = []
    need_score: list[RawJob] = []
    for job in jobs:
        row = stored.get(job.normalized_url_hash)
        if not row or row.get("match_score") is None:
            need_score.append(job)
            continue
        stored_desc = (row.get("description") or "").strip()
        current_desc = (job.description or "").strip()
        if stored_desc and current_desc and stored_desc != current_desc:
            need_score.append(job)
            continue
        job.match_score = int(row["match_score"])
        job.fit_reason = row.get("fit_reason")
        job.missing_skills = list(row.get("missing_skills") or [])
        job.scored_by = row.get("scored_by") or "cached"
        reuse.append(job)
    return need_score, reuse


def scrape_by_source(
    request: SearchRequest,
    scraper_sites: list[str],
    source_results: dict[str, dict[str, Any]],
) -> list[RawJob]:
    """Scrape each board for every selected title; failures are isolated per call."""
    collected: list[RawJob] = []
    is_remote = request.nationwide_remote or (request.remote_allowed and not request.onsite_allowed)
    if request.nationwide_remote:
        search_location = "United States"
    else:
        search_location = scraper_location(request.location, request.location_zip)
    titles = request.search_titles()

    settings = get_settings()
    per_query = settings.results_wanted_per_query

    config = ScraperConfig(
        search_term=titles[0],
        location=search_location or "United States",
        is_remote=is_remote,
        results_wanted=per_query,
        hours_old=request.hours_old(),
    )
    engine = ScraperEngine(config)

    for site in scraper_sites:
        ui_key = SCRAPER_TO_UI.get(site, site)
        site_total = 0
        last_error: str | None = None
        any_success = False

        for title in titles:
            log.info("[%s] Starting %r", ui_key.upper(), title)
            try:
                jobs = engine.search(
                    search_term=title,
                    location=search_location,
                    is_remote=is_remote,
                    results_wanted=per_query,
                    hours_old=request.hours_old(),
                    sites=(site,),
                )
                any_success = True
                site_total += len(jobs)
                collected.extend(jobs)
                log.info("[%s] %r found %s", ui_key.upper(), title, len(jobs))
            except RateLimitError as exc:
                last_error = str(exc)[:200]
                log.warning("[%s] %r failed: %s", ui_key.upper(), title, last_error)
            except Exception as exc:
                last_error = str(exc)[:200]
                log.warning("[%s] %r failed: %s", ui_key.upper(), title, last_error)

        if any_success:
            source_results[ui_key] = {"status": "success", "jobs_found": site_total}
            log.info("[%s] Found %s total", ui_key.upper(), site_total)
        elif last_error:
            status = "blocked" if "403" in last_error or "429" in last_error else "failed"
            source_results[ui_key] = {"status": status, "jobs_found": 0, "error": last_error}
            log.warning("[%s] Failed: %s", ui_key.upper(), last_error)
        else:
            source_results[ui_key] = {"status": "success", "jobs_found": 0}

    return collected


def _filter_payload(job: RawJob) -> dict[str, Any]:
    return {
        "commute_miles": round(job.commute_miles, 1) if job.commute_miles is not None else None,
        "work_arrangement": job.work_arrangement,
        "location_status": job.location_status or "unverified",
        "salary_status": job.salary_status or "pass",
        "keyword_status": job.keyword_status or "pass",
        "experience_status": job.experience_status or "pass",
        "education_status": job.education_status or "pass",
        "is_stretch": bool(getattr(job, "is_stretch", False)),
    }


def _apply_stretch_flags(
    jobs: list[RawJob],
    salary_ctx: SalaryContext,
    max_preferred_years: int | None,
) -> None:
    for job in jobs:
        job.is_stretch = compute_is_stretch(job, salary_ctx, max_preferred_years)


def _filter_by_job_id(jobs: list[RawJob], hash_to_id: dict[str, str]) -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    for job in jobs:
        job_id = hash_to_id.get(job.normalized_url_hash)
        if job_id:
            out[job_id] = _filter_payload(job)
    return out


def refilter_user_job_filters(database: JobDatabase, user_id: str) -> int:
    """Re-evaluate location and salary hard filters for every stored job."""
    set_fetch_budget(None)
    prefs = database.load_job_preferences(user_id)
    location_ctx = location_context_from_prefs(prefs)
    salary_ctx = salary_context_from_prefs(prefs)
    experience_ctx = experience_context_from_prefs(prefs)
    jobs = database.load_all_jobs()
    if not jobs:
        log.info("[FILTER] No stored jobs to refilter")
        return 0

    salary_enriched = enrich_jobs_salaries(jobs, database=database)
    if salary_enriched:
        log.info("[SALARY] Backfill enriched %s job(s) from posting pages", salary_enriched)

    hash_to_id = database.job_ids_for_hashes([job.normalized_url_hash for job in jobs])
    updates: list[dict[str, Any]] = []
    location_rejected = 0
    location_unverified = 0
    salary_rejected = 0
    salary_unknown = 0
    keyword_rejected = 0
    experience_rejected = 0
    experience_unknown = 0
    excluded_keywords = list((prefs or {}).get("excluded_keywords") or [])

    for job in jobs:
        job_id = hash_to_id.get(job.normalized_url_hash)
        if not job_id:
            continue

        location_result = evaluate_job_location(job, location_ctx)
        job.commute_miles = location_result.miles
        job.work_arrangement = location_result.arrangement
        job.location_status = location_result.status
        if location_result.status == "rejected":
            location_rejected += 1
        elif location_result.status == "unverified":
            location_unverified += 1

        salary_result = evaluate_job_salary(job, salary_ctx, fetch_page=False, database=database)
        job.salary_status = salary_result.status
        if salary_result.status == "rejected":
            salary_rejected += 1
        elif salary_result.status == "unknown":
            salary_unknown += 1

        keyword_result = evaluate_job_keywords(job, excluded_keywords)
        job.keyword_status = keyword_result.status
        if keyword_result.status == "rejected":
            keyword_rejected += 1

        experience_result = evaluate_job_experience(job, experience_ctx)
        job.experience_status = experience_result.status
        if experience_result.status == "rejected":
            experience_rejected += 1
        elif experience_result.status == "unknown":
            experience_unknown += 1
        if experience_result.required_years is not None:
            from job_engine.experience_filter import format_experience_requirement

            job.experience_requirement = format_experience_requirement(experience_result.required_years)

        education_result = evaluate_job_education(job)
        job.education_status = education_result.status

        _apply_stretch_flags([job], salary_ctx, experience_ctx.max_preferred_years)
        updates.append({"job_id": job_id, **_filter_payload(job)})

    database.update_job_salaries(jobs)
    database.update_job_experience_requirements(jobs)
    written = database.upsert_user_job_filter_states(user_id, updates)
    log.info(
        "[FILTER] Refiltered %s job(s): location rejected=%s unverified=%s, salary rejected=%s unknown=%s, keyword rejected=%s, experience rejected=%s unknown=%s",
        written,
        location_rejected,
        location_unverified,
        salary_rejected,
        salary_unknown,
        keyword_rejected,
        experience_rejected,
        experience_unknown,
    )
    return written


def refilter_user_job_locations(database: JobDatabase, user_id: str) -> int:
    """Backward-compatible alias — refilters location and salary."""
    return refilter_user_job_filters(database, user_id)


def process_refilter_request(database: JobDatabase, row: dict[str, Any]) -> None:
    """Re-evaluate location hard filter for all stored jobs (no scrape, no rescore)."""
    request = SearchRequest.from_row(row)
    log.info("[FILTER] Request %s — backfill location + salary filters on stored jobs", request.id[:8])
    updated = refilter_user_job_filters(database, request.user_id)
    database.finish_search_request(
        request.id,
        status="completed",
        jobs_found=updated,
        new_jobs_found=0,
        source_results={"refilter": {"status": "success", "jobs_refiltered": updated}},
        error=None,
    )
    log.info("[DONE] Location backfill complete (%s job(s))", updated)


def process_rescore_request(database: JobDatabase, row: dict[str, Any]) -> None:
    """Re-score every stored job with the local scorer and the user's current profile."""
    request = SearchRequest.from_row(row)
    log.info("[RESCORE] Request %s — loading stored jobs", request.id[:8])

    jobs = database.load_all_jobs()
    if not jobs:
        database.finish_search_request(
            request.id,
            status="completed",
            jobs_found=0,
            new_jobs_found=0,
            source_results={"rescore": {"status": "success", "jobs_rescored": 0}},
            error=None,
        )
        log.info("[RESCORE] No stored jobs to rescore")
        return

    profile = load_user_rescore_profile(database, request.user_id)
    settings = get_settings()
    scorer = build_scorer(profile, settings, force_local=True)
    log.info("[RESCORE] Scoring %s job(s) with updated local criteria", len(jobs))
    scored = scorer.score_jobs(jobs)
    updated = database.record_match_scores([job for job in scored if job.match_score is not None])
    log.info("[RESCORE] Updated %s job score(s)", updated)

    database.finish_search_request(
        request.id,
        status="completed",
        jobs_found=len(jobs),
        new_jobs_found=updated,
        source_results={"rescore": {"status": "success", "jobs_rescored": updated}},
        error=None,
    )
    log.info("[DONE] Rescored %s job(s)", updated)


def rescore_all_stored_jobs(database: JobDatabase, user_id: str) -> int:
    """Re-score every stored job immediately (no queued request)."""
    jobs = database.load_all_jobs()
    if not jobs:
        log.info("[RESCORE] No stored jobs to rescore")
        return 0

    profile = load_user_rescore_profile(database, user_id)
    settings = get_settings()
    scorer = build_scorer(profile, settings, force_local=True)
    log.info("[RESCORE] Scoring %s job(s) for user %s", len(jobs), user_id[:8])
    scored = scorer.score_jobs(jobs)
    updated = database.record_match_scores([job for job in scored if job.match_score is not None])
    log.info("[RESCORE] Updated %s job score(s)", updated)
    return updated


def process_search_request(database: JobDatabase, row: dict[str, Any]) -> None:
    """Run the full pipeline for one claimed search request."""
    request = SearchRequest.from_row(row)
    if request.rescore_only:
        process_rescore_request(database, row)
        return
    if request.refilter_only:
        process_refilter_request(database, row)
        return

    titles = request.search_titles()
    log.info("[SEARCH] Request %s (%s title(s))", request.id[:8], len(titles))

    source_results: dict[str, dict[str, Any]] = dict(request.source_results)
    scraper_sites, skipped = request.resolve_scraper_sites()
    source_results.update(skipped)

    for ui_key, meta in skipped.items():
        log.info("[%s] Skipped (%s)", ui_key.upper(), meta.get("error", "unsupported"))

    raw_jobs: list[RawJob] = []
    if scraper_sites:
        raw_jobs = scrape_by_source(request, scraper_sites, source_results)
    elif skipped:
        database.finish_search_request(
            request.id,
            status="failed",
            jobs_found=0,
            new_jobs_found=0,
            source_results=source_results,
            error="No supported sources selected",
        )
        log.error("[DONE] Request failed — no supported sources")
        return
    else:
        log.warning("[SEARCH] No sources selected")

    normalized = normalize_jobs(raw_jobs)
    log.info("[NORMALIZE] %s raw → %s unique", len(raw_jobs), len(normalized))

    settings = get_settings()
    ctx = load_user_search_context(database, request.user_id, request)
    user_suppressed = database.load_user_suppressed_job_hashes(request.user_id)
    database.rules(refresh=True)

    set_fetch_budget(max(settings.search_result_limit * 2, 30))
    salary_enriched = enrich_jobs_salaries(normalized, database=database)
    if salary_enriched:
        log.info("[SALARY] Enriched %s job(s) from posting pages", salary_enriched)
    database.update_job_salaries(normalized)
    set_fetch_budget(None)

    hard_filter = SearchRequestFilter(
        ctx,
        database=database,
        user_suppressed_hashes=user_suppressed,
        salary_database=database,
    )
    survivors, rejections = hard_filter.apply(normalized)
    log.info("[FILTER] %s unique → %s valid", len(normalized), len(survivors))
    for reason, count in sorted(rejections.items(), key=lambda item: -item[1])[:6]:
        log.info("[FILTER]   dropped %s: %s", count, reason)

    attempted_keys = [SCRAPER_TO_UI.get(site, site) for site in scraper_sites]
    attempted_results = [source_results.get(key, {}) for key in attempted_keys]
    all_sources_failed = bool(attempted_results) and all(
        result.get("status") != "success" for result in attempted_results
    )
    if all_sources_failed:
        database.finish_search_request(
            request.id,
            status="failed",
            jobs_found=0,
            new_jobs_found=0,
            source_results=source_results,
            error="All selected sources failed or returned no results",
        )
        log.error("[DONE] Request failed — no sources returned jobs")
        return

    result_limit = settings.search_result_limit

    if survivors:
        local_scorer = build_scorer(ctx.profile, settings, force_local=True)
        survivors = local_scorer.score_jobs(survivors)
        log.info("[SCORE] Local pre-rank on %s filtered job(s)", len(survivors))
        survivors = _trim_to_top_matches(survivors, result_limit)
        log.info("[SELECT] Kept top %s job(s) by match score", len(survivors))

        database.update_job_salaries(survivors)
        database.update_job_experience_requirements(survivors)
        report = database.save_jobs(survivors)
        log.info("[SAVE] %s", report.summary())

    hashes = [job.normalized_url_hash for job in survivors]
    stored = database.load_stored_jobs_by_hashes(hashes)
    need_score, reused = _apply_stored_scores(survivors, stored)
    log.info("[SCORE] %s cached / %s to score", len(reused), len(need_score))

    api_limit = settings.max_jobs_to_score
    candidates, overflow = select_candidates(need_score, api_limit)

    scored_new: list[RawJob] = []
    if candidates:
        scorer = build_scorer(ctx.profile, settings)
        scored_new = scorer.score_jobs(candidates)
        api_count = sum(1 for j in scored_new if j.scored_by and "local" not in (j.scored_by or "").lower())
        local_count = len(scored_new) - api_count
        log.info("[SCORE] %s API / %s local", api_count, local_count + len(overflow))

    if overflow:
        rescored = build_scorer(ctx.profile, settings, force_local=True).score_jobs(overflow)
        scored_new = scored_new + rescored

    if scored_new:
        database.record_match_scores([j for j in scored_new if j.match_score is not None])

    salary_ctx = salary_context_from_prefs(database.load_job_preferences(request.user_id))
    _apply_stretch_flags(survivors, salary_ctx, ctx.max_preferred_experience_years)

    survivors = sorted(
        survivors,
        key=lambda job: (1 if job.is_stretch else 0, _score_sort_key(job)),
    )
    survivors = _trim_to_top_matches(survivors, result_limit)

    hash_to_id = database.job_ids_for_hashes(hashes)
    filter_by_job = _filter_by_job_id(survivors, hash_to_id)
    state_map = database.load_user_job_state_map(request.user_id)
    selected_job_ids = select_jobs_to_show(survivors, hash_to_id, state_map, result_limit)
    log.info(
        "[SELECT] %s ranked job(s) → %s new job(s) for user",
        len(survivors),
        len(selected_job_ids),
    )

    known_states = set(state_map)
    new_count = database.ensure_user_job_states(
        request.user_id,
        selected_job_ids,
        known_states,
        location_by_job=filter_by_job,
    )
    database.upsert_user_job_filter_states(
        request.user_id,
        [{"job_id": jid, **filter_by_job[jid]} for jid in selected_job_ids if jid in filter_by_job],
    )

    database.finish_search_request(
        request.id,
        status="completed",
        jobs_found=len(survivors),
        new_jobs_found=new_count,
        source_results=source_results,
        error=None,
    )
    log.info("[DONE] %s new job(s) for user (%s valid total)", new_count, len(survivors))

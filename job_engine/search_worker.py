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
from job_engine.search_filters import SearchRequestFilter
from job_engine.search_models import SCRAPER_TO_UI, SearchRequest
from job_engine.user_context import load_user_rescore_profile, load_user_search_context

logger = logging.getLogger("job_engine.search_worker")

log = logging.getLogger("worker")

_REVIEWED_STATUSES = frozenset({"applied", "skipped", "opened", "apply_later"})


def _score_sort_key(job: RawJob) -> tuple[int, int]:
    score = job.match_score if job.match_score is not None else -1
    return (0 if job.match_score is not None else 1, -score)


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
    is_remote = request.remote_allowed and not request.onsite_allowed
    search_location = scraper_location(request.location, request.location_zip)
    titles = request.search_titles()

    config = ScraperConfig(
        search_term=titles[0],
        location=search_location or "United States",
        is_remote=is_remote,
        results_wanted=20,
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
                    results_wanted=20,
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

    ctx = load_user_search_context(database, request.user_id, request)
    user_suppressed = database.load_user_suppressed_job_hashes(request.user_id)
    database.rules(refresh=True)
    hard_filter = SearchRequestFilter(ctx, database=database, user_suppressed_hashes=user_suppressed)
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

    if survivors:
        report = database.save_jobs(survivors)
        log.info("[SAVE] %s", report.summary())

    hashes = [job.normalized_url_hash for job in survivors]
    stored = database.load_stored_jobs_by_hashes(hashes)
    need_score, reused = _apply_stored_scores(survivors, stored)
    log.info("[SCORE] %s cached / %s to score", len(reused), len(need_score))

    settings = get_settings()
    limit = settings.max_jobs_to_score
    candidates, overflow = select_candidates(need_score, limit)

    scored_new: list[RawJob] = []
    if candidates:
        scorer = build_scorer(ctx.profile, settings)
        scored_new = scorer.score_jobs(candidates)
        api_count = sum(1 for j in scored_new if j.scored_by and "local" not in (j.scored_by or "").lower())
        local_count = len(scored_new) - api_count
        log.info("[SCORE] %s API / %s local", api_count, local_count + len(overflow))

    if overflow:
        local_scorer = build_scorer(ctx.profile, settings, force_local=True)
        scored_new = scored_new + local_scorer.score_jobs(overflow)

    if scored_new:
        database.record_match_scores([j for j in scored_new if j.match_score is not None])

    hash_to_id = database.job_ids_for_hashes(hashes)
    state_map = database.load_user_job_state_map(request.user_id)
    daily_limit = settings.daily_job_limit
    selected_job_ids = select_jobs_to_show(survivors, hash_to_id, state_map, daily_limit)
    log.info(
        "[SELECT] %s valid candidates → top %s shown to user",
        len(survivors),
        len(selected_job_ids),
    )

    known_states = set(state_map)
    new_count = database.ensure_user_job_states(request.user_id, selected_job_ids, known_states)

    database.finish_search_request(
        request.id,
        status="completed",
        jobs_found=len(survivors),
        new_jobs_found=new_count,
        source_results=source_results,
        error=None,
    )
    log.info("[DONE] %s new job(s) for user (%s valid total)", new_count, len(survivors))

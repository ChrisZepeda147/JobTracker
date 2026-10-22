#!/usr/bin/env python3
"""Run one live search and print a stage-by-stage funnel (no filter changes)."""

from __future__ import annotations

import json
import sys
from collections import Counter, defaultdict
from copy import deepcopy
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from job_engine.config import get_settings
from job_engine.database import JobDatabase
from job_engine.experience_filter import evaluate_job_experience
from job_engine.filter_stats import SearchFilterStats
from job_engine.listing_availability import check_job_listing_availability, evaluate_availability_from_fetch
from job_engine.management_filter import evaluate_management_requirements, evaluate_strict_seniority_title
from job_engine.matcher import build_scorer
from job_engine.models import RawJob
from job_engine.normalizer import normalize_jobs
from job_engine.posting_fetch import get_cached_posting, set_fetch_budget
from job_engine.posting_hydration import HydrationStats, hydrate_job_postings
from job_engine.rejection_audit import RejectionAudit
from job_engine.salary_enrichment import enrich_jobs_salaries
from job_engine.scraper_engine import RateLimitError, ScraperConfig, ScraperEngine
from job_engine.search_filters import SearchRequestFilter
from job_engine.search_models import SCRAPER_TO_UI, SearchRequest
from job_engine.search_worker import (
    _apply_listing_availability,
    _finalize_survivor_stats,
    _sync_hydration_stats,
    _trim_to_top_matches,
    scrape_by_source,
)
from job_engine.user_context import load_user_search_context


@dataclass
class FunnelReport:
    prefs_summary: dict = field(default_factory=dict)
    config: dict = field(default_factory=dict)
    per_source: dict[str, int] = field(default_factory=dict)
    per_title: dict[str, int] = field(default_factory=dict)
    raw_scraped: int = 0
    deduped: int = 0
    fresh_note: str = ""
    after_seniority: int = 0
    after_location: int = 0
    after_salary: int = 0
    experience_verified_pass: int = 0
    experience_unknown_kept: int = 0
    experience_rejected: int = 0
    hard_filter_survivors: int = 0
    reject_reasons: Counter = field(default_factory=Counter)
    reject_samples: dict[str, list[str]] = field(default_factory=lambda: defaultdict(list))
    scoring_pool: int = 0
    availability_checked: int = 0
    closed_removed: int = 0
    final_saved: int = 0
    plausible_unknown_experience: int = 0


def _latest_search_request(database: JobDatabase, user_id: str) -> SearchRequest | None:
    try:
        response = (
            database.client.table("job_search_requests")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if response.data:
            return SearchRequest.from_row(response.data[0])
    except Exception:
        pass
    return None


def _request_from_prefs(user_id: str, prefs: dict) -> SearchRequest:
    titles = [str(t).strip() for t in (prefs.get("target_roles") or []) if str(t).strip()]
    if not titles:
        titles = ["Software Engineer"]
    locs = prefs.get("preferred_locations") or []
    location = str(locs[0]) if locs else "United States"
    return SearchRequest(
        id="funnel-diagnostic",
        user_id=user_id,
        query=titles[0],
        titles=titles[:5],
        location=location,
        location_zip=prefs.get("home_zip"),
        salary_min=float(prefs["salary_min"]) if prefs.get("salary_min") is not None else None,
        salary_max=float(prefs["salary_max"]) if prefs.get("salary_max") is not None else None,
        posted_within_days=int(prefs["posted_within_days"]) if prefs.get("posted_within_days") else 21,
        remote_allowed=bool(prefs.get("remote_allowed", True)),
        hybrid_allowed=bool(prefs.get("hybrid_allowed", True)),
        onsite_allowed=bool(prefs.get("onsite_allowed", False)),
        max_onsite_miles=int(prefs["max_commute_miles"]) if prefs.get("max_commute_miles") else None,
        sources=list(prefs.get("search_sources") or ["linkedin", "indeed", "builtin"]),
        nationwide_remote=bool(prefs.get("remote_allowed")) and not bool(prefs.get("onsite_allowed")),
    )


def _scrape_with_breakdown(request: SearchRequest) -> tuple[list[RawJob], dict[str, int], dict[str, int]]:
    """Scrape per source/title like the worker, returning jobs + counts."""
    from job_engine.location_utils import scraper_location

    collected: list[RawJob] = []
    per_source: dict[str, int] = defaultdict(int)
    per_title: dict[str, int] = defaultdict(int)
    strict = True
    is_remote = request.nationwide_remote or (request.remote_allowed and not request.onsite_allowed)
    search_location = "United States" if request.nationwide_remote else scraper_location(request.location, request.location_zip)
    settings = get_settings()
    per_query = settings.results_wanted_per_query
    scraper_sites, _ = request.resolve_scraper_sites()
    config = ScraperConfig(
        search_term=request.search_titles()[0],
        location=search_location or "United States",
        is_remote=is_remote,
        results_wanted=per_query,
        hours_old=request.hours_old(),
        linkedin_fetch_description=strict,
    )
    engine = ScraperEngine(config)
    titles = request.search_titles()

    for site in scraper_sites:
        ui_key = SCRAPER_TO_UI.get(site, site)
        for title in titles:
            try:
                jobs = engine.search(
                    search_term=title,
                    location=search_location,
                    is_remote=is_remote,
                    results_wanted=per_query,
                    hours_old=request.hours_old(),
                    sites=(site,),
                )
                per_source[ui_key] += len(jobs)
                per_title[title] += len(jobs)
                collected.extend(jobs)
            except (RateLimitError, Exception):
                pass
    return collected, dict(per_source), dict(per_title)


def _classify_reject(filter_obj: SearchRequestFilter, job: RawJob) -> tuple[str, str]:
    """Return (bucket, detail) for first failing check."""
    checks = [
        ("blacklist", filter_obj._check_blacklist),
        ("seniority_title", filter_obj._check_strict_seniority_title),
        ("management", filter_obj._check_management),
        ("excluded_keyword", filter_obj._check_excluded_keywords),
        ("experience", filter_obj._check_experience),
        ("education", filter_obj._check_education),
        ("location", filter_obj._check_location),
        ("salary", filter_obj._check_salary),
        ("suppressed", filter_obj._check_suppressed),
        ("user_history", filter_obj._check_user_history),
        ("feedback", filter_obj._check_learned_feedback),
        ("title_level_ii", filter_obj._check_title_level),
        ("work_mode", filter_obj._check_request_work_mode),
        ("excluded_seniority", filter_obj._check_excluded_seniority),
    ]
    for bucket, check in checks:
        job_copy = deepcopy(job)
        verdict = check(job_copy)
        if not verdict.passed:
            return bucket, verdict.reason or bucket
    return "pass", ""


def run_funnel(database: JobDatabase, user_id: str) -> FunnelReport:
    settings = get_settings()
    prefs = database.load_job_preferences(user_id) or {}
    request = _latest_search_request(database, user_id) or _request_from_prefs(user_id, prefs)
    request = SearchRequest(
        id=request.id,
        user_id=user_id,
        query=request.query,
        titles=request.titles,
        location=request.location,
        location_zip=request.location_zip,
        salary_min=request.salary_min,
        salary_max=request.salary_max,
        posted_within_days=request.posted_within_days,
        remote_allowed=request.remote_allowed,
        hybrid_allowed=request.hybrid_allowed,
        onsite_allowed=request.onsite_allowed,
        max_onsite_miles=request.max_onsite_miles,
        sources=request.sources,
        nationwide_remote=request.nationwide_remote,
    )

    report = FunnelReport()
    report.config = {
        "SEARCH_RESULT_LIMIT": settings.search_result_limit,
        "MAX_JOBS_TO_SCORE": settings.max_jobs_to_score,
        "RESULTS_WANTED_PER_QUERY": settings.results_wanted_per_query,
        "STRICT_HYDRATION_BUDGET": settings.strict_hydration_budget,
        "STRICT_AVAILABILITY_BUDGET": settings.strict_availability_budget,
        "posted_within_days": request.posted_within_days,
        "hours_old_scrape": request.hours_old(),
    }
    report.prefs_summary = {
        "max_preferred_experience_years": prefs.get("max_preferred_experience_years"),
        "salary_min": prefs.get("salary_min"),
        "salary_max": prefs.get("salary_max"),
        "strict_filtering": prefs.get("strict_filtering", True),
        "titles": request.search_titles(),
        "sources": request.sources,
        "location": request.location,
        "nationwide_remote": request.nationwide_remote,
        "excluded_keywords": prefs.get("excluded_keywords") or [],
    }
    report.fresh_note = (
        f"Board scrape already limited to ~{request.posted_within_days or 21} days "
        f"({request.hours_old()} hours_old); no separate post-dedupe freshness filter."
    )

    raw_jobs, per_source, per_title = _scrape_with_breakdown(request)
    report.raw_scraped = len(raw_jobs)
    report.per_source = per_source
    report.per_title = per_title

    normalized = normalize_jobs(raw_jobs)
    report.deduped = len(normalized)

    strict = bool(prefs.get("strict_filtering", True))
    stats = SearchFilterStats()
    stats.raw_scraped = report.raw_scraped
    stats.normalized = report.deduped

    set_fetch_budget(settings.strict_hydration_budget + settings.strict_availability_budget + 10)
    if strict:
        hydration = hydrate_job_postings(
            normalized,
            max_fetches=settings.strict_hydration_budget,
            stats=HydrationStats(),
        )
        _sync_hydration_stats(stats, hydration)

    enrich_jobs_salaries(normalized, database=database)
    ctx = load_user_search_context(database, user_id, request)
    user_suppressed = database.load_user_suppressed_job_hashes(user_id)
    audit = RejectionAudit()
    hard_filter = SearchRequestFilter(
        ctx,
        database=database,
        user_suppressed_hashes=user_suppressed,
        salary_database=database,
        stats=stats,
        audit=audit,
    )

    seniority_ok: list[RawJob] = []
    location_ok: list[RawJob] = []
    salary_ok: list[RawJob] = []
    survivors: list[RawJob] = []

    for job in normalized:
        bucket, detail = _classify_reject(hard_filter, job)
        if bucket != "pass":
            report.reject_reasons[bucket] += 1
            label = f'{(job.title or "")[:70]} @ {(job.company or "")[:30]} → {detail[:120]}'
            if len(report.reject_samples[bucket]) < 10:
                report.reject_samples[bucket].append(label)
            if bucket == "experience":
                report.experience_rejected += 1
            continue

        hard_filter.evaluate(job)
        survivors.append(job)
        if job.seniority_status != "rejected":
            seniority_ok.append(job)
        if job.location_status == "pass":
            location_ok.append(job)
        if job.salary_status != "rejected":
            salary_ok.append(job)
        if job.experience_status == "pass":
            report.experience_verified_pass += 1
        elif job.experience_status == "unknown":
            report.experience_unknown_kept += 1
            if job.location_status == "pass" and job.salary_status != "rejected":
                report.plausible_unknown_experience += 1

    report.after_seniority = len(seniority_ok)
    report.after_location = len(location_ok)
    report.after_salary = len(salary_ok)
    report.hard_filter_survivors = len(survivors)

    result_limit = settings.search_result_limit
    scoring_buffer = max(result_limit * 2, result_limit)

    if survivors:
        local_scorer = build_scorer(ctx.profile, settings, force_local=True)
        scored = local_scorer.score_jobs(survivors)
        pool = _trim_to_top_matches(scored, scoring_buffer)
        report.scoring_pool = len(pool)
        before = len(pool)
        kept = _apply_listing_availability(
            pool,
            strict=strict,
            stats=stats,
            max_checks=settings.strict_availability_budget,
        )
        report.availability_checked = min(before, settings.strict_availability_budget)
        report.closed_removed = before - len([j for j in kept if j.listing_status != "closed"])
        report.closed_removed = stats.closed_rejected
        final = _trim_to_top_matches(kept, result_limit)
        report.final_saved = len(final)
        _finalize_survivor_stats(stats, final)

    set_fetch_budget(None)
    report.stats = stats
    report.audit = audit
    return report


def print_report(report: FunnelReport) -> None:
    print("\n=== JOB SEARCH FUNNEL (live scrape, filters unchanged) ===\n")
    print("Preferences:", json.dumps(report.prefs_summary, indent=2))
    print("Config:", json.dumps(report.config, indent=2))
    print()
    print(f"raw jobs scraped .............. {report.raw_scraped}")
    print(f"→ deduped ..................... {report.deduped}")
    print(f"→ fresh enough ................ {report.deduped}  ({report.fresh_note})")
    print(f"→ title/seniority pass ........ {report.after_seniority}  (among survivors w/ seniority not rejected)")
    print(f"→ location pass ............... {report.after_location}")
    print(f"→ salary pass ................. {report.after_salary}")
    print(f"→ experience verified pass .... {report.experience_verified_pass}")
    print(f"→ experience unknown kept ..... {report.experience_unknown_kept}")
    print(f"→ experience rejected ......... {report.experience_rejected}")
    print(f"→ hard-filter survivors ....... {report.hard_filter_survivors}")
    print(f"→ scored candidates (pool) .... {report.scoring_pool}")
    print(f"→ availability checked ........ {report.availability_checked} (budget cap)")
    print(f"→ closed removed .............. {report.closed_removed}")
    print(f"→ final jobs saved ............ {report.final_saved}")
    print()
    print("--- Per source (raw rows from scrape, before dedupe) ---")
    for key, count in sorted(report.per_source.items(), key=lambda x: -x[1]):
        print(f"  {key}: {count}")
    print("\n--- Per target title (raw rows) ---")
    for title, count in sorted(report.per_title.items(), key=lambda x: -x[1]):
        print(f"  {title!r}: {count}")
    print("\n--- Top rejection buckets (first failing check) ---")
    for bucket, count in report.reject_reasons.most_common(15):
        print(f"  {bucket}: {count}")
    print(f"\nPlausible except unknown YoE (unknown + loc pass + salary ok): {report.plausible_unknown_experience}")
    biggest = report.reject_reasons.most_common(1)
    if biggest:
        bucket = biggest[0][0]
        print(f"\n--- Up to 10 examples: {bucket} ---")
        for line in report.reject_samples.get(bucket, [])[:10]:
            print(f"  • {line}")
    if hasattr(report, "stats"):
        report.stats.log_summary(print)


def main() -> int:
    database = JobDatabase.from_env()
    user_id = database.load_primary_user_id()
    if not user_id:
        print("No user_id found", file=sys.stderr)
        return 1
    report = run_funnel(database, user_id)
    print_report(report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

"""CLI orchestrator: scrape -> hard filter -> Supabase check -> score -> report."""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

from job_engine.config import get_settings
from job_engine.matcher import (
    HardFilter,
    MatcherError,
    UserProfile,
    build_scorer,
    rank_matches,
    select_candidates,
)
from job_engine.models import RawJob
from job_engine.normalizer import normalize_jobs
from job_engine.scraper_engine import DEFAULT_SITES, ScraperConfig, ScraperEngine

logger = logging.getLogger("job_engine.main")
DEFAULT_OUTPUT = Path("test_output.json")
DEFAULT_PROFILE = Path("user_profile.json")


def setup_logging(verbose: bool) -> None:
    # Job titles routinely contain en dashes and non-breaking hyphens. The
    # default Windows console encoding (cp1252) raises on those, which would
    # crash the run at the final print, so degrade instead of dying.
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[union-attr]
        except (AttributeError, ValueError):
            pass

    logging.basicConfig(
        level=logging.DEBUG if verbose else logging.INFO,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )
    # httpx logs every Supabase request at INFO; too noisy for a pipeline run.
    # Third-party SDKs log every HTTP call at INFO, which buries our own output.
    for noisy in ("httpx", "httpcore", "google_genai", "groq", "cohere", "hpack", "urllib3"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Scrape job boards, filter against your rules, and score matches against your resume.",
    )
    parser.add_argument("--profile", type=Path, default=DEFAULT_PROFILE, help="Path to user_profile.json")
    parser.add_argument("--search-term", help="Override the profile's search term")
    parser.add_argument("--location", help="Override the profile's search location")
    parser.add_argument("--remote", dest="is_remote", action="store_true", help="Force a remote search")
    parser.add_argument("--results-wanted", type=int, help="Max results per job board")
    parser.add_argument("--hours-old", type=int, help="Only keep jobs posted within this many hours")
    parser.add_argument("--country-indeed", default="USA", help="Indeed/Glassdoor country name")
    parser.add_argument(
        "--sites",
        default=",".join(DEFAULT_SITES),
        help="Comma-separated boards: indeed,linkedin,zip_recruiter,builtin,glassdoor",
    )
    parser.add_argument("--top", type=int, help="How many matches to print (default: profile top_n)")
    parser.add_argument(
        "--provider",
        choices=["gemini", "groq", "cohere", "anthropic", "local"],
        help="Pin one AI provider instead of the automatic fallback chain",
    )
    parser.add_argument(
        "--max-score",
        type=int,
        help="How many top candidates to send to the AI (default: 20). The rest are scored locally.",
    )
    parser.add_argument("--offline", action="store_true", help="Skip every API and score locally")
    parser.add_argument("--no-db", action="store_true", help="Run without Supabase")
    parser.add_argument("--no-score", action="store_true", help="Stop after the hard filter")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="JSON output path")
    parser.add_argument("--verbose", action="store_true", help="Enable debug logging")
    return parser.parse_args(argv)


def connect_database(enabled: bool):
    """Return a JobDatabase, or None if disabled or unreachable."""
    if not enabled:
        logger.info("Supabase disabled (--no-db)")
        return None
    try:
        from job_engine.database import JobDatabase

        database = JobDatabase.from_env()
        logger.info("Connected to Supabase (writes %s)", "enabled" if database.can_write else "DISABLED")
        return database
    except Exception as exc:
        logger.warning("Supabase unavailable (%s); continuing without it", exc)
        return None


def scrape(args: argparse.Namespace, profile: UserProfile) -> list[RawJob]:
    search = profile.search or {}
    sites = tuple(item.strip().lower() for item in args.sites.split(",") if item.strip())

    config = ScraperConfig(
        search_term=args.search_term or search.get("search_term") or (profile.target_titles or ["Software Engineer"])[0],
        location=args.location or search.get("location") or "United States",
        is_remote=args.is_remote or bool(search.get("is_remote", profile.work_location_preference == "remote")),
        results_wanted=args.results_wanted or int(search.get("results_wanted", 20)),
        hours_old=args.hours_old or int(search.get("hours_old", 24)),
        country_indeed=args.country_indeed,
        sites=sites,
    )

    try:
        raw_jobs = ScraperEngine(config).search()
    except Exception:
        logger.exception("Scrape stage crashed; continuing with no results")
        return []

    by_site: dict[str, int] = {}
    for job in raw_jobs:
        by_site[job.site] = by_site.get(job.site, 0) + 1
    for site in sites:
        logger.info("[progress] %s contributed %s raw job(s)", site, by_site.get(site, 0))
    return raw_jobs


def print_matches(matches: list[RawJob], scorer_name: str) -> None:
    print()
    print("=" * 78)
    print(f"  TOP {len(matches)} MATCHES  (scored by {scorer_name})")
    print("=" * 78)

    if not matches:
        print("\n  No jobs cleared the minimum match score.")
        print("  Try lowering min_match_score, widening preferred_cities, or")
        print("  reducing min_salary in user_profile.json.\n")
        return

    for rank, job in enumerate(matches, start=1):
        print(f"\n{rank:>2}. [{job.match_score:>3}] {job.title}")
        print(f"    {job.company or 'Unknown company'} - {job.location or 'location unknown'}")
        print(f"    Salary: {job.salary_display()}   Source: {job.site}   Posted: {job.posted_date or 'unknown'}")
        if job.fit_reason:
            print(f"    {job.fit_reason}")
        if job.missing_skills:
            print(f"    Missing: {', '.join(job.missing_skills)}")
        print(f"    {job.job_url}")
        if job.scored_by:
            print(f"    scored by {job.scored_by}")
    print()


def write_output(path: Path, jobs: list[RawJob]) -> None:
    payload = [job.to_dict() for job in jobs]
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    logger.info("Wrote %s job(s) to %s", len(payload), path.resolve())


def run(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    setup_logging(args.verbose)

    try:
        profile = UserProfile.load(args.profile)
    except MatcherError as exc:
        logger.error("%s", exc)
        return 1

    settings = get_settings()
    logger.info("=" * 72)
    logger.info("JobTracker pipeline | preference=%s | floor=$%s | min_score=%s",
                profile.work_location_preference, f"{profile.min_salary:,.0f}", profile.min_match_score)
    logger.info("%s", settings.describe())
    logger.info("=" * 72)

    database = connect_database(enabled=not args.no_db)

    # 1. Scrape
    logger.info("--- Stage 1/5: scrape ---")
    raw_jobs = scrape(args, profile)
    normalized = normalize_jobs(raw_jobs)
    logger.info("Stage 1 complete: %s unique job(s)", len(normalized))

    # 2 + 3. Hard filter, including the Supabase suppression check
    logger.info("--- Stage 2/5: hard filter + suppression check ---")
    hard_filter = HardFilter(profile, database=database)
    survivors, rejections = hard_filter.apply(normalized)
    for reason, count in sorted(rejections.items(), key=lambda item: -item[1]):
        logger.info("  dropped %s: %s", count, reason)
    logger.info("Stage 2 complete: %s of %s job(s) survived", len(survivors), len(normalized))

    # 4. Store the survivors before scoring, so a scoring failure loses nothing.
    logger.info("--- Stage 3/5: persist new listings ---")
    if database is not None and survivors:
        report = database.save_jobs(survivors)
        logger.info("  %s", report.summary())
    else:
        logger.info("  skipped (no database or nothing to save)")

    # 5. Score
    if args.no_score or not survivors:
        logger.info("--- Stage 4/5: scoring skipped ---")
        write_output(args.output, survivors)
        logger.info("Done. %s job(s) passed the hard filter.", len(survivors))
        return 0

    logger.info("--- Stage 4/5: resume scoring ---")
    limit = args.max_score if args.max_score is not None else settings.max_jobs_to_score

    # Free tiers are rate limited, so only the strongest candidates go to an API.
    candidates, overflow = select_candidates(survivors, limit)
    if overflow:
        logger.info(
            "Sending the top %s candidate(s) to the AI; the remaining %s will be scored locally",
            len(candidates),
            len(overflow),
        )

    scorer = build_scorer(profile, settings, force_local=args.offline, provider=args.provider)
    scored = scorer.score_jobs(candidates)

    if overflow:
        local_only = build_scorer(profile, settings, force_local=True)
        scored = scored + local_only.score_jobs(overflow)

    matches = rank_matches(scored, profile, top_n=args.top)

    # 6. Report and log scores back
    logger.info("--- Stage 5/5: report + log scores ---")
    if database is not None:
        database.record_match_scores([job for job in scored if job.match_score is not None])

    write_output(args.output, scored)
    print_matches(matches, getattr(scorer, "name", "unknown"))

    logger.info(
        "Done. scraped=%s filtered=%s scored=%s matched=%s",
        len(normalized),
        len(survivors),
        sum(1 for job in scored if job.match_score is not None),
        len(matches),
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(run())

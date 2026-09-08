#!/usr/bin/env python3
"""Poll Supabase for pending job_search_requests and run the scrape pipeline."""

from __future__ import annotations

import argparse
import logging
import signal
import sys
import time

from job_engine.database import DatabaseError, JobDatabase
from job_engine.search_worker import process_search_request, rescore_all_stored_jobs

log = logging.getLogger("worker")
_shutdown = False


def setup_logging(verbose: bool) -> None:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[union-attr]
        except (AttributeError, ValueError):
            pass

    logging.basicConfig(
        level=logging.DEBUG if verbose else logging.INFO,
        format="%(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )
    for noisy in ("httpx", "httpcore", "google_genai", "groq", "cohere", "hpack", "urllib3", "job_engine"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


def _handle_signal(signum, frame) -> None:
    global _shutdown
    _shutdown = True
    log.info("Shutting down after current request...")


def connect_database() -> JobDatabase:
    database = JobDatabase.from_env()
    if not database.can_write:
        raise DatabaseError(
            "SUPABASE_SERVICE_KEY is required for the worker. "
            "The publishable key cannot claim or write search requests."
        )
    return database


def run_once(database: JobDatabase) -> bool:
    """Process one pending request. Returns True if a request was handled."""
    row = database.claim_pending_search_request()
    if not row:
        return False
    try:
        process_search_request(database, row)
    except Exception:
        log.exception("[ERROR] Request %s crashed", row.get("id", "?")[:8])
        database.finish_search_request(
            str(row["id"]),
            status="failed",
            jobs_found=0,
            new_jobs_found=0,
            source_results=row.get("source_results") or {},
            error="Worker crashed — see logs",
        )
    return True


def run_loop(database: JobDatabase, poll_seconds: float) -> None:
    log.info("Worker started. Polling every %ss for pending searches.", poll_seconds)
    while not _shutdown:
        handled = run_once(database)
        if not handled:
            time.sleep(poll_seconds)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Process queued job search requests from Supabase.")
    parser.add_argument("--once", action="store_true", help="Process one pending request and exit")
    parser.add_argument(
        "--rescore-all",
        nargs="?",
        const="__auto__",
        metavar="USER_ID",
        help="Re-score all stored jobs with the local scorer (optional user UUID)",
    )
    parser.add_argument(
        "--poll",
        type=float,
        default=8.0,
        help="Seconds between polls when idle (default: 8)",
    )
    parser.add_argument("--verbose", action="store_true", help="Enable debug logging")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    setup_logging(args.verbose)

    signal.signal(signal.SIGINT, _handle_signal)
    signal.signal(signal.SIGTERM, _handle_signal)

    try:
        database = connect_database()
    except DatabaseError as exc:
        log.error("%s", exc)
        return 1

    if args.rescore_all is not None:
        user_id = None if args.rescore_all == "__auto__" else str(args.rescore_all).strip()
        if not user_id:
            user_id = database.load_primary_user_id()
        if not user_id:
            log.error("No user id found. Pass --rescore-all USER_ID explicitly.")
            return 1
        updated = rescore_all_stored_jobs(database, user_id)
        log.info("[DONE] Rescored %s stored job(s)", updated)
        return 0

    if args.once:
        handled = run_once(database)
        if not handled:
            log.info("No pending search requests.")
        return 0

    run_loop(database, max(5.0, args.poll))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

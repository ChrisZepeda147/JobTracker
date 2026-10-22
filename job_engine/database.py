"""Supabase persistence with suppression filtering and layered deduplication."""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Any, Iterable, Iterator, Sequence

from job_engine.models import RawJob

logger = logging.getLogger("job_engine.database")

try:
    from supabase import Client, create_client

    HAS_SUPABASE = True
except ImportError:  # pragma: no cover - optional dependency
    Client = Any  # type: ignore[assignment,misc]
    create_client = None  # type: ignore[assignment]
    HAS_SUPABASE = False
    logger.warning("supabase-py is not installed; persistence is disabled")

# PostgREST builds .in_() filters into the query string, so keep batches small
# enough that the URL stays well under proxy and server limits.
HASH_QUERY_CHUNK = 100
UPSERT_CHUNK = 200

# A job you have already acted on is permanently suppressed. Rows still sitting
# at 'new' are not: you have not actually looked at them yet.
HANDLED_STATUSES = ("seen", "applied", "rejected", "archived")


class DatabaseError(Exception):
    """Persistence failure that the caller may choose to ignore."""


@dataclass
class SuppressionRules:
    """Snapshot of the suppression lists, fetched once per run."""

    job_hashes: set[str] = field(default_factory=set)
    url_hashes: set[str] = field(default_factory=set)
    company_keys: set[str] = field(default_factory=set)
    keywords: list[tuple[str, str]] = field(default_factory=list)  # (pattern, applies_to)
    handled_job_hashes: set[str] = field(default_factory=set)
    handled_url_hashes: set[str] = field(default_factory=set)
    # "company|title" keys, so a handled job is recognised even when the caller
    # has no location to rebuild the identity hash from.
    handled_company_titles: set[str] = field(default_factory=set)

    @staticmethod
    def company_title_key(company: str, title: str) -> str:
        norm = lambda text: " ".join((text or "").strip().lower().split())  # noqa: E731
        return f"{norm(company)}|{norm(title)}"

    def reason_for(
        self,
        company: str,
        title: str,
        job_hash: str = "",
        url_hash: str = "",
        description: str = "",
    ) -> str | None:
        """Return a human-readable reason if this posting is suppressed."""
        if job_hash and job_hash in self.job_hashes:
            return "on a suppression, liked, or disliked list"
        if url_hash and url_hash in self.url_hashes:
            return "URL on a suppression, liked, or disliked list"
        if job_hash and job_hash in self.handled_job_hashes:
            return "already viewed or applied"
        if url_hash and url_hash in self.handled_url_hashes:
            return "already viewed or applied (same URL)"
        if self.company_title_key(company, title) in self.handled_company_titles:
            return "already viewed or applied"

        company_key = (company or "").strip().lower()
        if company_key and company_key in self.company_keys:
            return f"company '{company}' suppressed"

        title_lower = (title or "").lower()
        description_lower = (description or "").lower()
        for pattern, applies_to in self.keywords:
            needle = pattern.lower()
            if applies_to in ("title", "both") and needle in title_lower:
                return f"title matched keyword '{pattern}'"
            if applies_to in ("description", "both") and needle in description_lower:
                return f"description matched keyword '{pattern}'"
        return None

    def match(self, job: RawJob) -> str | None:
        """Return a human-readable reason if the job is suppressed."""
        return self.reason_for(
            company=job.company,
            title=job.title,
            job_hash=job.normalized_url_hash,
            url_hash=job.url_hash,
            description=job.description,
        )


@dataclass
class SaveReport:
    """Outcome of a save_jobs() call."""

    received: int = 0
    suppressed: int = 0
    already_stored: int = 0
    written: int = 0
    failed: int = 0

    def summary(self) -> str:
        return (
            f"received={self.received} written={self.written} "
            f"already_stored={self.already_stored} suppressed={self.suppressed} "
            f"failed={self.failed}"
        )


def _chunks(items: Sequence[Any], size: int) -> Iterator[Sequence[Any]]:
    for start in range(0, len(items), size):
        yield items[start : start + size]


def load_env_file() -> None:
    """Load .env if python-dotenv is available; otherwise rely on the environment."""
    try:
        from dotenv import load_dotenv

        load_dotenv()
    except ImportError:
        logger.debug("python-dotenv not installed; relying on ambient environment")


class JobDatabase:
    """Thin, fault-tolerant wrapper over the Supabase REST client."""

    def __init__(self, url: str, key: str, key_kind: str = "unknown") -> None:
        if not HAS_SUPABASE or create_client is None:
            raise DatabaseError("supabase-py is not installed (pip install supabase)")
        if not url:
            raise DatabaseError("SUPABASE_URL is not set")
        if not key:
            raise DatabaseError(
                "No Supabase key found. Set SUPABASE_SERVICE_KEY to the secret "
                "(service_role) key; the publishable key cannot write."
            )
        self.key_kind = key_kind
        if key_kind == "publishable":
            logger.warning(
                "Using the publishable key: reads work, but inserts will be rejected "
                "by row level security. Set SUPABASE_SERVICE_KEY to enable writes."
            )
        self.client: Client = create_client(url, key)
        self._rules_cache: SuppressionRules | None = None

    @classmethod
    def from_env(cls) -> "JobDatabase":
        """Build a client from .env, preferring the secret key over publishable."""
        load_env_file()

        url = (os.getenv("SUPABASE_URL") or "").strip()
        secret = (
            os.getenv("SUPABASE_SERVICE_KEY")
            or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            or os.getenv("SUPABASE_SECRET_KEY")
            or ""
        ).strip()

        # SUPABASE_KEY is whichever key the user pasted; treat a secret-looking
        # value as writable and anything else as read-only.
        generic = os.getenv("SUPABASE_KEY", "").strip()
        if not secret and generic and not generic.startswith("sb_publishable_"):
            secret = generic
        if secret:
            return cls(url, secret, key_kind="secret")

        publishable = (
            os.getenv("SUPABASE_PUBLISHABLE_KEY")
            or os.getenv("SUPABASE_ANON_KEY")
            or generic
            or ""
        ).strip()
        return cls(url, publishable, key_kind="publishable")

    @property
    def can_write(self) -> bool:
        return self.key_kind == "secret"

    # ---------------------------------------------------------------
    # Suppression lists
    # ---------------------------------------------------------------

    def load_suppression_rules(self) -> SuppressionRules:
        """Fetch all suppression lists. A failure degrades to 'suppress nothing'."""
        rules = SuppressionRules()

        # The suppression list plus both feedback lists all block a posting.
        for table in ("suppressed_jobs", "liked_jobs", "disliked_jobs"):
            try:
                response = self.client.table(table).select("job_hash, url_hash").execute()
                for row in response.data or []:
                    if row.get("job_hash"):
                        rules.job_hashes.add(row["job_hash"])
                    if row.get("url_hash"):
                        rules.url_hashes.add(row["url_hash"])
            except Exception:
                logger.exception("Failed to load %s; continuing without it", table)

        try:
            response = (
                self.client.table("jobs")
                .select("job_hash, url_hash, company, title")
                .in_("status", list(HANDLED_STATUSES))
                .execute()
            )
            for row in response.data or []:
                if row.get("job_hash"):
                    rules.handled_job_hashes.add(row["job_hash"])
                if row.get("url_hash"):
                    rules.handled_url_hashes.add(row["url_hash"])
                rules.handled_company_titles.add(
                    SuppressionRules.company_title_key(
                        row.get("company", ""), row.get("title", "")
                    )
                )
        except Exception:
            logger.exception("Failed to load handled jobs; continuing without it")

        try:
            response = self.client.table("suppressed_companies").select("company_key").execute()
            rules.company_keys = {row["company_key"] for row in (response.data or [])}
        except Exception:
            logger.exception("Failed to load suppressed_companies; continuing without it")

        try:
            response = (
                self.client.table("suppressed_keywords")
                .select("pattern, applies_to")
                .execute()
            )
            rules.keywords = [
                (row["pattern"], row.get("applies_to", "title"))
                for row in (response.data or [])
                if row.get("pattern")
            ]
        except Exception:
            logger.exception("Failed to load suppressed_keywords; continuing without it")

        total = (
            len(rules.job_hashes)
            + len(rules.url_hashes)
            + len(rules.company_keys)
            + len(rules.keywords)
            + len(rules.handled_company_titles)
        )
        if total == 0 and not self.can_write:
            # RLS grants SELECT to 'authenticated' only, so the publishable key
            # gets 200 OK with an empty body. Silent, and easy to miss.
            logger.warning(
                "Suppression lists came back EMPTY while using a read-only key. "
                "Row level security may be hiding your rules, which means blocked "
                "companies and applied jobs will NOT be filtered. "
                "Set SUPABASE_SERVICE_KEY to the secret key to fix this."
            )

        logger.info(
            "Suppression rules loaded: %s posting(s), %s company(ies), %s keyword(s), "
            "%s already handled",
            len(rules.job_hashes) + len(rules.url_hashes),
            len(rules.company_keys),
            len(rules.keywords),
            len(rules.handled_company_titles),
        )
        self._rules_cache = rules
        return rules

    def rules(self, refresh: bool = False) -> SuppressionRules:
        """Cached suppression rules; one fetch per run instead of one per job."""
        if refresh or self._rules_cache is None:
            return self.load_suppression_rules()
        return self._rules_cache

    def is_job_suppressed(self, company: str, title: str, url: str = "") -> bool:
        """True when this posting must never be shown again.

        Checks the suppression lists (by identity hash, URL hash, company, and
        keyword) plus anything already marked seen/applied/rejected/archived.
        """
        return self.suppression_reason(company, title, url) is not None

    def suppression_reason(self, company: str, title: str, url: str = "") -> str | None:
        """Same check as is_job_suppressed, but explains itself."""
        probe = RawJob(
            title=title,
            company=company,
            location="",
            job_url=url,
            description="",
            site="",
        )
        try:
            rules = self.rules()
        except Exception:
            logger.exception("Suppression lookup failed; treating job as allowed")
            return None

        # No location is available here, so the identity hash cannot be rebuilt;
        # the URL hash and the company|title index cover the same ground.
        return rules.reason_for(
            company=company,
            title=title,
            url_hash=probe.url_hash,
            description="",
        )

    def suppress_job(self, job_hash: str, url_hash: str = "", reason: str = "manual") -> bool:
        payload = {"job_hash": job_hash, "reason": reason}
        if url_hash:
            payload["url_hash"] = url_hash
        return self._suppress("suppressed_jobs", payload, "job_hash")

    def suppress_company(self, company: str, reason: str = "manual") -> bool:
        payload = {
            "company_key": company.strip().lower(),
            "label": company.strip(),
            "reason": reason,
        }
        return self._suppress("suppressed_companies", payload, "company_key")

    def suppress_keyword(
        self, pattern: str, applies_to: str = "title", reason: str = "manual"
    ) -> bool:
        payload = {"pattern": pattern, "applies_to": applies_to, "reason": reason}
        return self._suppress("suppressed_keywords", payload, "pattern,applies_to")

    def like_job(self, job: RawJob, note: str = "") -> bool:
        """Save a job you want to pursue. It will not be shown again."""
        payload = {
            "job_hash": job.normalized_url_hash,
            "url_hash": job.url_hash,
            "company": job.company,
            "title": job.title,
            "note": note,
        }
        return self._suppress("liked_jobs", payload, "job_hash")

    def dislike_job(self, job: RawJob, reason: str = "") -> bool:
        """Reject a job explicitly. It will not be shown again."""
        payload = {
            "job_hash": job.normalized_url_hash,
            "url_hash": job.url_hash,
            "company": job.company,
            "title": job.title,
            "reason": reason,
        }
        return self._suppress("disliked_jobs", payload, "job_hash")

    def _suppress(self, table: str, payload: dict[str, Any], on_conflict: str) -> bool:
        try:
            self.client.table(table).upsert(payload, on_conflict=on_conflict).execute()
            logger.info("Suppression added to %s: %s", table, payload)
            return True
        except Exception:
            logger.exception("Failed to add suppression to %s: %s", table, payload)
            return False

    # ---------------------------------------------------------------
    # Deduplication + writes
    # ---------------------------------------------------------------

    def existing_hashes(self, hashes: Sequence[str]) -> set[str]:
        """Return the subset of hashes already stored, querying in safe chunks."""
        found: set[str] = set()
        for batch in _chunks(hashes, HASH_QUERY_CHUNK):
            try:
                response = (
                    self.client.table("jobs")
                    .select("job_hash")
                    .in_("job_hash", list(batch))
                    .execute()
                )
                found.update(row["job_hash"] for row in (response.data or []))
            except Exception:
                logger.exception(
                    "Hash lookup failed for a batch of %s; treating them as new", len(batch)
                )
        return found

    @staticmethod
    def to_row(job: RawJob) -> dict[str, Any]:
        """Map a normalized RawJob onto the jobs table.

        company_key is a generated column and must never be sent.
        """
        row: dict[str, Any] = {
            "job_hash": job.normalized_url_hash or job.generate_hash(),
            "url_hash": job.url_hash or job.generate_url_hash(),
            "title": job.title,
            "company": job.company or "",
            "location": job.location or "",
            "job_url": job.job_url,
            "description": job.description or "",
            "site": job.site,
            "salary_min": job.salary_min,
            "salary_max": job.salary_max,
            "posted_date": job.posted_date or None,
        }
        if job.match_score is not None:
            row["match_score"] = job.match_score
            row["fit_reason"] = job.fit_reason
            row["missing_skills"] = job.missing_skills
            row["scored_by"] = job.scored_by
            row["scored_at"] = datetime.now(timezone.utc).isoformat()
        return row

    def save_scraped_job(self, job: RawJob) -> bool:
        """Record a single new listing. Returns False on failure rather than raising."""
        try:
            self.client.table("jobs").upsert(
                self.to_row(job), on_conflict="job_hash"
            ).execute()
            logger.debug("Saved %s @ %s", job.title, job.company)
            return True
        except Exception as exc:
            self._log_write_failure(f"save {job.title} @ {job.company}", exc)
            return False

    def record_match_scores(self, jobs: Iterable[RawJob]) -> int:
        """Write Claude's score and summary back onto already-stored rows."""
        updated = 0
        missing = 0
        now = datetime.now(timezone.utc).isoformat()
        for job in jobs:
            if job.match_score is None:
                continue
            try:
                response = (
                    self.client.table("jobs")
                    .update(
                        {
                            "match_score": job.match_score,
                            "fit_reason": job.fit_reason,
                            "missing_skills": job.missing_skills,
                            "scored_by": job.scored_by,
                            "scored_at": now,
                        }
                    )
                    .eq("job_hash", job.normalized_url_hash)
                    .execute()
                )
                # An update matching zero rows is not an error, so count what
                # actually came back rather than assuming success.
                if response.data:
                    updated += 1
                else:
                    missing += 1
            except Exception as exc:
                self._log_write_failure(f"record score for {job.job_url}", exc)

        if missing:
            logger.warning(
                "%s score(s) matched no stored row (the job was never saved, "
                "usually because writes are disabled)",
                missing,
            )
        logger.info("Recorded match scores for %s job(s)", updated)
        return updated

    def _log_write_failure(self, action: str, exc: BaseException) -> None:
        """Permission denials are expected with a read-only key; don't dump a trace."""
        code = getattr(exc, "code", None) or ""
        if code == "42501" or "row-level security" in str(exc).lower():
            logger.error(
                "Cannot write (%s): row level security rejected the request. "
                "Set SUPABASE_SERVICE_KEY to the secret key to enable writes.",
                action,
            )
            return
        logger.exception("Failed: %s", action)

    def set_status(self, job_hash: str, status: str) -> bool:
        """Mark a job seen/applied/rejected/archived, which also suppresses it."""
        try:
            self.client.table("jobs").update({"status": status}).eq(
                "job_hash", job_hash
            ).execute()
            self._rules_cache = None
            return True
        except Exception:
            logger.exception("Failed to set status=%s on %s", status, job_hash)
            return False

    def save_jobs(self, jobs: Iterable[RawJob], skip_existing: bool = True) -> SaveReport:
        """Filter suppressed and known jobs, then upsert the remainder."""
        job_list = list(jobs)
        report = SaveReport(received=len(job_list))
        if not job_list:
            return report

        rules = self.rules()

        candidates: list[RawJob] = []
        for job in job_list:
            reason = rules.match(job)
            if reason:
                report.suppressed += 1
                logger.info("Suppressed %s @ %s (%s)", job.title, job.company, reason)
                continue
            candidates.append(job)

        if skip_existing and candidates:
            known = self.existing_hashes([job.normalized_url_hash for job in candidates])
            before = len(candidates)
            candidates = [j for j in candidates if j.normalized_url_hash not in known]
            report.already_stored = before - len(candidates)

        # Guard against duplicates inside this single batch: PostgreSQL rejects
        # an upsert whose payload hits the same conflict target twice.
        seen: set[str] = set()
        rows: list[dict[str, Any]] = []
        for job in candidates:
            row = self.to_row(job)
            if row["job_hash"] in seen:
                report.already_stored += 1
                continue
            seen.add(row["job_hash"])
            rows.append(row)

        for batch in _chunks(rows, UPSERT_CHUNK):
            try:
                response = (
                    self.client.table("jobs")
                    .upsert(list(batch), on_conflict="job_hash")
                    .execute()
                )
                report.written += len(response.data or batch)
            except Exception as exc:
                report.failed += len(batch)
                self._log_write_failure(f"upsert of {len(batch)} job(s)", exc)

        logger.info("save_jobs complete: %s", report.summary())
        return report

    # ---------------------------------------------------------------
    # Search worker: requests + user job state
    # ---------------------------------------------------------------

    def _requeue_stale_running_requests(self, max_age_minutes: int = 10) -> None:
        """Return abandoned running requests to pending so a new worker can pick them up."""
        cutoff = (datetime.now(timezone.utc) - timedelta(minutes=max_age_minutes)).isoformat()
        try:
            stale = (
                self.client.table("job_search_requests")
                .select("id, started_at")
                .eq("status", "running")
                .execute()
            )
            for row in stale.data or []:
                started = row.get("started_at")
                if started and started >= cutoff:
                    continue
                self.client.table("job_search_requests").update(
                    {
                        "status": "pending",
                        "started_at": None,
                        "error": "Re-queued after the previous worker stopped mid-search",
                    }
                ).eq("id", row["id"]).eq("status", "running").execute()
                logger.info("Re-queued stale search request %s", str(row["id"])[:8])
        except Exception:
            logger.exception("Failed to requeue stale search requests")

    def claim_pending_search_request(self) -> dict[str, Any] | None:
        """Atomically claim the oldest pending search request."""
        self._requeue_stale_running_requests()
        now = datetime.now(timezone.utc).isoformat()
        try:
            pending = (
                self.client.table("job_search_requests")
                .select("*")
                .eq("status", "pending")
                .order("created_at")
                .limit(1)
                .execute()
            )
            if not pending.data:
                return None
            row = pending.data[0]
            claimed = (
                self.client.table("job_search_requests")
                .update({"status": "running", "started_at": now})
                .eq("id", row["id"])
                .eq("status", "pending")
                .execute()
            )
            if not claimed.data:
                return None
            return claimed.data[0]
        except Exception:
            logger.exception("Failed to claim a pending search request")
            return None

    def finish_search_request(
        self,
        request_id: str,
        *,
        status: str,
        jobs_found: int,
        new_jobs_found: int,
        source_results: dict[str, Any],
        error: str | None = None,
    ) -> None:
        now = datetime.now(timezone.utc).isoformat()
        payload: dict[str, Any] = {
            "status": status,
            "jobs_found": jobs_found,
            "new_jobs_found": new_jobs_found,
            "source_results": source_results,
            "completed_at": now,
            "error": error,
        }
        try:
            self.client.table("job_search_requests").update(payload).eq("id", request_id).execute()
        except Exception:
            logger.exception("Failed to finalize search request %s", request_id)

    def load_job_preferences(self, user_id: str) -> dict[str, Any] | None:
        try:
            response = (
                self.client.table("job_preferences")
                .select("*")
                .eq("user_id", user_id)
                .limit(1)
                .execute()
            )
            if response.data:
                return response.data[0]
            return None
        except Exception:
            logger.exception("Failed to load job_preferences for %s", user_id)
            return None

    def load_active_resume_text(self, user_id: str) -> str:
        try:
            response = (
                self.client.table("resumes")
                .select("resume_text")
                .eq("user_id", user_id)
                .eq("is_active", True)
                .limit(1)
                .execute()
            )
            if response.data:
                return str(response.data[0].get("resume_text") or "").strip()
        except Exception:
            logger.exception("Failed to load active resume for %s", user_id)
        return ""

    def load_candidate_profile(self, user_id: str) -> dict[str, Any] | None:
        try:
            response = (
                self.client.table("candidate_profiles")
                .select(
                    "full_name, current_title, location, software_experience_years, "
                    "education, professional_summary, technical_skills, "
                    "professional_strengths, additional_context"
                )
                .eq("user_id", user_id)
                .limit(1)
                .execute()
            )
            if response.data:
                return response.data[0]
        except Exception:
            logger.exception("Failed to load candidate profile for %s", user_id)
        return None

    def load_user_projects(self, user_id: str) -> list[dict[str, Any]]:
        try:
            response = (
                self.client.table("projects")
                .select(
                    "name, github_url, technologies, readme_text, personal_contribution, ai_notes"
                )
                .eq("user_id", user_id)
                .execute()
            )
            return list(response.data or [])
        except Exception:
            logger.exception("Failed to load projects for %s", user_id)
        return []

    def load_primary_user_id(self) -> str | None:
        """Best-effort user id for CLI rescoring (most recent search request)."""
        try:
            response = (
                self.client.table("job_search_requests")
                .select("user_id")
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            if response.data:
                return str(response.data[0]["user_id"])
        except Exception:
            logger.exception("Failed to load primary user id from search requests")
        try:
            response = (
                self.client.table("user_job_states")
                .select("user_id")
                .order("updated_at", desc=True)
                .limit(1)
                .execute()
            )
            if response.data:
                return str(response.data[0]["user_id"])
        except Exception:
            logger.exception("Failed to load primary user id from job states")
        return None

    @staticmethod
    def row_to_raw_job(row: dict[str, Any]) -> RawJob:
        salary_min = row.get("salary_min")
        salary_max = row.get("salary_max")
        posted = row.get("posted_date")
        return RawJob(
            title=str(row.get("title") or ""),
            company=str(row.get("company") or ""),
            location=str(row.get("location") or ""),
            job_url=str(row.get("job_url") or ""),
            description=str(row.get("description") or ""),
            site=str(row.get("site") or ""),
            salary_min=float(salary_min) if salary_min is not None else None,
            salary_max=float(salary_max) if salary_max is not None else None,
            posted_date=str(posted) if posted else None,
            normalized_url_hash=str(row.get("job_hash") or ""),
            url_hash=str(row.get("url_hash") or ""),
        )

    def load_all_jobs(self, page_size: int = 500) -> list[RawJob]:
        """Load every stored job row for bulk rescoring."""
        jobs: list[RawJob] = []
        offset = 0
        columns = (
            "job_hash, url_hash, title, company, location, job_url, description, site, "
            "salary_min, salary_max, posted_date"
        )
        while True:
            try:
                response = (
                    self.client.table("jobs")
                    .select(columns)
                    .order("last_seen_at", desc=True)
                    .range(offset, offset + page_size - 1)
                    .execute()
                )
            except Exception:
                logger.exception("Failed to load jobs for rescoring at offset %s", offset)
                break
            rows = response.data or []
            if not rows:
                break
            jobs.extend(self.row_to_raw_job(row) for row in rows)
            if len(rows) < page_size:
                break
            offset += page_size
        return jobs

    def load_user_suppressed_job_hashes(self, user_id: str) -> set[str]:
        """Job hashes the user already applied to or skipped (per-user state)."""
        suppressed: set[str] = set()
        try:
            response = (
                self.client.table("user_job_states")
                .select("status, jobs(job_hash)")
                .eq("user_id", user_id)
                .in_("status", ["applied", "skipped"])
                .execute()
            )
            for row in response.data or []:
                job = row.get("jobs") or {}
                if job.get("job_hash"):
                    suppressed.add(job["job_hash"])
        except Exception:
            logger.exception("Failed to load user suppressed job hashes")
        return suppressed

    def load_user_job_state_job_ids(self, user_id: str) -> set[str]:
        return set(self.load_user_job_state_map(user_id))

    def load_user_job_state_map(self, user_id: str) -> dict[str, str]:
        """Map job_id -> status for all of the user's job states."""
        try:
            response = (
                self.client.table("user_job_states")
                .select("job_id, status")
                .eq("user_id", user_id)
                .execute()
            )
            return {str(row["job_id"]): str(row["status"]) for row in (response.data or [])}
        except Exception:
            logger.exception("Failed to load user_job_states for %s", user_id)
            return {}

    def load_stored_salaries_by_hashes(self, hashes: Sequence[str]) -> dict[str, dict[str, Any]]:
        """Return stored salary fields keyed by job_hash."""
        found: dict[str, dict[str, Any]] = {}
        for batch in _chunks(list(hashes), HASH_QUERY_CHUNK):
            try:
                response = (
                    self.client.table("jobs")
                    .select("job_hash, salary_min, salary_max")
                    .in_("job_hash", list(batch))
                    .execute()
                )
                for row in response.data or []:
                    if row.get("salary_min") is not None or row.get("salary_max") is not None:
                        found[row["job_hash"]] = row
            except Exception:
                logger.exception("Stored salary lookup failed for batch of %s", len(batch))
        return found

    def load_stored_jobs_by_hashes(self, hashes: Sequence[str]) -> dict[str, dict[str, Any]]:
        """Return stored job rows keyed by job_hash (for score reuse)."""
        found: dict[str, dict[str, Any]] = {}
        for batch in _chunks(list(hashes), HASH_QUERY_CHUNK):
            try:
                response = (
                    self.client.table("jobs")
                    .select(
                        "id, job_hash, description, match_score, fit_reason, "
                        "missing_skills, scored_by, scored_at"
                    )
                    .in_("job_hash", list(batch))
                    .execute()
                )
                for row in response.data or []:
                    found[row["job_hash"]] = row
            except Exception:
                logger.exception("Stored job lookup failed for batch of %s", len(batch))
        return found

    def ensure_user_job_states(
        self,
        user_id: str,
        job_ids: Sequence[str],
        known_job_ids: set[str],
        location_by_job: dict[str, dict[str, Any]] | None = None,
    ) -> int:
        """Create status=new rows for jobs the user has never seen. Never overwrite status."""
        created = 0
        location_by_job = location_by_job or {}
        for job_id in job_ids:
            location = location_by_job.get(job_id) or {}
            if job_id in known_job_ids:
                if location:
                    self._patch_user_job_location(user_id, job_id, location)
                continue
            payload: dict[str, Any] = {"user_id": user_id, "job_id": job_id, "status": "new"}
            payload.update(location)
            try:
                response = (
                    self.client.table("user_job_states")
                    .insert(payload)
                    .execute()
                )
                if response.data:
                    created += 1
                    known_job_ids.add(job_id)
            except Exception as exc:
                if "duplicate" in str(exc).lower() or "23505" in str(exc):
                    known_job_ids.add(job_id)
                    if location:
                        self._patch_user_job_location(user_id, job_id, location)
                    continue
                logger.exception("Failed to create user_job_state for job %s", job_id)
        return created

    def _patch_user_job_location(self, user_id: str, job_id: str, location: dict[str, Any]) -> None:
        patch = {
            k: location[k]
            for k in (
                "commute_miles",
                "work_arrangement",
                "location_status",
                "salary_status",
                "keyword_status",
                "experience_status",
                "education_status",
            )
            if k in location
        }
        if not patch:
            return
        try:
            self.client.table("user_job_states").update(patch).eq("user_id", user_id).eq("job_id", job_id).execute()
        except Exception:
            logger.exception("Failed to patch filter state for user %s job %s", user_id, job_id)

    def upsert_user_job_filter_states(self, user_id: str, updates: list[dict[str, Any]]) -> int:
        """Write location and salary verdicts for stored jobs (refilter pass)."""
        written = 0
        for row in updates:
            job_id = str(row["job_id"])
            payload = {
                "commute_miles": row.get("commute_miles"),
                "work_arrangement": row.get("work_arrangement"),
                "location_status": row.get("location_status"),
                "salary_status": row.get("salary_status"),
                "keyword_status": row.get("keyword_status"),
                "experience_status": row.get("experience_status"),
                "education_status": row.get("education_status"),
                "management_status": row.get("management_status"),
                "seniority_status": row.get("seniority_status"),
                "listing_status": row.get("listing_status"),
                "listing_check_reason": row.get("listing_check_reason"),
                "listing_checked_at": row.get("listing_checked_at"),
                "filter_reason": row.get("filter_reason"),
                "is_stretch": row.get("is_stretch"),
            }
            try:
                response = (
                    self.client.table("user_job_states")
                    .select("job_id")
                    .eq("user_id", user_id)
                    .eq("job_id", job_id)
                    .limit(1)
                    .execute()
                )
                if response.data:
                    self.client.table("user_job_states").update(payload).eq("user_id", user_id).eq("job_id", job_id).execute()
                else:
                    self.client.table("user_job_states").insert(
                        {"user_id": user_id, "job_id": job_id, "status": "new", **payload}
                    ).execute()
                written += 1
            except Exception:
                logger.exception("Failed to upsert filter state for job %s", job_id)
        return written

    def upsert_user_job_location_states(self, user_id: str, updates: list[dict[str, Any]]) -> int:
        """Backward-compatible alias for filter-state upserts."""
        return self.upsert_user_job_filter_states(user_id, updates)

    def update_job_salaries(self, jobs: Iterable[RawJob]) -> int:
        """Persist salary discovered from posting pages onto global job rows."""
        updated = 0
        for job in jobs:
            if job.salary_min is None and job.salary_max is None:
                continue
            if not job.normalized_url_hash:
                continue
            try:
                response = (
                    self.client.table("jobs")
                    .update({"salary_min": job.salary_min, "salary_max": job.salary_max})
                    .eq("job_hash", job.normalized_url_hash)
                    .execute()
                )
                if response.data:
                    updated += 1
            except Exception:
                logger.exception("Failed to update salary for job hash %s", job.normalized_url_hash)
        return updated

    def update_job_experience_requirements(self, jobs: Iterable[RawJob]) -> int:
        """Persist extracted experience requirements onto global job rows."""
        updated = 0
        for job in jobs:
            if not job.experience_requirement or not job.normalized_url_hash:
                continue
            try:
                response = (
                    self.client.table("jobs")
                    .update({"experience_requirement": job.experience_requirement})
                    .eq("job_hash", job.normalized_url_hash)
                    .execute()
                )
                if response.data:
                    updated += 1
            except Exception:
                logger.exception(
                    "Failed to update experience requirement for job hash %s",
                    job.normalized_url_hash,
                )
        return updated

    def update_job_descriptions(self, jobs: Iterable[RawJob]) -> int:
        """Persist hydrated posting text when we have a richer description."""
        updated = 0
        for job in jobs:
            description = (job.description or "").strip()
            if len(description) < 120 or not job.normalized_url_hash:
                continue
            try:
                response = (
                    self.client.table("jobs")
                    .update({"description": description})
                    .eq("job_hash", job.normalized_url_hash)
                    .execute()
                )
                if response.data:
                    updated += 1
            except Exception:
                logger.exception("Failed to update description for job hash %s", job.normalized_url_hash)
        return updated

    def job_ids_for_hashes(self, hashes: Sequence[str]) -> dict[str, str]:
        """Map job_hash -> jobs.id for linking user state."""
        mapping: dict[str, str] = {}
        for batch in _chunks(list(hashes), HASH_QUERY_CHUNK):
            try:
                response = (
                    self.client.table("jobs")
                    .select("id, job_hash")
                    .in_("job_hash", list(batch))
                    .execute()
                )
                for row in response.data or []:
                    mapping[row["job_hash"]] = str(row["id"])
            except Exception:
                logger.exception("job_ids_for_hashes failed for batch of %s", len(batch))
        return mapping

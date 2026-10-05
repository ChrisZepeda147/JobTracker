"""Canonical raw job record used across scrape, normalize, filter, and persist."""

from __future__ import annotations

import hashlib
from dataclasses import asdict, dataclass, field
from datetime import date, datetime
from typing import Any


def _normalize_dedup_part(value: str | None) -> str:
    return " ".join((value or "").strip().lower().split())


def hash_url(url: str | None) -> str:
    """MD5 of a URL that has already had its tracking parameters stripped."""
    from job_engine.normalizer import strip_tracking_params

    cleaned = strip_tracking_params(url).rstrip("/").lower()
    if not cleaned:
        return ""
    return hashlib.md5(cleaned.encode("utf-8")).hexdigest()


@dataclass
class RawJob:
    """A single posting as returned by a board, before or after normalization."""

    title: str
    company: str
    location: str
    job_url: str
    description: str
    site: str
    salary_min: float | None = None
    salary_max: float | None = None
    posted_date: str | None = None

    # Identity hash: MD5(company + title + location). Two boards listing the
    # same role produce the same value, which is what dedup keys on.
    normalized_url_hash: str = field(default="")

    # MD5 of the canonical URL with tracking parameters removed. A second,
    # independent suppression key for when a company reposts under a new title.
    url_hash: str = field(default="")

    # Populated by matcher.py once a provider scores the posting.
    match_score: int | None = None
    fit_reason: str | None = None
    missing_skills: list[str] = field(default_factory=list)
    scored_by: str | None = None

    # Populated by location hard filter (per-user commute evaluation).
    commute_miles: float | None = None
    work_arrangement: str | None = None
    location_status: str | None = None
    salary_status: str | None = None
    keyword_status: str | None = None
    experience_status: str | None = None
    education_status: str | None = None
    experience_requirement: str | None = None
    salary_page_checked: bool = False
    is_stretch: bool = False

    def generate_hash(self) -> str:
        """MD5 of company + title + location for strict cross-board deduplication."""
        key = "|".join(
            [
                _normalize_dedup_part(self.company),
                _normalize_dedup_part(self.title),
                _normalize_dedup_part(self.location),
            ]
        )
        return hashlib.md5(key.encode("utf-8")).hexdigest()

    def generate_url_hash(self) -> str:
        """MD5 of the tracking-stripped job URL."""
        return hash_url(self.job_url)

    def refresh_hash(self) -> str:
        """Recompute and store both hashes after fields are cleaned."""
        self.normalized_url_hash = self.generate_hash()
        self.url_hash = self.generate_url_hash()
        return self.normalized_url_hash

    def __post_init__(self) -> None:
        if not self.normalized_url_hash:
            self.normalized_url_hash = self.generate_hash()
        if not self.url_hash:
            self.url_hash = self.generate_url_hash()

    def salary_display(self) -> str:
        if self.salary_min and self.salary_max:
            return f"${self.salary_min:,.0f}-${self.salary_max:,.0f}"
        if self.salary_min:
            return f"${self.salary_min:,.0f}+"
        if self.salary_max:
            return f"up to ${self.salary_max:,.0f}"
        return "not listed"

    def to_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        posted = payload.get("posted_date")
        if isinstance(posted, (datetime, date)):
            payload["posted_date"] = posted.isoformat()
        return payload

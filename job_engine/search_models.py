"""Search request models and UI-to-scraper source mapping."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

# UI source id -> scraper board id (None = not implemented yet)
UI_SOURCE_TO_SCRAPER: dict[str, str | None] = {
    "linkedin": "linkedin",
    "indeed": "indeed",
    "zip_recruiter": "zip_recruiter",
    "wellfound": None,
    "builtin": "builtin",
    "company_career_pages": None,
}

SCRAPER_TO_UI: dict[str, str] = {
    "linkedin": "linkedin",
    "indeed": "indeed",
    "zip_recruiter": "zip_recruiter",
    "builtin": "builtin",
    "glassdoor": "glassdoor",
}


@dataclass
class SearchRequest:
    """A queued job search from the web app."""

    id: str
    user_id: str
    query: str
    titles: list[str]
    location: str
    location_zip: str | None
    salary_min: float | None
    salary_max: float | None
    posted_within_days: int | None
    remote_allowed: bool
    hybrid_allowed: bool
    onsite_allowed: bool
    max_onsite_miles: int | None
    sources: list[str]
    status: str = "pending"
    source_results: dict[str, Any] = field(default_factory=dict)
    rescore_only: bool = False

    @classmethod
    def from_row(cls, row: dict[str, Any]) -> "SearchRequest":
        return cls(
            id=str(row["id"]),
            user_id=str(row["user_id"]),
            query=str(row.get("query") or ""),
            titles=_titles_from_row(row),
            location=str(row.get("location") or ""),
            location_zip=_str_or_none(row.get("location_zip")),
            salary_min=_float_or_none(row.get("salary_min")),
            salary_max=_float_or_none(row.get("salary_max")),
            posted_within_days=_int_or_none(row.get("posted_within_days")),
            remote_allowed=bool(row.get("remote_allowed", True)),
            hybrid_allowed=bool(row.get("hybrid_allowed", True)),
            onsite_allowed=bool(row.get("onsite_allowed", False)),
            max_onsite_miles=_int_or_none(row.get("max_onsite_miles")),
            sources=list(row.get("sources") or []),
            status=str(row.get("status") or "pending"),
            source_results=dict(row.get("source_results") or {}),
            rescore_only=bool(row.get("rescore_only", False)),
        )

    def hours_old(self) -> int:
        days = self.posted_within_days or 7
        return max(24, days * 24)

    def search_titles(self) -> list[str]:
        """Return normalized title list; fall back to legacy single query."""
        seen: set[str] = set()
        titles: list[str] = []
        for raw in self.titles:
            title = str(raw or "").strip()
            if not title:
                continue
            key = title.lower()
            if key in seen:
                continue
            seen.add(key)
            titles.append(title)
        if titles:
            return titles[:5]
        legacy = self.query.strip()
        if legacy:
            return [legacy]
        return ["Software Engineer"]

    def resolve_scraper_sites(self) -> tuple[list[str], dict[str, dict[str, Any]]]:
        """Return scraper site keys to run and pre-built results for skipped sources."""
        sites: list[str] = []
        skipped: dict[str, dict[str, Any]] = {}
        seen: set[str] = set()

        for ui_source in self.sources:
            ui_key = ui_source.strip().lower()
            scraper = UI_SOURCE_TO_SCRAPER.get(ui_key)
            if scraper is None:
                skipped[ui_key] = {
                    "status": "unsupported",
                    "jobs_found": 0,
                    "error": "Source not implemented yet",
                }
                continue
            if scraper in seen:
                continue
            seen.add(scraper)
            sites.append(scraper)
        return sites, skipped


def _titles_from_row(row: dict[str, Any]) -> list[str]:
    raw = row.get("titles")
    if isinstance(raw, list):
        return [str(item).strip() for item in raw if str(item).strip()]
    return []


def _str_or_none(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _float_or_none(value: Any) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _int_or_none(value: Any) -> int | None:
    if value is None or value == "":
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None

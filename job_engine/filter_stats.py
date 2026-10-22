"""Counters for search/refilter quality logging."""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field


@dataclass
class SearchFilterStats:
    raw_scraped: int = 0
    normalized: int = 0
    hydration_attempted: int = 0
    hydration_success: int = 0
    hydration_failed: int = 0
    hydration_failed_by_domain: dict[str, int] = field(default_factory=lambda: defaultdict(int))

    seniority_rejected: int = 0
    management_rejected: int = 0
    experience_rejected: int = 0
    experience_unknown_kept: int = 0
    education_rejected: int = 0
    location_rejected: int = 0
    salary_rejected: int = 0
    excluded_keyword_rejected: int = 0

    hard_filter_survivors: int = 0
    temporary_scoring_pool: int = 0
    closed_rejected: int = 0
    listing_availability_unknown: int = 0
    final_saved: int = 0
    recommended_count: int = 0
    needs_decision_count: int = 0

    score_min: int | None = None
    score_max: int | None = None
    score_median: int | None = None
    score_count: int = 0

    # Legacy aliases used during refilter hydration block
    description_hydrated: int = 0
    description_hydration_failed: int = 0
    experience_unknown_rejected: int = 0
    listing_closed_rejected: int = 0

    def sync_hydration_aliases(self) -> None:
        self.description_hydrated = self.hydration_success
        self.description_hydration_failed = self.hydration_failed
        self.listing_closed_rejected = self.closed_rejected

    def record_scores(self, scores: list[int]) -> None:
        if not scores:
            return
        ordered = sorted(scores)
        self.score_count = len(ordered)
        self.score_min = ordered[0]
        self.score_max = ordered[-1]
        mid = len(ordered) // 2
        self.score_median = ordered[mid]

    def log_summary(self, logger, prefix: str = "[FILTER]") -> None:
        self.sync_hydration_aliases()
        logger.info(
            "%s funnel raw_scraped=%s normalized=%s hydration_attempted=%s "
            "hydration_success=%s hydration_failed=%s",
            prefix,
            self.raw_scraped,
            self.normalized,
            self.hydration_attempted,
            self.hydration_success,
            self.hydration_failed,
        )
        if self.hydration_failed_by_domain:
            parts = ", ".join(f"{k}={v}" for k, v in sorted(self.hydration_failed_by_domain.items()))
            logger.info("%s hydration_failed_by_domain %s", prefix, parts)
        logger.info(
            "%s rejects seniority=%s management=%s experience=%s experience_unknown_kept=%s "
            "education=%s location=%s salary=%s keyword=%s",
            prefix,
            self.seniority_rejected,
            self.management_rejected,
            self.experience_rejected,
            self.experience_unknown_kept,
            self.education_rejected,
            self.location_rejected,
            self.salary_rejected,
            self.excluded_keyword_rejected,
        )
        logger.info(
            "%s survivors=%s scoring_pool=%s closed_rejected=%s listing_unknown=%s "
            "final_saved=%s recommended_count=%s needs_decision_count=%s",
            prefix,
            self.hard_filter_survivors,
            self.temporary_scoring_pool,
            self.closed_rejected,
            self.listing_availability_unknown,
            self.final_saved,
            self.recommended_count,
            self.needs_decision_count,
        )
        if self.score_count:
            logger.info(
                "%s score_distribution count=%s min=%s median=%s max=%s",
                prefix,
                self.score_count,
                self.score_min,
                self.score_median,
                self.score_max,
            )

"""Fault-tolerant multi-board job search engine."""

from job_engine.config import Settings, get_settings
from job_engine.matcher import HardFilter, UserProfile, build_scorer, rank_matches
from job_engine.models import RawJob
from job_engine.normalizer import normalize_jobs
from job_engine.scraper_engine import ScraperConfig, ScraperEngine

__all__ = [
    "HardFilter",
    "RawJob",
    "ScraperConfig",
    "ScraperEngine",
    "Settings",
    "UserProfile",
    "build_scorer",
    "get_settings",
    "normalize_jobs",
    "rank_matches",
]

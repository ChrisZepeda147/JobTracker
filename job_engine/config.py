"""Central configuration and zero-cost AI provider detection.

Every provider here has a free tier that needs no credit card:

  Gemini  - Google AI Studio, https://aistudio.google.com/apikey
  Groq    - Groq Cloud console, https://console.groq.com/keys
  Cohere  - Cohere dashboard trial key, https://dashboard.cohere.com/api-keys
  Local   - pure-Python TF-IDF, no key and no network at all

Priority runs Gemini, Groq, Cohere, then local. Cohere sits below the other two
because its trial key is capped per month rather than per day, so it is best
kept in reserve. The local scorer is always available, so scoring can never fail.
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

logger = logging.getLogger("job_engine.config")

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Free-tier defaults, verified against the live APIs.
# gemini-3.5-flash-lite has the most generous free quota of the flash family.
DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite"
# Groq no longer serves Llama 3 chat models; gpt-oss-20b is the fast free pick.
DEFAULT_GROQ_MODEL = "openai/gpt-oss-20b"
# Cohere's flagship chat model, available on a trial key.
DEFAULT_COHERE_MODEL = "command-a-03-2025"
DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-5"

# Free tiers are rate limited (Groq ~30 RPM, Gemini ~15 RPM), so only the
# strongest candidates are sent to an API.
DEFAULT_MAX_JOBS_TO_SCORE = 20
DEFAULT_SEARCH_RESULT_LIMIT = 45
DEFAULT_RESULTS_WANTED_PER_QUERY = 25
DEFAULT_DAILY_JOB_LIMIT = DEFAULT_SEARCH_RESULT_LIMIT

PROVIDER_GEMINI = "gemini"
PROVIDER_GROQ = "groq"
PROVIDER_COHERE = "cohere"
PROVIDER_ANTHROPIC = "anthropic"
PROVIDER_LOCAL = "local"

# Local is last and always present; it is the guaranteed floor.
PROVIDER_PRIORITY = (
    PROVIDER_GEMINI,
    PROVIDER_GROQ,
    PROVIDER_COHERE,
    PROVIDER_ANTHROPIC,
    PROVIDER_LOCAL,
)


def load_env(dotenv_path: Path | None = None) -> None:
    """Load .env once, if python-dotenv is installed."""
    try:
        from dotenv import load_dotenv
    except ImportError:
        logger.debug("python-dotenv not installed; using the ambient environment")
        return
    load_dotenv(dotenv_path or (PROJECT_ROOT / ".env"))


def _clean(name: str) -> str:
    """Read an env var, treating placeholder text as absent."""
    value = (os.getenv(name) or "").strip().strip("\"'")
    if not value or value.lower().startswith(("your-", "sk-ant-...", "sb_secret_...")):
        return ""
    if value.endswith("...") or value in {"...", "changeme"}:
        return ""
    return value


@dataclass
class Settings:
    """Everything read from the environment, in one place."""

    supabase_url: str = ""
    supabase_key: str = ""
    supabase_key_is_secret: bool = False

    gemini_api_key: str = ""
    groq_api_key: str = ""
    cohere_api_key: str = ""
    anthropic_api_key: str = ""

    gemini_model: str = DEFAULT_GEMINI_MODEL
    groq_model: str = DEFAULT_GROQ_MODEL
    cohere_model: str = DEFAULT_COHERE_MODEL
    anthropic_model: str = DEFAULT_ANTHROPIC_MODEL

    max_jobs_to_score: int = DEFAULT_MAX_JOBS_TO_SCORE
    search_result_limit: int = DEFAULT_SEARCH_RESULT_LIMIT
    results_wanted_per_query: int = DEFAULT_RESULTS_WANTED_PER_QUERY
    daily_job_limit: int = DEFAULT_DAILY_JOB_LIMIT
    proxy_list: list[str] = field(default_factory=list)
    greenhouse_board_slugs: list[str] = field(default_factory=list)
    wellfound_api_key: str = ""
    strict_hydration_budget: int = 60
    strict_availability_budget: int = 45

    @classmethod
    def from_env(cls) -> "Settings":
        load_env()

        secret = (
            _clean("SUPABASE_SERVICE_KEY")
            or _clean("SUPABASE_SERVICE_ROLE_KEY")
            or _clean("SUPABASE_SECRET_KEY")
        )
        generic = _clean("SUPABASE_KEY")
        if not secret and generic and not generic.startswith("sb_publishable_"):
            secret = generic

        key = secret or _clean("SUPABASE_PUBLISHABLE_KEY") or _clean("SUPABASE_ANON_KEY") or generic

        raw_proxies = _clean("PROXY_LIST")
        proxies = [p.strip() for p in raw_proxies.split(",") if p.strip()] if raw_proxies else []

        from job_engine.greenhouse_boards import DEFAULT_GREENHOUSE_BOARD_SLUGS, parse_board_slug_list

        raw_boards = _clean("GREENHOUSE_BOARD_SLUGS")
        if raw_boards:
            greenhouse_boards = parse_board_slug_list(raw_boards)
        else:
            greenhouse_boards = list(DEFAULT_GREENHOUSE_BOARD_SLUGS)

        try:
            max_score = int(_clean("MAX_JOBS_TO_SCORE") or DEFAULT_MAX_JOBS_TO_SCORE)
        except ValueError:
            max_score = DEFAULT_MAX_JOBS_TO_SCORE

        try:
            search_limit = int(
                _clean("SEARCH_RESULT_LIMIT") or _clean("DAILY_JOB_LIMIT") or DEFAULT_SEARCH_RESULT_LIMIT
            )
        except ValueError:
            search_limit = DEFAULT_SEARCH_RESULT_LIMIT

        try:
            results_wanted = int(
                _clean("RESULTS_WANTED_PER_QUERY") or DEFAULT_RESULTS_WANTED_PER_QUERY
            )
        except ValueError:
            results_wanted = DEFAULT_RESULTS_WANTED_PER_QUERY

        try:
            hydration_budget = int(_clean("STRICT_HYDRATION_BUDGET") or 60)
        except ValueError:
            hydration_budget = 60
        try:
            availability_budget = int(_clean("STRICT_AVAILABILITY_BUDGET") or 45)
        except ValueError:
            availability_budget = 45

        return cls(
            supabase_url=_clean("SUPABASE_URL"),
            supabase_key=key,
            supabase_key_is_secret=bool(secret),
            gemini_api_key=_clean("GEMINI_API_KEY") or _clean("GOOGLE_API_KEY"),
            groq_api_key=_clean("GROQ_API_KEY"),
            cohere_api_key=_clean("COHERE_API_KEY") or _clean("CO_API_KEY"),
            anthropic_api_key=_clean("ANTHROPIC_API_KEY"),
            gemini_model=_clean("GEMINI_MODEL") or DEFAULT_GEMINI_MODEL,
            groq_model=_clean("GROQ_MODEL") or DEFAULT_GROQ_MODEL,
            cohere_model=_clean("COHERE_MODEL") or DEFAULT_COHERE_MODEL,
            anthropic_model=_clean("ANTHROPIC_MODEL") or DEFAULT_ANTHROPIC_MODEL,
            max_jobs_to_score=max_score,
            search_result_limit=max(1, search_limit),
            results_wanted_per_query=max(1, results_wanted),
            daily_job_limit=max(1, search_limit),
            proxy_list=proxies,
            greenhouse_board_slugs=greenhouse_boards,
            wellfound_api_key=_clean("WELLFOUND_API_KEY"),
            strict_hydration_budget=max(0, hydration_budget),
            strict_availability_budget=max(0, availability_budget),
        )

    def available_providers(self) -> list[str]:
        """Providers with a usable key, in priority order. Local is always last."""
        available: list[str] = []
        if self.gemini_api_key:
            available.append(PROVIDER_GEMINI)
        if self.groq_api_key:
            available.append(PROVIDER_GROQ)
        if self.cohere_api_key:
            available.append(PROVIDER_COHERE)
        if self.anthropic_api_key:
            available.append(PROVIDER_ANTHROPIC)
        available.append(PROVIDER_LOCAL)
        return available

    def model_for(self, provider: str) -> str:
        return {
            PROVIDER_GEMINI: self.gemini_model,
            PROVIDER_GROQ: self.groq_model,
            PROVIDER_COHERE: self.cohere_model,
            PROVIDER_ANTHROPIC: self.anthropic_model,
        }.get(provider, "")

    def key_for(self, provider: str) -> str:
        return {
            PROVIDER_GEMINI: self.gemini_api_key,
            PROVIDER_GROQ: self.groq_api_key,
            PROVIDER_COHERE: self.cohere_api_key,
            PROVIDER_ANTHROPIC: self.anthropic_api_key,
        }.get(provider, "")

    def describe(self) -> str:
        providers = self.available_providers()
        paid = " (paid)" if PROVIDER_ANTHROPIC in providers else ""
        return f"AI providers: {' -> '.join(providers)}{paid}"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings.from_env()


def reset_settings_cache() -> None:
    """Force a re-read of the environment (used by tests)."""
    get_settings.cache_clear()

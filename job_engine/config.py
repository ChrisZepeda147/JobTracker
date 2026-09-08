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
DEFAULT_DAILY_JOB_LIMIT = 15

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
    daily_job_limit: int = DEFAULT_DAILY_JOB_LIMIT
    proxy_list: list[str] = field(default_factory=list)

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

        try:
            max_score = int(_clean("MAX_JOBS_TO_SCORE") or DEFAULT_MAX_JOBS_TO_SCORE)
        except ValueError:
            max_score = DEFAULT_MAX_JOBS_TO_SCORE

        try:
            daily_limit = int(_clean("DAILY_JOB_LIMIT") or DEFAULT_DAILY_JOB_LIMIT)
        except ValueError:
            daily_limit = DEFAULT_DAILY_JOB_LIMIT

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
            daily_job_limit=max(1, daily_limit),
            proxy_list=proxies,
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

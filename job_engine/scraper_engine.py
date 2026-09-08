"""Isolated, retrying, jittered multi-board scraper with proxy hooks."""

from __future__ import annotations

import logging
import os
import random
import re
import time
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Any, Callable, Iterator
from urllib.parse import quote_plus, urljoin

from job_engine.models import RawJob
from job_engine.normalizer import annualize_salary, infer_interval_from_amount

logger = logging.getLogger("job_engine.scraper")

try:
    from jobspy import scrape_jobs as jobspy_scrape_jobs

    HAS_JOBSPY = True
except ImportError:  # pragma: no cover - optional dependency
    jobspy_scrape_jobs = None
    HAS_JOBSPY = False
    logger.warning("python-jobspy is not installed; JobSpy-backed boards will be skipped")

try:
    from curl_cffi import requests as cffi_requests

    HAS_CURL_CFFI = True
except ImportError:  # pragma: no cover - optional dependency
    cffi_requests = None
    HAS_CURL_CFFI = False

import requests as std_requests

JOBSPY_SITES = ("indeed", "linkedin", "zip_recruiter", "glassdoor")
# Glassdoor's location lookup rejects bare country names ("location not parsed"),
# so for these we drop the location and let country_indeed do the filtering.
COUNTRY_ONLY_LOCATIONS = {
    "",
    "us",
    "usa",
    "u.s.",
    "u.s.a.",
    "united states",
    "united states of america",
    "canada",
    "uk",
    "united kingdom",
    "remote",
}
DEFAULT_SITES = ("indeed", "linkedin", "zip_recruiter", "builtin", "glassdoor")
RETRYABLE_STATUS = {403, 429}
RETRYABLE_MARKERS = (
    "429",
    "403",
    "too many requests",
    "status code 403",
    "status code 429",
    "http 403",
    "http 429",
    "rate limited",
    "rate-limit",
    "rate_limit",
)
DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

# Built In card parsing: "Denver, CO, USA", "135K-180K Annually", "3 Days Ago".
_BUILTIN_LOCATION_RE = re.compile(r"^[A-Za-z][A-Za-z .'\-]*,\s*[A-Za-z]{2,}(?:,\s*[A-Za-z]{2,3})?$")
_BUILTIN_SALARY_RE = re.compile(
    r"([\d,.]+)\s*([Kk])?\s*-\s*([\d,.]+)\s*([Kk])?\s*(Annually|Hourly)", re.IGNORECASE
)
_RELATIVE_AGE_RE = re.compile(
    r"(\d+)\+?\s*(minute|hour|day|week|month)s?\s+ago", re.IGNORECASE
)

# Rotate residential proxies here, or set PROXY_LIST in the environment
# (comma-separated). JobSpy and the Built In fallback both consume this list.
# Formats: "user:pass@host:port", "http://user:pass@host:port", "localhost"
PROXY_LIST: list[str] = [
    # "user:pass@residential-1.example.com:8000",
    # "user:pass@residential-2.example.com:8000",
]


class ScraperError(Exception):
    """Base scraper failure."""


class RateLimitError(ScraperError):
    """Board returned 429/403 or an equivalent block."""

    def __init__(self, site: str, status_code: int | None = None, detail: str = "") -> None:
        self.site = site
        self.status_code = status_code
        message = f"{site} rate-limited"
        if status_code:
            message = f"{site} returned HTTP {status_code}"
        if detail:
            message = f"{message}: {detail}"
        super().__init__(message)


def _env_proxy_list() -> list[str]:
    raw = os.getenv("PROXY_LIST", "").strip()
    if raw:
        return [item.strip() for item in raw.split(",") if item.strip()]
    return list(PROXY_LIST)


@dataclass
class ScraperConfig:
    """Runtime knobs for a search run. Override any field from the CLI or caller."""

    search_term: str = "Full Stack Developer"
    location: str = "United States"
    is_remote: bool = False
    results_wanted: int = 20
    hours_old: int = 24
    country_indeed: str = "USA"
    sites: tuple[str, ...] = DEFAULT_SITES
    jitter_min_seconds: float = 3.5
    jitter_max_seconds: float = 8.2
    max_retries: int = 3
    backoff_base_seconds: float = 2.0
    proxy_list: list[str] = field(default_factory=_env_proxy_list)
    linkedin_fetch_description: bool = False
    description_format: str = "markdown"
    verbose_jobspy: int = 0


def _safe_str(value: Any) -> str:
    if value is None:
        return ""
    try:
        import pandas as pd

        if pd.isna(value):
            return ""
    except Exception:
        pass
    text = str(value).strip()
    return "" if text.lower() in {"nan", "none", "nat"} else text


def _safe_float(value: Any) -> float | None:
    if value is None:
        return None
    try:
        import pandas as pd

        if pd.isna(value):
            return None
    except Exception:
        pass
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _is_retryable(exc: BaseException) -> bool:
    if isinstance(exc, RateLimitError):
        return True
    text = str(exc).lower()
    return any(marker in text for marker in RETRYABLE_MARKERS)


class _JobSpyErrorCollector(logging.Handler):
    """Capture JobSpy's internal errors.

    JobSpy logs a 403/429 and returns an empty DataFrame instead of raising, so
    without this the retry/backoff logic would never see a block.
    """

    def __init__(self) -> None:
        super().__init__(level=logging.ERROR)
        self.messages: list[str] = []

    def emit(self, record: logging.LogRecord) -> None:
        try:
            self.messages.append(record.getMessage())
        except Exception:
            pass

    def blocked_status(self) -> int | None:
        for message in self.messages:
            match = re.search(r"\b(403|429)\b", message)
            if match:
                return int(match.group(1))
        return None


@contextmanager
def _capture_jobspy_errors() -> Iterator[_JobSpyErrorCollector]:
    collector = _JobSpyErrorCollector()
    # JobSpy sets propagate = False on "JobSpy:<Site>" loggers, so attach directly.
    loggers = [
        logging.getLogger(name)
        for name in list(logging.root.manager.loggerDict)
        if name.startswith("JobSpy")
    ]
    for board_logger in loggers:
        board_logger.addHandler(collector)
    try:
        yield collector
    finally:
        for board_logger in loggers:
            board_logger.removeHandler(collector)


def _parse_k_amount(number: str, k_flag: str | None) -> float | None:
    try:
        value = float(number.replace(",", ""))
    except (TypeError, ValueError):
        return None
    return value * 1000.0 if k_flag else value


def _normalize_proxy_url(proxy: str) -> str:
    item = proxy.strip()
    if item in {"localhost", "direct", ""}:
        return item
    if "://" not in item:
        return f"http://{item}"
    return item


def _compose_location(row: dict[str, Any]) -> str:
    city = _safe_str(row.get("city"))
    state = _safe_str(row.get("state"))
    country = _safe_str(row.get("country"))
    listed = _safe_str(row.get("location"))
    if city and state:
        return f"{city}, {state}"
    if listed:
        return listed
    parts = [part for part in (city, state, country) if part]
    return ", ".join(parts)


def _format_posted_date(value: Any) -> str | None:
    if value is None:
        return None
    try:
        import pandas as pd

        if pd.isna(value):
            return None
        if isinstance(value, pd.Timestamp):
            return value.date().isoformat()
    except Exception:
        pass
    if isinstance(value, datetime):
        return value.date().isoformat()
    text = _safe_str(value)
    if not text:
        return None
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%m/%d/%Y", "%b %d, %Y", "%B %d, %Y"):
        try:
            return datetime.strptime(text[:32], fmt).date().isoformat()
        except ValueError:
            continue
    return text


def _location_slug(location: str) -> str:
    city = location.split(",")[0].strip().lower()
    return re.sub(r"[^a-z0-9]+", "-", city).strip("-")


class ScraperEngine:
    """Query each job board independently so one CAPTCHA/block cannot crash the run."""

    def __init__(self, config: ScraperConfig | None = None, **overrides: Any) -> None:
        self.config = config or ScraperConfig()
        for key, value in overrides.items():
            if not hasattr(self.config, key):
                raise TypeError(f"Unknown scraper override: {key}")
            setattr(self.config, key, value)
        if self.config.jitter_min_seconds > self.config.jitter_max_seconds:
            raise ValueError("jitter_min_seconds cannot exceed jitter_max_seconds")

    def search(
        self,
        search_term: str | None = None,
        location: str | None = None,
        is_remote: bool | None = None,
        results_wanted: int | None = None,
        hours_old: int | None = None,
        sites: list[str] | tuple[str, ...] | None = None,
    ) -> list[RawJob]:
        """Run an isolated search across the configured boards and return raw jobs."""
        cfg = self.config
        term = search_term if search_term is not None else cfg.search_term
        loc = location if location is not None else cfg.location
        remote = cfg.is_remote if is_remote is None else is_remote
        wanted = cfg.results_wanted if results_wanted is None else results_wanted
        freshness = cfg.hours_old if hours_old is None else hours_old
        board_list = tuple(sites) if sites is not None else cfg.sites

        logger.info(
            "Starting search term=%r location=%r remote=%s results_wanted=%s hours_old=%s boards=%s",
            term,
            loc,
            remote,
            wanted,
            freshness,
            ",".join(board_list),
        )
        if self.config.proxy_list:
            logger.info("Proxy rotation enabled (%s endpoint(s))", len(self.config.proxy_list))
        else:
            logger.info("No proxies configured; requests will use the local IP")

        collected: list[RawJob] = []
        for index, site in enumerate(board_list):
            site_key = site.strip().lower()
            if index > 0:
                self._sleep_jitter(reason=f"pre-request delay before {site_key}")
            jobs = self._search_site_isolated(site_key, term, loc, remote, wanted, freshness)
            collected.extend(jobs)

        logger.info("Search finished with %s raw job(s) across surviving boards", len(collected))
        return collected

    def _search_site_isolated(
        self,
        site: str,
        search_term: str,
        location: str,
        is_remote: bool,
        results_wanted: int,
        hours_old: int,
    ) -> list[RawJob]:
        logger.info("[%s] starting search", site)
        try:
            jobs = self._with_retries(
                site,
                lambda: self._dispatch_site(site, search_term, location, is_remote, results_wanted, hours_old),
            )
        except RateLimitError as exc:
            # An expected block: one clear line beats a stack trace.
            logger.error(
                "[%s] blocked (%s); giving up on this board and continuing. "
                "Configure PROXY_LIST to work around it.",
                site,
                exc,
            )
            return []
        except Exception:
            logger.exception(
                "[%s] failed after isolated handling; continuing with remaining boards",
                site,
            )
            return []

        logger.info("[%s] fetched %s job(s)", site, len(jobs))
        return jobs

    def _dispatch_site(
        self,
        site: str,
        search_term: str,
        location: str,
        is_remote: bool,
        results_wanted: int,
        hours_old: int,
    ) -> list[RawJob]:
        if site == "builtin":
            return self._scrape_builtin(search_term, location, is_remote, results_wanted, hours_old)
        if site in JOBSPY_SITES:
            return self._scrape_jobspy(site, search_term, location, is_remote, results_wanted, hours_old)
        raise ScraperError(f"Unsupported job board: {site}")

    def _with_retries(self, site: str, operation: Callable[[], list[RawJob]]) -> list[RawJob]:
        last_error: BaseException | None = None
        attempts = max(1, self.config.max_retries)
        for attempt in range(1, attempts + 1):
            try:
                return operation()
            except Exception as exc:
                last_error = exc
                if attempt >= attempts or not _is_retryable(exc):
                    raise
                delay = self._backoff_seconds(attempt)
                status = getattr(exc, "status_code", None)
                logger.warning(
                    "[%s] retryable failure (attempt %s/%s, status=%s): %s; backing off %.1fs",
                    site,
                    attempt,
                    attempts,
                    status,
                    exc,
                    delay,
                )
                time.sleep(delay)
        raise last_error or ScraperError(f"{site} exhausted retries")

    def _backoff_seconds(self, attempt: int) -> float:
        exp = self.config.backoff_base_seconds * (2 ** (attempt - 1))
        jitter = random.uniform(0.25, 1.25)
        return exp + jitter

    def _sleep_jitter(self, reason: str) -> None:
        delay = random.uniform(self.config.jitter_min_seconds, self.config.jitter_max_seconds)
        logger.info("Jitter sleep %.2fs (%s)", delay, reason)
        time.sleep(delay)

    def _jobspy_proxies(self) -> list[str] | None:
        return self.config.proxy_list or None

    def _scrape_jobspy(
        self,
        site: str,
        search_term: str,
        location: str,
        is_remote: bool,
        results_wanted: int,
        hours_old: int,
    ) -> list[RawJob]:
        if not HAS_JOBSPY or jobspy_scrape_jobs is None:
            raise ScraperError(f"python-jobspy is not installed; cannot query {site}")

        kwargs: dict[str, Any] = {
            "site_name": site,
            "search_term": search_term,
            "location": location,
            "results_wanted": results_wanted,
            "hours_old": hours_old,
            "country_indeed": self.config.country_indeed,
            "description_format": self.config.description_format,
            "verbose": self.config.verbose_jobspy,
        }
        # Indeed cannot combine hours_old with is_remote; prefer freshness.
        if site != "indeed":
            kwargs["is_remote"] = is_remote
        elif is_remote:
            logger.info("[%s] is_remote ignored because hours_old is set (Indeed limitation)", site)

        if site == "glassdoor" and location.strip().lower() in COUNTRY_ONLY_LOCATIONS:
            logger.info(
                "[glassdoor] dropping unparseable location %r; filtering by country_indeed=%s",
                location,
                self.config.country_indeed,
            )
            kwargs.pop("location", None)

        if site == "linkedin":
            kwargs["linkedin_fetch_description"] = self.config.linkedin_fetch_description
            # LinkedIn also cannot combine hours_old with easy_apply; we never set easy_apply.

        proxies = self._jobspy_proxies()
        if proxies:
            kwargs["proxies"] = proxies

        logger.info("[%s] querying via python-jobspy", site)
        with _capture_jobspy_errors() as collector:
            try:
                frame = jobspy_scrape_jobs(**kwargs)
            except Exception as exc:
                if _is_retryable(exc):
                    raise RateLimitError(site, detail=str(exc)) from exc
                raise ScraperError(f"{site} JobSpy error: {exc}") from exc

        try:
            empty = frame is None or getattr(frame, "empty", False)
        except Exception:
            empty = False

        # Only treat a logged block as fatal when nothing came back; a partial
        # page of results is worth more than a retry.
        blocked = collector.blocked_status()
        if empty and blocked:
            raise RateLimitError(site, status_code=blocked)

        if frame is None:
            logger.warning("[%s] JobSpy returned no dataframe", site)
            return []
        if empty:
            logger.info("[%s] JobSpy returned zero rows", site)
            return []

        jobs: list[RawJob] = []
        for _, row in frame.iterrows():
            try:
                jobs.append(self._row_to_job(site, row.to_dict()))
            except Exception:
                logger.exception("[%s] skipped a malformed JobSpy row", site)
        return jobs

    def _row_to_job(self, site: str, row: dict[str, Any]) -> RawJob:
        interval = _safe_str(row.get("interval")) or None
        salary_min = _safe_float(row.get("min_amount") if "min_amount" in row else row.get("salary_min"))
        salary_max = _safe_float(row.get("max_amount") if "max_amount" in row else row.get("salary_max"))
        if salary_min is not None and not interval:
            interval = infer_interval_from_amount(salary_min)
        return RawJob(
            title=_safe_str(row.get("title")),
            company=_safe_str(row.get("company")),
            location=_compose_location(row),
            job_url=_safe_str(row.get("job_url") or row.get("job_url_direct")),
            description=_safe_str(row.get("description")),
            site=_safe_str(row.get("site")) or site,
            salary_min=annualize_salary(salary_min, interval),
            salary_max=annualize_salary(salary_max, interval),
            posted_date=_format_posted_date(row.get("date_posted") or row.get("posted_date")),
        )

    def _pick_proxy(self) -> str | None:
        if not self.config.proxy_list:
            return None
        return random.choice(self.config.proxy_list)

    def _request(self, url: str, *, timeout: int = 30) -> Any:
        headers = {
            "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent": DEFAULT_USER_AGENT,
        }
        proxy = self._pick_proxy()
        proxy_url = _normalize_proxy_url(proxy) if proxy else None
        proxies = None
        if proxy_url and proxy_url not in {"localhost", "direct"}:
            proxies = {"http": proxy_url, "https": proxy_url}

        if HAS_CURL_CFFI and cffi_requests is not None:
            response = cffi_requests.get(
                url,
                headers=headers,
                proxies=proxies,
                timeout=timeout,
                impersonate="chrome",
            )
        else:
            if not HAS_CURL_CFFI:
                logger.debug("curl_cffi unavailable; using requests for %s", url)
            response = std_requests.get(url, headers=headers, proxies=proxies, timeout=timeout)

        status = getattr(response, "status_code", None)
        if status in RETRYABLE_STATUS:
            raise RateLimitError("builtin", status_code=status, detail=url)
        if status is not None and status >= 400:
            raise ScraperError(f"HTTP {status} from {url}")
        return response

    def _scrape_builtin(
        self,
        search_term: str,
        location: str,
        is_remote: bool,
        results_wanted: int,
        hours_old: int,
    ) -> list[RawJob]:
        """Built In is not in python-jobspy; scrape public listing pages as a fallback."""
        urls = self._builtin_candidate_urls(search_term, location, is_remote)
        last_error: Exception | None = None
        for url in urls:
            try:
                logger.info("[builtin] GET %s", url)
                response = self._request(url)
                jobs = self._parse_builtin_response(response.text, results_wanted, hours_old)
                if jobs:
                    return jobs
                logger.warning("[builtin] parsed zero jobs from %s; trying next endpoint", url)
            except Exception as exc:
                last_error = exc
                logger.warning("[builtin] endpoint failed (%s): %s", url, exc)
                if _is_retryable(exc):
                    raise
        if last_error:
            raise last_error
        return []

    def _builtin_candidate_urls(self, search_term: str, location: str, is_remote: bool) -> list[str]:
        query = quote_plus(search_term)
        urls = [f"https://www.builtin.com/jobs?search={query}"]
        if is_remote:
            urls.insert(0, f"https://www.builtin.com/jobs/remote?search={query}")
        slug = _location_slug(location)
        if slug and slug not in {"united-states", "usa", "us", "remote"}:
            urls.insert(0, f"https://www.builtin.com/jobs/{slug}?search={query}")
        return urls

    def _parse_builtin_response(self, html: str, results_wanted: int, hours_old: int) -> list[RawJob]:
        # Built In serves server-rendered cards; the JSON payloads are fallbacks
        # in case they move back to an embedded-state framework.
        jobs: list[RawJob] = self._jobs_from_html_cards(html)
        if not jobs:
            jobs.extend(self._jobs_from_next_data(html))
        if not jobs:
            jobs.extend(self._jobs_from_json_ld(html))
        filtered = [job for job in jobs if self._within_hours(job.posted_date, hours_old)]
        if jobs and not filtered:
            logger.info("[builtin] %s job(s) were older than %sh; returning unfiltered page matches", len(jobs), hours_old)
            filtered = jobs
        return filtered[:results_wanted]

    def _jobs_from_html_cards(self, html: str) -> list[RawJob]:
        """Parse Built In's server-rendered job cards."""
        try:
            from bs4 import BeautifulSoup
        except ImportError:
            logger.warning("[builtin] beautifulsoup4 is not installed; skipping card parser")
            return []

        soup = BeautifulSoup(html, "html.parser")
        cards = soup.select('div[data-id="job-card"]')
        jobs: list[RawJob] = []

        for card in cards:
            try:
                title_link = card.select_one('[data-id="job-card-title"]')
                if not title_link:
                    continue
                href = title_link.get("data-alias") or title_link.get("href") or ""
                if not href:
                    continue

                company_node = card.select_one('[data-id="company-title"]')
                strings = [text.strip() for text in card.stripped_strings if text.strip()]

                jobs.append(
                    RawJob(
                        title=title_link.get_text(" ", strip=True),
                        company=company_node.get_text(" ", strip=True) if company_node else "",
                        location=self._builtin_location(strings),
                        job_url=urljoin("https://www.builtin.com/", str(href).lstrip("/")),
                        description=self._builtin_description(strings),
                        site="builtin",
                        salary_min=self._builtin_salary(strings)[0],
                        salary_max=self._builtin_salary(strings)[1],
                        posted_date=self._builtin_posted_date(strings),
                    )
                )
            except Exception:
                logger.exception("[builtin] skipped a malformed job card")

        logger.info("[builtin] extracted %s job(s) from HTML cards", len(jobs))
        return jobs

    @staticmethod
    def _builtin_location(strings: list[str]) -> str:
        for text in strings:
            if _BUILTIN_LOCATION_RE.match(text):
                return text
        for text in strings:
            if text.lower() in {"remote", "fully remote"}:
                return "Remote"
        return ""

    @staticmethod
    def _builtin_salary(strings: list[str]) -> tuple[float | None, float | None]:
        for text in strings:
            match = _BUILTIN_SALARY_RE.search(text)
            if not match:
                continue
            unit = "hourly" if match.group(5).lower().startswith("hour") else "yearly"
            low = _parse_k_amount(match.group(1), match.group(2))
            high = _parse_k_amount(match.group(3), match.group(4))
            return annualize_salary(low, unit), annualize_salary(high, unit)
        return None, None

    @staticmethod
    def _builtin_posted_date(strings: list[str]) -> str | None:
        for text in strings:
            match = _RELATIVE_AGE_RE.search(text)
            if not match:
                continue
            amount = int(match.group(1))
            unit = match.group(2).lower()
            delta = {
                "minute": timedelta(minutes=amount),
                "hour": timedelta(hours=amount),
                "day": timedelta(days=amount),
                "week": timedelta(weeks=amount),
                "month": timedelta(days=amount * 30),
            }[unit]
            return (datetime.now(timezone.utc) - delta).date().isoformat()
        return None

    @staticmethod
    def _builtin_description(strings: list[str]) -> str:
        # The blurb is the longest text node on the card.
        return max(strings, key=len, default="") if strings else ""

    def _jobs_from_next_data(self, html: str) -> list[RawJob]:
        match = re.search(
            r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',
            html,
            flags=re.DOTALL,
        )
        if not match:
            return []
        try:
            import json

            payload = json.loads(match.group(1))
        except Exception:
            logger.exception("[builtin] __NEXT_DATA__ JSON parse failed")
            return []

        blobs: list[dict[str, Any]] = []
        self._walk_job_blobs(payload, blobs)
        jobs: list[RawJob] = []
        seen_urls: set[str] = set()
        for blob in blobs:
            job = self._builtin_blob_to_job(blob)
            if not job or job.job_url in seen_urls:
                continue
            seen_urls.add(job.job_url)
            jobs.append(job)
        logger.info("[builtin] extracted %s job(s) from __NEXT_DATA__", len(jobs))
        return jobs

    def _walk_job_blobs(self, node: Any, found: list[dict[str, Any]]) -> None:
        if isinstance(node, dict):
            keys = {key.lower() for key in node}
            has_title = bool(keys & {"title", "jobtitle"})
            has_url = bool(keys & {"url", "joburl", "job_url", "alias", "seo_name", "path"})
            if has_title and has_url:
                found.append(node)
            for value in node.values():
                self._walk_job_blobs(value, found)
        elif isinstance(node, list):
            for item in node:
                self._walk_job_blobs(item, found)

    def _jobs_from_json_ld(self, html: str) -> list[RawJob]:
        import json

        jobs: list[RawJob] = []
        for match in re.finditer(
            r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>',
            html,
            flags=re.DOTALL | re.IGNORECASE,
        ):
            try:
                payload = json.loads(match.group(1))
            except Exception:
                continue
            items = payload if isinstance(payload, list) else [payload]
            for item in items:
                if not isinstance(item, dict):
                    continue
                graph = item.get("@graph")
                candidates = graph if isinstance(graph, list) else [item]
                for candidate in candidates:
                    if not isinstance(candidate, dict):
                        continue
                    if str(candidate.get("@type", "")).lower() != "jobposting":
                        continue
                    job = self._json_ld_to_job(candidate)
                    if job:
                        jobs.append(job)
        logger.info("[builtin] extracted %s job(s) from JSON-LD", len(jobs))
        return jobs

    def _builtin_blob_to_job(self, blob: dict[str, Any]) -> RawJob | None:
        title = _safe_str(blob.get("title") or blob.get("jobTitle") or blob.get("name"))
        org = blob.get("hiringOrganization")
        if isinstance(org, dict):
            org_name = org.get("name")
        else:
            org_name = org
        company = _safe_str(
            blob.get("company")
            or blob.get("companyName")
            or blob.get("company_name")
            or org_name
        )
        location = _safe_str(
            blob.get("location")
            or blob.get("city")
            or blob.get("metro")
            or blob.get("formattedLocation")
        )
        path = _safe_str(
            blob.get("url")
            or blob.get("jobUrl")
            or blob.get("job_url")
            or blob.get("alias")
            or blob.get("seo_name")
            or blob.get("path")
        )
        if not title or not path:
            return None
        url = path if path.startswith("http") else urljoin("https://www.builtin.com/", path.lstrip("/"))
        if "job" not in url.lower():
            return None
        salary_min = _safe_float(blob.get("salary_min") or blob.get("min_salary") or blob.get("minSalary"))
        salary_max = _safe_float(blob.get("salary_max") or blob.get("max_salary") or blob.get("maxSalary"))
        return RawJob(
            title=title,
            company=company,
            location=location,
            job_url=url,
            description=_safe_str(blob.get("description") or blob.get("excerpt") or blob.get("shortDescription")),
            site="builtin",
            salary_min=salary_min,
            salary_max=salary_max,
            posted_date=_format_posted_date(
                blob.get("published_at")
                or blob.get("posted_at")
                or blob.get("datePosted")
                or blob.get("created_at")
            ),
        )

    def _json_ld_to_job(self, item: dict[str, Any]) -> RawJob | None:
        title = _safe_str(item.get("title"))
        org = item.get("hiringOrganization") or {}
        company = _safe_str(org.get("name") if isinstance(org, dict) else org)
        loc_node = item.get("jobLocation") or {}
        if isinstance(loc_node, list) and loc_node:
            loc_node = loc_node[0]
        address = loc_node.get("address") if isinstance(loc_node, dict) else {}
        if isinstance(address, dict):
            location = ", ".join(
                part
                for part in (
                    _safe_str(address.get("addressLocality")),
                    _safe_str(address.get("addressRegion")),
                )
                if part
            )
        else:
            location = _safe_str(address)
        url = _safe_str(item.get("url"))
        if not title or not url:
            return None
        base_salary = item.get("baseSalary") or {}
        value_node = base_salary.get("value") if isinstance(base_salary, dict) else {}
        salary_min = _safe_float((value_node or {}).get("minValue") if isinstance(value_node, dict) else None)
        salary_max = _safe_float((value_node or {}).get("maxValue") if isinstance(value_node, dict) else None)
        unit = None
        if isinstance(base_salary, dict):
            unit = _safe_str(base_salary.get("unitText") or (value_node or {}).get("unitText"))
        return RawJob(
            title=title,
            company=company,
            location=location,
            job_url=url,
            description=_safe_str(item.get("description")),
            site="builtin",
            salary_min=annualize_salary(salary_min, unit),
            salary_max=annualize_salary(salary_max, unit),
            posted_date=_format_posted_date(item.get("datePosted")),
        )

    @staticmethod
    def _within_hours(posted_date: str | None, hours_old: int) -> bool:
        if not posted_date or hours_old <= 0:
            return True
        try:
            parsed = datetime.fromisoformat(posted_date.replace("Z", "+00:00"))
        except ValueError:
            return True
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        age_hours = (datetime.now(timezone.utc) - parsed.astimezone(timezone.utc)).total_seconds() / 3600.0
        return age_hours <= hours_old + 24

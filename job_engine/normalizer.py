"""Clean scraped text, URLs, and salaries into a stable canonical form."""

from __future__ import annotations

import logging
import re
from html import unescape
from html.parser import HTMLParser
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from job_engine.models import RawJob

logger = logging.getLogger("job_engine.normalizer")

TRACKING_PARAMS = {
    "alid",
    "campaignid",
    "dclid",
    "fbclid",
    "from",
    "gclid",
    "gclsrc",
    "ik",
    "mc_cid",
    "mc_eid",
    "msclkid",
    "original_referer",
    "ref",
    "refid",
    "rs",
    "sc",
    "si",
    "source",
    "sp",
    "trk",
    "trkcamp",
    "twclid",
    "utm_campaign",
    "utm_cid",
    "utm_content",
    "utm_id",
    "utm_medium",
    "utm_name",
    "utm_reader",
    "utm_social",
    "utm_source",
    "utm_term",
    "via",
    "vj",
    "vjs",
}

TRACKING_PREFIXES = ("utm_", "trk")

HOURLY_HOURS_PER_YEAR = 2080.0
DAILY_DAYS_PER_YEAR = 260.0
WEEKLY_WEEKS_PER_YEAR = 52.0
MONTHS_PER_YEAR = 12.0

_K_SUFFIX = re.compile(r"^([\d,.]+)\s*[kK]$")
_PLAIN_NUMBER = re.compile(r"^[\d,.]+$")
_SALARY_IN_TEXT = re.compile(
    r"""
    \$?\s*(?P<min>[\d,]+(?:\.\d+)?)\s*(?P<min_k>[kK])?
    (?:\s*(?:-|–|—|to)\s*\$?\s*(?P<max>[\d,]+(?:\.\d+)?)\s*(?P<max_k>[kK])?)?
    \s*(?P<unit>per\s+year|per\s+annum|per\s+hour|per\s+month|per\s+week|/yr|/year|yearly|annually|annual|/hr|hourly|/mo|monthly|a\s+year|a\s+month|an\s+hour)?
    """,
    re.IGNORECASE | re.VERBOSE,
)
_SALARY_HINT = re.compile(r"(salary|compensation|pay|range|\$\s*\d)", re.IGNORECASE)

# Boards disagree on country suffixes ("Denver, CO" vs "Denver, CO, USA"), which
# would otherwise defeat the company+title+location dedup hash.
_TRAILING_COUNTRY_RE = re.compile(
    r",\s*(?:us|usa|u\.s\.a?\.?|united states(?: of america)?)\s*$", re.IGNORECASE
)


class _HTMLStripper(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._chunks: list[str] = []
        self._skip_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in {"script", "style", "noscript"}:
            self._skip_depth += 1
        elif tag in {"p", "br", "div", "li", "h1", "h2", "h3", "h4", "tr", "ul", "ol"}:
            self._chunks.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "noscript"} and self._skip_depth:
            self._skip_depth -= 1
        elif tag in {"p", "div", "li", "h1", "h2", "h3", "h4", "tr"}:
            self._chunks.append("\n")

    def handle_data(self, data: str) -> None:
        if self._skip_depth == 0:
            self._chunks.append(data)

    def get_text(self) -> str:
        text = unescape("".join(self._chunks))
        text = re.sub(r"[ \t\r\f\v]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()


def strip_html(text: str | None) -> str:
    """Remove markup and collapse leftover whitespace."""
    if not text:
        return ""
    raw = unescape(str(text))
    if "<" not in raw:
        return re.sub(r"\s+", " ", raw).strip()
    parser = _HTMLStripper()
    try:
        parser.feed(raw)
        parser.close()
        return parser.get_text()
    except Exception:
        logger.exception("HTML strip failed; falling back to regex cleanup")
        cleaned = re.sub(r"<(script|style|noscript)[\s\S]*?</\1>", " ", raw, flags=re.I)
        cleaned = re.sub(r"<[^>]+>", " ", cleaned)
        return re.sub(r"\s+", " ", unescape(cleaned)).strip()


def _is_tracking_param(name: str) -> bool:
    key = name.lower()
    if key in TRACKING_PARAMS:
        return True
    return any(key.startswith(prefix) for prefix in TRACKING_PREFIXES)


def strip_tracking_params(url: str | None) -> str:
    """Drop analytics/tracking query params and fragments so the same job shares one URL."""
    if not url:
        return ""
    raw = str(url).strip()
    try:
        parsed = urlparse(raw)
        kept = [
            (key, value)
            for key, value in parse_qsl(parsed.query, keep_blank_values=True)
            if not _is_tracking_param(key)
        ]
        cleaned = parsed._replace(query=urlencode(kept, doseq=True), fragment="")
        return urlunparse(cleaned)
    except Exception:
        logger.exception("URL cleanup failed for %s", raw)
        return raw


def _parse_money_token(token: str | None, k_flag: str | None = None) -> float | None:
    if token is None:
        return None
    text = str(token).strip().replace(",", "").replace("$", "")
    if not text:
        return None
    multiplier = 1000.0 if k_flag else 1.0
    k_match = _K_SUFFIX.match(text)
    if k_match:
        text = k_match.group(1)
        multiplier = 1000.0
    try:
        return float(text) * multiplier
    except ValueError:
        return None


def annualize_salary(amount: float | None, interval: str | None = None) -> float | None:
    """Convert a numeric wage into a yearly float."""
    if amount is None:
        return None
    try:
        value = float(amount)
    except (TypeError, ValueError):
        return None
    if value <= 0:
        return None

    unit = (interval or "yearly").strip().lower()
    if unit in {"year", "yearly", "annual", "annually", "yr", "/yr", "per year", "per annum", "a year"}:
        yearly = value
    elif unit in {"month", "monthly", "mo", "/mo", "per month", "a month"}:
        yearly = value * MONTHS_PER_YEAR
    elif unit in {"week", "weekly", "wk", "/wk", "per week"}:
        yearly = value * WEEKLY_WEEKS_PER_YEAR
    elif unit in {"day", "daily", "per day"}:
        yearly = value * DAILY_DAYS_PER_YEAR
    elif unit in {"hour", "hourly", "hr", "/hr", "per hour", "an hour"}:
        yearly = value * HOURLY_HOURS_PER_YEAR
    else:
        yearly = value

    return round(yearly, 2)


def infer_interval_from_amount(amount: float) -> str:
    """Guess pay period when a board omits interval (small numbers are rarely yearly)."""
    if amount <= 300:
        return "hourly"
    if amount <= 3000:
        return "weekly"
    if amount <= 20000:
        return "monthly"
    return "yearly"


def normalize_salary(
    value: float | int | str | None,
    interval: str | None = None,
) -> float | None:
    """Coerce a salary token into a yearly numeric float."""
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)):
        amount = float(value)
        unit = interval or infer_interval_from_amount(amount)
        return annualize_salary(amount, unit)

    text = str(value).strip()
    parsed = _parse_money_token(text)
    if parsed is None:
        return None
    unit = interval or infer_interval_from_amount(parsed)
    return annualize_salary(parsed, unit)


def extract_salary_from_text(text: str | None) -> tuple[float | None, float | None]:
    """Best-effort salary range extraction when a board omitted structured pay data."""
    if not text or not _SALARY_HINT.search(text):
        return None, None
    match = _SALARY_IN_TEXT.search(text)
    if not match:
        return None, None
    unit = match.group("unit")
    minimum = _parse_money_token(match.group("min"), match.group("min_k"))
    maximum = _parse_money_token(match.group("max"), match.group("max_k"))
    if minimum is None:
        return None, None
    inferred = unit or infer_interval_from_amount(minimum)
    return annualize_salary(minimum, inferred), annualize_salary(maximum, inferred)


def _clean_text_field(value: str | None) -> str:
    return strip_html(value)


def normalize_location(value: str | None) -> str:
    """Strip trailing country suffixes so boards agree on the same place."""
    text = strip_html(value)
    return _TRAILING_COUNTRY_RE.sub("", text).strip().rstrip(",").strip()


def normalize_job(job: RawJob) -> RawJob:
    """Clean one RawJob in place and refresh its dedup hash."""
    job.title = _clean_text_field(job.title)
    job.company = _clean_text_field(job.company)
    job.location = normalize_location(job.location)
    job.description = _clean_text_field(job.description)
    job.job_url = strip_tracking_params(job.job_url)
    job.site = (job.site or "").strip().lower()
    job.posted_date = (job.posted_date or "").strip() or None

    job.salary_min = normalize_salary(job.salary_min)
    job.salary_max = normalize_salary(job.salary_max)
    if job.salary_min is None and job.salary_max is None:
        job.salary_min, job.salary_max = extract_salary_from_text(job.description)

    if job.salary_min is not None and job.salary_max is not None and job.salary_min > job.salary_max:
        job.salary_min, job.salary_max = job.salary_max, job.salary_min

    # Recomputed last so both hashes reflect the cleaned fields and stripped URL.
    job.refresh_hash()
    return job


def normalize_jobs(jobs: list[RawJob]) -> list[RawJob]:
    """Normalize, then drop exact company+title+location duplicates."""
    cleaned: list[RawJob] = []
    seen: set[str] = set()
    dropped = 0

    for job in jobs:
        try:
            normalize_job(job)
        except Exception:
            logger.exception(
                "Failed to normalize job from %s (%s / %s); keeping a best-effort copy",
                job.site,
                job.company,
                job.title,
            )
            try:
                job.refresh_hash()
            except Exception:
                logger.exception("Hash refresh also failed for %s", job.job_url)

        if not job.title or not job.job_url:
            logger.warning("Dropping incomplete job from %s: title=%r url=%r", job.site, job.title, job.job_url)
            continue

        if job.normalized_url_hash in seen:
            dropped += 1
            logger.debug(
                "Dedup drop: %s | %s | %s (%s)",
                job.company,
                job.title,
                job.location,
                job.site,
            )
            continue
        seen.add(job.normalized_url_hash)
        cleaned.append(job)

    if dropped:
        logger.info("Removed %s duplicate job(s) via company+title+location hash", dropped)
    logger.info("Normalized %s unique job(s) from %s raw record(s)", len(cleaned), len(jobs))
    return cleaned

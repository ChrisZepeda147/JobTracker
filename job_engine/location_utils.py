"""Zip resolution and distance checks for search requests."""

from __future__ import annotations

import logging
import math
import re
from dataclasses import dataclass
from functools import lru_cache

logger = logging.getLogger("job_engine.location_utils")

_ZIP_RE = re.compile(r"\b(\d{5})(?:-\d{4})?\b")
_STATE_ABBR_RE = re.compile(
    r",\s*(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|"
    r"MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b"
)
_CITY_STATE_RE = re.compile(
    r"^\s*(?P<city>[^,|;/]+?)\s*,\s*"
    r"(?P<state>AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|"
    r"MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b",
    re.IGNORECASE,
)

# Used when a job is clearly in another state than the user's home zip — avoids
# Nominatim calls for nationwide scrape results (Miami, Seattle, etc.).
_CROSS_STATE_COMMUTE_MILES = 9999.0

_nominatim_geocode = None


@dataclass(frozen=True)
class ZipInfo:
    zip_code: str
    city: str
    state: str
    latitude: float
    longitude: float

    @property
    def display_location(self) -> str:
        if self.city and self.state:
            return f"{self.city}, {self.state}"
        return self.zip_code


def _normalize_zip(value: str | None) -> str | None:
    if not value:
        return None
    digits = re.sub(r"\D", "", value.strip())
    if len(digits) == 5:
        return digits
    if len(digits) >= 5:
        return digits[:5]
    return None


def state_abbr_from_location(location: str) -> str | None:
    match = _STATE_ABBR_RE.search(location or "")
    return match.group(1).upper() if match else None


def _state_abbr_from_location(location: str) -> str | None:
    return state_abbr_from_location(location)


@lru_cache(maxsize=256)
def resolve_us_zip(value: str | None) -> ZipInfo | None:
    """Resolve a US zip code to city/state and coordinates."""
    zip_code = _normalize_zip(value)
    if not zip_code:
        return None
    try:
        import pgeocode

        nomi = pgeocode.Nominatim("us")
        row = nomi.query_postal_code(zip_code)
        if row is None or row.empty:
            return None
        lat = float(row.latitude)
        lon = float(row.longitude)
        if math.isnan(lat) or math.isnan(lon):
            return None
        city = str(row.place_name or "").strip()
        state = str(row.state_code or "").strip()
        return ZipInfo(zip_code=zip_code, city=city, state=state, latitude=lat, longitude=lon)
    except Exception:
        logger.exception("Failed to resolve zip %s", zip_code)
        return None


def scraper_location(location: str, location_zip: str | None) -> str:
    """Best location string for job board scrapers."""
    info = resolve_us_zip(location_zip)
    if info:
        if info.city and info.state:
            return info.display_location
        return info.zip_code
    return (location or "").strip() or "United States"


@lru_cache(maxsize=2048)
def _geocode_us_city_state(city: str, state: str) -> tuple[float, float] | None:
    """Offline lat/lon from USPS place names (pgeocode), no HTTP."""
    city_key = city.strip().lower()
    state_key = state.strip().upper()
    if not city_key or not state_key:
        return None
    try:
        import pgeocode

        df = pgeocode.Nominatim("us")._data
        subset = df[
            (df.state_code == state_key) & (df.place_name.str.lower() == city_key)
        ]
        if subset.empty:
            subset = df[
                (df.state_code == state_key)
                & (df.place_name.str.lower().str.startswith(city_key[: min(len(city_key), 24)]))
            ]
        if subset.empty:
            return None
        row = subset.iloc[0]
        lat = float(row.latitude)
        lon = float(row.longitude)
        if math.isnan(lat) or math.isnan(lon):
            return None
        return lat, lon
    except Exception:
        logger.debug("City/state lookup failed for %r, %r", city, state, exc_info=True)
        return None


def _nominatim_lookup(normalized: str) -> tuple[float, float] | None:
    global _nominatim_geocode
    try:
        from geopy.geocoders import Nominatim
        from geopy.extra.rate_limiter import RateLimiter

        if _nominatim_geocode is None:
            geolocator = Nominatim(user_agent="jobtracker-worker/1.0", timeout=10)
            _nominatim_geocode = RateLimiter(
                geolocator.geocode,
                min_delay_seconds=2.0,
                max_retries=0,
                swallow_exceptions=True,
                return_value_on_exception=None,
            )
        result = _nominatim_geocode(f"{normalized}, USA")
        if result:
            return result.latitude, result.longitude
    except Exception:
        logger.debug("Geocode failed for %r", normalized, exc_info=True)
    return None


@lru_cache(maxsize=2048)
def _geocode_location(location: str) -> tuple[float, float] | None:
    normalized = (location or "").strip()
    if not normalized:
        return None

    zip_match = _ZIP_RE.search(normalized)
    if zip_match:
        info = resolve_us_zip(zip_match.group(1))
        if info:
            return info.latitude, info.longitude

    city_state = _CITY_STATE_RE.match(normalized)
    if city_state:
        coords = _geocode_us_city_state(city_state.group("city"), city_state.group("state"))
        if coords:
            return coords

    return _nominatim_lookup(normalized)


def haversine_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_miles = 3958.8
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return 2 * radius_miles * math.asin(math.sqrt(a))


def distance_from_origin(origin: ZipInfo, job_location: str) -> float | None:
    """Return miles from origin zip to a job location, or None if unknown."""
    job_state = _state_abbr_from_location(job_location)
    origin_state = (origin.state or "").strip().upper()
    if job_state and origin_state and job_state != origin_state:
        return _CROSS_STATE_COMMUTE_MILES

    coords = _geocode_location(job_location)
    if not coords:
        return None
    lat2, lon2 = coords
    return haversine_miles(origin.latitude, origin.longitude, lat2, lon2)

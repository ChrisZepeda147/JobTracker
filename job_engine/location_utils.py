"""Zip resolution and distance checks for search requests."""

from __future__ import annotations

import logging
import math
import re
from dataclasses import dataclass
from functools import lru_cache

logger = logging.getLogger("job_engine.location_utils")

_ZIP_RE = re.compile(r"\b(\d{5})(?:-\d{4})?\b")


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


@lru_cache(maxsize=512)
def _geocode_location(location: str) -> tuple[float, float] | None:
    normalized = (location or "").strip()
    if not normalized:
        return None

    zip_match = _ZIP_RE.search(normalized)
    if zip_match:
        info = resolve_us_zip(zip_match.group(1))
        if info:
            return info.latitude, info.longitude

    try:
        from geopy.geocoders import Nominatim
        from geopy.extra.rate_limiter import RateLimiter

        geolocator = Nominatim(user_agent="jobtracker-worker/1.0")
        geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1.0)
        result = geocode(f"{normalized}, USA")
        if result:
            return result.latitude, result.longitude
    except Exception:
        logger.debug("Geocode failed for %r", normalized, exc_info=True)
    return None


def haversine_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_miles = 3958.8
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return 2 * radius_miles * math.asin(math.sqrt(a))


def distance_from_origin(origin: ZipInfo, job_location: str) -> float | None:
    """Return miles from origin zip to a job location, or None if unknown."""
    coords = _geocode_location(job_location)
    if not coords:
        return None
    lat2, lon2 = coords
    return haversine_miles(origin.latitude, origin.longitude, lat2, lon2)

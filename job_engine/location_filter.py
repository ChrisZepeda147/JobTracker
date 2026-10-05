"""Distance-based location hard filter (Remote / Hybrid / Onsite)."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass

from job_engine.location_utils import ZipInfo, distance_from_origin, state_abbr_from_location
from job_engine.matcher import _HYBRID_RE, _ONSITE_RE, _REMOTE_RE, detect_work_mode, _normalize
from job_engine.models import RawJob

logger = logging.getLogger("job_engine.location_filter")

_US_COUNTRY_RE = re.compile(
    r"\b(united states|usa|u\.?s\.?a?\.?|america|remote\s*[-–—]?\s*us|us\s*[-–—]?\s*remote|remote\s*\(\s*us\s*\))\b",
    re.IGNORECASE,
)
_NON_US_RE = re.compile(
    r"\b("
    r"united kingdom|\buk\b|england|scotland|wales|northern ireland|ireland|"
    r"canada|toronto|vancouver|montreal|calgary|ottawa|"
    r"india|bangalore|bengaluru|hyderabad|mumbai|delhi|pune|"
    r"germany|berlin|munich|frankfurt|"
    r"france|paris|lyon|"
    r"australia|sydney|melbourne|brisbane|"
    r"netherlands|amsterdam|"
    r"spain|madrid|barcelona|"
    r"italy|rome|milan|"
    r"poland|warsaw|krakow|"
    r"remote\s*[-–—]?\s*(uk|eu|europe|canada|india|apac|emea)|"
    r"\beu\b|\bemea\b|\bapac\b|"
    r"london,\s*uk|dublin,\s*ireland"
    r")\b",
    re.IGNORECASE,
)
_US_STATE_ABBR_RE = re.compile(
    r",\s*(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|"
    r"MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b"
)
_US_STATE_NAMES = frozenset(
    name.lower()
    for name in (
        "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
        "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
        "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
        "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
        "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
        "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
        "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
        "Wisconsin", "Wyoming", "District of Columbia",
    )
)


@dataclass(frozen=True)
class LocationContext:
    origin_zip: ZipInfo | None
    max_commute_miles: int | None
    remote_allowed: bool = True
    hybrid_allowed: bool = True
    onsite_allowed: bool = False
    preferred_state: str | None = None


@dataclass
class LocationResult:
    passed: bool
    status: str  # pass | rejected | unverified
    arrangement: str  # remote | hybrid | onsite | unknown
    miles: float | None = None
    reason: str = ""


def _is_explicitly_non_us(location: str) -> bool:
    return bool(location and _NON_US_RE.search(location))


def _is_us_location(location: str) -> bool:
    if not location:
        return True
    if _US_COUNTRY_RE.search(location):
        return True
    if _US_STATE_ABBR_RE.search(location):
        return True
    if "metropolitan area" in location.lower():
        return True
    normalized = _normalize(location)
    if normalized in _US_STATE_NAMES:
        return True
    city_part = normalized.split(",")[0].strip()
    return city_part in _US_STATE_NAMES


def _is_us_eligible(location: str, mode: str) -> bool:
    if _is_explicitly_non_us(location):
        return False
    if not location:
        return True
    if mode == "remote" or _REMOTE_RE.search(location):
        return True
    return _is_us_location(location)


_ARRANGEMENT_PREFIX_RE = re.compile(
    r"^(?:remote|hybrid|on[- ]?site|in[- ]?office)\s*[-–—•|]?\s*",
    re.IGNORECASE,
)
_ARRANGEMENT_SUFFIX_RE = re.compile(
    r"\s*[-–—•|]?\s*(?:remote|hybrid|on[- ]?site|in[- ]?office)\s*$",
    re.IGNORECASE,
)


def geographic_job_location(location: str) -> str:
    """City/state portion with Remote/Hybrid/On-site prefixes removed."""
    trimmed = (location or "").strip()
    if not trimmed:
        return ""
    geo = _ARRANGEMENT_PREFIX_RE.sub("", trimmed).strip()
    geo = _ARRANGEMENT_SUFFIX_RE.sub("", geo).strip()
    geo = re.sub(
        r",\s*(?:US|USA|U\.S\.A?\.?|United States(?: of America)?)\s*$",
        "",
        geo,
        flags=re.IGNORECASE,
    ).strip()
    return geo or trimmed


def _is_broad_location(location: str) -> bool:
    if not location:
        return True
    geo = geographic_job_location(location)
    if state_abbr_from_location(geo):
        return False
    if _US_COUNTRY_RE.search(geo):
        return True
    normalized = _normalize(geo)
    if normalized in _US_STATE_NAMES:
        return True
    city_part = normalized.split(",")[0].strip()
    if city_part in _US_STATE_NAMES:
        return True
    if _REMOTE_RE.search(geo) and not state_abbr_from_location(location):
        return True
    return not geo


def _commute_miles(origin: ZipInfo | None, max_miles: int | None, location: str) -> tuple[float | None, str]:
    if not origin:
        return None, "home zip required to verify commute"
    if not max_miles:
        return None, "max commute distance required"
    geo = geographic_job_location(location)
    if _is_broad_location(geo):
        return None, "specific location required for hybrid/onsite commute check"
    miles = distance_from_origin(origin, geo or location)
    if miles is None:
        return None, "could not geocode job location"
    return miles, f"{miles:.0f} mi from home"


def _log_rejection(mode: str, miles: float, limit: int) -> None:
    logger.info("[FILTER] rejected: %s %.0f miles > %s mile limit", mode, miles, limit)


def _preferred_state_from_prefs(prefs: dict | None, origin: ZipInfo | None) -> str | None:
    if origin and origin.state:
        return origin.state.strip().upper()
    prefs = prefs or {}
    for raw in prefs.get("preferred_locations") or []:
        text = str(raw).strip()
        if not text:
            continue
        abbr = state_abbr_from_location(text)
        if abbr:
            return abbr
        if text.lower() in ("california", "ca"):
            return "CA"
    return None


_US_STATE_NAME_TO_ABBR = {
    "alabama": "AL",
    "alaska": "AK",
    "arizona": "AZ",
    "arkansas": "AR",
    "california": "CA",
    "colorado": "CO",
    "connecticut": "CT",
    "delaware": "DE",
    "florida": "FL",
    "georgia": "GA",
    "hawaii": "HI",
    "idaho": "ID",
    "illinois": "IL",
    "indiana": "IN",
    "iowa": "IA",
    "kansas": "KS",
    "kentucky": "KY",
    "louisiana": "LA",
    "maine": "ME",
    "maryland": "MD",
    "massachusetts": "MA",
    "michigan": "MI",
    "minnesota": "MN",
    "mississippi": "MS",
    "missouri": "MO",
    "montana": "MT",
    "nebraska": "NE",
    "nevada": "NV",
    "new hampshire": "NH",
    "new jersey": "NJ",
    "new mexico": "NM",
    "new york": "NY",
    "north carolina": "NC",
    "north dakota": "ND",
    "ohio": "OH",
    "oklahoma": "OK",
    "oregon": "OR",
    "pennsylvania": "PA",
    "rhode island": "RI",
    "south carolina": "SC",
    "south dakota": "SD",
    "tennessee": "TN",
    "texas": "TX",
    "utah": "UT",
    "vermont": "VT",
    "virginia": "VA",
    "washington": "WA",
    "west virginia": "WV",
    "wisconsin": "WI",
    "wyoming": "WY",
    "district of columbia": "DC",
}

_EXPLICIT_REMOTE_STATE_RES = (
    re.compile(
        r"(?:must|need to|required to)\s+(?:be|live|reside|located)\s+(?:in|within)\s+"
        r"(?:the\s+)?(?:state\s+of\s+)?(?P<place>[A-Za-z .]+?)(?:\.|,|\s+only|\s+to|\s+for|\s*$)",
        re.IGNORECASE,
    ),
    re.compile(
        r"(?:only|open)\s+(?:to|for)\s+(?:candidates|applicants|residents)\s+(?:in|from|living in)\s+"
        r"(?:the\s+)?(?:state\s+of\s+)?(?P<place>[A-Za-z .]+?)(?:\.|,|\s+only|\s*$)",
        re.IGNORECASE,
    ),
    re.compile(
        r"(?P<place>[A-Za-z .]{3,40})\s+residents?\s+only",
        re.IGNORECASE,
    ),
    re.compile(
        r"this\s+(?:role|position|job)\s+is\s+(?:only\s+)?(?:open|available)\s+(?:to|for)\s+"
        r"(?:candidates|applicants)\s+(?:in|from)\s+(?:the\s+)?(?:state\s+of\s+)?(?P<place>[A-Za-z .]+?)(?:\.|,|\s*$)",
        re.IGNORECASE,
    ),
)


def _normalize_state_token(place: str) -> str | None:
    token = (place or "").strip().rstrip(".")
    if not token:
        return None
    abbr = state_abbr_from_location(f"x, {token}") if len(token) == 2 else None
    if abbr:
        return abbr
    abbr = _US_STATE_NAME_TO_ABBR.get(token.lower())
    if abbr:
        return abbr
    if "," in token:
        return state_abbr_from_location(token)
    return None


def explicit_remote_residency_state(job: RawJob) -> str | None:
    """US state abbr when the posting explicitly restricts remote candidates to one state."""
    haystack = "\n".join(
        part for part in ((job.description or "")[:12000], job.location or "") if part
    )
    for pattern in _EXPLICIT_REMOTE_STATE_RES:
        for match in pattern.finditer(haystack):
            place = match.group("place") if "place" in match.groupdict() else None
            if not place:
                continue
            state = _normalize_state_token(place.strip())
            if state:
                return state
    return None


def effective_work_mode(job: RawJob) -> str:
    """Work mode for filtering; hybrid in body beats a Remote- prefix on the location line."""
    from job_engine.matcher import _work_mode_from_description_lines

    line_mode = _work_mode_from_description_lines(job.description)
    if line_mode:
        return line_mode

    location = job.location or ""
    if _HYBRID_RE.search(location):
        return "hybrid"
    if _ONSITE_RE.search(location):
        return "onsite"
    if _REMOTE_RE.search(location):
        head = f"{job.title}\n{(job.description or '')[:2500]}"
        if _HYBRID_RE.search(head):
            return "hybrid"
        if _ONSITE_RE.search(head):
            return "onsite"
        return "remote"
    return detect_work_mode(job)


def _job_state_abbr(location: str) -> str | None:
    return state_abbr_from_location(geographic_job_location(location) or location)


def _is_out_of_home_state(ctx: LocationContext, location: str) -> bool:
    if not ctx.preferred_state:
        return False
    job_state = _job_state_abbr(location)
    if not job_state:
        return False
    return job_state.upper() != ctx.preferred_state.upper()


def _commute_verdict(
    ctx: LocationContext,
    location: str,
    arrangement: str,
) -> LocationResult | None:
    """When home zip + commute limit are set, reject specific cities outside range."""
    if not ctx.origin_zip or not ctx.max_commute_miles:
        return None
    geo = geographic_job_location(location)
    if _is_broad_location(geo):
        return None
    miles, detail = _commute_miles(ctx.origin_zip, ctx.max_commute_miles, location)
    if miles is not None and miles <= ctx.max_commute_miles:
        return LocationResult(
            True,
            "pass",
            arrangement,
            miles=miles,
            reason=f"within commute ({miles:.0f} mi)",
        )
    if miles is not None:
        _log_rejection(arrangement, miles, ctx.max_commute_miles)
        return LocationResult(
            False,
            "rejected",
            arrangement,
            miles=miles,
            reason=f"{arrangement} {miles:.0f} miles > {ctx.max_commute_miles} mile limit",
        )
    return LocationResult(
        False,
        "unverified",
        arrangement,
        reason=f"location unverified: {detail}",
    )


def _remote_blocked_by_residency(job: RawJob, preferred_state: str | None) -> bool:
    """Reject only when remote eligibility is explicitly limited to another state."""
    restricted = explicit_remote_residency_state(job)
    if not restricted:
        return False
    if not preferred_state:
        return False
    return restricted.upper() != preferred_state.upper()


def evaluate_job_location(job: RawJob, ctx: LocationContext) -> LocationResult:
    """Hard-filter a job by work arrangement and commute distance."""
    location = (job.location or "").strip()
    mode = effective_work_mode(job)

    if _is_explicitly_non_us(location):
        return LocationResult(False, "rejected", mode or "unknown", reason="non-US location")

    if mode in ("hybrid", "onsite", "unknown") and _is_out_of_home_state(ctx, location):
        job_state = _job_state_abbr(location) or "?"
        logger.info(
            "[FILTER] rejected: %s job in %s (home state %s)",
            mode,
            job_state,
            ctx.preferred_state,
        )
        return LocationResult(
            False,
            "rejected",
            mode if mode != "unknown" else "hybrid",
            reason=f"{mode} in {job_state}, outside home state {ctx.preferred_state}",
        )

    if mode == "remote":
        if _remote_blocked_by_residency(job, ctx.preferred_state):
            restricted = explicit_remote_residency_state(job)
            logger.info(
                "[FILTER] rejected: remote restricted to %s (you prefer %s)",
                restricted,
                ctx.preferred_state,
            )
            return LocationResult(
                False,
                "rejected",
                "remote",
                reason=f"remote restricted to {restricted}, not nationwide",
            )
        commute = _commute_verdict(ctx, location, "remote")
        if commute is not None:
            return commute
        if ctx.remote_allowed and _is_us_eligible(location, mode):
            return LocationResult(True, "pass", "remote", reason="remote US-eligible")
        return LocationResult(False, "rejected", "remote", reason="remote not allowed or outside US")

    if mode in ("hybrid", "onsite"):
        if mode == "hybrid" and not ctx.hybrid_allowed:
            return LocationResult(False, "rejected", mode, reason="hybrid not allowed")
        if mode == "onsite" and not ctx.onsite_allowed:
            return LocationResult(False, "rejected", mode, reason="onsite not allowed")

        miles, detail = _commute_miles(ctx.origin_zip, ctx.max_commute_miles, location)
        if miles is not None and ctx.max_commute_miles is not None:
            if miles <= ctx.max_commute_miles:
                return LocationResult(
                    True, "pass", mode, miles=miles, reason=f"within commute ({miles:.0f} mi)"
                )
            _log_rejection(mode, miles, ctx.max_commute_miles)
            return LocationResult(
                False,
                "rejected",
                mode,
                miles=miles,
                reason=f"{mode} {miles:.0f} miles > {ctx.max_commute_miles} mile limit",
            )
        return LocationResult(
            False,
            "unverified",
            mode,
            reason=f"location unverified: {detail}",
        )

    # Unknown arrangement
    if _is_broad_location(location):
        if ctx.remote_allowed and _is_us_eligible(location, "remote"):
            return LocationResult(True, "pass", "remote", reason="broad US location, remote allowed")
        return LocationResult(
            False, "rejected", "unknown", reason="broad location requires remote work mode"
        )

    # Specific city with unknown arrangement — treat as potential hybrid/onsite, never as remote.
    if ctx.hybrid_allowed or ctx.onsite_allowed:
        miles, detail = _commute_miles(ctx.origin_zip, ctx.max_commute_miles, location)
        if miles is not None and ctx.max_commute_miles is not None:
            if miles <= ctx.max_commute_miles:
                return LocationResult(
                    True,
                    "pass",
                    "unknown",
                    miles=miles,
                    reason=f"unknown arrangement within commute ({miles:.0f} mi)",
                )
            _log_rejection("hybrid", miles, ctx.max_commute_miles)
            return LocationResult(
                False,
                "rejected",
                "unknown",
                miles=miles,
                reason=f"hybrid {miles:.0f} miles > {ctx.max_commute_miles} mile limit",
            )
        return LocationResult(
            False,
            "unverified",
            "unknown",
            reason="location unverified",
        )

    return LocationResult(
        False,
        "unverified",
        "unknown",
        reason="location unverified — arrangement unknown for specific city",
    )


def location_context_from_prefs(prefs: dict | None, request_zip: str | None = None, request_miles: int | None = None) -> LocationContext:
    """Build filter context; job preferences are the source of truth for home zip and max commute."""
    from job_engine.location_utils import resolve_us_zip

    prefs = prefs or {}
    home_zip = (prefs.get("home_zip") or request_zip or "").strip() or None
    max_miles = prefs.get("max_commute_miles")
    if max_miles is not None:
        max_miles = int(max_miles)
    elif request_miles is not None:
        max_miles = int(request_miles)

    origin = resolve_us_zip(home_zip)
    return LocationContext(
        origin_zip=origin,
        max_commute_miles=max_miles,
        remote_allowed=bool(prefs.get("remote_allowed", True)),
        hybrid_allowed=bool(prefs.get("hybrid_allowed", True)),
        onsite_allowed=bool(prefs.get("onsite_allowed", False)),
        preferred_state=_preferred_state_from_prefs(prefs, origin),
    )

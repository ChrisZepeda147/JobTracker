"""Deterministic hard filters, then zero-cost AI scoring with automatic fallback.

Two stages, deliberately ordered:

1. `HardFilter` discards anything violating a non-negotiable rule. Pure Python,
   no network, no cost, so it runs first and keeps API usage tiny.
2. A provider chain scores the survivors against the resume: Gemini, then Groq,
   then Cohere, then a local TF-IDF scorer that needs no key at all.

The chain degrades per job: if Gemini rate-limits halfway through, the jobs it
already scored are kept and the rest move to Groq. Because the local scorer can
never fail, every job that reaches stage 2 ends up with a score.
"""

from __future__ import annotations

import json
import logging
import math
import os
import re
import time
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable, Sequence

from job_engine.config import (
    PROVIDER_ANTHROPIC,
    PROVIDER_COHERE,
    PROVIDER_GEMINI,
    PROVIDER_GROQ,
    PROVIDER_LOCAL,
    Settings,
    get_settings,
)
from job_engine.models import RawJob

logger = logging.getLogger("job_engine.matcher")

DEFAULT_PROFILE_PATH = Path("user_profile.json")
MAX_DESCRIPTION_CHARS = 6000
MAX_RESUME_CHARS = 12000
VALID_LOCATION_PREFERENCES = ("remote", "onsite", "hybrid")

_REMOTE_RE = re.compile(r"\b(remote|work from home|wfh|distributed|anywhere)\b", re.IGNORECASE)
_HYBRID_RE = re.compile(r"\bhybrid\b", re.IGNORECASE)
_ONSITE_RE = re.compile(r"\b(on[- ]?site|in[- ]office|in person)\b", re.IGNORECASE)
# LinkedIn often puts work mode on its own line above "Full-time" (not in the location field).
_ARRANGEMENT_LINE_RE = re.compile(
    r"(?im)^\s*(remote|hybrid|on[- ]?site|onsite|in[- ]?office|in office)\s*$",
)


def _work_mode_from_description_lines(description: str | None) -> str | None:
    if not description:
        return None
    for line in description.splitlines()[:30]:
        match = _ARRANGEMENT_LINE_RE.match(line.strip())
        if not match:
            continue
        token = match.group(1).lower().replace(" ", "")
        if token == "remote":
            return "remote"
        if token == "hybrid":
            return "hybrid"
        if token in {"onsite", "on-site", "inoffice", "in-office"}:
            return "onsite"
    return None
_WORD_RE = re.compile(r"[a-z0-9][a-z0-9+#./-]*", re.IGNORECASE)
# Terms that look like technologies: capitalised mid-sentence, or containing a
# digit or symbol (C++, K8s, .NET). Used to keep local "missing skills" useful.
_SKILL_LIKE_RE = re.compile(r"\b[A-Z][A-Za-z0-9+#.]{1,}\b|\b[a-z]*[0-9+#][a-z0-9+#.]*\b")

_RETRYABLE_MARKERS = (
    "429", "500", "502", "503", "529",
    "rate limit", "rate_limit", "ratelimit",
    "resource_exhausted", "resource exhausted", "quota",
    "overloaded", "unavailable", "timeout", "deadline",
)

# Words too common in job ads to carry signal in the local scorer.
_STOPWORDS = frozenset("""
a an the and or but if then than that this these those for to of in on at by with from as is are was
were be been being do does did doing have has had having will would shall should can could may might
must you your we our they their he she it its not no so such about into over under more most other
some any each which who whom what when where why how all both few own same too very just now
job jobs work working role roles position positions company companies team teams candidate candidates
experience experienced years year required requirements requirement responsibilities responsibility
skills skill ability able strong excellent good great plus preferred nice must apply applying applicant
opportunity opportunities benefits salary compensation equal employer opportunity diversity inclusive
please send resume email us new please help make build using use used within across including include
""".split())

# Title/role vocabulary — never treated as missing technical skills.
_TITLE_ROLE_WORDS = frozenset("""
software engineer developer swe sde backend frontend full stack fullstack web mobile platform
applications application systems system data scientist analyst architect specialist consultant
early career entry level junior associate intern graduate new grad
""".split())

_JUNIOR_TITLE_RES = (
    re.compile(r"\bearly career\b", re.IGNORECASE),
    re.compile(r"\bentry[- ]?level\b", re.IGNORECASE),
    re.compile(r"\bjunior\b", re.IGNORECASE),
    re.compile(r"\bassociate\b", re.IGNORECASE),
    re.compile(r"\bsoftware engineer\s+(?:i|1)\b", re.IGNORECASE),
    re.compile(r"\b(?:swe|sde)\s+(?:i|1)\b", re.IGNORECASE),
    re.compile(r"\b(?:swe|sde)(?:i|1)\b", re.IGNORECASE),
)

_STRONG_STACK_TERMS = frozenset(
    """
    react next.js nextjs typescript javascript node node.js nodejs python postgresql postgres
    supabase api rest graphql integration integrations automation
    """.split()
)

_WEAK_STACK_TERMS = frozenset(
    """
    java dotnet .net c# swift kotlin objective-c cobol
    """.split()
)


def _stack_match_adjustment(title: str, description: str) -> float:
    """Prefer user's stack in ranking; never a hard filter."""
    text = f"{title} {description or ''}".lower()
    boost = 0.0
    for term in _STRONG_STACK_TERMS:
        if term in text:
            boost += 0.025
    boost = min(boost, 0.12)
    penalty = 0.0
    for term in _WEAK_STACK_TERMS:
        if re.search(rf"\b{re.escape(term)}\b", text):
            penalty += 0.035
    penalty = min(penalty, 0.12)
    return boost - penalty


_SENIOR_TITLE_RES = (
    re.compile(r"\bsenior\b", re.IGNORECASE),
    re.compile(r"\bstaff\b", re.IGNORECASE),
    re.compile(r"\bprincipal\b", re.IGNORECASE),
    re.compile(r"\blead\b", re.IGNORECASE),
    re.compile(r"\bsoftware engineer\s+(?:ii|iii|iv|2|3|4)\b", re.IGNORECASE),
    re.compile(r"\b(?:swe|sde)\s+(?:ii|iii|iv|2|3|4)\b", re.IGNORECASE),
    re.compile(r"\b(?:swe|sde)(?:ii|iii|iv|2|3|4)\b", re.IGNORECASE),
    re.compile(r"\bengineer\s+(?:ii|iii|iv|2|3|4)\b", re.IGNORECASE),
)

# Common technologies for requirement extraction when skill-like heuristics miss them.
_KNOWN_TECH_TERMS = frozenset("""
python javascript typescript java kotlin swift go golang rust ruby php c c++ c# objective-c
react reactjs vue vuejs angular svelte nextjs next.js node nodejs express django flask fastapi
spring springboot rails laravel dotnet .net asp.net sql postgres postgresql mysql mongodb redis
docker kubernetes k8s aws azure gcp graphql rest api git github gitlab ci cd jenkins terraform
ansible linux unix bash shell html css tailwind bootstrap sass scss webpack vite jest pytest
junit selenium playwright cypress pandas numpy tensorflow pytorch spark kafka rabbitmq elasticsearch
figma jira confluence slack
""".split())

# Capitalized prose in descriptions — not technologies.
_NON_TECH_CAPITALIZED = frozenset("""
requires required requirement requirements qualification qualifications responsibility responsibilities
preferred plus minimum maximum strong excellent ability abilities including include including
bachelor master degree degrees university college experience years graduate graduates graduating
pay pays paid payment compensation salary salaries hourly annually
ii iii iv i
""".split())


class MatcherError(Exception):
    """Configuration or scoring failure."""


def _normalize(text: str | None) -> str:
    return " ".join((text or "").strip().lower().split())


def _tokens(text: str | None) -> list[str]:
    words = []
    for raw in _WORD_RE.findall((text or "").lower()):
        term = raw.strip("./-")
        if len(term) >= 2 and term not in _STOPWORDS:
            words.append(term)
    return words


def _skill_like_terms(text: str | None) -> set[str]:
    """Lowercased terms in `text` that plausibly name a technology or credential."""
    terms = set()
    for raw in _SKILL_LIKE_RE.findall(text or ""):
        term = raw.strip("./-").lower()
        if len(term) >= 2 and term not in _STOPWORDS and term not in _TITLE_ROLE_WORDS:
            terms.add(term)
    return terms


def _title_word_set(title: str | None) -> set[str]:
    """Normalized tokens from a job title for exclusion from missing-skill lists."""
    words = set(_tokens(title))
    for raw in _WORD_RE.findall((title or "").lower()):
        term = raw.strip("./-")
        if term:
            words.add(term)
    return words


def _extract_technical_requirements(description: str | None, title_words: set[str]) -> set[str]:
    """Technology-like terms from the job description only (never the title)."""
    text = description or ""
    if not text.strip():
        return set()

    terms: set[str] = set()
    lowered = text.lower()
    for tech in _KNOWN_TECH_TERMS:
        if re.search(rf"\b{re.escape(tech)}\b", lowered):
            terms.add(tech)

    for raw in _SKILL_LIKE_RE.findall(text):
        term = raw.strip("./-").lower()
        if term in _STOPWORDS or term in _TITLE_ROLE_WORDS or term in title_words:
            continue
        if term in _NON_TECH_CAPITALIZED:
            continue
        if term in _KNOWN_TECH_TERMS:
            terms.add(term)
            continue
        if re.search(r"[0-9+#.]", term):
            terms.add(term)

    return {term for term in terms if len(term) >= 2}


def _normalize_skill_key(term: str) -> str:
    return term.strip("./-").lower()


def _build_candidate_skill_set(profile: UserProfile) -> set[str]:
    """Structured skills from profile, resume, and projects."""
    skills: set[str] = set()
    for raw in profile.technical_skills:
        key = _normalize_skill_key(str(raw))
        if key and key not in _STOPWORDS:
            skills.add(key)

    corpus = "\n".join(
        part
        for part in (
            profile.resume_text,
            profile.profile_text,
            profile.projects_text,
        )
        if part
    )
    skills.update(_skill_like_terms(corpus))
    for tech in _KNOWN_TECH_TERMS:
        if re.search(rf"\b{re.escape(tech)}\b", corpus.lower()):
            skills.add(tech)
    return skills


def _candidate_corpus(profile: UserProfile) -> str:
    """Text used for local TF-IDF similarity (profile + resume + projects)."""
    parts = [
        profile.resume_text,
        profile.profile_text,
        profile.projects_text,
        " ".join(profile.technical_skills),
        " ".join(profile.target_titles),
    ]
    return "\n".join(part.strip() for part in parts if part and part.strip())


def _title_overlap_score(job: RawJob, profile: UserProfile) -> float:
    title_tokens = set(_tokens(job.title))
    if not title_tokens:
        return 0.0
    if not profile.target_titles:
        return 0.5
    return max(
        (
            len(title_tokens & set(_tokens(target))) / max(len(set(_tokens(target))), 1)
            for target in profile.target_titles
        ),
        default=0.0,
    )


def _junior_title_adjustment(title: str) -> float:
    if any(pattern.search(title) for pattern in _JUNIOR_TITLE_RES):
        return 0.12
    return 0.0


def _senior_title_adjustment(title: str) -> float:
    if any(pattern.search(title) for pattern in _SENIOR_TITLE_RES):
        return -0.18
    return 0.0


def _skill_overlap_score(required: set[str], candidate: set[str]) -> float:
    if not required:
        return 0.75
    if not candidate:
        return 0.0
    matched = sum(1 for term in required if term in candidate or any(term in skill or skill in term for skill in candidate))
    return matched / len(required)


def _is_retryable(exc: BaseException) -> bool:
    status = getattr(exc, "status_code", None) or getattr(exc, "code", None)
    if status in (429, 500, 502, 503, 529):
        return True
    text = str(exc).lower()
    return any(marker in text for marker in _RETRYABLE_MARKERS)


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------


@dataclass
class UserProfile:
    """Everything the filters and the scorer need to know about you."""

    resume_text: str = ""
    technical_skills: list[str] = field(default_factory=list)
    profile_text: str = ""
    projects_text: str = ""
    target_titles: list[str] = field(default_factory=list)
    min_salary: float = 0.0
    work_location_preference: str = "remote"
    preferred_cities: list[str] = field(default_factory=list)
    blacklisted_companies: list[str] = field(default_factory=list)
    applied_job_summary: str = ""
    skipped_job_summary: str = ""
    applied_titles: list[str] = field(default_factory=list)
    applied_companies: list[str] = field(default_factory=list)
    feedback_avoid_locations: list[str] = field(default_factory=list)
    feedback_avoid_keywords: list[str] = field(default_factory=list)
    feedback_reject_senior: bool = False

    # Optional knobs with safe defaults.
    min_match_score: int = 60
    top_n: int = 10
    require_salary_data: bool = False
    search: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def load(cls, path: str | Path = DEFAULT_PROFILE_PATH) -> "UserProfile":
        profile_path = Path(path)
        if not profile_path.exists():
            raise MatcherError(f"Profile not found: {profile_path.resolve()}")

        try:
            data = json.loads(profile_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise MatcherError(f"{profile_path} is not valid JSON: {exc}") from exc

        resume_text = str(data.get("resume_text") or "").strip()
        resume_path = str(data.get("resume_path") or "").strip()
        if not resume_text and resume_path:
            candidate = Path(resume_path)
            if not candidate.is_absolute():
                candidate = profile_path.parent / candidate
            if candidate.exists():
                resume_text = candidate.read_text(encoding="utf-8", errors="replace").strip()
                logger.info("Loaded resume from %s (%s chars)", candidate, len(resume_text))
            else:
                logger.warning("resume_path %s does not exist; resume_text is empty", candidate)

        preference = str(data.get("work_location_preference") or "remote").strip().lower()
        if preference not in VALID_LOCATION_PREFERENCES:
            logger.warning(
                "work_location_preference %r is not one of %s; defaulting to 'remote'",
                preference,
                ", ".join(VALID_LOCATION_PREFERENCES),
            )
            preference = "remote"

        profile = cls(
            resume_text=resume_text,
            target_titles=[str(t) for t in data.get("target_titles", []) if str(t).strip()],
            min_salary=float(data.get("min_salary") or 0),
            work_location_preference=preference,
            preferred_cities=[str(c) for c in data.get("preferred_cities", []) if str(c).strip()],
            blacklisted_companies=[
                str(c) for c in data.get("blacklisted_companies", []) if str(c).strip()
            ],
            min_match_score=int(data.get("min_match_score", 60)),
            top_n=int(data.get("top_n", 10)),
            require_salary_data=bool(data.get("require_salary_data", False)),
            search=dict(data.get("search") or {}),
        )

        if not profile.resume_text:
            logger.warning(
                "resume_text is empty. Scoring will be based only on your titles and "
                "preferences, which is far less accurate."
            )
        return profile

    def city_keys(self) -> set[str]:
        """Preferred cities reduced to their city name for loose comparison."""
        keys: set[str] = set()
        for city in self.preferred_cities:
            normalized = _normalize(city)
            if normalized:
                keys.add(normalized)
                keys.add(normalized.split(",")[0].strip())
        return keys


# ---------------------------------------------------------------------------
# Stage 1: deterministic hard filters
# ---------------------------------------------------------------------------


@dataclass
class FilterVerdict:
    passed: bool
    reason: str = ""


def detect_work_mode(job: RawJob) -> str:
    """Classify a posting as remote, hybrid, onsite, or unknown."""
    location = job.location or ""
    from_lines = _work_mode_from_description_lines(job.description)
    if from_lines:
        return from_lines

    if _HYBRID_RE.search(location):
        return "hybrid"
    if _REMOTE_RE.search(location):
        return "remote"
    if _ONSITE_RE.search(location):
        return "onsite"

    head = f"{job.title}\n{(job.description or '')[:1500]}"
    if _HYBRID_RE.search(head):
        return "hybrid"
    if _ONSITE_RE.search(head):
        return "onsite"
    if _REMOTE_RE.search(head):
        return "remote"
    return "unknown"


class HardFilter:
    """Non-negotiable rules. Anything failing here never reaches an API."""

    def __init__(self, profile: UserProfile, database: Any | None = None) -> None:
        self.profile = profile
        self.database = database
        self._city_keys = profile.city_keys()
        self._blacklist = [
            re.compile(rf"\b{re.escape(_normalize(name))}\b")
            for name in profile.blacklisted_companies
            if _normalize(name)
        ]

    def evaluate(self, job: RawJob) -> FilterVerdict:
        for check in (
            self._check_blacklist,
            self._check_salary,
            self._check_location,
            self._check_suppressed,
        ):
            verdict = check(job)
            if not verdict.passed:
                return verdict
        return FilterVerdict(True)

    def apply(self, jobs: Iterable[RawJob]) -> tuple[list[RawJob], dict[str, int]]:
        """Split jobs into survivors, and count why the rest were dropped."""
        survivors: list[RawJob] = []
        rejections: dict[str, int] = {}
        for job in jobs:
            verdict = self.evaluate(job)
            if verdict.passed:
                survivors.append(job)
                continue
            bucket = verdict.reason.split(":")[0]
            rejections[bucket] = rejections.get(bucket, 0) + 1
            logger.debug("Filtered %s @ %s (%s)", job.title, job.company, verdict.reason)
        return survivors, rejections

    def _check_blacklist(self, job: RawJob) -> FilterVerdict:
        company = _normalize(job.company)
        if not company:
            return FilterVerdict(True)
        for pattern in self._blacklist:
            if pattern.search(company):
                return FilterVerdict(False, f"blacklisted company: {job.company}")
        return FilterVerdict(True)

    def _check_salary(self, job: RawJob) -> FilterVerdict:
        floor = self.profile.min_salary
        if floor <= 0:
            return FilterVerdict(True)

        # Judge on the top of the advertised range: a 100-160k posting still
        # clears a 120k floor.
        ceiling = job.salary_max or job.salary_min
        if ceiling is None:
            if self.profile.require_salary_data:
                return FilterVerdict(False, "salary missing: no pay data published")
            return FilterVerdict(True)
        if ceiling < floor:
            return FilterVerdict(False, f"below min_salary: {job.salary_display()}")
        return FilterVerdict(True)

    def _check_location(self, job: RawJob) -> FilterVerdict:
        preference = self.profile.work_location_preference
        mode = detect_work_mode(job)
        in_preferred_city = self._matches_preferred_city(job.location)

        if preference == "remote":
            if mode == "remote" or in_preferred_city:
                return FilterVerdict(True)
            return FilterVerdict(False, f"location mismatch: {mode} in {job.location or 'unknown'}")

        if preference == "hybrid":
            if in_preferred_city or (mode == "hybrid" and not self._city_keys):
                return FilterVerdict(True)
            return FilterVerdict(False, f"location mismatch: {mode} in {job.location or 'unknown'}")

        # onsite
        if in_preferred_city:
            return FilterVerdict(True)
        if mode == "remote" and not self._city_keys:
            return FilterVerdict(True)
        return FilterVerdict(False, f"location mismatch: {mode} in {job.location or 'unknown'}")

    def _matches_preferred_city(self, location: str | None) -> bool:
        if not self._city_keys:
            return False
        normalized = _normalize(location)
        if not normalized:
            return False
        if normalized in self._city_keys:
            return True
        city_part = normalized.split(",")[0].strip()
        return any(key == city_part or key in normalized for key in self._city_keys)

    def _check_suppressed(self, job: RawJob) -> FilterVerdict:
        """Suppression list, liked jobs, and disliked jobs all drop the posting."""
        if self.database is None:
            return FilterVerdict(True)
        try:
            reason = self.database.suppression_reason(job.company, job.title, job.job_url)
        except Exception:
            logger.exception("Suppression check failed; allowing %s", job.job_url)
            return FilterVerdict(True)
        if reason:
            return FilterVerdict(False, f"suppressed: {reason}")
        return FilterVerdict(True)


# ---------------------------------------------------------------------------
# Stage 2: scoring
# ---------------------------------------------------------------------------

SCORING_INSTRUCTIONS = """You are a precise technical recruiter screening one job posting for one candidate.

Score how well the posting fits the candidate's resume and stated preferences.

Scoring guide:
- 90-100: excellent fit; the candidate clearly meets the core requirements.
- 70-89: strong fit with minor gaps.
- 50-69: plausible but with real gaps in required skills or seniority.
- 20-49: weak fit.
- 0-19: wrong field, wrong seniority, or otherwise irrelevant.

Be skeptical and consistent. Do not inflate scores. Penalise seniority mismatches
in both directions, and missing must-have technologies.

Respond with ONLY a JSON object and nothing else:
{"match_score": <integer 0-100>, "fit_reason": "<exactly two concise sentences>", "missing_skills": ["<requirement absent from the resume>", ...]}

missing_skills must list concrete requirements from the posting that the resume
does not evidence. Use an empty list if there are none."""


@dataclass
class ScoreResult:
    match_score: int
    fit_reason: str
    missing_skills: list[str]


def _extract_json(text: str) -> dict[str, Any]:
    """Pull a JSON object out of a model response, tolerating fences or prose."""
    cleaned = (text or "").strip()
    fenced = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, re.DOTALL)
    if fenced:
        cleaned = fenced.group(1)
    else:
        start, end = cleaned.find("{"), cleaned.rfind("}")
        if start != -1 and end > start:
            cleaned = cleaned[start : end + 1]
    return json.loads(cleaned)


def _coerce(payload: dict[str, Any]) -> ScoreResult:
    try:
        score = int(round(float(payload.get("match_score", 0))))
    except (TypeError, ValueError):
        score = 0
    score = max(0, min(100, score))

    reason = str(payload.get("fit_reason") or payload.get("fit_summary") or "").strip()

    raw_gaps = payload.get("missing_skills") or payload.get("key_gaps") or []
    if isinstance(raw_gaps, str):
        raw_gaps = [raw_gaps]
    gaps = [str(g).strip() for g in raw_gaps if str(g).strip()][:8]

    return ScoreResult(score, reason, gaps)


def build_prompt(job: RawJob, profile: UserProfile) -> str:
    resume = (profile.resume_text or "(no resume provided)")[:MAX_RESUME_CHARS]
    description = (job.description or "(no description provided)")[:MAX_DESCRIPTION_CHARS]

    feedback_blocks = ""
    if profile.applied_job_summary.strip():
        feedback_blocks += f"""
<jobs_user_applied_to>
These are positive signals — the candidate applied because these looked like a good fit:
{profile.applied_job_summary.strip()}
</jobs_user_applied_to>
"""
    if profile.skipped_job_summary.strip():
        feedback_blocks += f"""
<jobs_user_skipped>
The candidate skipped these — penalize similar postings and respect the stated reasons:
{profile.skipped_job_summary.strip()}
</jobs_user_skipped>
"""

    return f"""<candidate_resume>
{resume}
</candidate_resume>

<candidate_preferences>
Target titles: {", ".join(profile.target_titles) or "not specified"}
Minimum salary: ${profile.min_salary:,.0f}
Work location preference: {profile.work_location_preference}
Preferred cities: {", ".join(profile.preferred_cities) or "not specified"}
</candidate_preferences>
{feedback_blocks}
<job_posting>
Title: {job.title}
Company: {job.company or "unknown"}
Location: {job.location or "unknown"}
Salary: {job.salary_display()}
Source: {job.site}

Description:
{description}
</job_posting>

Score this posting for this candidate."""


class BaseScorer:
    """Interface shared by every provider."""

    name = "base"
    provider = "base"
    is_local = False

    def score_one(self, job: RawJob, profile: UserProfile) -> ScoreResult:
        raise NotImplementedError


class LocalTfidfScorer(BaseScorer):
    """Pure-Python fallback scorer. No API key, no network, no cost.

    Combines structured title and technical-skill overlap (primary) with
    description-only TF-IDF similarity against profile + resume + projects.
    """

    name = "local TF-IDF"
    provider = PROVIDER_LOCAL
    is_local = True

    def __init__(self) -> None:
        self._idf: dict[str, float] = {}
        self._candidate_vector: dict[str, float] = {}
        self._candidate_skills: set[str] = set()
        self._fitted = False

    def fit(self, jobs: Sequence[RawJob], profile: UserProfile) -> None:
        """Compute IDF weights and candidate vectors from structured context."""
        self._candidate_skills = _build_candidate_skill_set(profile)
        candidate_corpus = _candidate_corpus(profile)

        documents: list[list[str]] = [_tokens(candidate_corpus)]
        documents.extend(_tokens(job.description or "") for job in jobs)
        documents = [doc for doc in documents if doc]
        if not documents:
            self._fitted = True
            return

        total = len(documents)
        appearances: Counter[str] = Counter()
        for doc in documents:
            appearances.update(set(doc))

        self._idf = {
            term: math.log((total + 1) / (count + 1)) + 1.0
            for term, count in appearances.items()
        }
        self._candidate_vector = self._vectorize(_tokens(candidate_corpus))
        self._fitted = True

    def _vectorize(self, tokens: Sequence[str]) -> dict[str, float]:
        if not tokens:
            return {}
        counts = Counter(tokens)
        length = len(tokens)
        vector = {
            term: (count / length) * self._idf.get(term, 1.0) for term, count in counts.items()
        }
        norm = math.sqrt(sum(value * value for value in vector.values()))
        if norm == 0:
            return {}
        return {term: value / norm for term, value in vector.items()}

    @staticmethod
    def _cosine(a: dict[str, float], b: dict[str, float]) -> float:
        if not a or not b:
            return 0.0
        smaller, larger = (a, b) if len(a) <= len(b) else (b, a)
        return sum(value * larger.get(term, 0.0) for term, value in smaller.items())

    def _candidate_has_skill(self, term: str) -> bool:
        if term in self._candidate_skills:
            return True
        return any(term in skill or skill in term for skill in self._candidate_skills)

    def score_one(self, job: RawJob, profile: UserProfile) -> ScoreResult:
        if not self._fitted:
            self.fit([job], profile)

        title_overlap = _title_overlap_score(job, profile)
        title_words = _title_word_set(job.title)
        required_skills = _extract_technical_requirements(job.description, title_words)
        skill_overlap = _skill_overlap_score(required_skills, self._candidate_skills)

        description_tokens = _tokens(job.description or "")
        similarity = self._cosine(self._candidate_vector, self._vectorize(description_tokens))
        scaled_similarity = min(1.0, similarity * 2.5)

        salary_headroom = 0.0
        ceiling = job.salary_max or job.salary_min
        if ceiling and profile.min_salary:
            salary_headroom = min(1.0, ceiling / (profile.min_salary * 1.5))

        junior_adj = _junior_title_adjustment(job.title or "")
        senior_adj = _senior_title_adjustment(job.title or "")
        stack_adj = _stack_match_adjustment(job.title or "", job.description or "")

        feedback_adj = 0.0
        try:
            from job_engine.job_feedback import feedback_score_adjustment

            feedback_adj = feedback_score_adjustment(job, profile)
        except Exception:
            logger.debug("Feedback score adjustment skipped", exc_info=True)

        raw = (
            0.30 * title_overlap
            + 0.45 * skill_overlap
            + 0.10 * scaled_similarity
            + 0.10 * salary_headroom
            + junior_adj
            + senior_adj
            + stack_adj
            + feedback_adj
        )
        score = max(0, min(100, int(round(raw * 100))))

        missing = self._missing_skills(job, title_words, required_skills)
        skill_pct = int(skill_overlap * 100)
        reason = (
            f"Local match: {int(title_overlap * 100)}% title overlap, "
            f"{skill_pct}% technical skill overlap"
            f"{f', {similarity:.2f} description similarity' if similarity > 0 else ''}. "
            f"Scored offline without an AI provider, so treat this as a rough ranking."
        )
        return ScoreResult(score, reason, missing)

    def _missing_skills(
        self,
        job: RawJob,
        title_words: set[str],
        required_skills: set[str],
        limit: int = 6,
    ) -> list[str]:
        """Technologies from the description that the candidate profile lacks."""
        if not required_skills:
            return []

        candidates = [
            term
            for term in required_skills
            if term not in title_words and not self._candidate_has_skill(term)
        ]
        ranked = sorted(candidates, key=lambda term: self._idf.get(term, 0.0), reverse=True)
        return ranked[:limit]


class GeminiScorer(BaseScorer):
    """Google Gemini free tier via Google AI Studio."""

    provider = PROVIDER_GEMINI

    def __init__(self, api_key: str, model: str) -> None:
        try:
            from google import genai
            from google.genai import types
        except ImportError as exc:
            raise MatcherError("google-genai is not installed (pip install google-genai)") from exc
        if not api_key:
            raise MatcherError("GEMINI_API_KEY is not set")

        self._types = types
        self.model = model
        self.name = f"Gemini ({model}, free tier)"
        self.client = genai.Client(api_key=api_key)
        # We never use tools, and leaving AFC on makes the SDK warn on every call.
        self._afc = types.AutomaticFunctionCallingConfig(disable=True)

    def score_one(self, job: RawJob, profile: UserProfile) -> ScoreResult:
        response = self.client.models.generate_content(
            model=self.model,
            contents=build_prompt(job, profile),
            config=self._types.GenerateContentConfig(
                system_instruction=SCORING_INSTRUCTIONS,
                temperature=0.0,
                max_output_tokens=1200,
                response_mime_type="application/json",
                automatic_function_calling=self._afc,
            ),
        )
        return _coerce(_extract_json(response.text or ""))


class GroqScorer(BaseScorer):
    """Groq Cloud free tier (OpenAI-compatible chat completions)."""

    provider = PROVIDER_GROQ

    def __init__(self, api_key: str, model: str) -> None:
        try:
            from groq import Groq
        except ImportError as exc:
            raise MatcherError("groq is not installed (pip install groq)") from exc
        if not api_key:
            raise MatcherError("GROQ_API_KEY is not set")

        self.model = model
        self.name = f"Groq ({model}, free tier)"
        self.client = Groq(api_key=api_key)

    def score_one(self, job: RawJob, profile: UserProfile) -> ScoreResult:
        completion = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": SCORING_INSTRUCTIONS},
                {"role": "user", "content": build_prompt(job, profile)},
            ],
            temperature=0.0,
            max_tokens=1200,
            response_format={"type": "json_object"},
        )
        return _coerce(_extract_json(completion.choices[0].message.content or ""))


class CohereScorer(BaseScorer):
    """Cohere trial key. Free, but capped per month rather than per day."""

    provider = PROVIDER_COHERE

    # Cohere can enforce a schema server-side, so the reply is always shaped right.
    RESPONSE_SCHEMA = {
        "type": "object",
        "required": ["match_score", "fit_reason", "missing_skills"],
        "properties": {
            "match_score": {"type": "integer"},
            "fit_reason": {"type": "string"},
            "missing_skills": {"type": "array", "items": {"type": "string"}},
        },
    }

    def __init__(self, api_key: str, model: str) -> None:
        try:
            import cohere
        except ImportError as exc:
            raise MatcherError("cohere is not installed (pip install cohere)") from exc
        if not api_key:
            raise MatcherError("COHERE_API_KEY is not set")

        self.model = model
        self.name = f"Cohere ({model}, trial tier)"
        # The schema parameter is flagged experimental and warns on every call.
        self.client = cohere.ClientV2(
            api_key=api_key, log_warning_experimental_features=False
        )

    def score_one(self, job: RawJob, profile: UserProfile) -> ScoreResult:
        response = self.client.chat(
            model=self.model,
            messages=[
                {"role": "system", "content": SCORING_INSTRUCTIONS},
                {"role": "user", "content": build_prompt(job, profile)},
            ],
            response_format={"type": "json_object", "schema": self.RESPONSE_SCHEMA},
            temperature=0.0,
            max_tokens=1200,
        )
        parts = [block.text for block in response.message.content or [] if hasattr(block, "text")]
        return _coerce(_extract_json("".join(parts)))


class AnthropicScorer(BaseScorer):
    """Anthropic Claude. Not free, so it sits below the free providers."""

    provider = PROVIDER_ANTHROPIC

    def __init__(self, api_key: str, model: str) -> None:
        try:
            import anthropic
        except ImportError as exc:
            raise MatcherError("anthropic is not installed (pip install anthropic)") from exc
        if not api_key:
            raise MatcherError("ANTHROPIC_API_KEY is not set")

        self.model = model
        self.name = f"Claude ({model})"
        self.client = anthropic.Anthropic(api_key=api_key)

    def score_one(self, job: RawJob, profile: UserProfile) -> ScoreResult:
        message = self.client.messages.create(
            model=self.model,
            max_tokens=4000,
            system=SCORING_INSTRUCTIONS,
            messages=[{"role": "user", "content": build_prompt(job, profile)}],
        )
        parts = [
            getattr(block, "text", "")
            for block in getattr(message, "content", []) or []
            if getattr(block, "type", None) == "text"
        ]
        return _coerce(_extract_json("\n".join(parts)))


def _create_scorer(provider: str, settings: Settings) -> BaseScorer:
    if provider == PROVIDER_LOCAL:
        return LocalTfidfScorer()
    if provider == PROVIDER_GEMINI:
        return GeminiScorer(settings.gemini_api_key, settings.gemini_model)
    if provider == PROVIDER_GROQ:
        return GroqScorer(settings.groq_api_key, settings.groq_model)
    if provider == PROVIDER_COHERE:
        return CohereScorer(settings.cohere_api_key, settings.cohere_model)
    if provider == PROVIDER_ANTHROPIC:
        return AnthropicScorer(settings.anthropic_api_key, settings.anthropic_model)
    raise MatcherError(f"Unknown provider: {provider}")


class ProviderChain:
    """Scores jobs across providers, degrading instead of failing.

    Each provider handles whatever is still unscored. If one exhausts its free
    quota partway through, its completed work is kept and the remainder moves
    down the chain. The local scorer anchors the chain and cannot fail.
    """

    def __init__(
        self,
        profile: UserProfile,
        settings: Settings | None = None,
        providers: Sequence[str] | None = None,
        max_workers: int = 3,
        max_retries: int = 2,
    ) -> None:
        self.profile = profile
        self.settings = settings or get_settings()
        self.max_workers = max(1, max_workers)
        self.max_retries = max(1, max_retries)
        self.requested = list(providers or self.settings.available_providers())
        if PROVIDER_LOCAL not in self.requested:
            self.requested.append(PROVIDER_LOCAL)
        self.name = " -> ".join(self.requested)

    def score_jobs(self, jobs: Sequence[RawJob]) -> list[RawJob]:
        if not jobs:
            return []

        pending = list(jobs)
        logger.info("Scoring %s job(s); provider order: %s", len(pending), self.name)

        for provider in self.requested:
            if not pending:
                break
            try:
                scorer = _create_scorer(provider, self.settings)
            except MatcherError as exc:
                logger.warning("Provider '%s' unavailable: %s", provider, exc)
                continue
            except Exception:
                logger.exception("Provider '%s' failed to initialise", provider)
                continue

            if isinstance(scorer, LocalTfidfScorer):
                scorer.fit(jobs, self.profile)

            logger.info("Trying %s for %s job(s)", scorer.name, len(pending))
            pending = self._run_provider(scorer, pending)

            if pending and not scorer.is_local:
                logger.warning(
                    "%s left %s job(s) unscored; falling back to the next provider",
                    scorer.name,
                    len(pending),
                )

        if pending:
            # Only reachable if the local scorer itself broke, which would be a bug.
            logger.error("%s job(s) could not be scored by any provider", len(pending))
        return list(jobs)

    def _run_provider(self, scorer: BaseScorer, jobs: Sequence[RawJob]) -> list[RawJob]:
        """Score what we can; return whatever this provider could not handle."""
        unscored: list[RawJob] = []
        quota_exhausted = False

        if scorer.is_local:
            for job in jobs:
                try:
                    self._apply(job, scorer, scorer.score_one(job, self.profile))
                except Exception:
                    logger.exception("Local scoring failed for %s", job.job_url)
                    unscored.append(job)
            return unscored

        with ThreadPoolExecutor(max_workers=self.max_workers) as pool:
            futures = {pool.submit(self._score_with_retry, scorer, job): job for job in jobs}
            for future in as_completed(futures):
                job = futures[future]
                try:
                    self._apply(job, scorer, future.result())
                except Exception as exc:
                    unscored.append(job)
                    if _is_retryable(exc) and not quota_exhausted:
                        quota_exhausted = True
                        logger.warning(
                            "%s hit a rate limit or quota: %s", scorer.name, str(exc)[:200]
                        )
                    elif not _is_retryable(exc):
                        logger.warning(
                            "%s could not score %s: %s", scorer.name, job.job_url, str(exc)[:200]
                        )
        return unscored

    def _score_with_retry(self, scorer: BaseScorer, job: RawJob) -> ScoreResult:
        last_error: BaseException | None = None
        for attempt in range(1, self.max_retries + 1):
            try:
                return scorer.score_one(job, self.profile)
            except Exception as exc:
                last_error = exc
                if attempt >= self.max_retries or not _is_retryable(exc):
                    raise
                delay = 2.0**(attempt - 1)
                logger.debug(
                    "%s retryable error (attempt %s/%s); waiting %.1fs",
                    scorer.name,
                    attempt,
                    self.max_retries,
                    delay,
                )
                time.sleep(delay)
        raise last_error or MatcherError("scoring failed")

    @staticmethod
    def _apply(job: RawJob, scorer: BaseScorer, result: ScoreResult) -> None:
        job.match_score = result.match_score
        job.fit_reason = result.fit_reason
        job.missing_skills = result.missing_skills
        job.scored_by = scorer.name


def build_scorer(
    profile: UserProfile,
    settings: Settings | None = None,
    force_local: bool = False,
    provider: str | None = None,
) -> ProviderChain:
    """Build the provider chain. `provider` pins a single provider for testing."""
    settings = settings or get_settings()
    if force_local:
        logger.info("Local scoring requested; skipping all AI providers")
        return ProviderChain(profile, settings, providers=[PROVIDER_LOCAL])
    if provider:
        return ProviderChain(profile, settings, providers=[provider, PROVIDER_LOCAL])
    return ProviderChain(profile, settings)


def select_candidates(jobs: Sequence[RawJob], limit: int) -> tuple[list[RawJob], list[RawJob]]:
    """Pick the best `limit` jobs to send to an API, cheaply and deterministically.

    Free tiers are rate limited, so only the strongest candidates get scored.
    Ranking here is by advertised pay, then recency, both of which are free to
    read. Everything beyond the cut is returned separately for local scoring.
    """
    if limit <= 0 or len(jobs) <= limit:
        return list(jobs), []

    ranked = sorted(
        jobs,
        key=lambda job: (job.salary_max or job.salary_min or 0, job.posted_date or ""),
        reverse=True,
    )
    return ranked[:limit], ranked[limit:]


def rank_matches(
    jobs: Sequence[RawJob],
    profile: UserProfile,
    top_n: int | None = None,
) -> list[RawJob]:
    """Drop unscored and low-scoring jobs, then return the best ones first."""
    limit = top_n if top_n is not None else profile.top_n
    qualified = [
        job
        for job in jobs
        if job.match_score is not None and job.match_score >= profile.min_match_score
    ]
    qualified.sort(key=lambda job: (job.match_score or 0, job.salary_max or 0), reverse=True)
    logger.info(
        "%s of %s scored job(s) met the minimum score of %s",
        len(qualified),
        len(jobs),
        profile.min_match_score,
    )
    return qualified[:limit]

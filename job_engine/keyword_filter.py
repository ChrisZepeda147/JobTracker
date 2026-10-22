"""Hard keyword filter from job preferences (case-insensitive)."""



from __future__ import annotations



import logging

import re

from dataclasses import dataclass



from job_engine.models import RawJob



logger = logging.getLogger("job_engine.keyword_filter")



# Roman level tokens — job title only.

_TITLE_LEVEL_KEYWORDS: frozenset[str] = frozenset({"ii", "iii", "iv"})



# User pref keywords that enable title-only new-grad / grad phrase rules (not description).

_GRAD_PREF_TRIGGERS: frozenset[str] = frozenset(

    {

        "grad",

        "graduate",

        "graduation",

        "undergrad",

    }

)



# Title-only phrases for new-grad roles (whole words / explicit phrases — no bare "grad" stem).

_GRAD_TITLE_PHRASES: tuple[tuple[str, re.Pattern[str]], ...] = (

    ("New Grad", re.compile(r"\bnew\s+grad\b", re.IGNORECASE)),

    ("New Graduate", re.compile(r"\bnew\s+graduate\b", re.IGNORECASE)),

    ("Recent Graduate", re.compile(r"\brecent\s+graduate\b", re.IGNORECASE)),

    ("University Graduate", re.compile(r"\buniversity\s+graduate\b", re.IGNORECASE)),

    ("Undergrad", re.compile(r"\bundergrad\b", re.IGNORECASE)),

    # Standalone "graduate" in title (e.g. "Graduate Software Developer"), not description.

    ("Graduate", re.compile(r"\bgraduate\b", re.IGNORECASE)),

)



_GRADUATION_TITLE = re.compile(r"\bgraduation\b", re.IGNORECASE)





@dataclass

class KeywordResult:

    passed: bool

    status: str  # pass | rejected

    matched_keyword: str | None = None

    reason: str = ""





def _grad_filter_enabled(keywords: list[str]) -> bool:

    for raw in keywords:

        if raw.strip().lower() in _GRAD_PREF_TRIGGERS:

            return True

    return False





def _find_grad_title_match(title: str) -> str | None:

    for label, pattern in _GRAD_TITLE_PHRASES:

        if pattern.search(title):

            return label

    return None





def _compile_general_keyword(keyword: str) -> re.Pattern[str]:

    escaped = re.escape(keyword.strip())

    return re.compile(rf"\b{escaped}\b", re.IGNORECASE)





def job_keyword_haystack(job: RawJob) -> str:

    return "\n".join(

        part

        for part in (job.title or "", job.company or "", job.description or "")

        if part

    )





def find_excluded_keyword(job: RawJob, keywords: list[str]) -> str | None:

    """Return the first excluded keyword matched in the appropriate haystack."""

    if not keywords:

        return None



    title = job.title or ""



    if title.strip() and _grad_filter_enabled(keywords):

        grad_hit = _find_grad_title_match(title)

        if grad_hit:

            return grad_hit



    seen: set[str] = set()

    for raw in keywords:

        keyword = raw.strip()

        if not keyword:

            continue

        key = keyword.lower()

        if key in seen:

            continue

        seen.add(key)



        if key in _GRAD_PREF_TRIGGERS:

            # Handled by title phrase rules above; skip description / stem matching.

            if key == "graduation" and title.strip() and _GRADUATION_TITLE.search(title):

                return keyword

            continue



        if key in _TITLE_LEVEL_KEYWORDS:

            if title.strip() and _compile_general_keyword(keyword).search(title):

                return keyword

            continue



        haystack = job_keyword_haystack(job)

        if not haystack.strip():

            continue

        if _compile_general_keyword(keyword).search(haystack):

            return keyword



    return None





def evaluate_job_keywords(job: RawJob, keywords: list[str]) -> KeywordResult:

    matched = find_excluded_keyword(job, keywords)

    if matched:

        logger.info("[FILTER] rejected: excluded keyword %r", matched)

        return KeywordResult(

            False,

            "rejected",

            matched_keyword=matched,

            reason=f"excluded keyword: {matched}",

        )

    return KeywordResult(True, "pass")



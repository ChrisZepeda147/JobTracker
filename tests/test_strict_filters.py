"""Regression tests for strict filtering pipeline."""

from __future__ import annotations

from unittest.mock import patch

import pytest

from job_engine.experience_filter import ExperienceContext, evaluate_job_experience, extract_required_years_for_job
from job_engine.listing_availability import evaluate_availability_from_fetch
from job_engine.management_filter import evaluate_management_requirements, evaluate_strict_seniority_title, find_management_requirement
from job_engine.models import RawJob
from job_engine.posting_fetch import PostingFetchResult, clear_posting_cache, fetch_posting, get_cached_posting
from job_engine.education_filter import evaluate_job_education, requires_cs_degree
from job_engine.keyword_filter import evaluate_job_keywords
from job_engine.posting_hydration import hydrate_job_postings


def _job(title: str, description: str = "", **kwargs) -> RawJob:
    return RawJob(
        title=title,
        company="Acme",
        location="Remote",
        job_url=kwargs.get("job_url", "https://example.com/jobs/1"),
        description=description,
        site=kwargs.get("site", "linkedin"),
    )


def test_hydrate_before_strict_experience(monkeypatch):
    clear_posting_cache()
    job = _job("Software Engineer", "", job_url="https://boards.example/g/1")

    html = (
        "<html><script type='application/ld+json'>"
        '{"@type":"JobPosting","description":"'
        + ("8+ years of full time software development experience. " * 3)
        + '"}'
        "</script></html>"
    )

    def fake_fetch(url, **kwargs):
        return PostingFetchResult(url=url, status_code=200, html=html)

    monkeypatch.setattr("job_engine.posting_hydration.fetch_posting", fake_fetch)

    stats = hydrate_job_postings([job], max_fetches=5)
    assert stats.hydrated == 1
    assert "8+ years" in job.description

    ctx = ExperienceContext(max_preferred_years=4, strict=True, hydration_attempted=True)
    result = evaluate_job_experience(job, ctx)
    assert result.passed is False
    assert result.required_years == 8


def test_eight_plus_years_rejected_when_max_four():
    job = _job(
        "Software Engineer",
        "Requirements:\n8+ years of full time software development experience\n",
    )
    ctx = ExperienceContext(max_preferred_years=4, strict=True, hydration_attempted=True)
    result = evaluate_job_experience(job, ctx)
    assert result.passed is False
    assert extract_required_years_for_job(job) == 8


def test_four_plus_engineering_management_rejected():
    text = "4+ years of engineering management experience required."
    assert find_management_requirement(text) is not None
    job = _job("Software Engineer", text)
    mgmt = evaluate_management_requirements(job)
    assert mgmt.passed is False


def test_work_with_engineering_managers_not_rejected():
    text = "You will work with product managers and report to the engineering manager."
    assert find_management_requirement(text) is None
    job = _job("Software Engineer", text)
    assert evaluate_management_requirements(job).passed is True


def test_strict_unknown_experience_kept_after_hydration():
    job = _job("Software Engineer", "We build great products.")
    ctx = ExperienceContext(max_preferred_years=4, strict=True, hydration_attempted=True)
    result = evaluate_job_experience(job, ctx)
    assert result.passed is True
    assert result.status == "unknown"


def test_junior_title_unknown_experience():
    job = _job("Associate Software Engineer", "Help us ship features.")
    ctx = ExperienceContext(max_preferred_years=4, strict=True, hydration_attempted=True)
    result = evaluate_job_experience(job, ctx)
    assert result.passed is True
    assert "junior-compatible" in result.reason


def test_non_strict_unknown_experience_passes():
    job = _job("Software Engineer", "We build great products.")
    ctx = ExperienceContext(max_preferred_years=4, strict=False, hydration_attempted=True)
    result = evaluate_job_experience(job, ctx)
    assert result.passed is True
    assert result.status == "unknown"


@pytest.mark.parametrize(
    "title",
    [
        "Senior Software Engineer",
        "Staff Engineer",
        "Principal Engineer",
        "Engineering Manager",
    ],
)
def test_strict_seniority_titles_rejected(title: str):
    job = _job(title, "")
    assert evaluate_strict_seniority_title(job).passed is False


def test_listing_http_404_closed():
    result = evaluate_availability_from_fetch(
        PostingFetchResult(url="https://x.com/j/1", status_code=404, html="<html>not found</html>"),
    )
    assert result.status == "closed"


def test_listing_no_longer_accepting_closed():
    result = evaluate_availability_from_fetch(
        PostingFetchResult(
            url="https://x.com/j/2",
            status_code=200,
            html="<html><body>This job is no longer accepting applications</body></html>",
        ),
    )
    assert result.status == "closed"


def test_listing_403_unknown_not_closed():
    result = evaluate_availability_from_fetch(
        PostingFetchResult(url="https://x.com/j/3", status_code=403, html=None, error="blocked"),
    )
    assert result.status == "unknown"
    assert result.status != "closed"


def test_posting_fetch_cache_reuse():
    clear_posting_cache()
    from job_engine.posting_fetch import cache_posting_result

    cache_posting_result(
        "https://example.com/job/1",
        PostingFetchResult("https://example.com/job/1", 200, "<html>cached</html>"),
    )
    cached = get_cached_posting("https://example.com/job/1")
    assert cached is not None
    assert cached.html == "<html>cached</html>"


def test_bad_posting_both_management_and_eight_years():
    description = (
        "4+ years of engineering management experience\n"
        "8+ years of full time software development experience\n"
    )
    job = _job("Software Engineer", description)
    assert evaluate_management_requirements(job).passed is False
    ctx = ExperienceContext(max_preferred_years=4, strict=True, hydration_attempted=True)
    assert evaluate_job_experience(job, ctx).passed is False


def test_education_or_related_field_not_hard_reject():
    text = "Bachelor's degree in Computer Science or related field preferred."
    assert requires_cs_degree(text) is False
    job = _job("Engineer", text)
    assert evaluate_job_education(job).passed is True


def test_keyword_grad_title_only_not_description():
    prefs = ["grad", "graduate", "Graduation", "Undergrad", "II", "III"]

    assert evaluate_job_keywords(_job("Software Engineer II", ""), prefs).passed is False
    assert evaluate_job_keywords(_job("Software Engineer III", ""), prefs).passed is False

    assert (
        evaluate_job_keywords(
            _job("Software Engineer I", "Our team includes graduate degree holders."),
            prefs,
        ).passed
        is True
    )
    assert (
        evaluate_job_keywords(
            _job("Software Engineer", "graduate degree preferred but not required."),
            prefs,
        ).passed
        is True
    )
    assert (
        evaluate_job_keywords(
            _job("Application Developer", "undergraduate degree required."),
            prefs,
        ).passed
        is True
    )
    assert (
        evaluate_job_keywords(
            _job("Software Engineer", "recent graduates are welcome"),
            prefs,
        ).passed
        is True
    )

    assert evaluate_job_keywords(_job("Software Engineer, New Grad", ""), prefs).passed is False
    assert evaluate_job_keywords(_job("New Graduate Software Engineer", ""), prefs).passed is False
    assert evaluate_job_keywords(_job("Graduate Software Developer", ""), prefs).passed is False
    assert (
        evaluate_job_keywords(_job("Software Engineer - University Graduate 2027", ""), prefs).passed
        is False
    )


def test_years_boundary_max_four():
    job_pass = _job("Engineer", "2+ years of software development experience")
    job_edge = _job("Engineer", "4+ years of software development experience")
    job_fail = _job("Engineer", "5+ years of software development experience")
    ctx = ExperienceContext(max_preferred_years=4, strict=True, hydration_attempted=True)
    assert evaluate_job_experience(job_pass, ctx).passed is True
    assert evaluate_job_experience(job_edge, ctx).passed is True
    assert evaluate_job_experience(job_fail, ctx).passed is False

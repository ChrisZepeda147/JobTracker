"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/sidebar";
import { JobCard } from "@/components/jobs/job-card";
import { JobSearchHistory } from "@/components/jobs/job-search-history";
import { JobPreferencesSummary } from "@/components/jobs/job-preferences-summary";
import { JobSearchPanel } from "@/components/jobs/job-search-panel";
import { SkipReasonDialog } from "@/components/jobs/skip-reason-dialog";
import { DEFAULT_POSTED_WITHIN_DAYS, JOB_TABS, type JobTabId, type SkipReasonId } from "@/lib/jobs/constants";
import { isListingTooOld } from "@/lib/jobs/listing-age";
import { fetchUserJobRecords } from "@/lib/jobs/fetch-user-jobs";
import {
  countForTab,
  defaultsFromPreferences,
  jobMatchesTab,
  locationPrefsFromPreferences,
  sortJobsByMatchScore,
  sortJobsForTab,
  type SearchFormDefaults,
  type SearchScope,
} from "@/lib/jobs/logic";
import { reevaluateStoredJobs } from "@/lib/jobs/run-reevaluate";
import { salaryPrefsFromPreferences } from "@/lib/jobs/salary-filter";
import type { JobRecord, JobSearchRequest } from "@/lib/types/jobs";
import type { JobPreferences } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";

type JobsBoardProps = {
  userId: string;
  preferences: JobPreferences | null;
  focusJobId?: string | null;
};

export function JobsBoard({ userId, preferences, focusJobId = null }: JobsBoardProps) {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [activeTab, setActiveTab] = useState<JobTabId>("new");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [searchRequests, setSearchRequests] = useState<JobSearchRequest[]>([]);
  const [searchesLoading, setSearchesLoading] = useState(true);
  const [skipTarget, setSkipTarget] = useState<JobRecord | null>(null);
  const [highlightedJobId, setHighlightedJobId] = useState<string | null>(null);
  const [includeOlderListings, setIncludeOlderListings] = useState(false);
  const [reevaluateRunning, setReevaluateRunning] = useState(false);

  const searchDefaults = useMemo(() => defaultsFromPreferences(preferences), [preferences]);
  const excludedKeywords = useMemo(
    () => (preferences?.excluded_keywords ?? []).map((k) => k.trim()).filter(Boolean),
    [preferences],
  );
  const salaryPrefs = useMemo(() => salaryPrefsFromPreferences(preferences), [preferences]);
  const locationPrefs = useMemo(() => locationPrefsFromPreferences(preferences), [preferences]);
  const maxPreferredExperienceYears = preferences?.max_preferred_experience_years ?? null;
  const listingAgePrefs = useMemo(
    () => ({
      maxAgeDays: preferences?.posted_within_days ?? DEFAULT_POSTED_WITHIN_DAYS,
      includeOlder: includeOlderListings,
    }),
    [preferences?.posted_within_days, includeOlderListings],
  );

  const hiddenOlderCount = useMemo(
    () =>
      jobs.filter((job) =>
        isListingTooOld(job, {
          maxAgeDays: listingAgePrefs.maxAgeDays,
          includeOlder: false,
        }),
      ).length,
    [jobs, listingAgePrefs.maxAgeDays],
  );

  const maintenancePending = useMemo(
    () =>
      searchRequests.some(
        (request) =>
          (request.rescore_only || request.refilter_only) &&
          (request.status === "pending" || request.status === "running"),
      ),
    [searchRequests],
  );

  const loadSearchRequests = useCallback(async () => {
    setSearchesLoading(true);
    const supabase = createClient();
    const { data, error: searchError } = await supabase
      .from("job_search_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!searchError) {
      setSearchRequests((data ?? []) as JobSearchRequest[]);
    }
    setSearchesLoading(false);
  }, [userId]);

  const loadJobs = useCallback(async () => {
    setError(null);
    const supabase = createClient();
    const { jobs, error: loadError } = await fetchUserJobRecords(supabase, userId);
    if (loadError) {
      setError(loadError);
    } else {
      setJobs(jobs);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadJobs();
    loadSearchRequests();
  }, [loadJobs, loadSearchRequests]);

  useEffect(() => {
    if (!maintenancePending) {
      return;
    }
    const timer = window.setInterval(() => {
      void loadSearchRequests();
      void loadJobs();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [maintenancePending, loadJobs, loadSearchRequests]);

  useEffect(() => {
    if (!focusJobId || loading || jobs.length === 0) {
      return;
    }
    const job = jobs.find((entry) => entry.id === focusJobId);
    if (!job) {
      return;
    }
    for (const tab of JOB_TABS) {
      if (
        jobMatchesTab(
          job,
          tab.id,
          excludedKeywords,
          salaryPrefs,
          maxPreferredExperienceYears,
          locationPrefs,
          listingAgePrefs,
          preferences,
        )
      ) {
        setActiveTab(tab.id);
        break;
      }
    }
    requestAnimationFrame(() => {
      document.getElementById(`job-${focusJobId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, [
    focusJobId,
    loading,
    jobs,
    excludedKeywords,
    salaryPrefs,
    maxPreferredExperienceYears,
    locationPrefs,
    listingAgePrefs,
  ]);

  useEffect(() => {
    if (!highlightedJobId || activeTab !== "needs_decision") {
      return;
    }
    requestAnimationFrame(() => {
      document.getElementById(`job-${highlightedJobId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, [highlightedJobId, activeTab]);

  function clearHighlightIfResolved(jobId: string) {
    setHighlightedJobId((current) => (current === jobId ? null : current));
  }

  const pinJobId = activeTab === "needs_decision" ? highlightedJobId : null;

  const visibleJobs = useMemo(
    () =>
      sortJobsForTab(
        jobs.filter((job) =>
          jobMatchesTab(
            job,
            activeTab,
            excludedKeywords,
            salaryPrefs,
            maxPreferredExperienceYears,
            locationPrefs,
            listingAgePrefs,
            preferences,
          ),
        ),
        activeTab,
        pinJobId,
      ),
    [
      jobs,
      activeTab,
      excludedKeywords,
      salaryPrefs,
      maxPreferredExperienceYears,
      locationPrefs,
      listingAgePrefs,
      pinJobId,
      preferences,
    ],
  );

  const tabCounts = useMemo(
    () =>
      Object.fromEntries(
        JOB_TABS.map((t) => [
          t.id,
          countForTab(
            jobs,
            t.id,
            excludedKeywords,
            salaryPrefs,
            maxPreferredExperienceYears,
            locationPrefs,
            listingAgePrefs,
            preferences,
          ),
        ]),
      ) as Record<JobTabId, number>,
    [jobs, excludedKeywords, salaryPrefs, maxPreferredExperienceYears, locationPrefs, listingAgePrefs, preferences],
  );

  async function upsertState(jobId: string, patch: Record<string, unknown>) {
    const supabase = createClient();
    const existing = jobs.find((j) => j.id === jobId)?.user_state;

    if (existing) {
      const { error: saveError } = await supabase
        .from("user_job_states")
        .update(patch)
        .eq("user_id", userId)
        .eq("job_id", jobId);
      if (saveError) throw new Error(saveError.message);
    } else {
      const { error: saveError } = await supabase.from("user_job_states").insert({
        user_id: userId,
        job_id: jobId,
        status: "new",
        ...patch,
      });
      if (saveError) throw new Error(saveError.message);
    }
    await loadJobs();
  }

  async function handleSourcesChange(sources: string[]) {
    const supabase = createClient();
    if (preferences) {
      const { error } = await supabase
        .from("job_preferences")
        .update({ search_sources: sources })
        .eq("user_id", userId);
      if (error) throw new Error(error.message);
      return;
    }
    const { error } = await supabase.from("job_preferences").insert({
      user_id: userId,
      target_roles: [],
      preferred_locations: [],
      remote_allowed: true,
      hybrid_allowed: true,
      onsite_allowed: false,
      excluded_seniority: [],
      excluded_keywords: [],
      additional_instructions: "",
      search_sources: sources,
    });
    if (error) throw new Error(error.message);
  }

  async function handleSearch(form: SearchFormDefaults, scope: SearchScope) {
    const supabase = createClient();
    const titles = form.titles.map((t) => t.trim()).filter(Boolean);
    const isRemoteUs = scope === "remote_us";
    const { error: insertError } = await supabase.from("job_search_requests").insert({
      user_id: userId,
      query: titles[0] ?? "",
      titles,
      location: isRemoteUs ? "United States" : form.location.trim(),
      location_zip: isRemoteUs ? null : form.locationZip.trim() || null,
      salary_min: form.salaryMin ? Number(form.salaryMin) : null,
      salary_max: form.salaryMax ? Number(form.salaryMax) : null,
      posted_within_days: form.postedWithinDays,
      remote_allowed: true,
      hybrid_allowed: isRemoteUs ? false : form.hybridAllowed,
      onsite_allowed: isRemoteUs ? false : form.onsiteAllowed,
      max_onsite_miles:
        !isRemoteUs && (form.hybridAllowed || form.onsiteAllowed) ? form.maxOnsiteMiles : null,
      sources: form.sources,
      nationwide_remote: isRemoteUs,
      status: "pending",
    });
    if (insertError) throw new Error(insertError.message);
    setSearchMessage(
      isRemoteUs
        ? "US remote search queued. Results will appear shortly."
        : "Local / commute search queued. Results will appear shortly.",
    );
    await loadSearchRequests();
  }

  async function handleReevaluate() {
    if (maintenancePending || reevaluateRunning) {
      setSearchMessage("A re-evaluation is already in progress.");
      return;
    }
    setReevaluateRunning(true);
    setSearchMessage("Starting re-evaluation…");
    try {
      const result = await reevaluateStoredJobs(userId, { wait: false });
      setSearchMessage(result.message);
      if (result.mode === "queued") {
        await loadSearchRequests();
      }
      if (result.mode === "background") {
        window.setTimeout(() => void loadJobs(), 90_000);
        window.setTimeout(() => void loadJobs(), 180_000);
      } else {
        await loadJobs();
      }
    } catch (err) {
      setSearchMessage(err instanceof Error ? err.message : "Re-evaluation failed.");
    } finally {
      setReevaluateRunning(false);
    }
  }

  async function handleApply(job: JobRecord) {
    window.open(job.job_url, "_blank", "noopener,noreferrer");
    const clickedAt = new Date().toISOString();
    setHighlightedJobId(job.id);
    setActiveTab("needs_decision");
    setJobs((prev) =>
      prev.map((entry) =>
        entry.id === job.id
          ? {
              ...entry,
              user_state: {
                ...(entry.user_state ?? {
                  user_id: userId,
                  job_id: job.id,
                  skip_reason: null,
                  user_notes: "",
                  commute_miles: null,
                  work_arrangement: null,
                  location_status: null,
                  salary_status: null,
                  keyword_status: null,
                  experience_status: null,
                  education_status: null,
                  created_at: clickedAt,
                  updated_at: clickedAt,
                }),
                status: "opened",
                apply_clicked_at: clickedAt,
              },
            }
          : entry,
      ),
    );
    await upsertState(job.id, {
      status: "opened",
      apply_clicked_at: clickedAt,
    });
  }

  async function handleMarkApplied(job: JobRecord) {
    await upsertState(job.id, {
      status: "applied",
      applied_at: new Date().toISOString(),
    });
    clearHighlightIfResolved(job.id);
    setActiveTab("applied");
  }

  async function handleApplyLater(job: JobRecord) {
    await upsertState(job.id, { status: "apply_later" });
    clearHighlightIfResolved(job.id);
    if (activeTab !== "needs_decision") {
      setActiveTab("apply_later");
    }
  }

  async function handleSkipConfirm(reason: SkipReasonId, notes: string) {
    if (!skipTarget) return;
    const patch: Record<string, unknown> = {
      status: "skipped",
      skip_reason: reason,
      user_notes: notes,
    };
    if (reason === "salary_too_low" || reason === "salary_too_high") {
      patch.salary_status = "rejected";
    }
    await upsertState(skipTarget.id, patch);
    clearHighlightIfResolved(skipTarget.id);
    setSkipTarget(null);
    setActiveTab("skipped");
  }

  return (
    <div>
      <PageHeader
        title="Jobs"
        description="Browse matches, track applications, and queue new searches."
      />

      <JobPreferencesSummary preferences={preferences} />

      <div id="find-jobs">
        <JobSearchPanel
          searchParams={searchDefaults}
          onSubmit={handleSearch}
          onSourcesChange={handleSourcesChange}
          onReevaluate={handleReevaluate}
          reevaluatePending={maintenancePending || reevaluateRunning}
          lastRequestMessage={searchMessage}
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 py-2">
        <p className="text-xs text-muted">
          Hiding listings older than {listingAgePrefs.maxAgeDays} days
          {hiddenOlderCount > 0 ? ` (${hiddenOlderCount} hidden)` : ""}.
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
          <input
            type="checkbox"
            className="rounded border-border"
            checked={includeOlderListings}
            onChange={(e) => setIncludeOlderListings(e.target.checked)}
          />
          Show older listings
        </label>
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-border pb-px">
        {JOB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id !== "needs_decision") {
                setHighlightedJobId(null);
              }
            }}
            className={cn(
              "whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-accent bg-white text-accent"
                : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-muted">({tabCounts[tab.id]})</span>
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-muted">Loading jobs...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !error && visibleJobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-zinc-50 px-6 py-12 text-center">
          <p className="text-sm font-medium">No jobs in this category</p>
          <p className="mt-1 text-sm text-muted">
            {activeTab === "new"
              ? "Run npm run search to start the app and worker, then queue a search above."
              : activeTab === "new_remote"
                ? "Remote US jobs from your searches will appear here after the worker runs."
                : "Jobs will appear here as you interact with listings."}
          </p>
        </div>
      ) : null}

      <div className="space-y-4">
        {visibleJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            highlighted={focusJobId === job.id || highlightedJobId === job.id}
            justApplied={highlightedJobId === job.id}
            onApply={handleApply}
            onMarkApplied={handleMarkApplied}
            onApplyLater={handleApplyLater}
            onSkip={setSkipTarget}
          />
        ))}
      </div>

      {skipTarget ? (
        <SkipReasonDialog
          jobTitle={skipTarget.title}
          onConfirm={handleSkipConfirm}
          onCancel={() => setSkipTarget(null)}
        />
      ) : null}

      <JobSearchHistory requests={searchRequests} loading={searchesLoading} />
    </div>
  );
}

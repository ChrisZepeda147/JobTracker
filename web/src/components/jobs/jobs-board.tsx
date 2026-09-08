"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/sidebar";
import { JobCard } from "@/components/jobs/job-card";
import { JobSearchHistory } from "@/components/jobs/job-search-history";
import { JobSearchPanel } from "@/components/jobs/job-search-panel";
import { SkipReasonDialog } from "@/components/jobs/skip-reason-dialog";
import { JOB_TABS, type JobTabId, type SkipReasonId } from "@/lib/jobs/constants";
import {
  countForTab,
  defaultsFromPreferences,
  jobMatchesTab,
  mergeJobsWithStates,
  type SearchFormDefaults,
} from "@/lib/jobs/logic";
import type { JobRecord, JobSearchRequest, UserJobState } from "@/lib/types/jobs";
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

  const searchDefaults = useMemo(() => defaultsFromPreferences(preferences), [preferences]);

  const rescorePending = useMemo(
    () =>
      searchRequests.some(
        (request) =>
          request.rescore_only &&
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

    const [jobsRes, statesRes] = await Promise.all([
      supabase
        .from("jobs")
        .select(
          "id, job_hash, title, company, location, job_url, description, site, salary_min, salary_max, posted_date, match_score, fit_reason, missing_skills, experience_requirement, scored_by, last_seen_at",
        )
        .order("last_seen_at", { ascending: false })
        .limit(200),
      supabase.from("user_job_states").select("*").eq("user_id", userId),
    ]);

    if (jobsRes.error) {
      setError(jobsRes.error.message);
      setLoading(false);
      return;
    }
    if (statesRes.error) {
      setError(statesRes.error.message);
      setLoading(false);
      return;
    }

    setJobs(
      mergeJobsWithStates(
        (jobsRes.data ?? []) as Omit<JobRecord, "user_state">[],
        (statesRes.data ?? []) as UserJobState[],
      ),
    );
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadJobs();
    loadSearchRequests();
  }, [loadJobs, loadSearchRequests]);

  useEffect(() => {
    if (!rescorePending) {
      return;
    }
    const timer = window.setInterval(() => {
      void loadSearchRequests();
      void loadJobs();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [rescorePending, loadJobs, loadSearchRequests]);

  useEffect(() => {
    if (!focusJobId || loading || jobs.length === 0) {
      return;
    }
    const job = jobs.find((entry) => entry.id === focusJobId);
    if (!job) {
      return;
    }
    for (const tab of JOB_TABS) {
      if (jobMatchesTab(job, tab.id)) {
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
  }, [focusJobId, loading, jobs]);

  const visibleJobs = useMemo(
    () => jobs.filter((job) => jobMatchesTab(job, activeTab)),
    [jobs, activeTab],
  );

  const tabCounts = useMemo(
    () => Object.fromEntries(JOB_TABS.map((t) => [t.id, countForTab(jobs, t.id)])) as Record<
      JobTabId,
      number
    >,
    [jobs],
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

  async function handleSearch(form: SearchFormDefaults) {
    const supabase = createClient();
    const titles = form.titles.map((t) => t.trim()).filter(Boolean);
    const { error: insertError } = await supabase.from("job_search_requests").insert({
      user_id: userId,
      query: titles[0] ?? "",
      titles,
      location: form.location.trim(),
      location_zip: form.locationZip.trim() || null,
      salary_min: form.salaryMin ? Number(form.salaryMin) : null,
      salary_max: form.salaryMax ? Number(form.salaryMax) : null,
      posted_within_days: form.postedWithinDays,
      remote_allowed: form.remoteAllowed,
      hybrid_allowed: form.hybridAllowed,
      onsite_allowed: form.onsiteAllowed,
      max_onsite_miles:
        form.hybridAllowed || form.onsiteAllowed ? form.maxOnsiteMiles : null,
      sources: form.sources,
      status: "pending",
    });
    if (insertError) throw new Error(insertError.message);
    setSearchMessage("Search queued. Results will appear shortly.");
    await loadSearchRequests();
  }

  async function handleRescore() {
    if (rescorePending) {
      setSearchMessage("A rescore is already queued or running.");
      return;
    }
    const supabase = createClient();
    const { error: insertError } = await supabase.from("job_search_requests").insert({
      user_id: userId,
      query: "",
      titles: [],
      location: "",
      sources: [],
      rescore_only: true,
      status: "pending",
    });
    if (insertError) throw new Error(insertError.message);
    setSearchMessage("Rescore queued. Existing jobs will be re-ranked shortly.");
    await loadSearchRequests();
  }

  async function handleApply(job: JobRecord) {
    window.open(job.job_url, "_blank", "noopener,noreferrer");
    await upsertState(job.id, {
      status: "opened",
      apply_clicked_at: new Date().toISOString(),
    });
    setActiveTab("needs_decision");
  }

  async function handleMarkApplied(job: JobRecord) {
    await upsertState(job.id, {
      status: "applied",
      applied_at: new Date().toISOString(),
    });
    setActiveTab("applied");
  }

  async function handleApplyLater(job: JobRecord) {
    await upsertState(job.id, { status: "apply_later" });
    setActiveTab("apply_later");
  }

  async function handleSkipConfirm(reason: SkipReasonId, notes: string) {
    if (!skipTarget) return;
    await upsertState(skipTarget.id, {
      status: "skipped",
      skip_reason: reason,
      user_notes: notes,
    });
    setSkipTarget(null);
    setActiveTab("skipped");
  }

  return (
    <div>
      <PageHeader
        title="Jobs"
        description="Browse matches, track applications, and queue new searches."
      />

      <div className="mb-6" id="find-jobs">
        <JobSearchPanel
          defaults={searchDefaults}
          onSubmit={handleSearch}
          onRescore={handleRescore}
          rescorePending={rescorePending}
          lastRequestMessage={searchMessage}
        />
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-border pb-px">
        {JOB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
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
              : "Jobs will appear here as you interact with listings."}
          </p>
        </div>
      ) : null}

      <div className="space-y-4">
        {visibleJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            highlighted={focusJobId === job.id}
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

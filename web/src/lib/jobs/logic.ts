import type { JobTabId, SkipReasonId, UserJobStatus } from "@/lib/jobs/constants";
import { MAX_SEARCH_TITLES, ONSITE_MILES_OPTIONS, RECOMMENDED_MIN_SCORE } from "@/lib/jobs/constants";
import type { JobRecord, UserJobState } from "@/lib/types/jobs";

export function effectiveStatus(state: UserJobState | undefined): UserJobStatus {
  return state?.status ?? "new";
}

export function jobMatchesTab(job: JobRecord, tab: JobTabId): boolean {
  const status = effectiveStatus(job.user_state);

  switch (tab) {
    case "new":
      return status === "new";
    case "recommended":
      return (
        (job.match_score ?? 0) >= RECOMMENDED_MIN_SCORE &&
        status !== "applied" &&
        status !== "skipped"
      );
    case "apply_later":
      return status === "apply_later";
    case "needs_decision":
      return status === "opened";
    case "applied":
      return status === "applied";
    case "skipped":
      return status === "skipped";
    default:
      return false;
  }
}

export function countForTab(jobs: JobRecord[], tab: JobTabId): number {
  return jobs.filter((job) => jobMatchesTab(job, tab)).length;
}

export function mergeJobsWithStates(
  jobs: Omit<JobRecord, "user_state">[],
  states: UserJobState[],
): JobRecord[] {
  const stateMap = new Map(states.map((s) => [s.job_id, s]));
  return jobs.map((job) => ({
    ...job,
    user_state: stateMap.get(job.id),
  }));
}

export type SearchFormDefaults = {
  titles: string[];
  location: string;
  locationZip: string;
  salaryMin: string;
  salaryMax: string;
  postedWithinDays: number;
  remoteAllowed: boolean;
  hybridAllowed: boolean;
  onsiteAllowed: boolean;
  maxOnsiteMiles: number;
  sources: string[];
};

export function defaultsFromPreferences(
  prefs: {
    target_roles?: string[];
    preferred_locations?: string[];
    salary_min?: number | null;
    salary_max?: number | null;
    remote_allowed?: boolean;
    hybrid_allowed?: boolean;
    onsite_allowed?: boolean;
  } | null,
): SearchFormDefaults {
  const roles = (prefs?.target_roles ?? []).slice(0, MAX_SEARCH_TITLES);
  return {
    titles: roles,
    location: prefs?.preferred_locations?.[0] ?? "",
    locationZip: "",
    salaryMin: prefs?.salary_min != null ? String(prefs.salary_min) : "",
    salaryMax: prefs?.salary_max != null ? String(prefs.salary_max) : "",
    postedWithinDays: 7,
    remoteAllowed: prefs?.remote_allowed ?? true,
    hybridAllowed: prefs?.hybrid_allowed ?? true,
    onsiteAllowed: prefs?.onsite_allowed ?? false,
    maxOnsiteMiles: ONSITE_MILES_OPTIONS[2].value,
    sources: ["linkedin", "indeed", "builtin"],
  };
}

export type SkipPayload = {
  jobId: string;
  reason: SkipReasonId;
  notes?: string;
};

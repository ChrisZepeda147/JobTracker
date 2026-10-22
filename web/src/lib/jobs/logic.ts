import type { JobTabId, SkipReasonId, UserJobStatus } from "@/lib/jobs/constants";
import {
  DEFAULT_POSTED_WITHIN_DAYS,
  DEFAULT_SEARCH_SOURCES,
  MAX_SEARCH_TITLES,
  ONSITE_MILES_OPTIONS,
  RECOMMENDED_MIN_SCORE,
  TOP_MATCHES_LIMIT,
} from "@/lib/jobs/constants";
import { matchesExcludedKeywords } from "@/lib/jobs/keyword-filter";
import { isEducationBlocked } from "@/lib/jobs/education-filter";
import { isExperienceOverPreference } from "@/lib/jobs/experience-filter";
import { isStrictSeniorityTitleBlocked } from "@/lib/jobs/management-filter";
import { isStrictFiltering } from "@/lib/jobs/strict-mode";
import type { JobPreferences } from "@/lib/types/database";
import {
  isLocationPolicyBlocked,
  locationPrefsFromPreferences,
  type LocationPrefs,
} from "@/lib/jobs/location-filter";
import { isSalaryOutOfRange, type SalaryPrefs } from "@/lib/jobs/salary-filter";
import { effectiveWorkArrangement } from "@/lib/jobs/format";
import { isListingTooOld, type ListingAgePrefs } from "@/lib/jobs/listing-age";
import type { JobRecord, UserJobState } from "@/lib/types/jobs";

export { RECOMMENDED_MIN_SCORE, TOP_MATCHES_LIMIT };

const HISTORY_TAB_STATUSES = new Set<UserJobStatus>(["applied", "skipped"]);

/** Active pipeline tabs require a confirmed location pass (Remote US or within commute). */
export function isLocationEligibleForActiveTabs(job: JobRecord): boolean {
  return job.user_state?.location_status === "pass";
}

/** Hide from New, Recommended, Apply Later, and Needs Decision. Applied/Skipped history stays visible. */
export function isLocationBlocked(
  job: JobRecord,
  _forRecommended = false,
  locationPrefs?: LocationPrefs,
): boolean {
  const status = effectiveStatus(job.user_state);
  if (HISTORY_TAB_STATUSES.has(status)) {
    return false;
  }
  if (locationPrefs && isLocationPolicyBlocked(job, locationPrefs)) {
    return true;
  }
  return !isLocationEligibleForActiveTabs(job);
}

export function isSalaryBlocked(job: JobRecord, salaryPrefs?: SalaryPrefs): boolean {
  const status = effectiveStatus(job.user_state);
  if (HISTORY_TAB_STATUSES.has(status)) {
    return false;
  }
  if (job.user_state?.salary_status === "rejected") {
    return true;
  }
  if (salaryPrefs && isSalaryOutOfRange(job, salaryPrefs)) {
    return true;
  }
  return false;
}

/** Backend wrote experience_status=unknown — review YoE before applying (not a hard reject). */
export function isExperienceNeedsReview(job: JobRecord): boolean {
  const status = effectiveStatus(job.user_state);
  if (HISTORY_TAB_STATUSES.has(status)) {
    return false;
  }
  return job.user_state?.experience_status === "unknown";
}

export function isExperienceBlocked(
  job: JobRecord,
  maxPreferredYears?: number | null,
): boolean {
  const status = effectiveStatus(job.user_state);
  if (HISTORY_TAB_STATUSES.has(status)) {
    return false;
  }
  if (job.user_state?.experience_status === "rejected") {
    return true;
  }
  if (maxPreferredYears != null && isExperienceOverPreference(job, maxPreferredYears)) {
    return true;
  }
  return false;
}

export function isManagementBlockedForJob(job: JobRecord): boolean {
  const status = effectiveStatus(job.user_state);
  if (HISTORY_TAB_STATUSES.has(status)) return false;
  return job.user_state?.management_status === "rejected";
}

export function isSeniorityTitleBlockedForJob(job: JobRecord): boolean {
  const status = effectiveStatus(job.user_state);
  if (HISTORY_TAB_STATUSES.has(status)) return false;
  if (job.user_state?.seniority_status === "rejected") return true;
  return false;
}

export function isListingClosedBlocked(job: JobRecord, strict = true): boolean {
  const status = effectiveStatus(job.user_state);
  if (HISTORY_TAB_STATUSES.has(status)) return false;
  if (job.user_state?.listing_status === "closed") return strict;
  return false;
}

export function isEducationBlockedForJob(job: JobRecord): boolean {
  const status = effectiveStatus(job.user_state);
  if (HISTORY_TAB_STATUSES.has(status)) {
    return false;
  }
  return isEducationBlocked(job);
}

export function isKeywordBlocked(job: JobRecord, excludedKeywords: string[] = []): boolean {
  const status = effectiveStatus(job.user_state);
  if (HISTORY_TAB_STATUSES.has(status)) {
    return false;
  }
  if (job.user_state?.keyword_status === "rejected") {
    return true;
  }
  if (excludedKeywords.length > 0 && matchesExcludedKeywords(job, excludedKeywords)) {
    return true;
  }
  return false;
}

export function isPipelineBlocked(
  job: JobRecord,
  forRecommended = false,
  excludedKeywords: string[] = [],
  salaryPrefs?: SalaryPrefs,
  maxPreferredExperienceYears?: number | null,
  locationPrefs?: LocationPrefs,
  listingAgePrefs?: ListingAgePrefs,
  preferences?: JobPreferences | null,
): boolean {
  const strict = isStrictFiltering(preferences);
  return (
    isLocationBlocked(job, forRecommended, locationPrefs) ||
    isSalaryBlocked(job, salaryPrefs) ||
    isExperienceBlocked(job, maxPreferredExperienceYears) ||
    isManagementBlockedForJob(job) ||
    isSeniorityTitleBlockedForJob(job) ||
    isListingClosedBlocked(job, strict) ||
    isEducationBlockedForJob(job) ||
    isKeywordBlocked(job, excludedKeywords) ||
    isListingAgeBlocked(job, listingAgePrefs)
  );
}

/** Hard blocks only — unknown YoE is handled via tab routing, not hidden. */
export function isCorePipelineBlocked(
  job: JobRecord,
  forRecommended = false,
  excludedKeywords: string[] = [],
  salaryPrefs?: SalaryPrefs,
  maxPreferredExperienceYears?: number | null,
  locationPrefs?: LocationPrefs,
  listingAgePrefs?: ListingAgePrefs,
  preferences?: JobPreferences | null,
): boolean {
  return isPipelineBlocked(
    job,
    forRecommended,
    excludedKeywords,
    salaryPrefs,
    maxPreferredExperienceYears,
    locationPrefs,
    listingAgePrefs,
    preferences,
  );
}

export { locationPrefsFromPreferences };

/** Dashboard top matches: active opportunities only — not skipped or applied history. */
export function isDashboardTopMatch(
  job: JobRecord,
  excludedKeywords: string[] = [],
  salaryPrefs?: SalaryPrefs,
  maxPreferredExperienceYears?: number | null,
  locationPrefs?: LocationPrefs,
  listingAgePrefs?: ListingAgePrefs,
  preferences?: JobPreferences | null,
): boolean {
  const status = effectiveStatus(job.user_state);
  if (status === "applied" || status === "skipped") {
    return false;
  }
  const strict = isStrictFiltering(preferences);
  return (
    !isLocationBlocked(job, false, locationPrefs) &&
    !isSalaryBlocked(job, salaryPrefs) &&
    !isExperienceBlocked(job, maxPreferredExperienceYears) &&
    !isManagementBlockedForJob(job) &&
    !isSeniorityTitleBlockedForJob(job) &&
    !isListingClosedBlocked(job, strict) &&
    !isEducationBlockedForJob(job) &&
    !isKeywordBlocked(job, excludedKeywords) &&
    !isListingAgeBlocked(job, listingAgePrefs)
  );
}

export function effectiveStatus(state: UserJobState | undefined): UserJobStatus {
  return state?.status ?? "new";
}

/** True when the location filter confirmed a remote US-eligible job. */
export function isRemoteJob(job: JobRecord): boolean {
  return effectiveWorkArrangement(job, job.user_state?.work_arrangement) === "Remote";
}

export function isListingAgeBlocked(job: JobRecord, listingAgePrefs?: ListingAgePrefs): boolean {
  if (!listingAgePrefs) return false;
  return isListingTooOld(job, listingAgePrefs);
}

function matchesNewTab(
  job: JobRecord,
  remoteOnly: boolean,
  excludedKeywords: string[],
  salaryPrefs?: SalaryPrefs,
  maxPreferredExperienceYears?: number | null,
  locationPrefs?: LocationPrefs,
  listingAgePrefs?: ListingAgePrefs,
  preferences?: JobPreferences | null,
): boolean {
  if (effectiveStatus(job.user_state) !== "new") {
    return false;
  }
  if (isExperienceNeedsReview(job)) {
    return false;
  }
  if (
    isCorePipelineBlocked(
      job,
      false,
      excludedKeywords,
      salaryPrefs,
      maxPreferredExperienceYears,
      locationPrefs,
      listingAgePrefs,
      preferences,
    )
  ) {
    return false;
  }
  return remoteOnly ? isRemoteJob(job) : !isRemoteJob(job);
}

export function jobMatchesTab(
  job: JobRecord,
  tab: JobTabId,
  excludedKeywords: string[] = [],
  salaryPrefs?: SalaryPrefs,
  maxPreferredExperienceYears?: number | null,
  locationPrefs?: LocationPrefs,
  listingAgePrefs?: ListingAgePrefs,
  preferences?: JobPreferences | null,
): boolean {
  const status = effectiveStatus(job.user_state);

  switch (tab) {
    case "new":
      return matchesNewTab(
        job,
        false,
        excludedKeywords,
        salaryPrefs,
        maxPreferredExperienceYears,
        locationPrefs,
        listingAgePrefs,
        preferences,
      );
    case "new_remote":
      return matchesNewTab(
        job,
        true,
        excludedKeywords,
        salaryPrefs,
        maxPreferredExperienceYears,
        locationPrefs,
        listingAgePrefs,
        preferences,
      );
    case "recommended":
      return (
        (job.match_score ?? 0) >= RECOMMENDED_MIN_SCORE &&
        status !== "applied" &&
        status !== "skipped" &&
        !isExperienceNeedsReview(job) &&
        !isCorePipelineBlocked(
          job,
          true,
          excludedKeywords,
          salaryPrefs,
          maxPreferredExperienceYears,
          locationPrefs,
          listingAgePrefs,
          preferences,
        )
      );
    case "apply_later":
      return (
        status === "apply_later" &&
        !isPipelineBlocked(
          job,
          false,
          excludedKeywords,
          salaryPrefs,
          maxPreferredExperienceYears,
          locationPrefs,
          listingAgePrefs,
          preferences,
        )
      );
    case "needs_decision":
      return (
        (status === "opened" || (status === "new" && isExperienceNeedsReview(job))) &&
        !isCorePipelineBlocked(
          job,
          false,
          excludedKeywords,
          salaryPrefs,
          maxPreferredExperienceYears,
          locationPrefs,
          listingAgePrefs,
          preferences,
        )
      );
    case "applied":
      return status === "applied";
    case "skipped":
      return status === "skipped";
    default:
      return false;
  }
}

export function countForTab(
  jobs: JobRecord[],
  tab: JobTabId,
  excludedKeywords: string[] = [],
  salaryPrefs?: SalaryPrefs,
  maxPreferredExperienceYears?: number | null,
  locationPrefs?: LocationPrefs,
  listingAgePrefs?: ListingAgePrefs,
  preferences?: JobPreferences | null,
): number {
  return jobs.filter((job) =>
    jobMatchesTab(
      job,
      tab,
      excludedKeywords,
      salaryPrefs,
      maxPreferredExperienceYears,
      locationPrefs,
      listingAgePrefs,
      preferences,
    ),
  ).length;
}

/** Highest match_score first; unscored jobs last, then most recently seen. */
export function compareJobsByMatchScore(a: JobRecord, b: JobRecord): number {
  const stretchA = a.user_state?.is_stretch ? 1 : 0;
  const stretchB = b.user_state?.is_stretch ? 1 : 0;
  if (stretchA !== stretchB) return stretchA - stretchB;

  const scoreA = a.match_score ?? -1;
  const scoreB = b.match_score ?? -1;
  if (scoreB !== scoreA) return scoreB - scoreA;
  return (b.last_seen_at ?? "").localeCompare(a.last_seen_at ?? "");
}

export function sortJobsByMatchScore(jobs: JobRecord[]): JobRecord[] {
  return [...jobs].sort(compareJobsByMatchScore);
}

/** Needs Decision: most recently opened first; optionally pin one job to the top. */
export function sortJobsForTab(jobs: JobRecord[], tab: JobTabId, pinJobId: string | null = null): JobRecord[] {
  if (tab === "needs_decision") {
    const sorted = [...jobs].sort((a, b) => {
      const atA = a.user_state?.apply_clicked_at ?? "";
      const atB = b.user_state?.apply_clicked_at ?? "";
      if (atB !== atA) return atB.localeCompare(atA);
      return compareJobsByMatchScore(a, b);
    });
    if (!pinJobId) return sorted;
    const pinned = sorted.find((job) => job.id === pinJobId);
    if (!pinned) return sorted;
    return [pinned, ...sorted.filter((job) => job.id !== pinJobId)];
  }
  if (tab === "applied") {
    return [...jobs].sort((a, b) => {
      const atA = a.user_state?.applied_at ?? "";
      const atB = b.user_state?.applied_at ?? "";
      if (atA && atB && atB !== atA) return atB.localeCompare(atA);
      if (atA && !atB) return -1;
      if (!atA && atB) return 1;
      return compareJobsByMatchScore(a, b);
    });
  }
  return sortJobsByMatchScore(jobs);
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

export type SearchScope = "local" | "remote_us";

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
    home_zip?: string | null;
    max_commute_miles?: number | null;
    search_sources?: string[] | null;
    posted_within_days?: number | null;
  } | null,
): SearchFormDefaults {
  const savedSources = (prefs?.search_sources ?? [])
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const sources =
    savedSources.length > 0 ? savedSources : [...DEFAULT_SEARCH_SOURCES];
  const roles = (prefs?.target_roles ?? []).slice(0, MAX_SEARCH_TITLES);
  const homeZip = prefs?.home_zip?.trim() ?? "";
  const maxCommute =
    prefs?.max_commute_miles ??
    (prefs?.hybrid_allowed || prefs?.onsite_allowed ? ONSITE_MILES_OPTIONS[2].value : ONSITE_MILES_OPTIONS[2].value);
  return {
    titles: roles,
    location: prefs?.preferred_locations?.[0] ?? "",
    locationZip: homeZip,
    salaryMin: prefs?.salary_min != null ? String(prefs.salary_min) : "",
    salaryMax: prefs?.salary_max != null ? String(prefs.salary_max) : "",
    postedWithinDays: prefs?.posted_within_days ?? DEFAULT_POSTED_WITHIN_DAYS,
    remoteAllowed: prefs?.remote_allowed ?? true,
    hybridAllowed: prefs?.hybrid_allowed ?? true,
    onsiteAllowed: prefs?.onsite_allowed ?? Boolean(homeZip),
    maxOnsiteMiles: maxCommute,
    sources,
  };
}

export type SkipPayload = {
  jobId: string;
  reason: SkipReasonId;
  notes?: string;
};

import type { JobRecord } from "@/lib/types/jobs";

export const DEFAULT_MAX_LISTING_AGE_DAYS = 21;

const HISTORY_STATUSES = new Set(["applied", "skipped"]);

function parseDate(value: string): Date | null {
  const date = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Whole days since the listing was posted (or last seen if posted date missing). */
export function listingAgeDays(job: JobRecord): number | null {
  const posted = job.posted_date ? parseDate(job.posted_date) : null;
  const anchor = posted ?? (job.last_seen_at ? parseDate(job.last_seen_at) : null);
  if (!anchor) return null;
  const diffMs = Date.now() - anchor.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export type ListingAgePrefs = {
  maxAgeDays: number;
  includeOlder: boolean;
};

export function isListingTooOld(job: JobRecord, prefs: ListingAgePrefs): boolean {
  if (prefs.includeOlder) return false;
  const status = job.user_state?.status ?? "new";
  if (HISTORY_STATUSES.has(status)) return false;
  const age = listingAgeDays(job);
  if (age == null) return false;
  return age > prefs.maxAgeDays;
}

export function formatListingAge(job: JobRecord): string | null {
  const age = listingAgeDays(job);
  if (age == null) return null;
  if (age <= 0) return "Posted today";
  if (age === 1) return "Posted 1 day ago";
  if (age < 14) return `Posted ${age} days ago`;
  if (age < 45) return `Posted ${Math.floor(age / 7)} weeks ago`;
  return `Posted ${Math.floor(age / 30)}+ months ago`;
}

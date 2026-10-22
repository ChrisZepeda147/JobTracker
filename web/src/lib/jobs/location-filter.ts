import type { JobPreferences } from "@/lib/types/database";
import type { JobRecord } from "@/lib/types/jobs";
import {
  effectiveWorkArrangement,
  sanitizeJobLocation,
  type WorkArrangement,
} from "@/lib/jobs/format";
import { remotePostingContradicted } from "@/lib/jobs/remote-contradiction";

const STATE_ABBR_RE =
  /,\s*(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b/i;

export type LocationPrefs = {
  preferredState: string | null;
  maxCommuteMiles: number | null;
  remoteAllowed: boolean;
  hybridAllowed: boolean;
  onsiteAllowed: boolean;
};

export function parseStateAbbr(location: string): string | null {
  const match = STATE_ABBR_RE.exec(sanitizeJobLocation(location));
  return match ? match[1].toUpperCase() : null;
}

function inferStateFromHomeZip(zip: string | null | undefined): string | null {
  const digits = zip?.replace(/\D/g, "").slice(0, 5);
  if (!digits || digits.length < 3) return null;
  const prefix = Number(digits.slice(0, 3));
  if (prefix >= 900 && prefix <= 961) return "CA";
  return null;
}

function preferredStateFromPreferences(prefs: JobPreferences | null): string | null {
  for (const raw of prefs?.preferred_locations ?? []) {
    const text = raw.trim();
    if (!text) continue;
    const abbr = parseStateAbbr(text);
    if (abbr) return abbr;
    if (/\bcalifornia\b/i.test(text)) return "CA";
  }
  return inferStateFromHomeZip(prefs?.home_zip);
}

export function locationPrefsFromPreferences(
  prefs: JobPreferences | null | undefined,
): LocationPrefs {
  return {
    preferredState: preferredStateFromPreferences(prefs ?? null),
    maxCommuteMiles: prefs?.max_commute_miles ?? null,
    remoteAllowed: prefs?.remote_allowed ?? true,
    hybridAllowed: prefs?.hybrid_allowed ?? true,
    onsiteAllowed: prefs?.onsite_allowed ?? Boolean(prefs?.home_zip?.trim()),
  };
}

function isFullyRemoteArrangement(arrangement: WorkArrangement): boolean {
  return arrangement === "Remote";
}

/** Client-side guard when DB filter state is stale or missing. */
export function isLocationPolicyBlocked(
  job: JobRecord,
  locationPrefs?: LocationPrefs,
): boolean {
  if (job.user_state?.location_status === "rejected") {
    return true;
  }
  if (job.user_state?.location_status === "unverified") {
    return true;
  }

  const prefs = locationPrefs;
  const arrangement = effectiveWorkArrangement(job, job.user_state?.work_arrangement);
  const locationLine = job.location ?? "";
  const jobState = parseStateAbbr(locationLine);
  const homeState = prefs?.preferredState ?? null;

  if (
    homeState &&
    jobState &&
    jobState !== homeState &&
    !isFullyRemoteArrangement(arrangement)
  ) {
    return true;
  }

  if (
    arrangement === "Hybrid" ||
    arrangement === "Onsite" ||
    (arrangement === "Unknown" && jobState)
  ) {
    const maxMiles = prefs?.maxCommuteMiles;
    const commute = job.user_state?.commute_miles;
    if (maxMiles != null && commute != null && commute > maxMiles) {
      return true;
    }
    if (homeState && jobState && jobState !== homeState) {
      return true;
    }
  }

  if (arrangement === "Remote" && homeState && jobState && jobState !== homeState) {
    const maxMiles = prefs?.maxCommuteMiles;
    const commute = job.user_state?.commute_miles;
    if (maxMiles != null && commute != null && commute > maxMiles) {
      return true;
    }
  }

  if (
    isFullyRemoteArrangement(arrangement) &&
    remotePostingContradicted(job)
  ) {
    return true;
  }

  if (job.user_state?.location_status === "pass") {
    if (
      isFullyRemoteArrangement(arrangement) &&
      (!locationLine.trim() ||
        BROAD_LOCATION_RE.test(sanitizeJobLocation(locationLine)))
    ) {
      return true;
    }
    return false;
  }

  return true;
}

const BROAD_LOCATION_RE =
  /^(?:united states(?:\s+of\s+america)?|usa|u\.?s\.?a?\.?|us|america|remote)$/i;

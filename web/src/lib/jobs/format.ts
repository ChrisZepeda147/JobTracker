export function formatSalaryRange(
  min: number | null | undefined,
  max: number | null | undefined,
): string | null {
  if (min == null && max == null) return null;
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  if (min != null) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

export function formatPostedDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatSource(site: string | null | undefined): string | null {
  if (!site) return null;
  const labels: Record<string, string> = {
    linkedin: "LinkedIn",
    indeed: "Indeed",
    zip_recruiter: "ZipRecruiter",
    wellfound: "Wellfound",
    builtin: "Built In",
    glassdoor: "Glassdoor",
    company_career_pages: "Company Career Pages",
  };
  return labels[site.toLowerCase()] ?? site.replace(/_/g, " ");
}

export function formatRelativeTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatPostedDate(iso);
}

export type WorkArrangement = "Remote" | "Hybrid" | "Onsite" | "Unknown";

const REMOTE_RE =
  /\b(remote|work from home|work-from-home|wfh|telecommute|distributed|anywhere|fully remote|remote-eligible|remote ok)\b/i;
const HYBRID_RE =
  /\b(hybrid|partially remote|flexible hybrid|\d+\s+days?\s+(?:a\s+week\s+)?in[- ]?office)\b/i;
const ONSITE_RE = /\b(on[- ]?site|in[- ]?office|in person|office[- ]based)\b/i;

const US_BROAD_LOCATION_RE =
  /^(?:united states(?:\s+of\s+america)?|usa|u\.?s\.?a?\.?|us|america)(?:\s*[-–—•|]\s*)?$/i;

function hasArrangementHint(text: string): boolean {
  return REMOTE_RE.test(text) || HYBRID_RE.test(text) || ONSITE_RE.test(text);
}

function normalizeGeographicLocation(location: string): string {
  const trimmed = location.trim();
  if (!trimmed) return "";
  return trimmed
    .replace(/,\s*(?:US|USA|U\.S\.A?\.?|United States(?: of America)?)\s*$/i, "")
    .trim();
}

export function detectWorkArrangement(job: {
  title: string;
  location: string;
  description?: string | null;
}): WorkArrangement {
  const location = job.location || "";
  const normalizedLocation = normalizeGeographicLocation(location);

  if (REMOTE_RE.test(location)) return "Remote";
  if (HYBRID_RE.test(location)) return "Hybrid";
  if (ONSITE_RE.test(location)) return "Onsite";

  if (US_BROAD_LOCATION_RE.test(normalizedLocation) || US_BROAD_LOCATION_RE.test(location.trim())) {
    return "Remote";
  }

  const text = `${job.title}\n${job.description || ""}`.slice(0, 8000);
  if (HYBRID_RE.test(text)) return "Hybrid";
  if (REMOTE_RE.test(text)) return "Remote";
  if (ONSITE_RE.test(text)) return "Onsite";

  return "Unknown";
}

function stripArrangementPrefix(location: string, arrangement: WorkArrangement): string {
  const trimmed = location.trim();
  if (!trimmed) return "";

  let geographic = trimmed;
  if (arrangement === "Remote") {
    geographic = trimmed.replace(/^remote\s*[-–—•|]\s*/i, "").trim() || trimmed;
  } else if (arrangement === "Hybrid") {
    geographic = trimmed.replace(/^hybrid\s*[-–—•|]\s*/i, "").trim() || trimmed;
  } else if (arrangement === "Onsite") {
    geographic = trimmed.replace(/^(?:on[- ]?site|in[- ]office)\s*[-–—•|]\s*/i, "").trim() || trimmed;
  }

  geographic = normalizeGeographicLocation(geographic);

  if (arrangement === "Unknown" && hasArrangementHint(geographic)) {
    geographic = geographic
      .replace(/\(\s*remote\s*\)/gi, "")
      .replace(/\(\s*hybrid\s*\)/gi, "")
      .replace(/\(\s*on[- ]?site\s*\)/gi, "")
      .replace(/\bremote\s*[-–—•|]\s*/gi, "")
      .replace(/\bhybrid\s*[-–—•|]\s*/gi, "")
      .trim();
    geographic = normalizeGeographicLocation(geographic);
  }

  return geographic;
}

export function formatWorkLocationLine(job: {
  title: string;
  location: string;
  description?: string | null;
}): string {
  const arrangement = detectWorkArrangement(job);
  const geographic = stripArrangementPrefix(job.location || "", arrangement);

  if (arrangement === "Unknown") {
    if (geographic) return geographic;
    return "Unknown";
  }

  if (!geographic) {
    return arrangement;
  }

  return `${arrangement} • ${geographic}`;
}

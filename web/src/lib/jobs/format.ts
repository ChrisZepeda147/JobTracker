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

export function formatAppliedAt(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
const ARRANGEMENT_LINE_RE =
  /^\s*(remote|hybrid|on[- ]?site|onsite|in[- ]?office|in office)\s*$/im;

export function sanitizeJobLocation(location: string): string {
  let text = location.trim();
  if (text.includes("·")) {
    text = text.split("·", 1)[0].trim();
  }
  return text.replace(/,\s*(?:US|USA|U\.S\.A?\.?|United States(?: of America)?)\s*$/i, "").trim();
}

function workModeFromDescriptionLines(description: string | null | undefined): WorkArrangement | null {
  if (!description) return null;
  const lines = description.split(/\r?\n/).slice(0, 30);
  for (const line of lines) {
    const match = ARRANGEMENT_LINE_RE.exec(line.trim());
    if (!match) continue;
    const token = match[1].toLowerCase().replace(/\s+/g, "");
    if (token === "remote") return "Remote";
    if (token === "hybrid") return "Hybrid";
    if (token === "onsite" || token === "on-site" || token === "inoffice" || token === "in-office") {
      return "Onsite";
    }
  }
  return null;
}

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

/** Mirrors worker effective_work_mode / detect_work_mode ordering. */
export function detectWorkArrangement(job: {
  title: string;
  location: string;
  description?: string | null;
}): WorkArrangement {
  const fromLines = workModeFromDescriptionLines(job.description);
  if (fromLines) return fromLines;

  const location = sanitizeJobLocation(job.location || "");
  const normalizedLocation = normalizeGeographicLocation(location);
  const head = `${job.title}\n${(job.description || "").slice(0, 2500)}`;

  if (HYBRID_RE.test(location)) return "Hybrid";
  if (ONSITE_RE.test(location)) return "Onsite";
  if (REMOTE_RE.test(location)) {
    if (HYBRID_RE.test(head)) return "Hybrid";
    if (ONSITE_RE.test(head)) return "Onsite";
    return "Remote";
  }

  if (US_BROAD_LOCATION_RE.test(normalizedLocation) || US_BROAD_LOCATION_RE.test(location.trim())) {
    return "Remote";
  }

  const text = `${job.title}\n${job.description || ""}`.slice(0, 8000);
  if (HYBRID_RE.test(text)) return "Hybrid";
  if (ONSITE_RE.test(text)) return "Onsite";
  if (REMOTE_RE.test(text)) return "Remote";

  return "Unknown";
}

const STORED_ARRANGEMENT: Record<string, WorkArrangement> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "Onsite",
  unknown: "Unknown",
};

/** Prefer filter verdict from the worker; fall back to heuristics. */
export function effectiveWorkArrangement(
  job: {
    title: string;
    location: string;
    description?: string | null;
  },
  stored: string | null | undefined,
): WorkArrangement {
  const key = stored?.trim().toLowerCase();
  if (key && key in STORED_ARRANGEMENT && key !== "unknown") {
    return STORED_ARRANGEMENT[key];
  }
  return detectWorkArrangement(job);
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

export function formatWorkLocationLine(
  job: {
    title: string;
    location: string;
    description?: string | null;
  },
  commuteMiles?: number | null,
  storedArrangement?: string | null,
): string {
  const arrangement = effectiveWorkArrangement(job, storedArrangement);
  const geographic = stripArrangementPrefix(sanitizeJobLocation(job.location || ""), arrangement);

  if (arrangement === "Remote") {
    const geo = geographic.trim();
    const isBroad =
      !geo ||
      US_BROAD_LOCATION_RE.test(geo) ||
      /^(united states|usa|u\.?s\.?)$/i.test(geo);
    if (!isBroad) {
      return `Remote • ${geo} (verify on posting)`;
    }
    return "Remote • US (verify workplace on posting)";
  }

  if (arrangement === "Unknown") {
    if (geographic) {
      if (commuteMiles != null) {
        return `${geographic} • ${Math.round(commuteMiles)} miles`;
      }
      return geographic;
    }
    return commuteMiles != null ? `Location Unverified • ${Math.round(commuteMiles)} miles` : "Location Unverified";
  }

  if (!geographic) {
    if (commuteMiles != null && arrangement !== "Remote") {
      return `${arrangement} • ${Math.round(commuteMiles)} miles`;
    }
    return arrangement;
  }

  if (commuteMiles != null && arrangement !== "Remote") {
    return `${arrangement} • ${geographic} • ${Math.round(commuteMiles)} miles`;
  }

  return `${arrangement} • ${geographic}`;
}

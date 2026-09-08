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

const REMOTE_RE = /\b(remote|work from home|wfh|distributed|anywhere)\b/i;
const HYBRID_RE = /\bhybrid\b/i;
const ONSITE_RE = /\b(on[- ]?site|in[- ]?office|in person)\b/i;

export function detectWorkArrangement(job: {
  title: string;
  location: string;
  description?: string | null;
}): WorkArrangement {
  const location = job.location || "";
  if (REMOTE_RE.test(location)) return "Remote";
  if (HYBRID_RE.test(location)) return "Hybrid";

  const head = `${job.title}\n${(job.description || "").slice(0, 1500)}`;
  if (HYBRID_RE.test(head)) return "Hybrid";
  if (REMOTE_RE.test(head)) return "Remote";
  if (ONSITE_RE.test(head)) return "Onsite";

  return "Unknown";
}

function stripArrangementPrefix(location: string, arrangement: WorkArrangement): string {
  const trimmed = location.trim();
  if (!trimmed) return "Unknown location";
  if (arrangement === "Remote") {
    return trimmed.replace(/^remote\s*[-–—•|]\s*/i, "").trim() || trimmed;
  }
  if (arrangement === "Hybrid") {
    return trimmed.replace(/^hybrid\s*[-–—•|]\s*/i, "").trim() || trimmed;
  }
  if (arrangement === "Onsite") {
    return trimmed.replace(/^(?:on[- ]?site|in[- ]office)\s*[-–—•|]\s*/i, "").trim() || trimmed;
  }
  return trimmed;
}

export function formatWorkLocationLine(job: {
  title: string;
  location: string;
  description?: string | null;
}): string {
  const arrangement = detectWorkArrangement(job);
  const geographic = stripArrangementPrefix(job.location || "", arrangement);

  if (arrangement === "Unknown") {
    return geographic ? `Unknown • ${geographic}` : "Unknown";
  }

  return `${arrangement} • ${geographic}`;
}

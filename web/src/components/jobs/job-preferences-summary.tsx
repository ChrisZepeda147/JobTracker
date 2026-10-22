import Link from "next/link";
import { Settings2 } from "lucide-react";
import { JOB_SOURCES, POSTED_WITHIN_OPTIONS } from "@/lib/jobs/constants";
import { formatSalaryRange } from "@/lib/jobs/format";
import type { JobPreferences } from "@/lib/types/database";

function formatWorkModes(prefs: JobPreferences): string {
  const modes: string[] = [];
  if (prefs.remote_allowed) modes.push("Remote");
  if (prefs.hybrid_allowed) modes.push("Hybrid");
  if (prefs.onsite_allowed) modes.push("On-site");
  return modes.length > 0 ? modes.join(" / ") : "None selected";
}

function formatCommute(prefs: JobPreferences): string {
  const zip = prefs.home_zip?.trim();
  const miles = prefs.max_commute_miles;
  if (zip && miles != null) return `${miles} mi from ${zip}`;
  if (zip) return `Home zip ${zip}`;
  if (miles != null) return `${miles} mi max commute`;
  return "Not set";
}

function formatList(values: string[], emptyLabel = "None"): string {
  const trimmed = values.map((v) => v.trim()).filter(Boolean);
  if (trimmed.length === 0) return emptyLabel;
  if (trimmed.length <= 2) return trimmed.join(", ");
  return `${trimmed.slice(0, 2).join(", ")} +${trimmed.length - 2} more`;
}

function formatSearchSources(prefs: JobPreferences): string {
  const ids = prefs.search_sources ?? [];
  if (ids.length === 0) return "None selected";
  const labels = ids
    .map((id) => JOB_SOURCES.find((s) => s.id === id)?.label ?? id)
    .filter(Boolean);
  return labels.join(", ");
}

function formatLocation(prefs: JobPreferences): string {
  const city = prefs.preferred_locations?.[0]?.trim();
  const zip = prefs.home_zip?.trim();
  if (city && zip) return `${city} (${zip})`;
  if (city) return city;
  if (zip) return zip;
  return "Not set";
}

type PreferenceItemProps = {
  label: string;
  value: string;
};

function PreferenceItem({ label, value }: PreferenceItemProps) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="truncate text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function JobPreferencesSummary({ preferences }: { preferences: JobPreferences | null }) {
  if (!preferences) {
    return (
      <div className="mb-4 rounded-xl border border-dashed border-border bg-zinc-50 px-4 py-3 text-sm text-muted">
        <p>No Job Preferences saved yet.</p>
        <Link href="/job-preferences" className="mt-1 inline-block font-medium text-accent hover:underline">
          Set up Job Preferences
        </Link>
        <span className="text-muted"> — filters and search defaults come from there.</span>
      </div>
    );
  }

  const salary =
    formatSalaryRange(preferences.salary_min, preferences.salary_max) ?? "Not set";
  const experience =
    preferences.max_preferred_experience_years != null
      ? `${preferences.max_preferred_experience_years} years max`
      : "Not set";
  const listingFreshness =
    POSTED_WITHIN_OPTIONS.find((o) => o.value === preferences.posted_within_days)?.label ??
    (preferences.posted_within_days != null
      ? `${preferences.posted_within_days} days`
      : "3 weeks (default)");

  return (
    <div className="mb-4 rounded-xl border border-border bg-zinc-50/80 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Active filters</p>
          <p className="text-xs text-muted">
            Read-only here. Edit on{" "}
            <Link href="/job-preferences" className="font-medium text-accent hover:underline">
              Job Preferences
            </Link>
            , then use{" "}
            <span className="font-medium text-foreground">Re-evaluate jobs now</span> on the Jobs page
            (instant on localhost) to refresh filters and scores.
          </p>
        </div>
        <Link
          href="/job-preferences"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-zinc-100"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Edit preferences
        </Link>
      </div>

      <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <PreferenceItem
          label="Job titles"
          value={formatList(preferences.target_roles ?? [], "Not set")}
        />
        <PreferenceItem label="Location" value={formatLocation(preferences)} />
        <PreferenceItem label="Search sources" value={formatSearchSources(preferences)} />
        <PreferenceItem label="Salary range" value={salary} />
        <PreferenceItem label="Commute" value={formatCommute(preferences)} />
        <PreferenceItem label="Work modes" value={formatWorkModes(preferences)} />
        <PreferenceItem label="Experience" value={experience} />
        <PreferenceItem label="Listing age" value={listingFreshness} />
        <PreferenceItem
          label="Excluded keywords"
          value={formatList(preferences.excluded_keywords ?? [])}
        />
      </dl>
    </div>
  );
}

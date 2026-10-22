"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JOB_SOURCES, MAX_SEARCH_TITLES, POSTED_WITHIN_OPTIONS } from "@/lib/jobs/constants";
import type { SearchFormDefaults, SearchScope } from "@/lib/jobs/logic";
import { cn } from "@/lib/utils/cn";

type JobSearchPanelProps = {
  searchParams: SearchFormDefaults;
  onSubmit: (form: SearchFormDefaults, scope: SearchScope) => Promise<void>;
  onSourcesChange?: (sources: string[]) => Promise<void>;
  onReevaluate?: () => Promise<void>;
  reevaluatePending?: boolean;
  lastRequestMessage?: string | null;
};

function validateSearchParams(form: SearchFormDefaults, scope: SearchScope): string | null {
  const titles = form.titles.map((t) => t.trim()).filter(Boolean);
  if (titles.length === 0) {
    return "Add at least one target role in Job Preferences.";
  }
  if (titles.length > MAX_SEARCH_TITLES) {
    return `Limit searches to ${MAX_SEARCH_TITLES} titles in Job Preferences.`;
  }
  const zip = form.locationZip.trim();
  const city = form.location.trim();
  if (scope === "local" && !zip && !city) {
    return "Set a home zip or preferred location in Job Preferences.";
  }
  if (zip && !/^\d{5}(-\d{4})?$/.test(zip)) {
    return "Home zip in Job Preferences must be 5 digits (optional +4 extension).";
  }
  if (form.sources.length === 0) {
    return "Select at least one job source.";
  }
  return null;
}

export function JobSearchPanel({
  searchParams,
  onSubmit,
  onSourcesChange,
  onReevaluate,
  reevaluatePending = false,
  lastRequestMessage,
}: JobSearchPanelProps) {
  const [sources, setSources] = useState(searchParams.sources);
  const [postedWithinDays, setPostedWithinDays] = useState(searchParams.postedWithinDays);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSources(searchParams.sources);
  }, [searchParams.sources]);

  useEffect(() => {
    setPostedWithinDays(searchParams.postedWithinDays);
  }, [searchParams.postedWithinDays]);

  const formWithSources = { ...searchParams, sources, postedWithinDays };
  const localValidationError = validateSearchParams(formWithSources, "local");
  const remoteValidationError = validateSearchParams(formWithSources, "remote_us");

  function toggleSource(sourceId: string) {
    setSources((prev) => {
      const next = prev.includes(sourceId)
        ? prev.filter((id) => id !== sourceId)
        : [...prev, sourceId];
      void onSourcesChange?.(next);
      return next;
    });
  }

  async function handleSearch(scope: SearchScope) {
    const validationError = scope === "local" ? localValidationError : remoteValidationError;
    if (validationError) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit(formWithSources, scope);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-4 space-y-3">
      <div>
        <p className="mb-2 text-xs font-medium text-muted">Search sources</p>
        <div className="flex flex-wrap gap-2">
          {JOB_SOURCES.map((source) => {
            const active = sources.includes(source.id);
            const hint =
              source.id === "wellfound"
                ? "May be blocked without PROXY_LIST; worker tries best-effort"
                : source.id === "company_career_pages"
                  ? "Greenhouse company boards (public API)"
                  : undefined;
            return (
              <button
                key={source.id}
                type="button"
                title={hint}
                onClick={() => toggleSource(source.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-indigo-50 text-accent ring-1 ring-accent/30"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200",
                )}
              >
                {source.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted">
        Use up to {MAX_SEARCH_TITLES} titles per search (set in Job Preferences). Queue separate
        searches for core SWE, frontend, backend, AI, and integration roles rather than one mega-search.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-medium text-muted">
          <span>Posted within</span>
          <select
            className="rounded-lg border border-border bg-white px-2 py-1.5 text-sm text-foreground"
            value={postedWithinDays}
            onChange={(e) => setPostedWithinDays(Number(e.target.value))}
          >
            {POSTED_WITHIN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Button
          type="button"
          disabled={Boolean(localValidationError) || loading}
          onClick={() => void handleSearch("local")}
          className="shrink-0"
        >
          <Search className="mr-2 h-4 w-4" />
          {loading ? "Queuing..." : "Local / commute search"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={Boolean(remoteValidationError) || loading}
          onClick={() => void handleSearch("remote_us")}
          className="shrink-0"
        >
          <Search className="mr-2 h-4 w-4" />
          {loading ? "Queuing..." : "US remote search"}
        </Button>

        {onReevaluate ? (
          <Button
            type="button"
            variant="secondary"
            disabled={reevaluatePending}
            onClick={() => void onReevaluate()}
            className="shrink-0"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {reevaluatePending ? "Re-evaluating jobs..." : "Re-evaluate jobs now"}
          </Button>
        ) : null}

        {localValidationError || error ? (
          <p className="text-sm text-red-600">{localValidationError ?? error}</p>
        ) : null}
        {!localValidationError && lastRequestMessage ? (
          <p className="text-sm text-emerald-700">{lastRequestMessage}</p>
        ) : null}
      </div>
    </div>
  );
}

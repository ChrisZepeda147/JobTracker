"use client";

import { FormEvent, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TagInput } from "@/components/ui/tag-input";
import { JOB_SOURCES, MAX_SEARCH_TITLES, ONSITE_MILES_OPTIONS, POSTED_WITHIN_OPTIONS } from "@/lib/jobs/constants";
import type { SearchFormDefaults } from "@/lib/jobs/logic";

type JobSearchPanelProps = {
  defaults: SearchFormDefaults;
  onSubmit: (form: SearchFormDefaults) => Promise<void>;
  onRescore?: () => Promise<void>;
  rescorePending?: boolean;
  lastRequestMessage?: string | null;
};

export function JobSearchPanel({
  defaults,
  onSubmit,
  onRescore,
  rescorePending = false,
  lastRequestMessage,
}: JobSearchPanelProps) {
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(false);
  const [rescoreLoading, setRescoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const titles = form.titles.map((t) => t.trim()).filter(Boolean);
    if (titles.length === 0) {
      setError("Add at least one job title.");
      return;
    }
    if (titles.length > MAX_SEARCH_TITLES) {
      setError(`Limit searches to ${MAX_SEARCH_TITLES} titles.`);
      return;
    }
    const zip = form.locationZip.trim();
    const city = form.location.trim();
    if (!zip && !city) {
      setError("Enter a zip code or city/area for location.");
      return;
    }
    if (zip && !/^\d{5}(-\d{4})?$/.test(zip)) {
      setError("Zip code must be 5 digits (optional +4 extension).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ ...form, titles });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search request failed.");
    } finally {
      setLoading(false);
    }
  }

  function toggleSource(sourceId: string) {
    setForm((prev) => ({
      ...prev,
      sources: prev.sources.includes(sourceId)
        ? prev.sources.filter((s) => s !== sourceId)
        : [...prev.sources, sourceId],
    }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-4 w-4 text-accent" />
          Find Jobs
        </CardTitle>
        <CardDescription>
          Search defaults come from your Job Preferences. Start local development with{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">npm run search</code> to run
          the web app and job worker together.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <TagInput
              label="Job titles"
              value={form.titles}
              onChange={(titles) =>
                setForm({ ...form, titles: titles.slice(0, MAX_SEARCH_TITLES) })
              }
              placeholder="Full Stack Engineer, Backend Engineer"
              hint={`Up to ${MAX_SEARCH_TITLES} titles. Defaults from Job Preferences.`}
            />
          </div>
          <div>
            <Label htmlFor="search_location_zip">Zip code</Label>
            <Input
              id="search_location_zip"
              value={form.locationZip}
              onChange={(e) => setForm({ ...form, locationZip: e.target.value })}
              placeholder="78701"
              inputMode="numeric"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="search_location">City / area (optional)</Label>
            <Input
              id="search_location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Austin, TX — used as fallback if zip is empty"
            />
          </div>
          <div>
            <Label htmlFor="search_salary_min">Salary minimum</Label>
            <Input
              id="search_salary_min"
              type="number"
              min={0}
              value={form.salaryMin}
              onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="search_salary_max">Salary maximum</Label>
            <Input
              id="search_salary_max"
              type="number"
              min={0}
              value={form.salaryMax}
              onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="posted_within">Posted within</Label>
          <select
            id="posted_within"
            value={form.postedWithinDays}
            onChange={(e) => setForm({ ...form, postedWithinDays: Number(e.target.value) })}
            className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 md:max-w-xs"
          >
            {POSTED_WITHIN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          {(
            [
              ["remoteAllowed", "Remote"],
              ["hybridAllowed", "Hybrid"],
              ["onsiteAllowed", "On-site"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
              />
              {label}
            </label>
          ))}
        </div>

        {form.hybridAllowed || form.onsiteAllowed ? (
          <div>
            <Label htmlFor="max_onsite_miles">Max commute (on-site / hybrid)</Label>
            <select
              id="max_onsite_miles"
              value={form.maxOnsiteMiles}
              onChange={(e) => setForm({ ...form, maxOnsiteMiles: Number(e.target.value) })}
              className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 md:max-w-xs"
            >
              {ONSITE_MILES_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <Label>Sources</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {JOB_SOURCES.map((source) => {
              const active = form.sources.includes(source.id);
              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => toggleSource(source.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "bg-indigo-50 text-accent"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {source.label}
                </button>
              );
            })}
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {lastRequestMessage ? (
          <p className="text-sm text-emerald-700">{lastRequestMessage}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={loading || form.sources.length === 0 || form.titles.length === 0}>
            {loading ? "Queuing search..." : "Search Jobs"}
          </Button>
          {onRescore ? (
            <Button
              type="button"
              variant="secondary"
              disabled={rescoreLoading || rescorePending}
              onClick={async () => {
                setRescoreLoading(true);
                setError(null);
                try {
                  await onRescore();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Rescore request failed.");
                } finally {
                  setRescoreLoading(false);
                }
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {rescoreLoading || rescorePending ? "Rescore queued..." : "Rescore existing jobs"}
            </Button>
          ) : null}
        </div>
      </form>
    </Card>
  );
}

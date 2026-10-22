"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { Card } from "@/components/ui/card";
import {
  DEFAULT_POSTED_WITHIN_DAYS,
  DEFAULT_SEARCH_SOURCES,
  ONSITE_MILES_OPTIONS,
  POSTED_WITHIN_OPTIONS,
} from "@/lib/jobs/constants";
import { reevaluateStoredJobs } from "@/lib/jobs/run-reevaluate";
import type { JobPreferences } from "@/lib/types/database";

const emptyPrefs = (userId: string): Omit<JobPreferences, "created_at" | "updated_at"> => ({
  user_id: userId,
  target_roles: [],
  salary_min: null,
  salary_preferred: null,
  salary_max: null,
  max_preferred_experience_years: null,
  preferred_locations: [],
  remote_allowed: true,
  hybrid_allowed: true,
  onsite_allowed: true,
  home_zip: null,
  max_commute_miles: 50,
  excluded_seniority: [],
  excluded_keywords: [],
  additional_instructions: "",
  search_sources: [...DEFAULT_SEARCH_SOURCES],
  posted_within_days: DEFAULT_POSTED_WITHIN_DAYS,
  strict_filtering: true,
});

export function JobPreferencesForm({ userId }: { userId: string }) {
  const [form, setForm] = useState({ ...emptyPrefs(userId) });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reevaluateAfterSave, setReevaluateAfterSave] = useState(true);
  const [savedSalaryMin, setSavedSalaryMin] = useState<number | null>(null);
  const [savedSalaryMax, setSavedSalaryMax] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("job_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (data) {
        const prefs = data as JobPreferences;
        setForm({
          ...prefs,
          posted_within_days: prefs.posted_within_days ?? DEFAULT_POSTED_WITHIN_DAYS,
          strict_filtering: prefs.strict_filtering !== false,
          search_sources:
            prefs.search_sources?.length > 0 ? prefs.search_sources : [...DEFAULT_SEARCH_SOURCES],
        });
        setSavedSalaryMin(prefs.salary_min ?? null);
        setSavedSalaryMax(prefs.salary_max ?? null);
      }
      setLoading(false);
    }
    load();
  }, [userId]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const supabase = createClient();
    const { error: saveError } = await supabase.from("job_preferences").upsert({
      ...form,
      user_id: userId,
    });

    if (saveError) {
      setSaving(false);
      setError(saveError.message);
      return;
    }

    const salaryChanged =
      form.salary_min !== savedSalaryMin || form.salary_max !== savedSalaryMax;

    setSavedSalaryMin(form.salary_min ?? null);
    setSavedSalaryMax(form.salary_max ?? null);
    setSaving(false);

    if (reevaluateAfterSave) {
      try {
        const result = await reevaluateStoredJobs(userId, { wait: false });
        setMessage(
          salaryChanged
            ? `Preferences saved. ${result.message}`
            : `Preferences saved. ${result.message}`,
        );
      } catch (reevaluateError) {
        setMessage("Preferences saved.");
        setError(
          reevaluateError instanceof Error
            ? `Saved, but re-evaluation failed: ${reevaluateError.message}`
            : "Saved, but re-evaluation failed.",
        );
      }
    } else {
      setMessage(
        "Preferences saved. Use Re-evaluate jobs now on the Jobs page when you want to update stored results.",
      );
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading preferences...</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card className="space-y-4">
        <TagInput
          label="Target roles"
          value={form.target_roles}
          onChange={(target_roles) => setForm({ ...form, target_roles })}
          placeholder="Full Stack Engineer, Backend Engineer"
        />

        <p className="text-sm text-muted">
          Saved per account. New searches and filter updates always read these values — nothing is
          hardcoded. Another user can set a different salary range.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="salary_min">Salary min</Label>
            <Input
              id="salary_min"
              type="number"
              min={0}
              value={form.salary_min ?? ""}
              onChange={(e) =>
                setForm({ ...form, salary_min: e.target.value ? Number(e.target.value) : null })
              }
            />
          </div>
          <div>
            <Label htmlFor="salary_preferred">Salary preferred</Label>
            <Input
              id="salary_preferred"
              type="number"
              min={0}
              value={form.salary_preferred ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  salary_preferred: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="salary_max">Salary max</Label>
            <Input
              id="salary_max"
              type="number"
              min={0}
              value={form.salary_max ?? ""}
              onChange={(e) =>
                setForm({ ...form, salary_max: e.target.value ? Number(e.target.value) : null })
              }
            />
          </div>
        </div>
        <p className="text-xs text-muted">
          Example band: $50k min / $130k max / ~$80–85k preferred. Overlapping ranges are kept
          (e.g. $68k–$130k). Unlisted pay stays visible as unknown. Only pay entirely outside your
          range is rejected. Re-evaluate after saving to update stored jobs.
        </p>

        <div>
          <Label htmlFor="posted_within_days">Show listings posted within</Label>
          <select
            id="posted_within_days"
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            value={form.posted_within_days ?? DEFAULT_POSTED_WITHIN_DAYS}
            onChange={(e) =>
              setForm({ ...form, posted_within_days: Number(e.target.value) })
            }
          >
            {POSTED_WITHIN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted">
            New searches only fetch jobs this fresh. Older stored jobs stay hidden on the Jobs page
            unless you turn on &quot;Show older listings&quot; there.
          </p>
        </div>

        <div>
          <Label htmlFor="max_preferred_experience_years">Max preferred experience (years)</Label>
          <Input
            id="max_preferred_experience_years"
            type="number"
            min={0}
            value={form.max_preferred_experience_years ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                max_preferred_experience_years: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
          <label className="mt-2 flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={form.strict_filtering !== false}
              onChange={(e) => setForm({ ...form, strict_filtering: e.target.checked })}
            />
            Strict filtering (quality over quantity — hydrate postings, reject senior/management, verify listings)
          </label>
        </div>

        <TagInput
          label="Preferred locations"
          value={form.preferred_locations}
          onChange={(preferred_locations) => setForm({ ...form, preferred_locations })}
          placeholder="Austin, TX"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="home_zip">Home zip code</Label>
            <Input
              id="home_zip"
              inputMode="numeric"
              maxLength={10}
              placeholder="78701"
              value={form.home_zip ?? ""}
              onChange={(e) =>
                setForm({ ...form, home_zip: e.target.value.trim() || null })
              }
            />
            <p className="mt-1 text-xs text-muted">
              Used to calculate commute distance for hybrid and on-site roles.
            </p>
          </div>
          <div>
            <Label htmlFor="max_commute_miles">Max commute distance</Label>
            <select
              id="max_commute_miles"
              className="flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              value={form.max_commute_miles ?? ONSITE_MILES_OPTIONS[3].value}
              onChange={(e) =>
                setForm({ ...form, max_commute_miles: Number(e.target.value) })
              }
            >
              {ONSITE_MILES_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["remote_allowed", "Remote"],
              ["hybrid_allowed", "Hybrid"],
              ["onsite_allowed", "On-site"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
              />
              {label}
            </label>
          ))}
        </div>

        <TagInput
          label="Excluded seniority"
          value={form.excluded_seniority}
          onChange={(excluded_seniority) => setForm({ ...form, excluded_seniority })}
          placeholder="Intern, Junior"
        />

        <TagInput
          label="Excluded keywords"
          value={form.excluded_keywords}
          onChange={(excluded_keywords) => setForm({ ...form, excluded_keywords })}
          placeholder="clearance, unpaid"
        />

        <div>
          <Label htmlFor="additional_instructions">Additional instructions</Label>
          <Textarea
            id="additional_instructions"
            rows={4}
            value={form.additional_instructions}
            onChange={(e) => setForm({ ...form, additional_instructions: e.target.value })}
            placeholder="Prioritize product companies, avoid contract roles..."
          />
        </div>
      </Card>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={reevaluateAfterSave}
          onChange={(e) => setReevaluateAfterSave(e.target.checked)}
        />
        After saving, update my existing jobs in the background (does not block save)
      </label>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save preferences"}
      </Button>
    </form>
  );
}

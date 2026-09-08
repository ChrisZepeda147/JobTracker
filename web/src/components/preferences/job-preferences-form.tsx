"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { Card } from "@/components/ui/card";
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
  onsite_allowed: false,
  excluded_seniority: [],
  excluded_keywords: [],
  additional_instructions: "",
});

export function JobPreferencesForm({ userId }: { userId: string }) {
  const [form, setForm] = useState({ ...emptyPrefs(userId) });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("job_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (data) setForm(data as JobPreferences);
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

    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setMessage("Preferences saved.");
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
        </div>

        <TagInput
          label="Preferred locations"
          value={form.preferred_locations}
          onChange={(preferred_locations) => setForm({ ...form, preferred_locations })}
          placeholder="Austin, TX"
        />

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

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save preferences"}
      </Button>
    </form>
  );
}

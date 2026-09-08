"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { Card } from "@/components/ui/card";
import type { CandidateProfile } from "@/lib/types/database";

const emptyProfile = (): Omit<CandidateProfile, "created_at" | "updated_at"> => ({
  user_id: "",
  full_name: "",
  current_title: "",
  location: "",
  software_experience_years: null,
  education: "",
  professional_summary: "",
  technical_skills: [],
  professional_strengths: [],
  additional_context: "",
});

export function ProfileForm({ userId }: { userId: string }) {
  const [form, setForm] = useState({ ...emptyProfile(), user_id: userId });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) setForm(data as CandidateProfile);
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
    const { error: saveError } = await supabase.from("candidate_profiles").upsert({
      ...form,
      user_id: userId,
    });

    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setMessage("Profile saved.");
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading profile...</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="current_title">Current title</Label>
            <Input
              id="current_title"
              value={form.current_title}
              onChange={(e) => setForm({ ...form, current_title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="software_experience_years">Software experience (years)</Label>
            <Input
              id="software_experience_years"
              type="number"
              min={0}
              value={form.software_experience_years ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  software_experience_years: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </div>
        </div>

        <div>
          <Label htmlFor="education">Education</Label>
          <Textarea
            id="education"
            rows={3}
            value={form.education}
            onChange={(e) => setForm({ ...form, education: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="professional_summary">Professional summary</Label>
          <Textarea
            id="professional_summary"
            rows={4}
            value={form.professional_summary}
            onChange={(e) => setForm({ ...form, professional_summary: e.target.value })}
          />
        </div>

        <TagInput
          label="Technical skills"
          value={form.technical_skills}
          onChange={(technical_skills) => setForm({ ...form, technical_skills })}
          placeholder="Python, PostgreSQL, AWS"
        />

        <TagInput
          label="Professional strengths"
          value={form.professional_strengths}
          onChange={(professional_strengths) => setForm({ ...form, professional_strengths })}
          placeholder="System design, mentoring"
        />

        <div>
          <Label htmlFor="additional_context">Additional context</Label>
          <Textarea
            id="additional_context"
            rows={4}
            value={form.additional_context}
            onChange={(e) => setForm({ ...form, additional_context: e.target.value })}
            placeholder="Visa status, career goals, industries to avoid..."
          />
        </div>
      </Card>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}

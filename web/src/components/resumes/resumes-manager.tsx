"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Resume } from "@/lib/types/database";

type ResumeDraft = Omit<Resume, "created_at" | "updated_at">;

const blankResume = (userId: string): ResumeDraft => ({
  id: "",
  user_id: userId,
  name: "",
  target_role: "",
  resume_text: "",
  ai_notes: "",
  is_active: false,
});

export function ResumesManager({ userId }: { userId: string }) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [draft, setDraft] = useState<ResumeDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data, error: loadError } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
    }
    setResumes((data as Resume[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [userId]);

  async function saveResume(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;

    setSaving(true);
    setError(null);
    const supabase = createClient();

    const row = {
      user_id: userId,
      name: draft.name.trim(),
      target_role: draft.target_role.trim(),
      resume_text: draft.resume_text,
      ai_notes: draft.ai_notes,
      is_active: draft.is_active,
    };

    const saveError = draft.id
      ? (await supabase.from("resumes").update(row).eq("id", draft.id).eq("user_id", userId)).error
      : (await supabase.from("resumes").insert(row)).error;

    setSaving(false);

    if (saveError) {
      if (saveError.message.includes("schema cache") || saveError.message.includes("Could not find")) {
        setError(
          "Database tables are not set up yet. Ask your admin to run schema_web.sql in Supabase, then refresh this page.",
        );
      } else {
        setError(saveError.message);
      }
      return;
    }

    setDraft(null);
    await load();
  }

  async function deleteResume(id: string) {
    if (!confirm("Delete this resume?")) return;
    const supabase = createClient();
    await supabase.from("resumes").delete().eq("id", id);
    if (draft?.id === id) setDraft(null);
    await load();
  }

  async function setActive(id: string) {
    const supabase = createClient();
    await supabase.from("resumes").update({ is_active: true }).eq("id", id);
    await load();
  }

  if (loading) return <p className="text-sm text-muted">Loading resumes...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setDraft(blankResume(userId))}>Add resume</Button>
      </div>

      {draft ? (
        <Card>
          <CardHeader>
            <CardTitle>{draft.id ? "Edit resume" : "New resume"}</CardTitle>
          </CardHeader>
          <form onSubmit={saveResume} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="resume_name">Name</Label>
                <Input
                  id="resume_name"
                  required
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="target_role">Target role</Label>
                <Input
                  id="target_role"
                  value={draft.target_role}
                  onChange={(e) => setDraft({ ...draft, target_role: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="resume_text">Resume text</Label>
              <Textarea
                id="resume_text"
                rows={14}
                value={draft.resume_text}
                onChange={(e) => setDraft({ ...draft, resume_text: e.target.value })}
                placeholder="Paste your resume here..."
              />
            </div>
            <div>
              <Label htmlFor="ai_notes">AI notes</Label>
              <Textarea
                id="ai_notes"
                rows={3}
                value={draft.ai_notes}
                onChange={(e) => setDraft({ ...draft, ai_notes: e.target.value })}
                placeholder="Optional notes for the scorer..."
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.is_active}
                onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
              />
              Set as active resume
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save resume"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setDraft(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {resumes.length === 0 ? (
          <Card>
            <CardDescription>No resumes yet. Add one to get started.</CardDescription>
          </Card>
        ) : (
          resumes.map((resume) => (
            <Card key={resume.id} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{resume.name}</h3>
                  {resume.is_active ? <Badge variant="accent">Active</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-muted">{resume.target_role || "No target role"}</p>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
                  {resume.resume_text || "Empty resume text"}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {!resume.is_active ? (
                  <Button variant="secondary" onClick={() => setActive(resume.id)}>
                    Set active
                  </Button>
                ) : null}
                <Button variant="secondary" onClick={() => setDraft(resume)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => deleteResume(resume.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

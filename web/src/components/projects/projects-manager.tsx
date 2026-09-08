"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project } from "@/lib/types/database";

type ProjectDraft = Omit<Project, "created_at" | "updated_at">;

const blankProject = (userId: string): ProjectDraft => ({
  id: "",
  user_id: userId,
  name: "",
  github_url: "",
  technologies: [],
  readme_text: "",
  personal_contribution: "",
  ai_notes: "",
});

export function ProjectsManager({ userId }: { userId: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [draft, setDraft] = useState<ProjectDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    setProjects((data as Project[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [userId]);

  async function saveProject(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;

    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: saveError } = await supabase.from("projects").upsert({
      ...draft,
      user_id: userId,
      id: draft.id || undefined,
    });
    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setDraft(null);
    await load();
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project?")) return;
    const supabase = createClient();
    await supabase.from("projects").delete().eq("id", id);
    if (draft?.id === id) setDraft(null);
    await load();
  }

  if (loading) return <p className="text-sm text-muted">Loading projects...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setDraft(blankProject(userId))}>Add project</Button>
      </div>

      {draft ? (
        <Card>
          <CardHeader>
            <CardTitle>{draft.id ? "Edit project" : "New project"}</CardTitle>
          </CardHeader>
          <form onSubmit={saveProject} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="project_name">Name</Label>
                <Input
                  id="project_name"
                  required
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input
                  id="github_url"
                  type="url"
                  value={draft.github_url}
                  onChange={(e) => setDraft({ ...draft, github_url: e.target.value })}
                />
              </div>
            </div>
            <TagInput
              label="Technologies"
              value={draft.technologies}
              onChange={(technologies) => setDraft({ ...draft, technologies })}
            />
            <div>
              <Label htmlFor="readme_text">README / overview</Label>
              <Textarea
                id="readme_text"
                rows={5}
                value={draft.readme_text}
                onChange={(e) => setDraft({ ...draft, readme_text: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="personal_contribution">Your contribution</Label>
              <Textarea
                id="personal_contribution"
                rows={4}
                value={draft.personal_contribution}
                onChange={(e) => setDraft({ ...draft, personal_contribution: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="project_ai_notes">AI notes</Label>
              <Textarea
                id="project_ai_notes"
                rows={3}
                value={draft.ai_notes}
                onChange={(e) => setDraft({ ...draft, ai_notes: e.target.value })}
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save project"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setDraft(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {projects.length === 0 ? (
          <Card>
            <CardDescription>No projects yet.</CardDescription>
          </Card>
        ) : (
          projects.map((project) => (
            <Card key={project.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-medium">{project.name}</h3>
                  {project.github_url ? (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-accent hover:underline"
                    >
                      {project.github_url}
                    </a>
                  ) : null}
                  <p className="mt-2 text-sm text-muted">
                    {project.technologies.join(", ") || "No technologies listed"}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm">{project.personal_contribution}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setDraft(project)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => deleteProject(project.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

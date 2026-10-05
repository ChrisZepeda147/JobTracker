import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ApplicationDashboard } from "@/components/dashboard/application-dashboard";
import { PageHeader, RunSearchButton } from "@/components/layout/sidebar";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  activeResumeName,
  formatCurrency,
  preferencesSalaryLabel,
  profileCompletionPercent,
} from "@/lib/utils/dashboard";
import { formatWorkLocationLine } from "@/lib/jobs/format";
import { DEFAULT_POSTED_WITHIN_DAYS } from "@/lib/jobs/constants";
import {
  isDashboardTopMatch,
  locationPrefsFromPreferences,
  sortJobsByMatchScore,
  TOP_MATCHES_LIMIT,
} from "@/lib/jobs/logic";
import { salaryPrefsFromPreferences } from "@/lib/jobs/salary-filter";
import type { CandidateProfile, JobPreferences, Project, Resume } from "@/lib/types/database";
import type { JobRecord, UserJobState } from "@/lib/types/jobs";

async function loadDashboardData(userId: string) {
  const supabase = await createClient();

  const [profileRes, resumesRes, projectsRes, prefsRes, jobsRes, statesRes] = await Promise.all([
    supabase.from("candidate_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("resumes").select("*").eq("user_id", userId).order("updated_at", { ascending: false }),
    supabase.from("projects").select("*").eq("user_id", userId),
    supabase.from("job_preferences").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("jobs")
      .select(
        "id, job_hash, title, company, location, description, job_url, salary_min, salary_max, posted_date, match_score, fit_reason, last_seen_at",
      )
      .order("match_score", { ascending: false, nullsFirst: false })
      .limit(200),
    supabase.from("user_job_states").select("*").eq("user_id", userId),
  ]);

  const jobs = (jobsRes.data ?? []) as Omit<JobRecord, "user_state">[];
  const states = (statesRes.data ?? []) as UserJobState[];
  const stateMap = new Map(states.map((state) => [state.job_id, state]));
  const merged: JobRecord[] = jobs.map((job) => ({
    ...job,
    user_state: stateMap.get(job.id),
  }));

  const preferences = (prefsRes.data as JobPreferences | null) ?? null;
  const excludedKeywords = (preferences?.excluded_keywords ?? [])
    .map((k) => k.trim())
    .filter(Boolean);
  const salaryPrefs = salaryPrefsFromPreferences(preferences);
  const locationPrefs = locationPrefsFromPreferences(preferences);
  const listingAgePrefs = {
    maxAgeDays: preferences?.posted_within_days ?? DEFAULT_POSTED_WITHIN_DAYS,
    includeOlder: false,
  };
  const topMatches = sortJobsByMatchScore(
    merged.filter((job) =>
      isDashboardTopMatch(
        job,
        excludedKeywords,
        salaryPrefs,
        preferences?.max_preferred_experience_years ?? null,
        locationPrefs,
        listingAgePrefs,
      ),
    ),
  ).slice(0, TOP_MATCHES_LIMIT);

  const appliedAtTimestamps = states
    .filter((state) => state.status === "applied" && state.applied_at)
    .map((state) => state.applied_at as string);

  return {
    profile: (profileRes.data as CandidateProfile | null) ?? null,
    resumes: (resumesRes.data as Resume[]) ?? [],
    projects: (projectsRes.data as Project[]) ?? [],
    preferences,
    topMatches,
    appliedAtTimestamps,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { profile, resumes, projects, preferences, topMatches, appliedAtTimestamps } =
    await loadDashboardData(user.id);
  const completion = profileCompletionPercent(profile);
  const displayName = profile?.full_name || user.email?.split("@")[0] || "there";

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${displayName}`}
        description="Track applications, hit your daily goal, and jump into top matches."
        action={<RunSearchButton />}
      />

      <div className="mb-8">
        <ApplicationDashboard appliedAtTimestamps={appliedAtTimestamps} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Profile completion</CardDescription>
            <CardTitle>{completion}%</CardTitle>
          </CardHeader>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full rounded-full bg-accent" style={{ width: `${completion}%` }} />
          </div>
          <Link href="/profile" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
            Complete profile
          </Link>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Active resume</CardDescription>
            <CardTitle className="truncate">{activeResumeName(resumes)}</CardTitle>
          </CardHeader>
          <Link href="/resumes" className="text-sm font-medium text-accent hover:underline">
            Manage resumes
          </Link>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Projects stored</CardDescription>
            <CardTitle>{projects.length}</CardTitle>
          </CardHeader>
          <Link href="/projects" className="text-sm font-medium text-accent hover:underline">
            View projects
          </Link>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Target salary</CardDescription>
            <CardTitle>{preferencesSalaryLabel(preferences)}</CardTitle>
          </CardHeader>
          <p className="text-xs text-muted">
            Min {formatCurrency(preferences?.salary_min)} · Max {formatCurrency(preferences?.salary_max)}
          </p>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Top matches</CardTitle>
            <CardDescription>
              Highest-scoring jobs within your commute range (up to {TOP_MATCHES_LIMIT}).
            </CardDescription>
          </CardHeader>
          {topMatches.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-zinc-50 px-4 py-10 text-center text-sm text-muted">
              No jobs yet. Set your home zip in Job Preferences, then queue a search.
            </div>
          ) : (
            <div className="space-y-3">
              {topMatches.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs?job=${job.id}`}
                  className="flex items-start justify-between gap-4 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-zinc-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{job.title}</p>
                    <p className="truncate text-sm text-muted">
                      {job.company} ·{" "}
                      {formatWorkLocationLine(
                        {
                          title: job.title,
                          location: job.location,
                          description: job.description,
                        },
                        job.user_state?.commute_miles,
                        job.user_state?.work_arrangement,
                      )}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {job.match_score != null ? (
                      <Badge variant="accent">{job.match_score}% match</Badge>
                    ) : (
                      <Badge variant="muted">Unscored</Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick setup</CardTitle>
            <CardDescription>Get the most from scoring once the pipeline connects.</CardDescription>
          </CardHeader>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/profile" className="font-medium text-accent hover:underline">
                Add your profile
              </Link>
            </li>
            <li>
              <Link href="/resumes" className="font-medium text-accent hover:underline">
                Paste an active resume
              </Link>
            </li>
            <li>
              <Link href="/job-preferences" className="font-medium text-accent hover:underline">
                Set salary and location preferences
              </Link>
            </li>
            <li>
              <Link href="/projects" className="font-medium text-accent hover:underline">
                Document portfolio projects
              </Link>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

import type { CandidateProfile, JobPreferences, Resume } from "@/lib/types/database";

const PROFILE_FIELDS: (keyof CandidateProfile)[] = [
  "full_name",
  "current_title",
  "location",
  "software_experience_years",
  "education",
  "professional_summary",
  "technical_skills",
  "professional_strengths",
];

export function profileCompletionPercent(profile: CandidateProfile | null): number {
  if (!profile) return 0;

  let filled = 0;
  for (const field of PROFILE_FIELDS) {
    const value = profile[field];
    if (Array.isArray(value) ? value.length > 0 : value !== null && value !== "") {
      filled += 1;
    }
  }
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "Not set";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function preferencesSalaryLabel(prefs: JobPreferences | null): string {
  if (!prefs) return "Not set";
  if (prefs.salary_preferred != null) return formatCurrency(prefs.salary_preferred);
  if (prefs.salary_min != null) return formatCurrency(prefs.salary_min);
  return "Not set";
}

export function activeResumeName(resumes: Resume[]): string {
  return resumes.find((r) => r.is_active)?.name ?? "None selected";
}

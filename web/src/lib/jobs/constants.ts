export const MAX_SEARCH_TITLES = 5;

export const JOB_SOURCES = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "indeed", label: "Indeed" },
  { id: "zip_recruiter", label: "ZipRecruiter" },
  { id: "wellfound", label: "Wellfound" },
  { id: "builtin", label: "Built In" },
  { id: "company_career_pages", label: "Company Career Pages" },
] as const;

export type JobSourceId = (typeof JOB_SOURCES)[number]["id"];

export const DEFAULT_SEARCH_SOURCES: JobSourceId[] = ["linkedin", "indeed", "builtin"];

/** Boards wired in the worker (some may still return 0 jobs when a site blocks bots). */
export const IMPLEMENTED_SEARCH_SOURCES = new Set<JobSourceId>([
  "linkedin",
  "indeed",
  "builtin",
  "zip_recruiter",
  "wellfound",
  "company_career_pages",
]);

export const POSTED_WITHIN_OPTIONS = [
  { value: 1, label: "24 hours" },
  { value: 3, label: "3 days" },
  { value: 7, label: "7 days" },
  { value: 14, label: "2 weeks" },
  { value: 21, label: "3 weeks (default)" },
  { value: 30, label: "1 month" },
  { value: 60, label: "2 months" },
] as const;

export const DEFAULT_POSTED_WITHIN_DAYS = 21;

export const ONSITE_MILES_OPTIONS = [
  { value: 10, label: "10 miles" },
  { value: 20, label: "20 miles" },
  { value: 40, label: "40 miles" },
  { value: 50, label: "50 miles" },
  { value: 100, label: "100 miles" },
] as const;

export const JOB_TABS = [
  { id: "new", label: "New" },
  { id: "new_remote", label: "New Remote" },
  { id: "recommended", label: "Recommended" },
  { id: "apply_later", label: "Apply Later" },
  { id: "needs_decision", label: "Needs Decision" },
  { id: "applied", label: "Applied" },
  { id: "skipped", label: "Skipped" },
] as const;

export type JobTabId = (typeof JOB_TABS)[number]["id"];

export type UserJobStatus =
  | "new"
  | "recommended"
  | "apply_later"
  | "opened"
  | "applied"
  | "skipped"
  | "interview"
  | "rejected"
  | "offer";

export const SKIP_REASONS = [
  { id: "salary_too_low", label: "Salary too low" },
  { id: "salary_too_high", label: "Salary too high" },
  { id: "too_senior", label: "Too senior" },
  { id: "experience_requirement", label: "Experience requirement" },
  { id: "wrong_location", label: "Wrong location" },
  { id: "tech_stack", label: "Tech stack" },
  { id: "education_requirement", label: "Education requirement" },
  { id: "employment_type", label: "Employment type" },
  { id: "company", label: "Company" },
  { id: "not_interested", label: "Not interested" },
  { id: "other", label: "Other" },
] as const;

export type SkipReasonId = (typeof SKIP_REASONS)[number]["id"];

export const RECOMMENDED_MIN_SCORE = 75;

export type SearchRequestStatus = "pending" | "running" | "completed" | "failed";

export const TOP_MATCHES_LIMIT = 15;

import type { SkipReasonId, UserJobStatus } from "@/lib/jobs/constants";

export type JobRecord = {
  id: string;
  job_hash: string;
  title: string;
  company: string;
  location: string;
  job_url: string;
  description: string;
  site: string;
  salary_min: number | null;
  salary_max: number | null;
  posted_date: string | null;
  match_score: number | null;
  fit_reason: string | null;
  missing_skills: string[] | null;
  experience_requirement: string | null;
  scored_by: string | null;
  last_seen_at: string;
  user_state?: UserJobState;
};

export type UserJobState = {
  user_id: string;
  job_id: string;
  status: UserJobStatus;
  apply_clicked_at: string | null;
  applied_at: string | null;
  skip_reason: SkipReasonId | null;
  user_notes: string;
  created_at: string;
  updated_at: string;
};

export type JobSearchRequest = {
  id: string;
  user_id: string;
  query: string;
  titles: string[];
  location: string;
  location_zip: string | null;
  salary_min: number | null;
  salary_max: number | null;
  posted_within_days: number | null;
  remote_allowed: boolean;
  hybrid_allowed: boolean;
  onsite_allowed: boolean;
  max_onsite_miles: number | null;
  sources: string[];
  status: "pending" | "running" | "completed" | "failed";
  rescore_only?: boolean;
  jobs_found: number;
  new_jobs_found: number;
  error: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

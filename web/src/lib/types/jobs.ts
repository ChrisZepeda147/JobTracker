import type { SkipReasonId, UserJobStatus } from "@/lib/jobs/constants";

export type JobRecord = {
  id: string;
  job_hash: string;
  title: string;
  company: string;
  location: string;
  job_url: string;
  /** Omitted on list loads for speed; filters use worker-written user_state when set. */
  description?: string | null;
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
  commute_miles: number | null;
  work_arrangement: "remote" | "hybrid" | "onsite" | "unknown" | null;
  location_status: "pass" | "rejected" | "unverified" | null;
  salary_status: "pass" | "rejected" | "unknown" | null;
  keyword_status: "pass" | "rejected" | null;
  experience_status: "pass" | "rejected" | "unknown" | null;
  education_status: "pass" | "rejected" | null;
  management_status: "pass" | "rejected" | null;
  seniority_status: "pass" | "rejected" | null;
  listing_status: "open" | "closed" | "unknown" | null;
  listing_checked_at: string | null;
  listing_check_reason: string | null;
  filter_reason: string | null;
  is_stretch: boolean | null;
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
  refilter_only?: boolean;
  nationwide_remote?: boolean;
  jobs_found: number;
  new_jobs_found: number;
  error: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

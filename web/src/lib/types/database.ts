export type CandidateProfile = {
  user_id: string;
  full_name: string;
  current_title: string;
  location: string;
  software_experience_years: number | null;
  education: string;
  professional_summary: string;
  technical_skills: string[];
  professional_strengths: string[];
  additional_context: string;
  created_at: string;
  updated_at: string;
};

export type Resume = {
  id: string;
  user_id: string;
  name: string;
  target_role: string;
  resume_text: string;
  ai_notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  user_id: string;
  name: string;
  github_url: string;
  technologies: string[];
  readme_text: string;
  personal_contribution: string;
  ai_notes: string;
  created_at: string;
  updated_at: string;
};

export type JobPreferences = {
  user_id: string;
  target_roles: string[];
  salary_min: number | null;
  salary_preferred: number | null;
  salary_max: number | null;
  max_preferred_experience_years: number | null;
  preferred_locations: string[];
  remote_allowed: boolean;
  hybrid_allowed: boolean;
  onsite_allowed: boolean;
  home_zip: string | null;
  max_commute_miles: number | null;
  excluded_seniority: string[];
  excluded_keywords: string[];
  additional_instructions: string;
  search_sources: string[];
  posted_within_days: number | null;
  created_at: string;
  updated_at: string;
};

export type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  description?: string;
  job_url: string;
  match_score: number | null;
  fit_reason: string | null;
  status: string;
  last_seen_at: string;
};

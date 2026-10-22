import type { SupabaseClient } from "@supabase/supabase-js";
import { mergeJobsWithStates } from "@/lib/jobs/logic";
import type { JobRecord, UserJobState } from "@/lib/types/jobs";

/** Columns for list views — omit description (often 10–50KB per row). */
export const JOB_LIST_SELECT =
  "id, job_hash, title, company, location, job_url, site, salary_min, salary_max, posted_date, match_score, fit_reason, missing_skills, experience_requirement, scored_by, last_seen_at";

export const USER_STATE_SELECT =
  "user_id, job_id, status, apply_clicked_at, applied_at, skip_reason, user_notes, commute_miles, work_arrangement, location_status, salary_status, keyword_status, experience_status, education_status, management_status, seniority_status, listing_status, listing_checked_at, listing_check_reason, filter_reason, is_stretch, created_at, updated_at";

const JOB_ID_CHUNK = 80;

async function fetchJobsByIds(
  supabase: SupabaseClient,
  jobIds: string[],
): Promise<Omit<JobRecord, "user_state">[]> {
  if (jobIds.length === 0) return [];

  const rows: Omit<JobRecord, "user_state">[] = [];
  for (let i = 0; i < jobIds.length; i += JOB_ID_CHUNK) {
    const chunk = jobIds.slice(i, i + JOB_ID_CHUNK);
    const { data, error } = await supabase.from("jobs").select(JOB_LIST_SELECT).in("id", chunk);
    if (error) throw error;
    for (const row of data ?? []) {
      rows.push({ ...row, description: "" } as Omit<JobRecord, "user_state">);
    }
  }
  return rows;
}

/** Load jobs the user has state for (not the global jobs table scan). */
export async function fetchUserJobRecords(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ jobs: JobRecord[]; error: string | null }> {
  const { data: states, error: statesError } = await supabase
    .from("user_job_states")
    .select(USER_STATE_SELECT)
    .eq("user_id", userId);

  if (statesError) {
    return { jobs: [], error: statesError.message };
  }

  const userStates = (states ?? []) as UserJobState[];
  const jobIds = [...new Set(userStates.map((s) => s.job_id))];

  try {
    const jobRows = await fetchJobsByIds(supabase, jobIds);
    return {
      jobs: mergeJobsWithStates(jobRows, userStates),
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load jobs";
    return { jobs: [], error: message };
  }
}

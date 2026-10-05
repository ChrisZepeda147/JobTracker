import { createClient } from "@/lib/supabase/client";

/** Queue a worker pass to re-run hard filters (salary, location, keywords, experience) on stored jobs. */
export async function queuePreferenceRefilter(userId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("job_search_requests").insert({
    user_id: userId,
    query: "",
    titles: [],
    location: "",
    sources: [],
    refilter_only: true,
    status: "pending",
  });
  if (error) {
    throw new Error(error.message);
  }
}

/** Queue a worker pass to re-score stored jobs using current preferences and resume. */
export async function queueJobRescore(userId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("job_search_requests").insert({
    user_id: userId,
    query: "",
    titles: [],
    location: "",
    sources: [],
    rescore_only: true,
    status: "pending",
  });
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Re-check stored jobs against current preferences, then re-rank them.
 * Used after salary or other preference changes — filters run first, then rescore.
 */
export async function queueReevaluateStoredJobs(userId: string): Promise<void> {
  await queuePreferenceRefilter(userId);
  await queueJobRescore(userId);
}

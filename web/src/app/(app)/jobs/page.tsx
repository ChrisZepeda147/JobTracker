import { createClient } from "@/lib/supabase/server";
import { JobsBoard } from "@/components/jobs/jobs-board";
import type { JobPreferences } from "@/lib/types/database";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const { job: focusJobId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: preferences } = await supabase
    .from("job_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <JobsBoard
      userId={user.id}
      preferences={(preferences as JobPreferences) ?? null}
      focusJobId={focusJobId ?? null}
    />
  );
}

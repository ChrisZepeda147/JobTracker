import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/sidebar";
import { JobPreferencesForm } from "@/components/preferences/job-preferences-form";

export default async function JobPreferencesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="Job Preferences"
        description="Salary, location, and filtering rules for your search."
      />
      <JobPreferencesForm userId={user.id} />
    </div>
  );
}

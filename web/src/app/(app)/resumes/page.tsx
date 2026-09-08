import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/sidebar";
import { ResumesManager } from "@/components/resumes/resumes-manager";

export default async function ResumesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="Resumes"
        description="Maintain multiple resume versions. One active resume is used for scoring."
      />
      <ResumesManager userId={user.id} />
    </div>
  );
}

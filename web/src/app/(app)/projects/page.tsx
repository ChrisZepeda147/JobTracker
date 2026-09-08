import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/sidebar";
import { ProjectsManager } from "@/components/projects/projects-manager";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Portfolio projects that help the matcher understand your experience."
      />
      <ProjectsManager userId={user.id} />
    </div>
  );
}

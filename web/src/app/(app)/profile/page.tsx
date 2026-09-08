import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/sidebar";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Your background and strengths, used to personalize matching."
      />
      <ProfileForm userId={user.id} />
    </div>
  );
}

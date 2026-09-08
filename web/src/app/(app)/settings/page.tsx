import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/sidebar";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return (
    <div>
      <PageHeader title="Settings" description="Account and workspace settings." />
      <div className="grid gap-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Signed in as {user.email}</CardDescription>
          </CardHeader>
          <SignOutButton />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pipeline integration</CardTitle>
            <CardDescription>
              The Python CLI continues to run independently. A future milestone will
              trigger searches from this dashboard and sync context automatically.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <Button
      variant={compact ? "ghost" : "secondary"}
      onClick={signOut}
      className={compact ? "px-2 py-1 text-xs" : "w-full"}
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  );
}

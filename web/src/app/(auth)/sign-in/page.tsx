"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/supabase/config-error";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void createClient().auth.signOut({ scope: "local" });
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (authError) {
      setError(authErrorMessage(authError));
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Access your JobTracker workspace.</CardDescription>
      </CardHeader>
      {!isSupabaseConfigured() ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Missing Supabase config. Copy{" "}
          <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> into{" "}
          <code className="text-xs">web/.env.local</code> (see repo{" "}
          <code className="text-xs">.env.example</code>).
        </p>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {callbackError ? <p className="text-sm text-red-600">{callbackError}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        No account?{" "}
        <Link href="/sign-up" className="font-medium text-accent hover:underline">
          Create one
        </Link>
      </p>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
      <SignInForm />
    </Suspense>
  );
}

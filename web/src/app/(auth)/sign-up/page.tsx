"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getAuthCallbackUrl,
  MIN_PASSWORD_LENGTH,
  validatePassword,
} from "@/lib/auth/redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void createClient().auth.signOut({ scope: "local" });
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const validationError = validatePassword(password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setMessage(
      "Check your email to confirm your account, then sign in. Open the link on the same device you used to sign up, or sign up using your computer's network address if confirming on your phone.",
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Start building your job search profile.</CardDescription>
      </CardHeader>
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
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mt-1 text-xs text-muted">
            At least {MIN_PASSWORD_LENGTH} characters.
          </p>
        </div>
        <div>
          <Label htmlFor="confirm_password">Confirm password</Label>
          <Input
            id="confirm_password"
            type="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}

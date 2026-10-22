export const SUPABASE_CONNECTION_HINT =
  "Cannot reach Supabase. If the project was paused (free tier inactivity), open supabase.com → JobHunter → Restore project, then run npm run check:supabase. Also check VPN/firewall and web/.env.local URL (https://xxxx.supabase.co).";

export function authErrorMessage(error: { message?: string; name?: string; code?: string }): string {
  const msg = error.message ?? "";
  const code = error.code ?? "";
  if (/fetch failed|failed to fetch|network|timeout|abort/i.test(msg)) {
    return SUPABASE_CONNECTION_HINT;
  }
  if (/refresh_token|session/i.test(msg) || code === "refresh_token_not_found") {
    return "Session expired after the database was restored. Refresh this page and sign in again.";
  }
  return msg || "Sign in failed.";
}

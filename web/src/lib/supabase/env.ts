const FETCH_TIMEOUT_MS = 8_000;

export function supabaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
}

export function supabaseAnonKey(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}

/** Fail fast instead of Supabase auth retrying for ~25s on network/DNS errors. */
export function supabaseFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const signal =
    init?.signal ??
    AbortSignal.timeout(FETCH_TIMEOUT_MS);
  return fetch(input, { ...init, signal });
}

export function supabaseAuthCookieNames(): string[] {
  return ["-auth-token", "-auth-token-code-verifier"];
}

export function requestHasSupabaseSession(request: { cookies: { getAll: () => { name: string }[] } }): boolean {
  const markers = supabaseAuthCookieNames();
  return request.cookies.getAll().some((cookie) =>
    markers.some((marker) => cookie.name.includes(marker)),
  );
}

/** Drop stale sb-* cookies (e.g. after Supabase project restore invalidates refresh tokens). */
export function clearSupabaseAuthCookies(
  request: { cookies: { getAll: () => { name: string }[] } },
  response: { cookies: { set: (name: string, value: string, options?: { maxAge?: number; path?: string }) => void } },
): void {
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("sb-")) {
      response.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
    }
  }
}

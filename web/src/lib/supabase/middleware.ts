import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  clearSupabaseAuthCookies,
  isSupabaseConfigured,
  requestHasSupabaseSession,
  supabaseAnonKey,
  supabaseFetch,
  supabaseUrl,
} from "@/lib/supabase/env";

function isProtectedPath(path: string): boolean {
  return (
    path.startsWith("/dashboard") ||
    path.startsWith("/profile") ||
    path.startsWith("/resumes") ||
    path.startsWith("/projects") ||
    path.startsWith("/job-preferences") ||
    path.startsWith("/jobs") ||
    path.startsWith("/settings")
  );
}

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith("/sign-in") || path.startsWith("/sign-up");
  const isProtected = isProtectedPath(path);
  const hasSessionCookie = requestHasSupabaseSession(request);

  if (!isSupabaseConfigured()) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("error", "Supabase is not configured in web/.env.local.");
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  // Never refresh session on auth pages — stale refresh tokens blocked login for ~25s.
  if (isAuthRoute) {
    const response = NextResponse.next({ request });
    clearSupabaseAuthCookies(request, response);
    return response;
  }

  // Avoid a Supabase round-trip on every anonymous visit (was ~25s when fetch failed).
  if (!hasSessionCookie) {
    if (path === "/" || path === "") {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    global: { fetch: supabaseFetch },
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  let user = null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      user = null;
    } else {
      user = data.session?.user ?? null;
    }
  } catch {
    user = null;
  }

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirect", path);
    const response = NextResponse.redirect(url);
    clearSupabaseAuthCookies(request, response);
    return response;
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (path === "/" || path === "") {
    return NextResponse.redirect(
      new URL(user ? "/dashboard" : "/sign-in", request.url),
    );
  }

  return supabaseResponse;
}

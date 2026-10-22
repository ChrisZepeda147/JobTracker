import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseFetch, supabaseUrl } from "@/lib/supabase/env";

export function createClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey(), {
    global: { fetch: supabaseFetch },
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
    },
  });
}

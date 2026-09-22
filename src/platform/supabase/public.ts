import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/platform/env/public";
import type { Database } from "@/platform/supabase/types";

// Cookie-less anon client for public-site reads. Public pages never carry an
// admin session (ADR-004), so reads here see only what RLS grants `anon`:
// published + public rows. Safe to use inside cached functions.
export function createPublicClient() {
  const env = getSupabasePublicEnv();
  return createSupabaseClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

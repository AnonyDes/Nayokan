import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/platform/env/public";
import type { Database } from "@/platform/supabase/types";

// RLS-scoped client for Server Components, Server Actions and route handlers.
// Almost all application code uses this. See service.ts for the narrow
// exceptions that bypass RLS.
export async function createClient() {
  const env = getSupabasePublicEnv();
  const cookieStore = await cookies();
  return createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called during a Server Component render; proxy.ts refreshes the session.
        }
      },
    },
  });
}

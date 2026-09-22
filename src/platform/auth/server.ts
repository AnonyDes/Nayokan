import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

// Staff-facing Supabase client bound to the admin-host session cookies.
// Hostname is never a security input — every query runs under the user's own
// JWT and Postgres RLS (app.has_permission) enforces authorization.

function env() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return { url, key };
}

/** Request-scoped client that can read + write auth cookies (Route Handlers, Server Actions). */
export async function createMutableServerClient(): Promise<SupabaseClient> {
  const store = await cookies();
  const { url, key } = env();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        for (const { name, value, options } of list) {
          store.set(name, value, options);
        }
      },
    },
  });
}

/** Read-only client for RSC pages — cookie writes are swallowed (session refresh lives in proxy.ts). */
export async function createServerReadClient(): Promise<SupabaseClient> {
  const store = await cookies();
  const { url, key } = env();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: () => {},
    },
  });
}

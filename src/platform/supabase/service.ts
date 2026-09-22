import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/platform/env/public";
import { requireSecret } from "@/platform/env/server";
import type { Database } from "@/platform/supabase/types";

// Bypasses RLS entirely. Allowed uses ONLY:
//   - seed scripts and test fixtures
//   - Auth Admin API calls with no non-admin equivalent (inviting staff)
//   - scheduled jobs that run outside any user session
//   - minting signed upload/download URLs for paths a SECURITY DEFINER RPC
//     already validated (application documents, evidence)
// Public form submissions go through SECURITY DEFINER RPCs callable by
// `anon`, never through this client. A new import of this file outside the
// cases above is a defect; flag it in review.
export function createServiceClient() {
  const env = getSupabasePublicEnv();
  return createSupabaseClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, requireSecret("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// RLS fixtures (MEMEX pattern ported under ADR-002). Builds four staff users
// via the service-role client — the one legitimate use of that key outside
// app code — then hands back anon-key clients signed in as each user so
// tests exercise RLS exactly as a real request would. Everything is
// prefixed `rls-<RUN_ID>-` and torn down in afterAll.
//
// Staff matrix of fixtures:
//   superAdmin        role super_admin        no scope rows (exempt)
//   pmVti             role programme_manager  scope vti
//   editorAll         role content_editor     scope all
//   reviewerStartup   role reviewer           scope startup
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEMO_PASSWORD = "RlsTest!2026Nayokan";
const RUN_ID = Math.random().toString(36).slice(2, 8);

export function serviceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — the RLS suite needs the dev/test project keys in .env.local.",
    );
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export function anonClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY not set.");
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export type StaffName = "superAdmin" | "pmVti" | "editorAll" | "reviewerStartup";

export type Fixtures = {
  clients: Record<StaffName, SupabaseClient> & { anonymous: SupabaseClient };
  userIds: Record<StaffName, string>;
  service: SupabaseClient;
};

async function createSignedInUser(
  service: SupabaseClient,
  email: string,
  fullName: string,
): Promise<{ id: string; client: SupabaseClient }> {
  const { data, error } = await service.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw new Error(`createUser(${email}): ${error.message}`);

  const client = anonClient();
  const { error: signInErr } = await client.auth.signInWithPassword({ email, password: DEMO_PASSWORD });
  if (signInErr) throw new Error(`signIn(${email}): ${signInErr.message}`);

  return { id: data.user.id, client };
}

const STAFF: Record<StaffName, { role: string; scopes: string[] }> = {
  superAdmin: { role: "super_admin", scopes: [] },
  pmVti: { role: "programme_manager", scopes: ["vti"] },
  editorAll: { role: "content_editor", scopes: ["all"] },
  reviewerStartup: { role: "reviewer", scopes: ["startup"] },
};

export async function setupFixtures(): Promise<Fixtures> {
  const service = serviceClient();
  const clients = {} as Fixtures["clients"];
  const userIds = {} as Fixtures["userIds"];

  for (const [name, def] of Object.entries(STAFF) as [StaffName, (typeof STAFF)[StaffName]][]) {
    const user = await createSignedInUser(service, `rls-${RUN_ID}-${name}@nayokan-test.local`, `RLS ${name}`);

    // The signup trigger creates an 'invited' profile with no role.
    // Promote it to an active, roled profile as the service role (the guard
    // trigger and column grants both allow service_role).
    const { error: profileErr } = await service
      .from("profiles")
      .update({ role_key: def.role, status: "active" })
      .eq("id", user.id);
    if (profileErr) throw profileErr;

    if (def.scopes.length > 0) {
      const { error: scopeErr } = await service
        .from("user_site_scopes")
        .insert(def.scopes.map((site) => ({ user_id: user.id, site })));
      if (scopeErr) throw scopeErr;
    }

    clients[name] = user.client;
    userIds[name] = user.id;
  }

  clients.anonymous = anonClient();
  return { clients, userIds, service };
}

export async function teardownFixtures(fx: Fixtures) {
  const { data } = await fx.service.auth.admin.listUsers({ perPage: 200 });
  for (const u of data?.users ?? []) {
    if (u.email?.startsWith(`rls-${RUN_ID}-`)) {
      await fx.service.auth.admin.deleteUser(u.id);
    }
  }
}

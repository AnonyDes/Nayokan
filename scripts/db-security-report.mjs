// Grant-matrix security report (port of MEMEX security_grant_report).
// Asserts, against the live project via the Management API:
//   1. every table in the public schema has RLS enabled;
//   2. no function in public/app is EXECUTE-able by anon, except an
//      allowlist of intentionally public RPCs (submission endpoints etc.).
// Exits non-zero on any finding so CI can gate on it.
//
// Usage: node scripts/db-security-report.mjs
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const REF = process.env.SUPABASE_PROJECT_REF ?? "ofltuujurdnirgoutevp";
const TOKEN = process.env.SUPABASE_ACCESS_KEY;

// Public write RPCs callable by anon on purpose (SECURITY DEFINER, rate
// limited). Grow this list deliberately, never casually.
const ANON_FUNCTION_ALLOWLIST = new Set([
  "public.submit_application(p_site site_id, p_full_name text, p_email text, p_motivation text, p_programme_id uuid, p_opportunity_id uuid, p_phone text, p_city_region text, p_age_band text, p_education_level text, p_occupation text, p_plans text, p_preferred_cluster_id uuid, p_secondary_interests text[], p_consents jsonb, p_source_url text, p_source_host text, p_ip text, p_honeypot text)",
  "public.submit_enquiry(p_site site_id, p_category text, p_name text, p_email text, p_message text, p_organization text, p_property_id uuid, p_programme_id uuid, p_source_page text, p_source_url text, p_source_host text, p_ip text, p_honeypot text)",
  "public.register_application_document(p_application_id uuid, p_file_name text, p_mime_type text, p_size_bytes integer)",
  "public.confirm_application_document(p_document_id uuid)",
]);

if (!TOKEN) {
  console.error("SUPABASE_ACCESS_KEY missing from .env.local");
  process.exit(1);
}

async function query(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 800)}`);
  return JSON.parse(text);
}

let failures = 0;

const rlsOff = await query(`
  select tablename from pg_tables
  where schemaname = 'public' and not rowsecurity
  order by 1;
`);
if (rlsOff.length > 0) {
  failures += rlsOff.length;
  console.error("FAIL: public tables without RLS:", rlsOff.map((r) => r.tablename).join(", "));
} else {
  console.log("ok: every public table has RLS enabled");
}

const anonFns = await query(`
  select n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' as fn
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public', 'app')
    and has_function_privilege('anon', p.oid, 'execute')
  order by 1;
`);
const unexpected = anonFns.filter((r) => !ANON_FUNCTION_ALLOWLIST.has(r.fn));
if (unexpected.length > 0) {
  failures += unexpected.length;
  console.error("FAIL: functions executable by anon:", unexpected.map((r) => r.fn).join("\n  "));
} else {
  console.log(`ok: anon EXECUTE surfaces limited to allowlist (${anonFns.length} allowlisted)`);

}

// Bonus surface check: which public-schema tables can anon even touch (RLS
// decides rows; this lists tables with any policy covering anon at all).
const anonPolicies = await query(`
  select schemaname, tablename, policyname, cmd from pg_policies
  where schemaname = 'public' and ('anon' = any(roles) or roles = '{public}')
  order by 1, 2;
`);
console.log(`info: ${anonPolicies.length} policy(ies) visible to anon:`);
for (const p of anonPolicies) console.log(`  ${p.tablename} · ${p.policyname} · ${p.cmd}`);

process.exit(failures === 0 ? 0 : 1);

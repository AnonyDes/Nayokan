// Applies hand-written migrations from supabase/migrations to the linked
// project through the Management API query endpoint, using the personal
// access token (SUPABASE_ACCESS_KEY). Used because the Supabase DB password
// is not available locally, so `supabase db push` cannot connect directly.
//
// Records each applied version in supabase_migrations.schema_migrations in
// the same shape the CLI uses, so `supabase migration list` stays truthful
// once the CLI can connect.
//
// Usage: node scripts/db-apply.mjs [--dry-run]
import { config as loadEnv } from "dotenv";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const REF = process.env.SUPABASE_PROJECT_REF ?? "ofltuujurdnirgoutevp";
const TOKEN = process.env.SUPABASE_ACCESS_KEY;
const DRY_RUN = process.argv.includes("--dry-run");

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
  return text;
}

const dir = path.resolve("supabase/migrations");
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

await query(`
  create schema if not exists supabase_migrations;
  create table if not exists supabase_migrations.schema_migrations (
    version text primary key,
    name text,
    statements text[],
    created_at timestamptz not null default now()
  );
`);

const appliedRows = JSON.parse(
  await query(`select version from supabase_migrations.schema_migrations`),
);
const applied = new Set(appliedRows.map((r) => r.version));

const pending = files.filter((f) => !applied.has(f.split("_")[0]));
for (const file of files) {
  if (applied.has(file.split("_")[0])) console.log(`skip ${file} (already applied)`);
}

if (DRY_RUN && pending.length > 0) {
  // One transaction across every pending migration so later files see earlier
  // objects; rolled back at the end so nothing persists.
  const sql = pending.map((f) => readFileSync(path.join(dir, f), "utf8")).join("\n");
  await query(`begin;\n${sql}\nrollback;`);
  console.log(`ok dry-run ${pending.length} migration(s), rolled back`);
  process.exit(0);
}

for (const file of pending) {
  const version = file.split("_")[0];
  const sql = readFileSync(path.join(dir, file), "utf8");
  console.log(`apply ${file} …`);
  await query(`begin;\n${sql}\ncommit;`);
  await query(
    `insert into supabase_migrations.schema_migrations (version, name) values ('${version}', '${file.replace(/\.sql$/, "").replace(/'/g, "''")}')`,
  );
  console.log(`ok ${file}`);
}

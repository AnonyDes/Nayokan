// One-off dev helper: publish seeded demo content through the real governance
// workflow (submit → approve → publish) so CONTENT_SOURCE=supabase renders the
// sites. Runs against the DEV project only; seeds keep provenance.isDemo so
// "tbc" tags still render. Usage:
//   SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=... node scripts/supabase-publish-seeds.mjs
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const REF = process.env.SUPABASE_PROJECT_REF;
if (!ACCESS_TOKEN || !REF) throw new Error("SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF required");

const q = async (query) => {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return r.text();
};

const admin = JSON.parse(await q("select id from profiles where role_key='super_admin' and status='active' limit 1"))[0].id;
const J = `{"sub":"${admin}"}`;
// Claim + statement in one call so the session GUC applies.
const asAdmin = (sql) => q(`select set_config('request.jwt.claims','${J}',true); ${sql}`);

// Publish preflight: site-owned rows need seo.title + seo.description.
const nameCol = { programmes: "name", clusters: "name", articles: "title", stories: "title", pages: "title", properties: "name", opportunities: "title", ventures: "name", partners: "name", people: "name", mentors: "name" };
const descCol = { programmes: "summary", clusters: "summary", articles: "excerpt", stories: "excerpt", properties: "summary", ventures: "description", mentors: "bio" };

for (const [table, name] of Object.entries(nameCol)) {
  const hasSeo = +JSON.parse(await q(`select count(*) c from information_schema.columns where table_schema='public' and table_name='${table}' and column_name='seo'`))[0].c;
  if (!hasSeo) continue;
  const desc = descCol[table] ? `coalesce(nullif(${descCol[table]},''),'Nayokan — to be confirmed')` : `'Nayokan — to be confirmed'`;
  const out = await asAdmin(
    `update ${table} set seo=jsonb_build_object('title',coalesce(nullif(${name},''),'Nayokan'),'description',${desc}) where coalesce(seo->>'title','')='' or coalesce(seo->>'description','')=''`,
  );
  console.log("seo", table, out.slice(0, 140));
}

// Preflight media: articles/stories need cover; programmes/clusters need hero.
for (const [table, col, offset] of [
  ["programmes", "hero_media_id", 1],
  ["clusters", "hero_media_id", 2],
  ["articles", "cover_media_id", 3],
  ["stories", "cover_media_id", 4],
]) {
  const out = await asAdmin(
    `update ${table} set ${col}=(select id from media where bucket='public-media' and mime_type like 'image/%' order by path offset ${offset} limit 1) where ${col} is null`,
  );
  console.log("media", table, out.slice(0, 140));
}

// Ventures need placements to appear on a site portfolio.
console.log("venture placements", (await asAdmin(`insert into venture_placements (venture_id, site, world, listing_status, sort_order, is_public)
  select v.id, 'startup', 'startup', 'active', row_number() over (order by v.slug), true
  from ventures v where not exists (select 1 from venture_placements p where p.venture_id = v.id)`)).slice(0, 140));

// Publish through the workflow: submit → approve → publish.
for (const table of ["programmes", "clusters", "opportunities", "mentors", "properties", "stories", "articles", "ventures", "partners", "people", "pages"]) {
  const rows = JSON.parse(await q(`select id from ${table}`));
  let ok = 0;
  for (const { id } of rows) {
    let failed = false;
    for (const action of ["submit", "approve", "publish"]) {
      const res = await asAdmin(`select * from transition_content('${table}','${id}','${action}')`);
      if (res.includes("Failed to run sql query")) {
        console.log(`${table} ${id} ${action}:`, res.slice(0, 180));
        failed = true;
        break;
      }
    }
    if (!failed) ok++;
  }
  console.log(`${table}: published ${ok}/${rows.length}`);
  await new Promise((r) => setTimeout(r, 500)); // stay under management API throttle
}

console.log("home sections", (await q(`update site_home_sections set is_live=true where not is_live`)).slice(0, 140));
console.log("open programmes", (await asAdmin(`update programmes set application_open=true, status='open' where status_content='published' and application_open=false`)).slice(0, 140));
console.log("open opportunities", (await asAdmin(`update opportunities set status='open' where status_content='published' and status<>'open'`)).slice(0, 140));

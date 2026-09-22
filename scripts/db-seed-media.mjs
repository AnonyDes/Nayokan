// Seeds brand assets and design photos: uploads the binaries from
// Designs/assets to the public-media bucket and inserts matching rows into
// public.media. Idempotent (upsert on bucket+path).
//
// Usage: node scripts/db-seed-media.mjs
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import path from "node:path";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Supabase URL/service key missing from .env.local");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ASSETS = [
  { file: "Designs/assets/logo-lockup.svg", alt: "Nayokan logo lockup" },
  { file: "Designs/assets/logo-mark.svg", alt: "Nayokan logo mark" },
  { file: "Designs/assets/logo-original.png", alt: "Nayokan logo (original raster)" },
  ...Array.from({ length: 9 }, (_, i) => ({
    file: `Designs/assets/photos/nayokan-0${i + 1}.jpg`,
    alt: `Nayokan programme photo ${i + 1} (from the approved design package)`,
  })),
];

const MIME = { ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg" };

const { data: collection, error: collErr } = await supabase
  .from("media_collections")
  .upsert({ name: "design-assets", description: "Brand assets and photos from the approved Genspark design package." }, { onConflict: "name" })
  .select("id")
  .single();
if (collErr) throw collErr;

for (const asset of ASSETS) {
  const filename = path.basename(asset.file);
  const storagePath = `design-assets/${filename}`;
  const body = readFileSync(asset.file);
  const contentType = MIME[path.extname(asset.file)] ?? "application/octet-stream";

  const { error: upErr } = await supabase.storage
    .from("public-media")
    .upload(storagePath, body, { contentType, upsert: true });
  if (upErr) throw new Error(`upload ${storagePath}: ${upErr.message}`);

  const { error: rowErr } = await supabase.from("media").upsert(
    {
      bucket: "public-media",
      path: storagePath,
      filename,
      mime_type: contentType,
      size_bytes: body.byteLength,
      alt_text: asset.alt,
      source_credit: "Nayokan design package (Genspark)",
      collection_id: collection.id,
    },
    { onConflict: "bucket,path" },
  );
  if (rowErr) throw new Error(`media row ${storagePath}: ${rowErr.message}`);
  console.log(`ok ${storagePath} (${body.byteLength} bytes)`);
}
console.log(`done: ${ASSETS.length} assets`);

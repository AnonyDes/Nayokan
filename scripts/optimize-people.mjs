// Builds a responsive WebP variant for each real, named person's photo.
//   source:   art-source/people/<slug>.{jpg,webp,png}   (originals; not served)
//   output:   public/assets/photos/people/<slug>-<w>.webp
//   manifest: src/ui/media/people-manifest.json
//
// These are REAL, named, identifiable individuals (Nayokan leadership/board),
// supplied directly by Nayokan as ground truth — not the illustrative/AI
// pipeline (scripts/optimize-illustrative.mjs), and never rendered with an
// "Illustrative image" badge. Only add a file here for someone whose name,
// role and consent to publish are confirmed by Nayokan.
//
// Every photo is cropped to 3:4 (src/sites/corporate/styles/corporate.css
// .leader-portrait) at a canonical 1200x1600 canvas, then downsized, so
// framing is identical across variants regardless of the source's own
// aspect ratio. Set a per-slug crop focus in FOCUS below if the default
// (top-weighted centre, good for head-and-shoulders portraits) crops a
// face out of frame.
//
// Run after adding or replacing a source photo: npm run images:optimize:people
import { mkdir, readdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "art-source/people";
const OUT = "public/assets/photos/people";
const WIDTHS = [320, 640, 960];
const QUALITY = 82;
const CANVAS = { width: 1200, height: 1600 }; // 3:4

const FOCUS = {
  // sharp gravity/position keywords: "top" | "centre" | "north" etc.
  "yogo-melo": "north",
};

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const manifest = {};
for (const file of (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort()) {
  const name = path.parse(file).name;
  const cropped = sharp(path.join(SRC, file))
    .rotate()
    .resize({ ...CANVAS, fit: "cover", position: FOCUS[name] ?? "top" });

  const variants = [];
  for (const w of WIDTHS) {
    const out = path.join(OUT, `${name}-${w}.webp`);
    const info = await cropped.clone().resize({ width: w }).webp({ quality: QUALITY, effort: 5 }).toFile(out);
    variants.push({ w, bytes: info.size });
  }
  manifest[name] = { width: CANVAS.width, height: CANVAS.height, variants };
  console.log(name.padEnd(16), `${CANVAS.width}x${CANVAS.height}`, variants.map((v) => `${v.w}:${Math.round(v.bytes / 1024)}KB`).join(" "));
}
await writeFile("src/ui/media/people-manifest.json", JSON.stringify(manifest, null, 2) + "\n");

// Builds responsive WebP variants for the illustrative images.
//   source:  art-source/illustrative/<name>.jpg   (originals; not served)
//   output:  public/assets/photos/illustrative/<name>-<w>.webp
//   manifest: src/ui/media/illustrative-manifest.json
// Run after adding or replacing a source image: npm run images:optimize
import { mkdir, readdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "art-source/illustrative";
const OUT = "public/assets/photos/illustrative";
const WIDTHS = [480, 800, 1280];
const QUALITY = 72;

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const manifest = {};
let total = 0;
for (const file of (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort()) {
  const name = path.parse(file).name;
  const meta = await sharp(path.join(SRC, file)).metadata();
  const variants = [];
  // Never upscale: cap variants at the source width, keep at least one.
  const widths = [...new Set(WIDTHS.map((w) => Math.min(w, meta.width)))];
  for (const w of widths) {
    const out = path.join(OUT, `${name}-${w}.webp`);
    const info = await sharp(path.join(SRC, file)).rotate().resize({ width: w }).webp({ quality: QUALITY, effort: 5 }).toFile(out);
    variants.push({ w, bytes: info.size });
    total += info.size;
  }
  manifest[name] = { width: meta.width, height: meta.height, variants };
  console.log(name.padEnd(30), `${meta.width}x${meta.height}`, variants.map((v) => `${v.w}:${Math.round(v.bytes / 1024)}KB`).join(" "));
}
await writeFile("src/ui/media/illustrative-manifest.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`total served: ${(total / 1024 / 1024).toFixed(2)} MB`);

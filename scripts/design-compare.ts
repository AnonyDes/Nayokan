// Design-fidelity screenshot comparison (readiness-report §16 verification).
// Serves the read-only Genspark package in Designs/ over http, screenshots each
// page at four breakpoints, screenshots the matching app route on its real
// *.nayokan.localhost host, and pixel-diffs the pairs.
//
// Output is a triage aid, not a pass/fail gate: seeded content differs from the
// designs' fixed copy (real slugs, DB text, tbc tags, live imagery), so mismatch
// percentages are always non-zero even for a faithful port. Read the report and
// eyeball the diff images.
//
// Usage: PORT=3100 npx tsx scripts/design-compare.ts
// Requires the dev server already running on PORT.

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { chromium, type Browser, type Page } from "@playwright/test";
import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const ROOT = path.resolve(__dirname, "..");
const DESIGNS_DIR = path.join(ROOT, "Designs");
const OUT_DIR = path.join(ROOT, "design-compare-output");
const DESIGNS_PORT = 4300;
const APP_PORT = Number(process.env.PORT || 3100);
const BREAKPOINTS = [390, 768, 1280, 1440] as const;

const host = (sub: string) => `http://${sub ? `${sub}.` : ""}nayokan.localhost:${APP_PORT}`;

type SiteKey = "corporate" | "vti" | "startup";

interface ScreenPair {
  name: string;
  site: SiteKey;
  designFile: string;
  appPath: string;
  // For detail pages: scrape this listing route for the first href matching
  // `detailPattern` instead of hardcoding a slug (DB slugs differ from fixtures).
  listPath?: string;
  detailPattern?: RegExp;
}

const SCREENS: ScreenPair[] = [
  { name: "corp-home", site: "corporate", designFile: "index.html", appPath: "/" },
  { name: "corp-what-we-do", site: "corporate", designFile: "what-we-do.html", appPath: "/what-we-do" },
  { name: "corp-about", site: "corporate", designFile: "about.html", appPath: "/about" },
  { name: "corp-impact", site: "corporate", designFile: "impact.html", appPath: "/impact" },
  { name: "corp-partners", site: "corporate", designFile: "partners.html", appPath: "/partners" },
  { name: "corp-insights", site: "corporate", designFile: "insights.html", appPath: "/insights" },
  {
    name: "corp-article",
    site: "corporate",
    designFile: "article.html",
    appPath: "",
    listPath: "/insights",
    detailPattern: /href="\/insights\/[^"?#]+/,
  },
  { name: "corp-contact", site: "corporate", designFile: "contact.html", appPath: "/contact" },
  { name: "corp-programmes", site: "corporate", designFile: "programmes.html", appPath: "/programmes" },
  { name: "vc-home", site: "corporate", designFile: "venture-capital.html", appPath: "/venture-capital" },
  { name: "vc-approach", site: "corporate", designFile: "vc-approach.html", appPath: "/venture-capital/approach" },
  { name: "vc-pipeline", site: "corporate", designFile: "vc-pipeline.html", appPath: "/venture-capital/pipeline" },
  { name: "vc-portfolio", site: "corporate", designFile: "vc-portfolio.html", appPath: "/venture-capital/portfolio" },
  { name: "vc-partner", site: "corporate", designFile: "vc-partner.html", appPath: "/venture-capital/partner" },
  { name: "hosp-home", site: "corporate", designFile: "hospitality.html", appPath: "/hospitality" },
  { name: "hosp-properties", site: "corporate", designFile: "hospitality-properties.html", appPath: "/hospitality/properties" },
  {
    name: "hosp-property",
    site: "corporate",
    designFile: "property-detail.html",
    appPath: "",
    listPath: "/hospitality/properties",
    detailPattern: /href="\/hospitality\/properties\/[^"?#]+/,
  },
  { name: "vti-home", site: "vti", designFile: "vti.html", appPath: "/" },
  { name: "vti-programmes", site: "vti", designFile: "vti-programmes.html", appPath: "/programmes" },
  {
    name: "vti-programme",
    site: "vti",
    designFile: "programme-detail.html",
    appPath: "",
    listPath: "/programmes",
    detailPattern: /href="\/programmes\/[^"?#]+/,
  },
  { name: "vti-clusters", site: "vti", designFile: "vti-clusters.html", appPath: "/clusters" },
  {
    name: "vti-cluster",
    site: "vti",
    designFile: "cluster-detail.html",
    appPath: "",
    listPath: "/clusters",
    detailPattern: /href="\/clusters\/[^"?#]+/,
  },
  { name: "vti-apply", site: "vti", designFile: "application.html", appPath: "/apply" },
  { name: "startup-home", site: "startup", designFile: "startup-centre.html", appPath: "/" },
  { name: "startup-programme", site: "startup", designFile: "startup-programme.html", appPath: "/programme" },
  { name: "startup-commercialization", site: "startup", designFile: "startup-commercialization.html", appPath: "/commercialization" },
  { name: "startup-apply", site: "startup", designFile: "startup-apply.html", appPath: "/apply" },
  { name: "startup-uni", site: "startup", designFile: "startup-university-partnerships.html", appPath: "/university-partnerships" },
  { name: "startup-mentors", site: "startup", designFile: "startup-mentors.html", appPath: "/mentors" },
  { name: "startup-opportunities", site: "startup", designFile: "startup-opportunities.html", appPath: "/opportunities" },
  { name: "startup-portfolio", site: "startup", designFile: "startup-portfolio.html", appPath: "/portfolio" },
  {
    name: "startup-venture",
    site: "startup",
    designFile: "portfolio-detail.html",
    appPath: "",
    listPath: "/portfolio",
    detailPattern: /href="\/portfolio\/[^"?#]+/,
  },
];

function serveDesigns(): Promise<http.Server> {
  const mime: Record<string, string> = {
    ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".webp": "image/webp", ".svg": "image/svg+xml", ".mp4": "video/mp4",
    ".woff": "font/woff", ".woff2": "font/woff2", ".json": "application/json",
  };
  const server = http.createServer((req, res) => {
    const reqPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
    const filePath = path.join(DESIGNS_DIR, reqPath === "/" ? "index.html" : reqPath);
    if (!filePath.startsWith(DESIGNS_DIR)) {
      res.writeHead(403);
      res.end();
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      res.writeHead(200, { "Content-Type": mime[path.extname(filePath).toLowerCase()] ?? "application/octet-stream" });
      res.end(data);
    });
  });
  return new Promise((resolve) => server.listen(DESIGNS_PORT, () => resolve(server)));
}

async function shot(page: Page, url: string, width: number, outPath: string): Promise<boolean> {
  await page.setViewportSize({ width, height: 900 });
  const res = await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  if (!res || !res.ok()) return false;
  // Scroll to bottom and back so lazy/reveal content settles before capture.
  // String form: esbuild injects a __name helper into function evaluates.
  await page.evaluate(`new Promise((done) => {
    let y = 0;
    const step = () => {
      y += 600;
      window.scrollTo(0, y);
      if (y < document.body.scrollHeight) setTimeout(step, 30);
      else {
        window.scrollTo(0, 0);
        setTimeout(done, 150);
      }
    };
    step();
  })`);
  await page.screenshot({ path: outPath, fullPage: true });
  return true;
}

async function resolveDetailPath(page: Page, site: SiteKey, pair: ScreenPair): Promise<string | null> {
  if (!pair.listPath || !pair.detailPattern) return pair.appPath;
  const res = await page.goto(`${host(site)}${pair.listPath}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  if (!res || !res.ok()) return null;
  const html = await page.content();
  const m = html.match(pair.detailPattern);
  if (!m) return null;
  return m[0].slice('href="'.length);
}

interface Row {
  screen: string;
  width: number;
  appOk: boolean;
  designOk: boolean;
  mismatch?: number;
  diff?: string;
}

async function main() {
  await fsp.mkdir(OUT_DIR, { recursive: true });
  const server = await serveDesigns();
  const browser: Browser = await chromium.launch();
  const rows: Row[] = [];

  try {
    for (const pair of SCREENS) {
      const ctx = await browser.newContext({ reducedMotion: "reduce" });
      const page = await ctx.newPage();
      const appPath = await resolveDetailPath(page, pair.site, pair);
      if (appPath === null) {
        for (const width of BREAKPOINTS) {
          rows.push({ screen: pair.name, width, appOk: false, designOk: false });
        }
        await ctx.close();
        continue;
      }
      const appUrl = `${host(pair.site)}${appPath}`;
      const designUrl = `http://127.0.0.1:${DESIGNS_PORT}/${pair.designFile}`;

      for (const width of BREAKPOINTS) {
        const appShot = path.join(OUT_DIR, `${pair.name}-${width}-app.png`);
        const designShot = path.join(OUT_DIR, `${pair.name}-${width}-design.png`);
        const appOk = await shot(page, appUrl, width, appShot);
        const designOk = await shot(page, designUrl, width, designShot);
        const row: Row = { screen: pair.name, width, appOk, designOk };
        if (appOk && designOk) {
          const a = PNG.sync.read(await fsp.readFile(appShot));
          const b = PNG.sync.read(await fsp.readFile(designShot));
          const w = Math.min(a.width, b.width);
          const h = Math.min(a.height, b.height);
          const crop = (img: PNG) => {
            if (img.width === w && img.height === h) return img;
            const out = new PNG({ width: w, height: h });
            PNG.bitblt(img, out, 0, 0, w, h, 0, 0);
            return out;
          };
          const ca = crop(a);
          const cb = crop(b);
          const diff = new PNG({ width: w, height: h });
          const n = pixelmatch(ca.data, cb.data, diff.data, w, h, { threshold: 0.15 });
          row.mismatch = n / (w * h);
          const diffPath = path.join(OUT_DIR, `${pair.name}-${width}-diff.png`);
          await fsp.writeFile(diffPath, PNG.sync.write(diff));
          row.diff = path.basename(diffPath);
        }
        rows.push(row);
      }
      await ctx.close();
      console.log(`done ${pair.name}${appPath !== pair.appPath ? ` (${appPath})` : ""}`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  const report = ["# design-compare report", "", `app port: ${APP_PORT}  designs: http://127.0.0.1:${DESIGNS_PORT}`, "", "| screen | width | app | design | mismatch % | diff |", "|---|---|---|---|---|---|"];
  for (const r of rows) {
    report.push(
      `| ${r.screen} | ${r.width} | ${r.appOk ? "ok" : "FAIL"} | ${r.designOk ? "ok" : "FAIL"} | ${r.mismatch === undefined ? "—" : (r.mismatch * 100).toFixed(1)} | ${r.diff ?? "—"} |`,
    );
  }
  await fsp.writeFile(path.join(OUT_DIR, "report.md"), report.join("\n") + "\n");
  console.log(`\n${rows.filter((r) => !r.appOk || !r.designOk).length} failed captures; report at design-compare-output/report.md`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

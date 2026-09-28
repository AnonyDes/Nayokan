import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

// Guards the approved ecosystem-gateway navigation structure
// (docs/architecture/ux-refinement-2026-09.md §11) directly in the seed SQL,
// so a future edit to the seed cannot silently reintroduce VTI or the
// Startup Centre as corporate top-level navigation tabs. This is a pure
// text check — no database required — so it runs in the fast unit suite.
const SEED_PATH = path.resolve(__dirname, "migrations/20260922140007_seed.sql");
const seed = readFileSync(SEED_PATH, "utf-8");

// One line per navigation_items values-tuple, e.g.
//   ('corporate', 'primary', 2, 'Venture Capital', '/venture-capital', false),
const ROW_RE = /\(\s*'?(corporate|vti|startup)'?(?:::public\.site_id)?\s*,\s*'(primary|cta|footer)'\s*,\s*(\d+)\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*(true|false)\s*\)/g;

interface Row {
  site: string;
  area: string;
  sortOrder: number;
  label: string;
  href: string;
  crossSite: boolean;
}

function parseNavRows(sql: string): Row[] {
  const rows: Row[] = [];
  for (const m of sql.matchAll(ROW_RE)) {
    rows.push({ site: m[1], area: m[2], sortOrder: Number(m[3]), label: m[4], href: m[5], crossSite: m[6] === "true" });
  }
  return rows;
}

describe("navigation seed: corporate ecosystem gateway", () => {
  const rows = parseNavRows(seed);
  const corporate = rows.filter((r) => r.site === "corporate");

  test("finds the corporate navigation rows (parser sanity check)", () => {
    expect(corporate.length).toBeGreaterThanOrEqual(6);
  });

  test("corporate primary navigation matches the approved structure exactly", () => {
    const primary = corporate.filter((r) => r.area === "primary").sort((a, b) => a.sortOrder - b.sortOrder).map((r) => r.label);
    expect(primary).toEqual(["What we do", "Venture Capital", "Hospitality", "Impact", "Insights", "About"]);
  });

  test("corporate cta is Contact", () => {
    const cta = corporate.filter((r) => r.area === "cta").map((r) => r.label);
    expect(cta).toEqual(["Contact"]);
  });

  test("VTI and Startup Centre never appear as corporate navigation items", () => {
    for (const row of corporate) {
      expect(row.label).not.toMatch(/^VTI$|Startup Centre/i);
      expect(row.href).not.toMatch(/vti\.nayokan|startup\.nayokan/i);
    }
  });

  test("no corporate navigation row is cross-site", () => {
    // The corporate site never links out to a sub-site from its own nav;
    // VTI and the Startup Centre are reached through What We Do instead.
    for (const row of corporate) {
      expect(row.crossSite).toBe(false);
    }
  });
});

describe("navigation seed: sub-sites have no cross-site primary tabs", () => {
  const rows = parseNavRows(seed);

  test("VTI and Startup Centre primary navs carry no cross-site rows", () => {
    // Cross-site wayfinding lives in the ecosystem bar and the footer, not
    // as a primary tab — same rule as the corporate site, applied the other
    // direction.
    for (const site of ["vti", "startup"] as const) {
      const primary = rows.filter((r) => r.site === site && r.area === "primary");
      expect(primary.length).toBeGreaterThan(0);
      for (const row of primary) expect(row.crossSite).toBe(false);
    }
  });
});

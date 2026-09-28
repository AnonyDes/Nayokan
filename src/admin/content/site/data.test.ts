import { describe, expect, test } from "vitest";
import { getNavigation } from "./data";

// Guards the approved ecosystem-gateway navigation structure
// (docs/architecture/ux-refinement-2026-09.md §11): VTI and the Startup
// Centre must never appear as corporate top-level navigation tabs, in the
// mock admin store any more than in the Supabase seed (supabase/seed.test.ts
// on the data-layer branch). This is what an editor sees and edits, so it
// must model the approved structure even before the navigation RPC lands.
describe("admin navigation mock: corporate ecosystem gateway", () => {
  const nav = getNavigation("corporate");

  test("primary navigation matches the approved structure exactly", () => {
    expect(nav.primary.map((r) => r.label)).toEqual(["What we do", "Venture Capital", "Hospitality", "Impact"]);
  });

  test("VTI and Startup Centre never appear as enabled primary items", () => {
    for (const row of nav.primary) {
      if (!row.enabled) continue;
      expect(row.label).not.toMatch(/^VTI$|Startup Centre/i);
      expect(row.href).not.toMatch(/^\/vti$|^\/startup-centre$|vti\.nayokan|startup\.nayokan/i);
    }
  });

  test("footer Worlds links route through What We Do, not off-site tabs", () => {
    const worlds = nav.footerColumns.find((c) => c.heading === "Worlds");
    expect(worlds).toBeDefined();
    const vti = worlds!.links.find((l) => l.label === "VTI");
    const startup = worlds!.links.find((l) => l.label === "Startup Centre");
    expect(vti?.href).toBe("/what-we-do#vti");
    expect(startup?.href).toBe("/what-we-do#startup");
  });
});

describe("admin navigation mock: sub-sites have no cross-site primary tabs", () => {
  test("VTI and Startup Centre primary navs carry no off-site rows", () => {
    // Same rule the other direction: cross-site wayfinding lives in the
    // ecosystem bar and the footer, never a primary tab.
    for (const site of ["vti", "startup"] as const) {
      const nav = getNavigation(site);
      for (const row of nav.primary) {
        expect(row.href).not.toMatch(/^https?:\/\//);
      }
    }
  });
});

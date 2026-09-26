import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { getImageBrief, type ImageSlotId } from "./image-briefs";
import { WORLDS_DIRECTORY } from "@/platform/content/worlds";

// Governance guard: the only approved photographs are the real Nayokan
// photos of the VTI computer-lab launch. No other file may be wired in as an
// image asset without an explicit decision (docs/architecture/ux-refinement-2026-09.md §0).
const APPROVED = /^\/assets\/photos\/nayokan-0[1-9]\.jpg$/;

const SLOTS: ImageSlotId[] = [
  "home-hero", "home-about", "world-vti", "world-startup", "world-vc", "world-hospitality",
  "programme-vti", "programme-startup", "programme-vc", "programme-hospitality", "programmes-hero",
  "vti-hero", "vti-programmes-hero", "vti-clusters-hero", "cluster-detail",
  "startup-programme-hero", "startup-commercialization", "startup-opportunities-hero", "startup-portfolio", "startup-mentor",
  "vc-hero", "hospitality-hero", "property", "story-startup", "article-default",
];

describe("image briefs", () => {
  test.each(SLOTS)("%s has a complete brief", (slot) => {
    const b = getImageBrief(slot);
    for (const field of [b.role, b.subject, b.location, b.composition, b.treatment]) {
      expect(field.trim().length).toBeGreaterThan(3);
    }
  });

  test.each(SLOTS)("%s uses only approved Nayokan photography", (slot) => {
    const asset = getImageBrief(slot).asset;
    if (!asset) return;
    expect(asset.src).toMatch(APPROVED);
    expect(existsSync(path.join(process.cwd(), "public", asset.src))).toBe(true);
    expect(asset.alt.length).toBeGreaterThan(20);
  });

  test("Startup, Venture Capital and Hospitality have no photography yet", () => {
    for (const slot of ["world-startup", "world-vc", "world-hospitality", "property", "vc-hero"] as ImageSlotId[]) {
      expect(getImageBrief(slot).asset).toBeUndefined();
    }
  });

  test.each(SLOTS)("%s has an authentic asset or an illustrative fallback on disk", (slot) => {
    const brief = getImageBrief(slot);
    const image = brief.asset ?? brief.illustrative;
    expect(image).toBeDefined();
    expect(existsSync(path.join(process.cwd(), "public", image!.src))).toBe(true);
    expect(image!.alt.length).toBeGreaterThan(15);
  });
});

describe("four worlds", () => {
  test("VTI and Startup Centre route to their own sites; VC and Hospitality stay on corporate", () => {
    const byWorld = Object.fromEntries(WORLDS_DIRECTORY.map((w) => [w.world, w]));
    expect(byWorld.vti.crossSite).toBe(true);
    expect(byWorld.vti.destination.site).toBe("vti");
    expect(byWorld.startup.crossSite).toBe(true);
    expect(byWorld.startup.destination.site).toBe("startup");
    expect(byWorld.venture_capital).toMatchObject({ crossSite: false, destination: { site: "corporate", path: "/venture-capital" } });
    expect(byWorld.hospitality).toMatchObject({ crossSite: false, destination: { site: "corporate", path: "/hospitality" } });
  });

  test("directional headlines stay flagged until confirmed", () => {
    for (const w of WORLDS_DIRECTORY) expect(w.provenance.unconfirmedFields).toContain("headline");
  });
});

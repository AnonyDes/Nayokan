import { existsSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { getImageBrief, getNamedIllustrative, getPropertyGallery, type ImageSlotId } from "./image-briefs";
import { WORLDS_DIRECTORY } from "@/platform/content/worlds";

// Governance guard: the only approved photographs are the real Nayokan
// photos of the VTI computer-lab launch. No other file may be wired in as an
// image asset without an explicit decision (docs/architecture/ux-refinement-2026-09.md §0).
const APPROVED = /^\/assets\/photos\/nayokan-0[1-9]\.jpg$/;

const SLOTS: ImageSlotId[] = [
  "home-hero", "home-about", "world-vti", "world-startup", "world-vc", "world-hospitality",
  "programme-vti", "programme-startup", "programme-vc", "programme-hospitality", "programmes-hero",
  "vti-hero", "vti-programmes-hero", "vti-clusters-hero", "cluster-detail",
  "startup-programme-hero", "startup-commercialization", "startup-opportunities-hero", "startup-portfolio",
  "vc-hero", "hospitality-hero", "property", "story-startup", "article-default",
  "about-origin", "about-people", "impact-evidence", "contact-hero",
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

  // Each world's landmark slots (its Four Worlds panel, plus its own site's
  // hero) must show that world, not a copy of another world's photo. A prior
  // generation batch left "vc-hero" byte-identical to "vti-clusters-hero" —
  // Venture Capital's own hero rendering VTI's cluster workshop — which is
  // exactly the kind of mix-up this guards against.
  const WORLD_LANDMARK_SLOTS: Record<string, ImageSlotId[]> = {
    vti: ["world-vti", "vti-hero"],
    startup: ["world-startup", "startup-programme-hero"],
    venture_capital: ["world-vc", "vc-hero"],
    hospitality: ["world-hospitality", "hospitality-hero"],
  };

  test("no two different worlds' landmark photos are the same file", () => {
    const hashOf = (slot: ImageSlotId) => {
      const image = getImageBrief(slot).asset ?? getImageBrief(slot).illustrative!;
      return createHash("md5").update(readFileSync(path.join(process.cwd(), "public", image.src))).digest("hex");
    };
    const bySlot = Object.entries(WORLD_LANDMARK_SLOTS).flatMap(([world, slots]) => slots.map((slot) => ({ world, slot, hash: hashOf(slot) })));
    for (let i = 0; i < bySlot.length; i++) {
      for (let j = i + 1; j < bySlot.length; j++) {
        if (bySlot[i].world === bySlot[j].world) continue; // same world may reuse its own photo
        expect(bySlot[i].hash, `${bySlot[i].slot} (${bySlot[i].world}) vs ${bySlot[j].slot} (${bySlot[j].world})`).not.toBe(bySlot[j].hash);
      }
    }
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

  test("tones alternate black / green in reading order", () => {
    expect(WORLDS_DIRECTORY.map((w) => w.tone)).toEqual(["black", "green", "black", "green"]);
  });

  test("every world explains itself before its CTA: what, why, who, offers and system fit", () => {
    for (const w of WORLDS_DIRECTORY) {
      for (const text of [w.positioning, w.whatItIs, w.why, w.audience, w.systemFit]) expect(text.length).toBeGreaterThan(10);
      expect(w.offers.length).toBeGreaterThanOrEqual(3);
      expect(w.anchor).toMatch(/^[a-z-]+$/);
    }
  });

  test("world copy carries no figures", () => {
    for (const w of WORLDS_DIRECTORY) {
      const copy = [w.positioning, w.description, w.whatItIs, w.why, w.audience, w.systemFit, ...w.offers].join(" ");
      expect(copy).not.toMatch(/\d/);
    }
  });
});

describe("illustrative image weight", () => {
  test.each(SLOTS)("%s serves responsive WebP variants, none over 200 KB", (slot) => {
    const img = getImageBrief(slot).illustrative;
    if (!img) return;
    expect(img.srcSet).toBeDefined();
    const urls = img.srcSet!.split(",").map((c) => c.trim().split(" ")[0]);
    expect(urls.length).toBeGreaterThanOrEqual(2);
    for (const u of urls) {
      expect(u).toMatch(/\.webp$/);
      const size = statSync(path.join(process.cwd(), "public", u)).size;
      expect(size).toBeLessThan(200 * 1024);
    }
  });

  test("original sources are not served from public/", () => {
    expect(existsSync(path.join(process.cwd(), "public/assets/photos/illustrative/world-vc.jpg"))).toBe(false);
  });
});

describe("named illustrative images", () => {
  test("VTI programmes resolve their own generated photo, not the generic slot fallback", () => {
    const img = getNamedIllustrative("programme-professional-growth-engineering", "alt text goes here");
    expect(img).toBeDefined();
    expect(img!.src).toContain("programme-professional-growth-engineering");
    expect(img!.srcSet).toBeDefined();
  });

  test("an unknown name has no illustrative fallback", () => {
    expect(getNamedIllustrative("programme-does-not-exist", "alt")).toBeUndefined();
  });

  test("the guesthouse gallery returns its 3 generated frames in order", () => {
    const gallery = getPropertyGallery("nayokan-guesthouse", "The Nayokan Guesthouse");
    expect(gallery).toHaveLength(3);
    expect(gallery[0].src).toMatch(/property-nayokan-guesthouse-\d+\.webp$/);
    expect(gallery[1].src).toMatch(/property-nayokan-guesthouse-2-\d+\.webp$/);
    expect(gallery[2].src).toMatch(/property-nayokan-guesthouse-3-\d+\.webp$/);
  });

  test("a property with a single generated frame returns just that frame", () => {
    const gallery = getPropertyGallery("workspace-reception", "Workspace & Reception");
    expect(gallery).toHaveLength(1);
  });
});

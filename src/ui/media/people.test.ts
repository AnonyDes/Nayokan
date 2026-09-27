import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { getPersonPhoto, getPersonSrcSet } from "./people";

// Real, named individuals (Nayokan leadership/board) confirmed by Nayokan.
// Kept out of the illustrative/AI pipeline entirely: no "Illustrative image"
// badge, no generic placeholder fallback.

describe("confirmed people photos", () => {
  test.each(["kanjo", "yogo-melo"])("%s has a photo on disk in every generated width", (slug) => {
    const img = getPersonPhoto(slug, "alt text");
    expect(img).toBeDefined();
    expect(existsSync(path.join(process.cwd(), "public", img!.src))).toBe(true);

    const srcSet = getPersonSrcSet(slug)!;
    expect(srcSet).toBeDefined();
    for (const candidate of srcSet.split(",").map((c) => c.trim().split(" ")[0])) {
      expect(candidate).toMatch(/\.webp$/);
      expect(existsSync(path.join(process.cwd(), "public", candidate))).toBe(true);
      expect(statSync(path.join(process.cwd(), "public", candidate)).size).toBeLessThan(100 * 1024);
    }
  });

  test("an unconfirmed slug has no photo — no AI or stock fallback for named people", () => {
    expect(getPersonPhoto("nayokan-founder-president", "alt")).toBeUndefined();
  });
});

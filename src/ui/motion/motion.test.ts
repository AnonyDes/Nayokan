import { describe, expect, test } from "vitest";
import { MOTION_CSS } from "@/ui/motion/motion-styles";
import { ALL_TARGETS, MASK_SELECTOR, RISE_SELECTOR, STAGGER_GRIDS, STAGGER_SELECTOR } from "@/ui/motion/targets";

describe("scroll motion contract", () => {
  test("hidden state is gated on screen, scripting and no reduced-motion preference", () => {
    expect(MOTION_CSS).toContain(
      "@media screen and (prefers-reduced-motion: no-preference) and (scripting: enabled)",
    );
  });

  test("every target the observer watches has a server-rendered hidden rule", () => {
    for (const selector of ALL_TARGETS.split(",\n")) {
      expect(MOTION_CSS).toContain(`${selector}:not([data-mo])`);
    }
  });

  test("hidden elements always carry a failsafe so content never stays invisible", () => {
    const hiddenBlocks = MOTION_CSS.split("}").filter((block) => block.includes(":not([data-mo])"));
    expect(hiddenBlocks.length).toBeGreaterThan(0);
    for (const block of hiddenBlocks) {
      expect(block).toContain("animation: mo-failsafe");
    }
  });

  test("targets stay inside site content and skip heroes and legacy reveals", () => {
    for (const selector of [RISE_SELECTOR, STAGGER_SELECTOR, MASK_SELECTOR].flatMap((s) => s.split(",\n"))) {
      expect(selector.startsWith("#main ")).toBe(true);
      expect(selector).toContain(":not(.reveal, .reveal *, .hero *");
    }
  });

  test("every stagger grid is observed", () => {
    for (const grid of STAGGER_GRIDS) {
      expect(STAGGER_SELECTOR).toContain(`.${grid}`);
    }
  });
});

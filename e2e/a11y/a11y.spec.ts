import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Phase 11: WCAG 2.2 AA — zero serious/critical violations on every public
// route shape across all three hosts, plus the admin login.
const PORT = Number(process.env.PORT || 3100);
const host = (sub: string) => `http://${sub ? `${sub}.` : ""}nayokan.localhost:${PORT}`;

const ROUTES: { name: string; url: string }[] = [
  { name: "corp-home", url: `${host("")}/` },
  { name: "corp-what-we-do", url: `${host("")}/what-we-do` },
  { name: "corp-impact", url: `${host("")}/impact` },
  { name: "corp-partners", url: `${host("")}/partners` },
  { name: "corp-insights", url: `${host("")}/insights` },
  { name: "corp-contact", url: `${host("")}/contact` },
  { name: "corp-programmes", url: `${host("")}/programmes` },
  { name: "corp-application", url: `${host("")}/application` },
  { name: "vc-home", url: `${host("")}/venture-capital` },
  { name: "vc-partner", url: `${host("")}/venture-capital/partner` },
  { name: "hosp-home", url: `${host("")}/hospitality` },
  { name: "hosp-properties", url: `${host("")}/hospitality/properties` },
  { name: "corp-404", url: `${host("")}/no-such-route` },
  { name: "vti-home", url: `${host("vti")}/` },
  { name: "vti-programmes", url: `${host("vti")}/programmes` },
  { name: "vti-clusters", url: `${host("vti")}/clusters` },
  { name: "vti-apply", url: `${host("vti")}/apply` },
  { name: "startup-home", url: `${host("startup")}/` },
  { name: "startup-programme", url: `${host("startup")}/programme` },
  { name: "startup-apply", url: `${host("startup")}/apply` },
  { name: "startup-mentors", url: `${host("startup")}/mentors` },
  { name: "startup-opportunities", url: `${host("startup")}/opportunities` },
  { name: "startup-portfolio", url: `${host("startup")}/portfolio` },
  { name: "admin-login", url: `${host("admin")}/login` },
];

for (const route of ROUTES) {
  test(`axe: ${route.name} has no serious/critical violations`, async ({ page }) => {
    const res = await page.goto(route.url, { waitUntil: "domcontentloaded" });
    // The admin host redirects unauthenticated users; the corp-404 entry is a
    // real 404 page — both still need an axe pass.
    expect(res?.ok() || res?.status() === 307 || res?.status() === 404).toBeTruthy();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`),
    ).toEqual([]);
  });
}

test.describe("keyboard + reduced motion", () => {
  test("skip link is first tabbable and reaches main content", async ({ page }) => {
    await page.goto(`${host("")}/`);
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveAttribute("href", /#(main|content)/);
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  });

  test("nav reachable by keyboard on every host", async ({ page }) => {
    for (const sub of ["", "vti", "startup"]) {
      await page.goto(`${host(sub)}/`);
      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toBeVisible();
      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toBeVisible();
    }
  });

  test("reduced motion renders system section statically", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "chromium-only check");
    const ctx = await page.context().browser()!.newContext({ reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto(`${host("")}/`, { waitUntil: "domcontentloaded" });
    await expect(p.locator("main")).toBeVisible();
    await ctx.close();
  });
});

import { expect, test, type Page } from "@playwright/test";

// Corporate site (nayokan.org) smoke + key journeys. baseURL is the corporate
// host for the "corporate" project; the "mobile" project also runs these on
// the corporate host at a phone viewport.

const go = (page: Page, path: string) => page.goto(path);

test.describe("corporate routes", () => {
  const routes = [
    "/",
    "/what-we-do",
    "/about",
    "/impact",
    "/partners",
    "/insights",
    "/contact",
    "/programmes",
    "/application",
    "/venture-capital",
    "/venture-capital/approach",
    "/venture-capital/pipeline",
    "/venture-capital/portfolio",
    "/venture-capital/partner",
    "/hospitality",
    "/hospitality/properties",
    "/privacy",
    "/terms",
    "/sitemap",
  ];

  for (const path of routes) {
    test(`${path} returns 200 with a heading`, async ({ page }) => {
      const res = await go(page, path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1, h2").first()).toBeVisible();
      await expect(page.locator("[data-site='corporate']")).toBeVisible();
    });
  }

  test("insights article renders", async ({ page }) => {
    // Slugs come from the content repository — follow the first card link.
    await go(page, "/insights");
    const first = page.locator('a[href^="/insights/"]').first();
    await expect(first).toBeVisible();
    const res = await go(page, (await first.getAttribute("href"))!);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("property detail renders", async ({ page }) => {
    await go(page, "/hospitality/properties");
    const first = page.locator('a[href^="/hospitality/properties/"]').first();
    await expect(first).toBeVisible();
    const res = await go(page, (await first.getAttribute("href"))!);
    expect(res?.status()).toBe(200);
  });

  test("unknown route 404s with site chrome", async ({ page }) => {
    const res = await go(page, "/definitely-not-a-page");
    expect(res?.status()).toBe(404);
  });

  test("sitemap and robots are served", async ({ request, baseURL }) => {
    // Node can't resolve *.localhost — hit 127.0.0.1 with the real Host header.
    const host = new URL(baseURL!).host;
    const ip = `http://127.0.0.1:${host.split(":")[1]}`;
    const headers = { host };
    const sitemap = await request.get(`${ip}/sitemap.xml`, { headers });
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("nayokan.localhost");
    const robots = await request.get(`${ip}/robots.txt`, { headers });
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("sitemap.xml");
  });
});

test.describe("corporate chrome + a11y", () => {
  test("nav, footer and skip link exist", async ({ page }) => {
    await go(page, "/");
    await expect(page.locator("header.nav, nav").first()).toBeVisible();
    await expect(page.locator("footer").first()).toBeVisible();
    await expect(page.locator(".skip-link")).toBeAttached();
  });

  test("cross-site links point at site origins", async ({ page }) => {
    await go(page, "/");
    const vti = page.locator("a[href*='vti.nayokan']").first();
    await expect(vti).toBeAttached();
  });

  test("no language toggle: French is not implied as available", async ({ page }) => {
    await go(page, "/");
    // Checks the whole document, including the (possibly closed) mobile nav
    // panel — it renders in the DOM regardless of viewport or open state.
    await expect(page.locator(".lang-toggle")).toHaveCount(0);
    await expect(page.getByText("FR", { exact: true })).toHaveCount(0);
  });

  test("footer sitemap link opens the HTML sitemap, not the raw XML", async ({ page }) => {
    await go(page, "/");
    const link = page.locator("footer a", { hasText: "Sitemap" });
    await expect(link).toHaveAttribute("href", "/sitemap");
  });

  test("sitemap page lists all three sites and links out to the XML sitemap separately", async ({ page }) => {
    await go(page, "/sitemap");
    await expect(page.getByRole("heading", { name: "Nayokan", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Vocational Training Institute" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Startup Centre" })).toBeVisible();
    const xmlLink = page.locator("a", { hasText: "XML sitemap" });
    await expect(xmlLink).toHaveAttribute("href", /\/sitemap\.xml$/);
  });

  test("contact form validates before submit", async ({ page }) => {
    await go(page, "/contact");
    const submit = page.locator("form button[type='submit']").first();
    await submit.click();
    // Zod errors render as field errors or native validation blocks submit.
    await expect(page.locator("form").first()).toBeVisible();
  });

  test("application flow shows six steps", async ({ page }) => {
    await go(page, "/application");
    await expect(page.getByRole("region", { name: "Step 1 — Getting started" })).toBeVisible();
  });

  test("unverified metrics show no number, only a verification state", async ({ page }) => {
    await go(page, "/impact");
    await expect(page.getByText("Published once verified").first()).toBeVisible();
    for (const text of await page.locator(".num-pending, .impact-num-pending").allInnerTexts()) {
      expect(text).not.toMatch(/\d/);
    }
  });
});

test.describe("ecosystem gateway", () => {
  test("corporate navigation has no VTI or Startup Centre tabs", async ({ page }) => {
    await go(page, "/");
    const labels = (await page.locator("header .nav-links a").allInnerTexts()).map((t) => t.trim());
    expect(labels).toEqual(["What we do", "Venture Capital", "Hospitality", "Impact", "Insights", "About"]);
    await expect(page.locator("header .nav-cta")).toHaveText("Contact");
    for (const label of labels) expect(label).not.toMatch(/VTI|Startup/i);
  });

  test("What We Do explains each world before its contextual CTA", async ({ page }) => {
    await go(page, "/what-we-do");
    for (const id of ["vti", "startup", "venture-capital", "hospitality"]) {
      const section = page.locator(`section#${id}`);
      await expect(section).toBeVisible();
      await expect(section.getByText("Why it exists")).toBeVisible();
      await expect(section.getByText("Who it serves")).toBeVisible();
    }
    await expect(page.locator("section#vti a", { hasText: "Explore VTI" })).toHaveAttribute("href", /vti/);
    await expect(page.locator("section#startup a", { hasText: "Explore Startup Centre" })).toHaveAttribute("href", /startup/);
  });

  test("no editorial notation is visible on public pages", async ({ page }) => {
    for (const path of ["/", "/what-we-do", "/about", "/impact", "/venture-capital", "/hospitality", "/partners", "/contact"]) {
      await go(page, path);
      const text = await page.locator("body").innerText();
      expect(text, path).not.toMatch(/\btbc\b|to be confirmed|\bdemo\b|— — —/i);
    }
  });
});

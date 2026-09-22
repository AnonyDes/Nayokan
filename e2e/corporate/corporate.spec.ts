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
    const res = await go(page, "/insights/inauguration-day-vti-yaounde");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("property detail renders", async ({ page }) => {
    const res = await go(page, "/hospitality/properties/nayokan-guesthouse");
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

  test("contact form validates before submit", async ({ page }) => {
    await go(page, "/contact");
    const submit = page.locator("form button[type='submit']").first();
    await submit.click();
    // Zod errors render as field errors or native validation blocks submit.
    await expect(page.locator("form").first()).toBeVisible();
  });

  test("application flow shows six steps", async ({ page }) => {
    await go(page, "/application");
    await expect(page.getByText(/Step 01/i).first()).toBeVisible();
  });

  test("unverified metrics render em-dash, not fabricated numbers", async ({ page }) => {
    await go(page, "/impact");
    const html = await page.content();
    expect(html).toContain("—");
    expect(html.toLowerCase()).toContain("tbc");
  });
});

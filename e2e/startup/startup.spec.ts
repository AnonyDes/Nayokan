import { expect, test, type Page } from "@playwright/test";

// Startup Centre site (startup.nayokan.org) smoke + journeys.

const go = (page: Page, path: string) => page.goto(path);

test.describe("startup routes", () => {
  const routes = [
    "/",
    "/programme",
    "/commercialization",
    "/university-partnerships",
    "/mentors",
    "/opportunities",
    "/portfolio",
    "/portfolio/agri-processing-venture",
    "/apply",
    "/apply/success",
    "/privacy",
    "/terms",
  ];

  for (const path of routes) {
    test(`${path} returns 200`, async ({ page }) => {
      const res = await go(page, path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("[data-site='startup']")).toBeVisible();
      await expect(page.locator("h1, h2").first()).toBeVisible();
    });
  }

  test("unknown route 404s", async ({ page }) => {
    const res = await go(page, "/definitely-not-a-page");
    expect(res?.status()).toBe(404);
  });

  test("sitemap lists portfolio URLs", async ({ request, baseURL }) => {
    const host = new URL(baseURL!).host;
    const ip = `http://127.0.0.1:${host.split(":")[1]}`;
    const res = await request.get(`${ip}/sitemap.xml`, { headers: { host } });
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("/portfolio/");
  });

  test("robots.txt points at the startup sitemap", async ({ request, baseURL }) => {
    const host = new URL(baseURL!).host;
    const ip = `http://127.0.0.1:${host.split(":")[1]}`;
    const res = await request.get(`${ip}/robots.txt`, { headers: { host } });
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("startup.nayokan");
  });
});

test.describe("startup journeys", () => {
  test("opportunities table filters by category", async ({ page }) => {
    await go(page, "/opportunities");
    await expect(page.locator(".opp-row").first()).toBeVisible();
    const count = await page.locator(".opp-row").count();
    await page.getByRole("button", { name: /Funding/ }).click();
    const filtered = await page.locator(".opp-row").count();
    expect(filtered).toBeLessThan(count);
    expect(filtered).toBeGreaterThan(0);
  });

  test("portfolio detail renders anonymised venture", async ({ page }) => {
    await go(page, "/portfolio/agri-processing-venture");
    await expect(page.locator("h1").first()).toContainText(/venture/i);
    await expect(page.locator(".portv-facts")).toBeVisible();
  });

  test("six-step innovator application renders", async ({ page }) => {
    await go(page, "/apply");
    await expect(page.locator(".form-progress")).toBeVisible();
    await expect(page.getByText(/Step 01 · Applicant/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Continue to Step 02/i }).click();
    await expect(page.getByText(/Step 02 · Institution/i).first()).toBeVisible();
  });

  test("application blocks submit without required consent", async ({ page }) => {
    await go(page, "/apply");
    for (let i = 0; i < 5; i++) {
      await page.getByRole("button", { name: /Continue to Step/i }).click();
    }
    await page.getByRole("button", { name: /Submit application/i }).click();
    await expect(page.getByText(/consent|confirm/i).last()).toBeVisible();
  });
});

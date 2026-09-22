import { expect, test, type Page } from "@playwright/test";

// VTI site (vti.nayokan.org) smoke + application journey.

const go = (page: Page, path: string) => page.goto(path);

test.describe("vti routes", () => {
  const routes = [
    "/",
    "/programmes",
    "/programmes/professional-growth-engineering",
    "/clusters",
    "/clusters/agri-food-production",
    "/apply",
    "/apply/success",
    "/privacy",
    "/terms",
  ];

  for (const path of routes) {
    test(`${path} returns 200`, async ({ page }) => {
      const res = await go(page, path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("[data-site='vti']")).toBeVisible();
      await expect(page.locator("h1, h2").first()).toBeVisible();
    });
  }

  test("unknown route 404s", async ({ page }) => {
    const res = await go(page, "/definitely-not-a-page");
    expect(res?.status()).toBe(404);
  });

  test("sitemap lists programme and cluster URLs", async ({ request, baseURL }) => {
    const host = new URL(baseURL!).host;
    const ip = `http://127.0.0.1:${host.split(":")[1]}`;
    const res = await request.get(`${ip}/sitemap.xml`, { headers: { host } });
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("/programmes/");
    expect(body).toContain("/clusters/");
  });

  test("robots.txt points at the vti sitemap", async ({ request, baseURL }) => {
    const host = new URL(baseURL!).host;
    const ip = `http://127.0.0.1:${host.split(":")[1]}`;
    const res = await request.get(`${ip}/robots.txt`, { headers: { host } });
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("vti.nayokan");
  });
});

test.describe("vti application flow", () => {
  test("six-step application renders and steps forward", async ({ page }) => {
    await go(page, "/apply");
    await expect(page.getByText(/Step 01/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Begin application/i }).click();
    await expect(page.getByText(/Step 02 — About you/i).first()).toBeVisible();
  });
});

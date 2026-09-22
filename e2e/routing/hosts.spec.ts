import { expect, test } from "@playwright/test";

const url = (sub: string, path = "/") => `http://${sub ? `${sub}.` : ""}nayokan.localhost:${process.env.PORT || 3000}${path}`;

test("each host renders its own site", async ({ page }) => {
  for (const [sub, site] of [["", "corporate"], ["vti", "vti"], ["startup", "startup"]] as const) {
    await page.goto(url(sub));
    await expect(page.locator(`[data-site="${site}"]`)).toBeVisible();
  }
});

test("internal route-tree prefixes are not directly addressable", async ({ page }) => {
  const res = await page.goto(url("vti", "/vti"));
  expect(res?.status()).toBe(404);
});

test("admin paths 404 on public hosts", async ({ page }) => {
  const res = await page.goto(url("", "/admin"));
  expect(res?.status()).toBe(404);
});

test("legacy corporate paths redirect to the subdomain", async ({ page }) => {
  // Drive the request through the browser: *.localhost resolves natively in
  // Chromium, while Node's resolver (apiRequestContext) does not on Windows.
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/vocational-training/programmes")),
    page.goto(url("", "/vocational-training/programmes"), { waitUntil: "commit" }).catch(() => null),
  ]);
  expect(response.status()).toBe(308);
  expect(response.headers()["location"]).toBe(url("vti", "/programmes"));
});

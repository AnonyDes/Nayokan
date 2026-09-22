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

test("legacy corporate paths redirect to the subdomain", async ({ request }) => {
  // Node can't resolve *.localhost — hit 127.0.0.1 with the real Host header.
  const host = new URL(url("")).host;
  const ip = `http://127.0.0.1:${host.split(":")[1]}`;
  const res = await request.get(`${ip}/vocational-training/programmes`, {
    maxRedirects: 0,
    headers: { host },
  });
  expect(res.status()).toBe(308);
  expect(res.headers()["location"]).toBe(url("vti", "/programmes"));
});

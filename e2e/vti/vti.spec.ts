import { expect, test, type Page } from "@playwright/test";

// VTI site (vti.nayokan.org) smoke + application journey.

const go = (page: Page, path: string) => page.goto(path);

test.describe("vti routes", () => {
  const routes = [
    "/",
    "/programmes",
    "/programmes/agro-industrialization-export-systems-market-access",
    "/programmes/local-manufacturing-sustainable-construction",
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

const AGRO = "agro-industrialization-export-systems-market-access";
const MANUFACTURING = "local-manufacturing-sustainable-construction";

test.describe("vti programme catalogue", () => {
  test("lists the two training offerings and no retired demo programmes", async ({ page }) => {
    await go(page, "/programmes");
    const cards = page.locator("a.ed-card");
    await expect(cards).toHaveCount(2);
    await expect(page.getByRole("heading", { name: "Local Manufacturing & Sustainable Construction", level: 3 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Agro-Industrialization, Export Systems & Market Access", level: 3 })).toBeVisible();
    const text = await page.locator("main").innerText();
    for (const retired of ["Professional Growth Engineering", "Skills for Industrialisation", "Hospitality Operations", "Industry Application Certification"]) {
      expect(text).not.toContain(retired);
    }
  });

  test("each card links to a working detail page", async ({ page }) => {
    for (const slug of [AGRO, MANUFACTURING]) {
      await go(page, "/programmes");
      await page.locator(`a.ed-card[href="/programmes/${slug}"]`).click();
      await expect(page).toHaveURL(new RegExp(`/programmes/${slug}$`));
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("detail pages never present unconfirmed facts as real", async ({ page }) => {
    for (const slug of [AGRO, MANUFACTURING]) {
      await go(page, `/programmes/${slug}`);
      const text = await page.locator("main").innerText();
      expect(text, slug).not.toMatch(/export station|million fcfa|guaranteed (income|contract)|\btbc\b|to be confirmed|\bdemo\b/i);
      // No programme is open, so there is no apply button, only interest registration.
      await expect(page.getByRole("link", { name: /^Apply to/ })).toHaveCount(0);
      await expect(page.getByRole("link", { name: /Register interest/ }).first()).toBeVisible();
    }
  });

  test("the agro-industrialization page states that training is not a guarantee", async ({ page }) => {
    await go(page, `/programmes/${AGRO}`);
    await expect(page.getByText(/does not itself mean regulatory approval/i)).toBeVisible();
  });

  test("retired programme URLs redirect instead of 404ing", async ({ request, baseURL }) => {
    const host = new URL(baseURL!).host;
    const ip = `http://127.0.0.1:${host.split(":")[1]}`;
    const get = (path: string) => request.get(`${ip}${path}`, { headers: { host }, maxRedirects: 0 });
    const retired = await get("/programmes/professional-growth-engineering");
    expect(retired.status()).toBe(308);
    expect(retired.headers()["location"]).toBe("/programmes");
    const agri = await get("/programmes/agri-food-post-harvest");
    expect(agri.status()).toBe(308);
    expect(agri.headers()["location"]).toBe(`/programmes/${AGRO}`);
  });
});

test.describe("vti interest and application", () => {
  test("apply explains that applications are not open and points to the enquiry form", async ({ page }) => {
    await go(page, "/apply");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/not open yet/i);
    await page.getByRole("link", { name: /Register interest/ }).click();
    await expect(page).toHaveURL(/\/#apply$/);
  });

  test("the enquiry form offers exactly the two current programmes", async ({ page }) => {
    await go(page, "/");
    const options = await page.locator("#fp option:not([disabled])").allInnerTexts();
    expect(options).toEqual([
      "Local Manufacturing & Sustainable Construction",
      "Agro-Industrialization, Export Systems & Market Access",
    ]);
  });
});

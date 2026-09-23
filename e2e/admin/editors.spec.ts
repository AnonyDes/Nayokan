import { expect, test, type Page } from "@playwright/test";
import { EMAIL, PASSWORD, signInStaff } from "./helpers";

// CMS editor write-path coverage. Runs serially on one signed-in page so we
// pay the MFA round-trip once. Saves are idempotent (same values submitted);
// no destructive transitions are clicked — governance is DB-enforced.

test.describe("admin editors", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(!EMAIL || !PASSWORD, "ADMIN_TEST_* credentials not configured");

  let page: Page;

  test.setTimeout(240_000);

  test.beforeAll(async ({ browser }, testInfo) => {
    const context = await browser.newContext({ baseURL: String(testInfo.project.use.baseURL) });
    page = await context.newPage();
    await signInStaff(page);
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test("article editor renders blocks and saves a draft", async () => {
    await page.goto("/admin/articles");
    await page.locator(".ax-table__title a").first().click();
    await expect(page.locator(".ed-title")).toBeVisible();
    await expect(page.locator(".ed-doc__meta")).toContainText("Article");
    await expect(page.locator(".ed-side__status")).toBeVisible();

    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.locator(".ax-pill--verified").filter({ hasText: "Draft saved" })).toBeVisible();
  });

  test("article block editor adds and removes blocks", async () => {
    const before = await page.locator(".ed-block").count();
    await page.locator(".ed-insert__opt", { hasText: "paragraph" }).click();
    await expect(page.locator(".ed-block")).toHaveCount(before + 1);
    await page.locator(".ed-block").last().getByLabel("Remove block").click();
    await expect(page.locator(".ed-block")).toHaveCount(before);
  });

  test("page editor lists sections and saves", async () => {
    await page.goto("/admin/pages");
    await page.locator(".ax-table__title a").first().click();
    await expect(page.locator(".he-sections")).toBeVisible();
    const sections = page.locator(".he-sec");
    // Seed data ships empty section arrays on legal pages — click through only
    // when sections exist.
    if ((await sections.count()) > 1) {
      await sections.nth(1).click();
      await expect(page.locator(".he-canvas__title")).toBeVisible();
    }
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.locator(".ax-pill--verified").filter({ hasText: "Page saved" })).toBeVisible();
  });

  test("programme editor renders form and saves", async () => {
    await page.goto("/admin/programmes");
    await page.locator(".ax-table__title a").first().click();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('select[name="status"]')).toBeVisible();
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.locator(".ax-pill--verified").filter({ hasText: "Programme saved" })).toBeVisible();
  });

  test("metric editor shows the verification chain and saves", async () => {
    await page.goto("/admin/impact-metrics");
    await page.locator(".ax-table__title a").first().click();
    await expect(page.locator(".me-verif-box")).toBeVisible();
    await expect(page.locator(".me-hero")).toBeVisible();
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.locator(".ax-pill--verified").filter({ hasText: "Metric saved" })).toBeVisible();
  });

  test("homepage editor selects sections per site and saves", async () => {
    await page.goto("/admin/homepage?site=corporate");
    await expect(page.locator(".he-sections")).toBeVisible();
    const sections = page.locator(".he-sec");
    expect(await sections.count()).toBeGreaterThan(0);
    if ((await sections.count()) > 1) {
      await sections.nth(1).click();
      await expect(page.locator(".he-canvas__title")).toBeVisible();
    }
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.locator(".ax-pill--verified").filter({ hasText: "Section saved" })).toBeVisible();
  });
});

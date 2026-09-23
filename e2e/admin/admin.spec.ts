import { expect, test } from "@playwright/test";
import { EMAIL, PASSWORD, signInStaff } from "./helpers";

// Admin auth E2E. Credentials live in .env.test.local (gitignored), written by
// scripts/setup or the session that created the dev admin user.
// TOTP secret persists across runs in the same file once enrolled.

test.describe("admin auth", () => {
  test.skip(!EMAIL || !PASSWORD, "ADMIN_TEST_* credentials not configured");

  test("unauthenticated users are redirected to login", async ({ page }) => {
    await page.goto("/admin/articles");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("login page renders the designed split screen", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator(".login__title")).toContainText("digital ecosystem");
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("invalid credentials show an error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', "wrong-password");
    await page.click('button[type="submit"]');
    await expect(page.locator(".ax-notice--danger")).toBeVisible();
  });

  test("full sign-in with MFA reaches the dashboard", async ({ page }) => {
    test.setTimeout(90_000);
    await signInStaff(page);
    await expect(page.locator(".dash-hero__greet")).toBeVisible();
    await expect(page.locator(".ax-sidebar")).toBeVisible();
  });
});

test("admin host routes / to /admin", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/admin/);
});

import { test, expect } from "@playwright/test";

// Playwright project "admin" (playwright.config.ts) runs these against
// admin.nayokan.localhost. A real run needs a seeded Supabase test project
// (AUTH_SOURCE=supabase, invited test accounts with TOTP factors) — until
// then this documents the required coverage and exercises what doesn't need
// a backend: the login form itself and the unauthenticated redirect.
//
// TODO once Session B's auth-state setup project exists (workstreams.md):
//   - login + MFA succeeds per role, lands on /admin with the right nav
//   - wrong MFA code is rejected, correct code (from a seeded TOTP secret) succeeds
//   - a role with no access to an area gets /admin/denied, not a 404 that
//     would suggest the route doesn't exist
//   - the site selector narrows dashboard data but never grants access to a
//     scoped-out site's write actions (server-side requirePermission holds)
//   - 60-minute idle expiry redirects to /admin/login?expired=1

test.describe("admin auth", () => {
  test("visiting a protected route while signed out redirects to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole("heading", { name: "Access Nayokan Admin." })).toBeVisible();
  });

  test("login form rejects an empty submit and requires both fields", async ({ page }) => {
    await page.goto("/admin/login");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#pw");
    await expect(emailInput).toHaveAttribute("required", "");
    await expect(passwordInput).toHaveAttribute("required", "");
  });

  test("incorrect credentials show an inline error, not a redirect", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator("#email").fill("nobody@nayokan.cm");
    await page.locator("#pw").fill("wrong-password");
    await page.getByRole("button", { name: "Continue to two-factor" }).click();
    await expect(page.getByText("Incorrect email or password.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

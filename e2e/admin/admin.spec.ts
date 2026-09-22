import { expect, test } from "@playwright/test";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// Admin auth E2E. Credentials live in .env.test.local (gitignored), written by
// scripts/setup or the session that created the dev admin user.
// TOTP secret persists across runs in the same file once enrolled.

const envPath = path.resolve(__dirname, "../../.env.test.local");

function loadEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].trim();
    }
  }
  return out;
}

function saveEnv(key: string, value: string) {
  const lines = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8").split("\n").filter(Boolean) : [];
  const next = lines.filter((l) => !l.startsWith(`${key}=`));
  next.push(`${key}=${value}`);
  fs.writeFileSync(envPath, next.join("\n") + "\n");
}

// RFC 6238 TOTP — SHA1, 30s step, 6 digits.
function totp(secretB32: string): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = secretB32.replace(/=+$/, "").toUpperCase();
  const bytes: number[] = [];
  let bits = 0, value = 0;
  for (const c of clean) {
    value = (value << 5) | alphabet.indexOf(c);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  const key = Buffer.from(bytes);
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const hmac = crypto.createHmac("sha1", key).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac[offset] & 0x7f) << 24 | hmac[offset + 1] << 16 | hmac[offset + 2] << 8 | hmac[offset + 3]) % 1e6;
  return String(code).padStart(6, "0");
}

const env = loadEnv();
const EMAIL = env.ADMIN_TEST_EMAIL ?? "";
const PASSWORD = env.ADMIN_TEST_PASSWORD ?? "";

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
    await page.goto("/admin/login");
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');

    // Either enrol (first run) or challenge (subsequent runs).
    await page.waitForURL(/\/admin\/login\/mfa/);
    if (page.url().includes("/enrol")) {
      const manual = await page.locator("text=Manual entry:").textContent();
      const uri = manual?.replace("Manual entry:", "").trim() ?? "";
      const secret = new URL(uri).searchParams.get("secret") ?? uri.match(/secret=([A-Z2-7]+)/i)?.[1] ?? "";
      expect(secret).not.toBe("");
      saveEnv("ADMIN_TEST_TOTP_SECRET", secret);
      await page.fill('input[name="code"]', totp(secret));
      await page.click('button[type="submit"]');
    } else {
      const secret = env.ADMIN_TEST_TOTP_SECRET ?? loadEnv().ADMIN_TEST_TOTP_SECRET ?? "";
      expect(secret, "TOTP secret missing — run enrol path first").not.toBe("");
      await page.fill('input[name="code"]', totp(secret));
      await page.click('button[type="submit"]');
    }

    await expect(page).toHaveURL(/\/admin\/?$/);
    await expect(page.locator(".dash-hero__greet")).toBeVisible();
    await expect(page.locator(".ax-sidebar")).toBeVisible();
  });
});

test("admin host routes / to /admin", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/admin/);
});

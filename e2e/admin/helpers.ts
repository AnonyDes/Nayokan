import { expect, type Page } from "@playwright/test";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// Shared admin auth helpers. Credentials live in .env.test.local (gitignored).
// TOTP secret persists across runs in the same file once enrolled.

const envPath = path.resolve(__dirname, "../../.env.test.local");

export function loadEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].trim();
    }
  }
  return out;
}

export function saveEnv(key: string, value: string) {
  const lines = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8").split("\n").filter(Boolean) : [];
  const next = lines.filter((l) => !l.startsWith(`${key}=`));
  next.push(`${key}=${value}`);
  fs.writeFileSync(envPath, next.join("\n") + "\n");
}

// RFC 6238 TOTP — SHA1, 30s step, 6 digits.
export function totp(secretB32: string): string {
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

export const env = loadEnv();
export const EMAIL = env.ADMIN_TEST_EMAIL ?? "";
export const PASSWORD = env.ADMIN_TEST_PASSWORD ?? "";

function mfaSecret(pageUrl: string): string {
  const secret = loadEnv().ADMIN_TEST_TOTP_SECRET ?? "";
  expect(secret, "TOTP secret missing — run enrol path first").not.toBe("");
  return secret;
}

/** Wait until the next 30s TOTP window so a fresh code is generated. */
async function nextTotpWindow() {
  const ms = 30_000 - (Date.now() % 30_000) + 500;
  await new Promise((r) => setTimeout(r, ms));
}

/** Full password + MFA sign-in; lands on the admin dashboard. */
export async function signInStaff(page: Page) {
  await page.goto("/admin/login");
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');

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
    // Supabase may reject a TOTP code already consumed in this window (e.g. a
    // parallel spec signed in first). Retry up to twice with fresh codes.
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.fill('input[name="code"]', totp(mfaSecret(page.url())));
      await page.click('button[type="submit"]');
      // Either the dashboard, a bounce back to password login, or a visible
      // error while still on the challenge page (slow dev compile included).
      await page
        .waitForURL(/\/admin\/?$|\/admin\/login$/, { timeout: 30_000 })
        .catch(() => {});
      if (/\/admin\/?$/.test(page.url())) return;
      if (/\/admin\/login$/.test(page.url())) {
        // Bounced to password — redo password step, then challenge again.
        await page.fill('input[name="email"]', EMAIL);
        await page.fill('input[name="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/admin\/login\/mfa/);
      }
      await nextTotpWindow();
    }
    throw new Error("MFA challenge failed after retries");
  }
  await expect(page).toHaveURL(/\/admin\/?$/);
}

// Signs the admin idle-session cookie so its timestamp can't be forged or
// extended client-side. A plain `Date.now()` cookie value is fully
// attacker-controlled (readable and writable via devtools/an extension even
// with `httpOnly`, since that only blocks page JS, not the browser's own
// cookie UI) — an attacker could pin it to a future time and defeat the
// 60-minute idle expiry (readiness-report §10) entirely. HMAC-signing it
// means a tampered value fails verification and is treated as expired.
//
// Used from both proxy.ts's Node-runtime admin branch (admin-session.ts)
// and the Server Component/Action DAL (session.ts) — kept dependency-free
// of both `next/headers` and `next/server` so it works in either.
import { createHmac, timingSafeEqual } from "node:crypto";

export const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes (readiness-report §10)
export const IDLE_COOKIE = "nayokan_admin_seen";

function hmac(secret: string, message: string): string {
  return createHmac("sha256", secret).update(message).digest("hex");
}

export function signIdleTimestamp(nowMs: number, secret: string): string {
  return `${nowMs}.${hmac(secret, String(nowMs))}`;
}

/** Returns the signed timestamp, or null if missing, malformed, or tampered. */
export function verifyIdleTimestamp(cookieValue: string | undefined, secret: string): number | null {
  if (!cookieValue) return null;
  const separatorIndex = cookieValue.lastIndexOf(".");
  if (separatorIndex < 1) return null;

  const tsPart = cookieValue.slice(0, separatorIndex);
  const sigPart = cookieValue.slice(separatorIndex + 1);
  const ts = Number(tsPart);
  if (!Number.isFinite(ts)) return null;

  const expected = hmac(secret, tsPart);
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(sigPart, "hex");
  if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) return null;

  return ts;
}

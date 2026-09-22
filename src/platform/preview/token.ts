// Signed preview tokens — the admin→site preview contract (readiness-report
// §7: "a signed, short-lived token renders drafts on the owning site's host
// at /__preview/... with a PREVIEW · NOT LIVE badge").
//
// Ownership: this module is the shared contract. Session C (admin) signs via
// previewUrl(); Session A (public sites) verifies inside the site's
// /__preview/[token] route using verifyPreviewToken(). Both sides share the
// PREVIEW_SECRET env var. The proxy must let /__preview through on site
// hosts and must ignore it in production unless the token verifies — the
// verify route is Session A's responsibility.
//
// Format: v1.<base64url(JSON payload)>.<base64url(HMAC-SHA256)>
// Payload: { site, path, exp } — path is a root-relative path on `site`.
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { isSiteId, type SiteId } from "@/platform/sites/types";
import { siteUrl } from "@/platform/sites/registry";

const VERSION = "v1";
const DEFAULT_TTL_SECONDS = 10 * 60;

interface PreviewPayload {
  site: SiteId;
  path: string;
  /** Unix seconds. */
  exp: number;
}

const b64url = (buf: Buffer | string) => Buffer.from(buf).toString("base64url");

function secret(): string | null {
  const s = process.env.PREVIEW_SECRET;
  return s && s.length > 0 ? s : null;
}

/** Sign a preview token. Returns null when PREVIEW_SECRET isn't configured —
 *  callers must degrade (hide/disable the preview link), never crash. */
export function signPreviewToken(site: SiteId, path: string, ttlSeconds = DEFAULT_TTL_SECONDS): string | null {
  const key = secret();
  if (!key) return null;
  const payload: PreviewPayload = { site, path, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", key).update(`${VERSION}.${body}`).digest("base64url");
  return `${VERSION}.${body}.${sig}`;
}

/** Verify a token. Returns the payload or null (bad sig, expired, malformed). */
export function verifyPreviewToken(token: string): PreviewPayload | null {
  const key = secret();
  if (!key) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== VERSION) return null;
  const expected = createHmac("sha256", key).update(`${parts[0]}.${parts[1]}`).digest();
  const got = Buffer.from(parts[2], "base64url");
  if (got.length !== expected.length || !timingSafeEqual(got, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as PreviewPayload;
    if (!isSiteId(payload.site) || typeof payload.path !== "string" || !payload.path.startsWith("/")) return null;
    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Absolute preview URL on the owning site's host. null when unconfigured. */
export function previewUrl(site: SiteId, path: string, ttlSeconds?: number): string | null {
  const token = signPreviewToken(site, path, ttlSeconds);
  return token ? siteUrl(site, `/__preview/${token}`) : null;
}

/**
 * Admin "Preview" link target. When PREVIEW_SECRET is set this is the signed
 * /__preview/<token> URL on the owning site's host; otherwise it falls back
 * to the live path so the link still opens the right page in dev.
 */
export function previewHref(site: SiteId, path: string): { href: string; signed: boolean } {
  const signed = previewUrl(site, path);
  return signed ? { href: signed, signed: true } : { href: siteUrl(site, path), signed: false };
}

import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITES } from "@/platform/sites/registry";
import { isSiteId, type SiteId } from "@/platform/sites/types";

// Per-host robots.txt. robots.ts must live at the app root (Next 16 file
// convention); the proxy passes /robots.txt through un-prefixed and stamps
// x-nayokan-site, so we resolve the site from that header (or the Host).
// Reading headers() opts this handler into request-time rendering.
export const dynamic = "force-dynamic";

function resolveSite(siteHeader: string | null, host: string): SiteId {
  if (isSiteId(siteHeader)) return siteHeader;
  const match = (Object.keys(SITES) as SiteId[]).find(
    (id) => new URL(SITES[id].origin).host.toLowerCase() === host,
  );
  return match ?? "corporate";
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const site = resolveSite(h.get("x-nayokan-site"), (h.get("host") ?? "").toLowerCase());

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api"] },
    sitemap: `${SITES[site].origin}/sitemap.xml`,
  };
}

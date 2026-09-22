import type { Metadata } from "next";
import { SITES } from "@/platform/sites/registry";
import type { SiteId } from "@/platform/sites/types";

const isIndexable = () => process.env.VERCEL_ENV === "production";

/** Base metadata for a site layout: metadataBase, title template, robots. */
export function buildSiteMetadata(site: SiteId): Metadata {
  const cfg = SITES[site];
  return {
    metadataBase: new URL(cfg.origin),
    title: { default: cfg.name, template: cfg.titleTemplate },
    description: cfg.defaultDescription,
    applicationName: cfg.name,
    openGraph: { siteName: cfg.name, type: "website", locale: "en" },
    // Non-production deployments are never indexed.
    robots: isIndexable() ? { index: true, follow: true } : { index: false, follow: false },
  };
}

/** Canonical path helper: always resolves against the owning site's origin. */
export function canonical(path: string): Metadata["alternates"] {
  return { canonical: path.startsWith("/") ? path : `/${path}` };
}

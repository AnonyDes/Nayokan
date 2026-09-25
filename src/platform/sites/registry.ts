import type { SiteId } from "./types";

export interface SiteConfig {
  id: SiteId;
  /** Human name used in titles, JSON-LD and the admin site selector. */
  name: string;
  /** Title template, e.g. "%s · Nayokan VTI". */
  titleTemplate: string;
  /** Absolute origin, no trailing slash. */
  origin: string;
  /** CSS class on the site's root element; selects its theme tokens. */
  themeClass: string;
  /** Value sent as the `site` dimension on every analytics event. */
  analyticsSite: SiteId;
  defaultDescription: string;
}

const stripSlash = (v: string) => v.replace(/\/+$/, "");

// NEXT_PUBLIC_* must be referenced literally so Next inlines them.
const ORIGINS = {
  corporate: stripSlash(process.env.NEXT_PUBLIC_SITE_ORIGIN_CORPORATE || "http://nayokan.localhost:3000"),
  vti: stripSlash(process.env.NEXT_PUBLIC_SITE_ORIGIN_VTI || "http://vti.nayokan.localhost:3000"),
  startup: stripSlash(process.env.NEXT_PUBLIC_SITE_ORIGIN_STARTUP || "http://startup.nayokan.localhost:3000"),
} as const satisfies Record<SiteId, string>;

export const ADMIN_ORIGIN = stripSlash(process.env.NEXT_PUBLIC_ADMIN_ORIGIN || "http://admin.nayokan.localhost:3000");

export const SITES: Record<SiteId, SiteConfig> = {
  corporate: {
    id: "corporate",
    name: "Nayokan",
    titleTemplate: "%s · Nayokan",
    origin: ORIGINS.corporate,
    themeClass: "site-corporate",
    analyticsSite: "corporate",
    defaultDescription: "Building people, enterprises and productive systems for Cameroon.",
  },
  vti: {
    id: "vti",
    name: "Nayokan VTI",
    titleTemplate: "%s · Nayokan VTI",
    origin: ORIGINS.vti,
    themeClass: "site-vti",
    analyticsSite: "vti",
    defaultDescription: "Nayokan Vocational Training Institute: practical skills and entrepreneurial clusters.",
  },
  startup: {
    id: "startup",
    name: "Nayokan Startup Centre",
    titleTemplate: "%s · Nayokan Startup Centre",
    origin: ORIGINS.startup,
    themeClass: "site-startup",
    analyticsSite: "startup",
    defaultDescription: "Nayokan Startup Centre: commercializing innovation from idea to scale.",
  },
};

export function previewSiteUrl(site: SiteId, path = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (site === "corporate") {
    return p;
  }
  return p === "/" ? `/${site}` : `/${site}${p}`;
}

/** Absolute URL on a given site. Use for every cross-site link and canonical URL. */
export function siteUrl(site: SiteId, path = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;

  // When custom domains have not yet been purchased or activated,
  // or when browsing on preview / single-hostname environments (*.vercel.app or localhost),
  // return safe relative/preview paths so links never navigate to unbought domains.
  const customDomainsActive = process.env.NEXT_PUBLIC_ENABLE_CUSTOM_DOMAINS === "true";

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isSingleHost = host.endsWith(".vercel.app") || host === "localhost" || host.includes(".localhost");
    if (!customDomainsActive || isSingleHost) {
      return previewSiteUrl(site, p);
    }
  } else if (!customDomainsActive) {
    return previewSiteUrl(site, p);
  }

  return p === "/" ? SITES[site].origin : `${SITES[site].origin}${p}`;
}


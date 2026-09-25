import type { SiteId } from "./types";
import { SITE_IDS, isSiteId } from "./types";

// Pure host/path routing decision used by proxy.ts. Free of Next imports so
// it is unit-testable. See docs/architecture/adr/001-multi-site-single-app.md.

export type HostKind = { kind: "site"; site: SiteId } | { kind: "admin" } | { kind: "unknown" };

export interface RoutingConfig {
  /** host (lowercase, with port) → site */
  siteHosts: Record<string, SiteId>;
  adminHosts: string[];
  /** Hosts that redirect to the corporate apex, e.g. www.nayokan.org. */
  wwwHosts: string[];
  corporateOrigin: string;
  vtiOrigin: string;
  startupOrigin: string;
  isProduction: boolean;
}

export type RoutingDecision =
  | { action: "rewrite"; site: SiteId; pathname: string }
  | { action: "admin" }
  | { action: "redirect"; location: string; status: 308 }
  | { action: "notFound" };

export const PREVIEW_SITE_PARAM = "__site";
export const PREVIEW_SITE_COOKIE = "nayokan_site";

const LEGACY_PREFIXES: { prefix: string; target: "vtiOrigin" | "startupOrigin" }[] = [
  { prefix: "/vocational-training", target: "vtiOrigin" },
  { prefix: "/startup-centre", target: "startupOrigin" },
];

const isAdminPath = (p: string) => p === "/admin" || p.startsWith("/admin/");

export function classifyHost(host: string, cfg: RoutingConfig): HostKind {
  const h = host.toLowerCase();
  if (cfg.adminHosts.includes(h)) return { kind: "admin" };
  const site = cfg.siteHosts[h];
  return site ? { kind: "site", site } : { kind: "unknown" };
}

export function routeRequest(input: {
  host: string;
  pathname: string;
  search: string;
  /** Non-production only: ?__site= / cookie override. Never a security input. */
  siteOverride?: string | null;
  cfg: RoutingConfig;
}): RoutingDecision {
  const { pathname, search, cfg } = input;
  const host = input.host.toLowerCase();

  if (cfg.wwwHosts.includes(host)) {
    return { action: "redirect", location: `${cfg.corporateOrigin}${pathname}${search}`, status: 308 };
  }

  let kind = classifyHost(host, cfg);

  // Preview deployments (and *.vercel.app deployment hosts) serve every site from one hostname.
  const isVercelHost = host.endsWith(".vercel.app") || host.includes(".vercel.app:");
  const isPreviewHost = kind.kind === "unknown" && (!cfg.isProduction || isVercelHost);

  if (isPreviewHost) {
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      return { action: "admin" };
    }

    // Direct path prefixes for preview testing: /vti and /startup
    if (pathname === "/vti") {
      return { action: "rewrite", site: "vti", pathname: "/vti" };
    }
    if (pathname.startsWith("/vti/")) {
      return { action: "rewrite", site: "vti", pathname };
    }
    if (pathname === "/startup") {
      return { action: "rewrite", site: "startup", pathname: "/startup" };
    }
    if (pathname.startsWith("/startup/")) {
      return { action: "rewrite", site: "startup", pathname };
    }

    // Route disambiguation: do not allow a sticky preview cookie to trap
    // routes that strictly exist on only one site. The apex homepage (/)
    // and corporate directories are strictly corporate on preview hosts.
    const CORPORATE_EXCLUSIVE = [
      "/",
      "/what-we-do",
      "/about",
      "/impact",
      "/insights",
      "/venture-capital",
      "/hospitality",
      "/contact",
      "/partners",
      "/application",
    ];
    const STARTUP_EXCLUSIVE = [
      "/commercialization",
      "/mentors",
      "/opportunities",
      "/portfolio",
      "/university-partnerships",
      "/programme",
    ];
    const VTI_EXCLUSIVE = [
      "/clusters",
    ];

    const matchesPrefix = (list: string[]) =>
      list.some((p) => pathname === p || (p !== "/" && pathname.startsWith(`${p}/`)));

    if (matchesPrefix(CORPORATE_EXCLUSIVE)) {
      kind = { kind: "site", site: "corporate" };
    } else if (matchesPrefix(STARTUP_EXCLUSIVE)) {
      kind = { kind: "site", site: "startup" };
    } else if (matchesPrefix(VTI_EXCLUSIVE)) {
      kind = { kind: "site", site: "vti" };
    } else {
      kind = { kind: "site", site: isSiteId(input.siteOverride) ? input.siteOverride : "corporate" };
    }
  }

  if (kind.kind === "unknown") return { action: "notFound" };

  if (kind.kind === "admin") {
    if (isAdminPath(pathname)) return { action: "admin" };
    return { action: "redirect", location: `/admin${pathname === "/" ? "" : pathname}${search}`, status: 308 };
  }

  // Admin UI is never served on a public host.
  if (isAdminPath(pathname)) return { action: "notFound" };

  if (kind.site === "corporate") {
    for (const { prefix, target } of LEGACY_PREFIXES) {
      if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
        const rest = pathname.slice(prefix.length);
        return { action: "redirect", location: `${cfg[target]}${rest}${search}`, status: 308 };
      }
    }
  }

  // robots.ts is root-only in Next 16 (unlike sitemap, which nests). Pass the
  // path through un-prefixed so app/robots.ts serves it; it resolves the site
  // from the x-nayokan-site header / Host.
  if (pathname === "/robots.txt") {
    return { action: "rewrite", site: kind.site, pathname: "/robots.txt" };
  }

  // Internal route-tree prefixes are never directly addressable: `/vti/x` on
  // the vti host becomes `/vti/vti/x`, which does not exist, so it 404s.
  return { action: "rewrite", site: kind.site, pathname: `/${kind.site}${pathname === "/" ? "" : pathname}` };
}

export function buildRoutingConfig(origins: {
  corporate: string;
  vti: string;
  startup: string;
  admin: string;
  isProduction: boolean;
}): RoutingConfig {
  const hostOf = (o: string) => new URL(o).host.toLowerCase();
  const siteHosts: Record<string, SiteId> = {};
  for (const id of SITE_IDS) siteHosts[hostOf(origins[id])] = id;
  const corporateHost = hostOf(origins.corporate);
  return {
    siteHosts,
    adminHosts: [hostOf(origins.admin)],
    wwwHosts: corporateHost.startsWith("www.") ? [] : [`www.${corporateHost}`],
    corporateOrigin: origins.corporate,
    vtiOrigin: origins.vti,
    startupOrigin: origins.startup,
    isProduction: origins.isProduction,
  };
}

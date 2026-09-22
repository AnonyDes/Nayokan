// Breadcrumb derivation for the admin topbar. The shell layout can't know
// which route it's wrapping (layouts receive no pathname/searchParams), so
// crumbs are resolved client-side from the URL itself: find the deepest nav
// item whose href prefixes the path (preferring the one whose ?site= matches),
// then label any remaining dynamic segments generically. The entity name
// itself belongs in the page's ax-page__title, not the crumb trail — matching
// the design's convention (e.g. "Applications / Application details").
import { NAV_GROUPS } from "./nav";

export interface Crumb {
  label: string;
  href?: string;
}

interface NavHit {
  groupLabel: string;
  itemLabel: string;
}

function findNavItem(pathname: string, site: string | null): NavHit | null {
  let fallback: NavHit | null = null;
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      // Nav hrefs may carry a query (e.g. /admin/programmes?site=vti) — the
      // pathname never does, so match on the path portion, then disambiguate
      // same-path items by their site param.
      const [itemPath, itemQuery] = item.href.split("?");
      if (itemPath !== pathname) continue;
      const itemSite = new URLSearchParams(itemQuery ?? "").get("site");
      const hit = { groupLabel: group.label, itemLabel: item.label };
      if (itemSite === site) return hit; // exact match including site scope
      if (itemSite === null || fallback === null) fallback = hit;
    }
  }
  return fallback;
}

/** Labels for segments that follow the deepest matched nav item. */
function leafLabel(segment: string): string {
  if (segment === "new") return "New";
  return "Details";
}

export function crumbsForPath(pathname: string, site: string | null = null): Crumb[] {
  const segments = pathname.replace(/\/+$/, "").split("/").filter(Boolean);

  if (segments.length <= 1) return [{ label: "Dashboard" }];

  // Walk from the full path toward /admin until a nav item matches; whatever
  // segments remain beyond it are detail/editor leaves.
  for (let i = segments.length; i >= 2; i--) {
    const candidate = `/${segments.slice(0, i).join("/")}`;
    const hit = findNavItem(candidate, site);
    if (!hit) continue;

    const crumbs: Crumb[] = [{ label: hit.groupLabel }];
    const isExact = i === segments.length;
    crumbs.push(isExact ? { label: hit.itemLabel } : { label: hit.itemLabel, href: candidate });
    for (const extra of segments.slice(i)) crumbs.push({ label: leafLabel(extra) });
    return crumbs;
  }

  return [{ label: "Admin" }];
}

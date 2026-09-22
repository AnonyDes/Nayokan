// Sidebar taxonomy per readiness-report.md §7 (site-aware groups), not the
// single-brand grouping in Designs/admin/scripts/shell.js — the multi-site
// architecture (ADR-001) didn't exist when that prototype nav was drawn.
// Visual language (ax-nav-group, ax-nav__item, icons) is still ported as-is.
import type { PermissionArea, PermissionLevel, SiteScope } from "@/platform/auth/types";
import type { SiteId } from "@/platform/sites/types";

export interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: string;
  /** Omit for always-visible items (dashboard, search, notifications). */
  require?: { area: PermissionArea; level: PermissionLevel; site?: SiteScope };
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const siteLabel: Record<SiteId, string> = { corporate: "Corporate", vti: "VTI", startup: "Startup Centre" };

function siteEditorGroup(site: SiteId): NavGroup {
  return {
    label: siteLabel[site],
    items: [
      { id: `${site}-pages`, href: `/admin/sites/${site}/pages`, label: "Pages", icon: "file", require: { area: "pages", level: "view", site } },
      { id: `${site}-homepage`, href: `/admin/sites/${site}/homepage`, label: "Homepage", icon: "home", require: { area: "website", level: "view", site } },
      { id: `${site}-navigation`, href: `/admin/sites/${site}/navigation`, label: "Navigation", icon: "sitemap", require: { area: "website", level: "view", site } },
      { id: `${site}-seo`, href: `/admin/sites/${site}/seo`, label: "SEO", icon: "target", require: { area: "website", level: "view", site } },
    ],
  };
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { id: "dashboard", href: "/admin", label: "Dashboard", icon: "grid" },
      { id: "review-queue", href: "/admin/review-queue", label: "Review queue", icon: "inbox" },
      { id: "notifications", href: "/admin/notifications", label: "Notifications", icon: "bell" },
      { id: "search", href: "/admin/search", label: "Search", icon: "search" },
    ],
  },
  siteEditorGroup("corporate"),
  {
    label: "Corporate",
    items: [
      { id: "articles", href: "/admin/content/articles", label: "Insights", icon: "article", require: { area: "articles", level: "view", site: "corporate" } },
      { id: "stories", href: "/admin/content/stories", label: "Stories", icon: "quote", require: { area: "stories", level: "view", site: "corporate" } },
      { id: "partners", href: "/admin/ecosystem/partners", label: "Partners", icon: "handshake", require: { area: "partners", level: "view" } },
      { id: "people", href: "/admin/ecosystem/people", label: "People", icon: "user", require: { area: "people", level: "view" } },
      { id: "portfolio", href: "/admin/ecosystem/portfolio", label: "Venture Capital", icon: "graph", require: { area: "portfolio", level: "view" } },
      { id: "properties", href: "/admin/ecosystem/properties", label: "Hospitality", icon: "building", require: { area: "properties", level: "view" } },
    ],
  },
  siteEditorGroup("vti"),
  {
    label: "VTI",
    items: [
      { id: "vti-programmes", href: "/admin/programmes?site=vti", label: "Programmes", icon: "layers", require: { area: "programmes", level: "view", site: "vti" } },
      { id: "vti-clusters", href: "/admin/programmes/clusters?site=vti", label: "Clusters", icon: "hex", require: { area: "programmes", level: "view", site: "vti" } },
    ],
  },
  siteEditorGroup("startup"),
  {
    label: "Startup Centre",
    items: [
      { id: "startup-programmes", href: "/admin/programmes?site=startup", label: "Programme", icon: "layers", require: { area: "programmes", level: "view", site: "startup" } },
      { id: "startup-opportunities", href: "/admin/programmes/opportunities?site=startup", label: "Opportunities", icon: "star", require: { area: "programmes", level: "view", site: "startup" } },
      { id: "startup-mentors", href: "/admin/ecosystem/mentors", label: "Mentors", icon: "users", require: { area: "people", level: "view", site: "startup" } },
      { id: "startup-portfolio", href: "/admin/ecosystem/portfolio?site=startup", label: "Portfolio", icon: "graph", require: { area: "portfolio", level: "view", site: "startup" } },
    ],
  },
  {
    label: "Shared",
    items: [
      { id: "media", href: "/admin/media", label: "Media", icon: "image", require: { area: "media", level: "view" } },
      { id: "impact-metrics", href: "/admin/impact/metrics", label: "Impact metrics", icon: "chart", require: { area: "impact_metrics", level: "view" } },
      { id: "evidence", href: "/admin/impact/evidence", label: "Evidence", icon: "shield", require: { area: "evidence", level: "view" } },
      { id: "impact-stories", href: "/admin/impact/stories", label: "Impact stories", icon: "book", require: { area: "impact_metrics", level: "view" } },
      { id: "applications", href: "/admin/applications", label: "Applications", icon: "inbox-2", require: { area: "applications", level: "view" } },
      { id: "enquiries", href: "/admin/enquiries", label: "Enquiries", icon: "mail", require: { area: "enquiries", level: "view" } },
      { id: "version-history", href: "/admin/version-history", label: "Version history", icon: "log", require: { area: "audit_log", level: "view" } },
    ],
  },
  {
    label: "Administration",
    items: [
      { id: "users", href: "/admin/admin/users", label: "Users", icon: "shield-user", require: { area: "users", level: "view" } },
      { id: "roles", href: "/admin/admin/roles", label: "Roles & permissions", icon: "key", require: { area: "roles", level: "view" } },
      { id: "audit", href: "/admin/admin/audit-log", label: "Audit log", icon: "log", require: { area: "audit_log", level: "view" } },
      { id: "settings", href: "/admin/admin/settings", label: "Settings", icon: "gear", require: { area: "settings", level: "view" } },
    ],
  },
];

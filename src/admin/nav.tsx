// Admin navigation — ported 1:1 from Designs/admin/scripts/shell.js.
// hrefs rewritten to /admin/* routes. Icons are the design's 1.5px line set.

export interface AdminNavItem {
  id: string;
  href: string;
  label: string;
  icon: string;
}

export const ADMIN_NAV: { label: string; items: AdminNavItem[] }[] = [
  { label: "Workspace", items: [
    { id: "dashboard",     href: "/admin",                label: "Dashboard",     icon: "grid" },
    { id: "review-queue",  href: "/admin/review-queue",   label: "Review queue",  icon: "inbox" },
    { id: "notifications", href: "/admin/notifications",  label: "Notifications", icon: "bell" },
    { id: "search",        href: "/admin/search",         label: "Search",        icon: "search" },
  ]},
  { label: "Content", items: [
    { id: "pages",    href: "/admin/pages",    label: "Pages",              icon: "file" },
    { id: "articles", href: "/admin/articles", label: "Articles / Insights",icon: "article" },
    { id: "stories",  href: "/admin/stories",  label: "Stories",            icon: "quote" },
    { id: "media",    href: "/admin/media",    label: "Media library",      icon: "image" },
  ]},
  { label: "Programmes", items: [
    { id: "programmes",    href: "/admin/programmes",    label: "Programmes",   icon: "layers" },
    { id: "clusters",      href: "/admin/clusters",      label: "Clusters",     icon: "hex" },
    { id: "opportunities", href: "/admin/opportunities", label: "Opportunities",icon: "star" },
    { id: "applications",  href: "/admin/applications",  label: "Applications", icon: "inbox-2" },
  ]},
  { label: "Ecosystem", items: [
    { id: "people",     href: "/admin/people",     label: "People",     icon: "user" },
    { id: "mentors",    href: "/admin/mentors",    label: "Mentors",    icon: "users" },
    { id: "partners",   href: "/admin/partners",   label: "Partners",   icon: "handshake" },
    { id: "portfolio",  href: "/admin/portfolio",  label: "Portfolio",  icon: "graph" },
    { id: "properties", href: "/admin/properties", label: "Properties", icon: "building" },
  ]},
  { label: "Impact", items: [
    { id: "impact-metrics", href: "/admin/impact-metrics",  label: "Impact metrics", icon: "chart" },
    { id: "evidence",       href: "/admin/evidence",        label: "Evidence",       icon: "shield" },
    { id: "impact-stories", href: "/admin/impact-stories",  label: "Impact stories", icon: "book" },
  ]},
  { label: "Operations", items: [
    { id: "enquiries", href: "/admin/enquiries", label: "Enquiries", icon: "mail" },
  ]},
  { label: "Website", items: [
    { id: "homepage",    href: "/admin/homepage",    label: "Homepage",   icon: "home" },
    { id: "navigation",  href: "/admin/navigation",  label: "Navigation", icon: "sitemap" },
    { id: "seo",         href: "/admin/seo",         label: "SEO",        icon: "target" },
  ]},
  { label: "Administration", items: [
    { id: "users",    href: "/admin/users",    label: "Users",                icon: "shield-user" },
    { id: "roles",    href: "/admin/roles",    label: "Roles & permissions",  icon: "key" },
    { id: "audit",    href: "/admin/audit",    label: "Audit log",            icon: "log" },
    { id: "settings", href: "/admin/settings", label: "Settings",             icon: "gear" },
  ]},
];

export const ADMIN_ICONS: Record<string, string> = {
  grid:       '<rect x="3" y="3" width="7" height="7"/><rect x="3" y="13" width="7" height="7"/><rect x="13" y="3" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>',
  inbox:      '<path d="M3 13v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6"/><path d="M3 13l3-8h12l3 8"/><path d="M3 13h5l1 3h6l1-3h5"/>',
  "inbox-2":  '<path d="M4 12h4l2 3h4l2-3h4"/><path d="M4 12V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6"/><path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/>',
  bell:       '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
  search:     '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>',
  file:       '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
  article:    '<path d="M4 3h13a2 2 0 0 1 2 2v15l-4-3H6a2 2 0 0 1-2-2z"/><path d="M8 8h9M8 12h9M8 16h6"/>',
  quote:      '<path d="M5 8h4v4a4 4 0 0 1-4 4"/><path d="M13 8h4v4a4 4 0 0 1-4 4"/>',
  image:      '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 15-4-4-8 8"/>',
  layers:     '<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
  hex:        '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/>',
  star:       '<path d="m12 4 2.5 5 5.5.8-4 3.9.9 5.5L12 16.7 7.1 19.2 8 13.7 4 9.8l5.5-.8z"/>',
  user:       '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
  users:      '<circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="17" cy="7" r="2.5"/><path d="M22 20c0-2.5-2-4.5-5-4.5"/>',
  handshake:  '<path d="M11 17 8 20a2 2 0 0 1-3-3l4-4"/><path d="m13 15 4 4a2 2 0 0 0 3-3l-6-6a2 2 0 0 0-3 0l-2 2a2 2 0 0 1-3 0L4 10"/><path d="M14 8h4l2 2"/>',
  graph:      '<path d="M4 20V6M4 20h16"/><path d="m8 16 3-4 3 2 5-7"/>',
  building:   '<rect x="5" y="3" width="14" height="18"/><path d="M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1"/>',
  chart:      '<path d="M4 20V4M4 20h16"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="14" width="3" height="4"/>',
  shield:     '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  book:       '<path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
  mail:       '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  home:       '<path d="m4 11 8-7 8 7v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M10 21v-6h4v6"/>',
  sitemap:    '<rect x="9" y="3" width="6" height="4"/><rect x="3" y="17" width="6" height="4"/><rect x="15" y="17" width="6" height="4"/><path d="M12 7v4M6 17v-2h12v2M12 11v4"/>',
  target:     '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
  "shield-user": '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><circle cx="12" cy="10" r="2"/><path d="M8 17c0-2 1.5-3 4-3s4 1 4 3"/>',
  key:        '<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8.2-8.2m-3 3 3 3m-6 0 3 3"/>',
  log:        '<path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  gear:       '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  help:       '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 4"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/>',
  preview:    '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
  plus:       '<path d="M12 5v14M5 12h14"/>',
  check:      '<path d="m5 13 4 4L19 7"/>',
  x:          '<path d="M6 6l12 12M18 6 6 18"/>',
  chevron:    '<path d="m9 6 6 6-6 6"/>',
  "chevron-d":'<path d="m6 9 6 6 6-6"/>',
  filter:     '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>',
  warn:       '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17.5v.5"/>',
};

export function AxIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ADMIN_ICONS[name] ?? "" }}
    />
  );
}

// MOCK site-CMS data — pending Session B's content tables (pages,
// home_sections, navigation_menus, seo_settings — readiness-report §8-9).
// Rows are drawn from Designs/admin/{pages,homepage-editor,navigation,seo,
// page-editor}.html verbatim where the design enumerates them; VTI/Startup
// sets are marked pendingConfirmation because the design package only
// specified them for the single-site prototype. Nothing here is asserted
// public fact — the screens tag mock data per AGENTS.md.
import "server-only";
import { filterByQuery, filterByStatus, paginate, type ListQuery, type Page } from "@/admin/data/query";
import { mockGet, mockId, mockInsert, mockList, mockUpdate } from "@/admin/data/mock-store";
import type { SiteId, World } from "@/platform/content/types";
import type { AdminPage, AdminPageSection, SiteNav } from "./types";

const DEMO = { isDemo: true } as const;

function section(id: string, key: string, title: string, sub: string, isLive: boolean, fields: Record<string, string> = {}): AdminPageSection {
  return { id, key, title, sub, isLive, fields };
}

function standardSections(pageId: string, eyebrow: string): AdminPageSection[] {
  return [
    section(`${pageId}:hero`, "hero", "Hero", "Fixed layout · edit copy and image only", true, {
      eyebrow,
      headline: "",
      supportingCopy: "",
      primaryCtaLabel: "",
      primaryCtaHref: "",
    }),
    section(`${pageId}:body`, "body", "Body content", "Structured blocks", true),
    section(`${pageId}:cta`, "cta", "Call to action", "Banner strip", true),
  ];
}

interface PageSeed {
  id: string;
  site: SiteId;
  path: string;
  title: string;
  world: World | null;
  status: AdminPage["status"];
  isPublic: boolean;
  updatedBy: string;
  updatedAgo: string;
  seoTitleLen: number | null;
  seoDescLen: number | null;
  socialSet: boolean;
}

function pg(s: PageSeed): AdminPage {
  const { id, site, path, title, world, status, isPublic, updatedBy, updatedAgo, seoTitleLen, seoDescLen, socialSet } = s;
  return {
    id,
    site,
    path,
    title,
    world,
    status,
    isPublic,
    updatedBy,
    updatedAgo,
    sections: standardSections(id, world === "vti" ? "01 · Vocational Training Institute" : "Nayokan"),
    seo: {},
    seoTitleLen,
    seoDescLen,
    socialSet,
    provenance: { ...DEMO },
  };
}

// Design source: pages.html. Corporate owns the institutional + world
// landing pages; VTI/Startup own only what their hosts serve — paths there
// are root-relative to their own origin (ADR-001).
const SEED_PAGES: AdminPage[] = [
  // — corporate (nayokan.org) —
  pg({ id: "corp-home", site: "corporate", path: "/", title: "Homepage", world: null, status: "published", isPublic: true, updatedBy: "Sarah", updatedAgo: "2h", seoTitleLen: 58, seoDescLen: 142, socialSet: true }),
  pg({ id: "corp-what-we-do", site: "corporate", path: "/what-we-do", title: "What we do", world: null, status: "published", isPublic: true, updatedBy: "Maria", updatedAgo: "Yesterday", seoTitleLen: 52, seoDescLen: 138, socialSet: true }),
  pg({ id: "corp-vc", site: "corporate", path: "/venture-capital", title: "Venture Capital", world: "venture_capital", status: "published", isPublic: true, updatedBy: "David", updatedAgo: "2w", seoTitleLen: 28, seoDescLen: 142, socialSet: false }),
  pg({ id: "corp-vc-approach", site: "corporate", path: "/vc-approach", title: "VC · Approach", world: "venture_capital", status: "published", isPublic: true, updatedBy: "David", updatedAgo: "2w", seoTitleLen: 40, seoDescLen: 120, socialSet: true }),
  pg({ id: "corp-vc-pipeline", site: "corporate", path: "/vc-pipeline", title: "VC · Pipeline", world: "venture_capital", status: "published", isPublic: true, updatedBy: "David", updatedAgo: "2w", seoTitleLen: 38, seoDescLen: 118, socialSet: true }),
  pg({ id: "corp-vc-portfolio", site: "corporate", path: "/vc-portfolio", title: "VC · Portfolio", world: "venture_capital", status: "published", isPublic: true, updatedBy: "David", updatedAgo: "2w", seoTitleLen: 36, seoDescLen: 122, socialSet: true }),
  pg({ id: "corp-vc-partner", site: "corporate", path: "/vc-partner", title: "VC · Become a partner", world: "venture_capital", status: "published", isPublic: true, updatedBy: "David", updatedAgo: "2w", seoTitleLen: 44, seoDescLen: 130, socialSet: true }),
  pg({ id: "corp-hos", site: "corporate", path: "/hospitality", title: "Hospitality", world: "hospitality", status: "published", isPublic: true, updatedBy: "David", updatedAgo: "3w", seoTitleLen: 46, seoDescLen: 132, socialSet: true }),
  pg({ id: "corp-hos-properties", site: "corporate", path: "/hospitality-properties", title: "Hospitality · Properties", world: "hospitality", status: "published", isPublic: true, updatedBy: "David", updatedAgo: "3w", seoTitleLen: 50, seoDescLen: 128, socialSet: true }),
  pg({ id: "corp-impact", site: "corporate", path: "/impact", title: "Impact", world: null, status: "published", isPublic: true, updatedBy: "David", updatedAgo: "3d", seoTitleLen: 52, seoDescLen: 148, socialSet: true }),
  pg({ id: "corp-partners", site: "corporate", path: "/partners", title: "Partners", world: null, status: "published", isPublic: true, updatedBy: "Sarah", updatedAgo: "2w", seoTitleLen: 42, seoDescLen: null, socialSet: true }),
  pg({ id: "corp-insights", site: "corporate", path: "/insights", title: "Insights", world: null, status: "published", isPublic: true, updatedBy: "Sarah", updatedAgo: "2h", seoTitleLen: 40, seoDescLen: 126, socialSet: true }),
  pg({ id: "corp-contact", site: "corporate", path: "/contact", title: "Contact", world: null, status: "published", isPublic: true, updatedBy: "Sarah", updatedAgo: "1mo", seoTitleLen: 32, seoDescLen: 104, socialSet: false }),
  pg({ id: "corp-about", site: "corporate", path: "/about", title: "About", world: null, status: "published", isPublic: true, updatedBy: "Maria", updatedAgo: "1mo", seoTitleLen: 20, seoDescLen: 110, socialSet: true }),
  pg({ id: "corp-sitemap", site: "corporate", path: "/sitemap", title: "Sitemap", world: null, status: "published", isPublic: true, updatedBy: "System", updatedAgo: "—", seoTitleLen: 18, seoDescLen: null, socialSet: false }),
  pg({ id: "corp-privacy", site: "corporate", path: "/privacy", title: "Legal · Privacy", world: null, status: "draft", isPublic: false, updatedBy: "Maria", updatedAgo: "2mo", seoTitleLen: 28, seoDescLen: null, socialSet: false }),
  pg({ id: "corp-terms", site: "corporate", path: "/terms", title: "Legal · Terms", world: null, status: "draft", isPublic: false, updatedBy: "Maria", updatedAgo: "2mo", seoTitleLen: 24, seoDescLen: null, socialSet: false }),
  pg({ id: "corp-impact-deep-dive", site: "corporate", path: "/impact-deep", title: "Impact · Deep dive", world: null, status: "draft", isPublic: false, updatedBy: "David", updatedAgo: "5d", seoTitleLen: 30, seoDescLen: null, socialSet: false }),

  // — vti (vti.nayokan.org) — derived from pages.html's VTI rows + page-editor.html.
  pg({ id: "vti-home", site: "vti", path: "/", title: "Homepage", world: "vti", status: "published", isPublic: true, updatedBy: "John", updatedAgo: "3d", seoTitleLen: 44, seoDescLen: 128, socialSet: true }),
  pg({ id: "vti-overview", site: "vti", path: "/overview", title: "VTI · Overview", world: "vti", status: "published", isPublic: true, updatedBy: "John", updatedAgo: "3d", seoTitleLen: 36, seoDescLen: 122, socialSet: true }),
  pg({ id: "vti-programmes", site: "vti", path: "/programmes", title: "VTI · Programmes", world: "vti", status: "published", isPublic: true, updatedBy: "John", updatedAgo: "3d", seoTitleLen: 40, seoDescLen: 118, socialSet: true }),
  pg({ id: "vti-clusters", site: "vti", path: "/clusters", title: "VTI · Clusters", world: "vti", status: "published", isPublic: true, updatedBy: "John", updatedAgo: "5d", seoTitleLen: 34, seoDescLen: 116, socialSet: true }),
  pg({ id: "vti-apply", site: "vti", path: "/apply", title: "Apply", world: "vti", status: "draft", isPublic: false, updatedBy: "John", updatedAgo: "1w", seoTitleLen: 18, seoDescLen: null, socialSet: false }),

  // — startup (startup.nayokan.org) — design's Startup-* rows, root-relative.
  pg({ id: "sc-home", site: "startup", path: "/", title: "Homepage", world: "startup", status: "published", isPublic: true, updatedBy: "Sarah", updatedAgo: "1w", seoTitleLen: 48, seoDescLen: 134, socialSet: true }),
  pg({ id: "sc-commercialisation", site: "startup", path: "/commercialisation", title: "Startup · Commercialisation", world: "startup", status: "published", isPublic: true, updatedBy: "Sarah", updatedAgo: "1w", seoTitleLen: 52, seoDescLen: 128, socialSet: true }),
  pg({ id: "sc-mentors", site: "startup", path: "/mentors", title: "Startup · Mentors", world: "startup", status: "published", isPublic: true, updatedBy: "Sarah", updatedAgo: "1w", seoTitleLen: 34, seoDescLen: 112, socialSet: true }),
  pg({ id: "sc-portfolio", site: "startup", path: "/portfolio", title: "Startup · Portfolio", world: "startup", status: "published", isPublic: true, updatedBy: "Sarah", updatedAgo: "1w", seoTitleLen: 36, seoDescLen: 120, socialSet: true }),
  pg({ id: "sc-opportunities", site: "startup", path: "/opportunities", title: "Startup · Opportunities", world: "startup", status: "published", isPublic: true, updatedBy: "Sarah", updatedAgo: "2w", seoTitleLen: 44, seoDescLen: 124, socialSet: true }),
  pg({ id: "sc-university", site: "startup", path: "/university-partnerships", title: "Startup · University partnerships", world: "startup", status: "published", isPublic: true, updatedBy: "Sarah", updatedAgo: "2w", seoTitleLen: 56, seoDescLen: 132, socialSet: true }),
];

// VTI overview page's real section list (page-editor.html).
const VTI_OVERVIEW_SECTIONS: AdminPageSection[] = [
  section("vti-overview:hero", "hero", "Hero", "Fixed layout · edit copy and image only", true, {
    eyebrow: "01 · Vocational Training Institute",
    headline: "Practical training. National standards. Productive enterprise.",
    supportingCopy:
      "The Nayokan Vocational Training Institute turns capability into recognised, productive enterprise — through certification, cluster peer accountability and market-ready programmes.",
  }),
  section("vti-overview:structure", "structure", "Programme structure", "", true),
  section("vti-overview:clusters", "clusters", "Four clusters", "", true),
  section("vti-overview:pathway", "pathway", "Learning pathway", "", true),
  section("vti-overview:certification", "certification", "Certification", "", true),
  section("vti-overview:enrolment", "enrolment", "Enrolment", "", true),
  section("vti-overview:related", "related", "Related content", "", true),
];

// Corporate homepage sections — verbatim from homepage-editor.html. The hero
// copy is the design's own approved text (the only homepage copy in the pack).
const CORPORATE_HOME_SECTIONS: AdminPageSection[] = [
  section("corporate:hero", "hero", "Hero", "Institutional statement", true, {
    eyebrow: "A Cameroonian development institution",
    headline: "Building <em>people</em>, enterprises&nbsp;and productive systems for Cameroon.",
    supportingCopy:
      "Nayokan is an ecosystem of vocational training, entrepreneurship, innovation and capital — connecting human capability to productive enterprise across four institutional worlds.",
    primaryCtaLabel: "Explore what we do",
    primaryCtaHref: "#what-we-do",
    secondaryCtaLabel: "Partner with Nayokan",
    secondaryCtaHref: "#cta",
    heroImage: "nayokan-hero-a.jpg",
  }),
  section("corporate:system", "system", "Nayokan system", "Stage narrative", true),
  section("corporate:worlds", "worlds", "Four worlds", "VTI · SC · VC · Hospitality", true),
  section("corporate:programmes", "programmes", "Flagship programmes", "3 selected · rotating", true),
  section("corporate:impact", "impact", "Impact", "6 verified metrics", true),
  section("corporate:stories", "stories", "Stories", "4 selected", true),
  section("corporate:partners", "partners", "Partners", "Curated logos", true),
  section("corporate:cta", "cta", "Final CTA", "Partnership call", true),
  section("corporate:newsletter", "newsletter", "Newsletter signup", "Disabled", false),
  section("corporate:event-banner", "event-banner", "Event banner", "Disabled", false),
];

// VTI/Startup homepages reuse the same fixed-section pattern; their exact
// composition is pending confirmation (the design only specified corporate).
const VTI_HOME_SECTIONS: AdminPageSection[] = [
  section("vti:hero", "hero", "Hero", "Institute statement", true, { eyebrow: "01 · Vocational Training Institute", headline: "", supportingCopy: "" }),
  section("vti:programmes", "programmes", "Programmes", "Curated", true),
  section("vti:clusters", "clusters", "Clusters", "Curated", true),
  section("vti:stories", "stories", "Stories", "Curated", true),
  section("vti:cta", "cta", "Final CTA", "Application call", true),
];

const STARTUP_HOME_SECTIONS: AdminPageSection[] = [
  section("startup:hero", "hero", "Hero", "Centre statement", true, { eyebrow: "02 · Startup Centre", headline: "", supportingCopy: "" }),
  section("startup:programme", "programme", "Programme", "Curated", true),
  section("startup:mentors", "mentors", "Mentors", "Curated", true),
  section("startup:opportunities", "opportunities", "Opportunities", "Curated", true),
  section("startup:cta", "cta", "Final CTA", "Application call", true),
];

function seedHomeSections(): AdminPageSection[] {
  return [...CORPORATE_HOME_SECTIONS, ...VTI_HOME_SECTIONS, ...STARTUP_HOME_SECTIONS];
}

const NAV_SEED: Record<SiteId, SiteNav> = {
  // navigation.html's corporate nav, verbatim.
  corporate: {
    site: "corporate",
    primary: [
      { id: "n1", label: "What we do", href: "/what-we-do", enabled: true },
      { id: "n2", label: "VTI", href: "/vti", enabled: true },
      { id: "n3", label: "Startup Centre", href: "/startup-centre", enabled: true },
      { id: "n4", label: "Venture Capital", href: "/venture-capital", enabled: true },
      { id: "n5", label: "Hospitality", href: "/hospitality", enabled: true },
      { id: "n6", label: "Impact", href: "/impact", enabled: true },
    ],
    footerColumns: [
      { heading: "Nayokan", links: [{ label: "About", href: "/about" }, { label: "What we do", href: "/what-we-do" }, { label: "Impact", href: "/impact" }, { label: "Contact", href: "/contact" }] },
      { heading: "Worlds", links: [{ label: "VTI", href: "/vti" }, { label: "Startup Centre", href: "/startup-centre" }, { label: "Venture Capital", href: "/venture-capital" }, { label: "Hospitality", href: "/hospitality" }] },
      { heading: "Institution", links: [{ label: "Partners", href: "/partners" }, { label: "Insights", href: "/insights" }, { label: "Sitemap", href: "/sitemap" }, { label: "Legal", href: "/privacy" }] },
    ],
    headerCta: { label: "Partner with us", href: "/contact" },
    footerCta: { label: "Get in touch", href: "/contact" },
    pendingConfirmation: false,
  },
  vti: {
    site: "vti",
    primary: [
      { id: "v1", label: "Programmes", href: "/programmes", enabled: true },
      { id: "v2", label: "Clusters", href: "/clusters", enabled: true },
      { id: "v3", label: "Stories", href: "/stories", enabled: true },
      { id: "v4", label: "Apply", href: "/apply", enabled: true },
    ],
    footerColumns: [
      { heading: "VTI", links: [{ label: "Programmes", href: "/programmes" }, { label: "Clusters", href: "/clusters" }, { label: "Apply", href: "/apply" }] },
      { heading: "Nayokan", links: [{ label: "Corporate", href: "https://nayokan.org" }, { label: "Startup Centre", href: "https://startup.nayokan.org" }] },
    ],
    headerCta: { label: "Apply now", href: "/apply" },
    footerCta: { label: "Contact VTI", href: "/contact" },
    pendingConfirmation: true,
  },
  startup: {
    site: "startup",
    primary: [
      { id: "s1", label: "Programme", href: "/programme", enabled: true },
      { id: "s2", label: "Mentors", href: "/mentors", enabled: true },
      { id: "s3", label: "Portfolio", href: "/portfolio", enabled: true },
      { id: "s4", label: "Opportunities", href: "/opportunities", enabled: true },
    ],
    footerColumns: [
      { heading: "Startup Centre", links: [{ label: "Programme", href: "/programme" }, { label: "Opportunities", href: "/opportunities" }, { label: "Mentors", href: "/mentors" }] },
      { heading: "Nayokan", links: [{ label: "Corporate", href: "https://nayokan.org" }, { label: "VTI", href: "https://vti.nayokan.org" }] },
    ],
    headerCta: { label: "Apply to the programme", href: "/programme#apply" },
    footerCta: { label: "Get in touch", href: "/contact" },
    pendingConfirmation: true,
  },
};

function seedPages() {
  return SEED_PAGES.map((p) => (p.id === "vti-overview" ? { ...p, sections: VTI_OVERVIEW_SECTIONS } : p));
}

const homeId = (site: SiteId, key: string) => `${site}:${key}`;

export function listPages(site: SiteId, query: ListQuery): Page<AdminPage> {
  let rows = mockList("site_pages", seedPages).filter((p) => p.site === site);
  rows = filterByStatus(rows, query.status, (r) => r.status);
  rows = filterByQuery(rows, query.q, (r) => [r.title, r.path]);
  return paginate(rows, query.page);
}

export function pageStatusCounts(site: SiteId): Record<string, number> {
  const rows = mockList("site_pages", seedPages).filter((p) => p.site === site);
  const counts: Record<string, number> = { all: rows.length };
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
  return counts;
}

export function getPage(site: SiteId, id: string): AdminPage | null {
  const page = mockGet("site_pages", seedPages, id);
  return page && page.site === site ? page : null;
}

export function getHomepageSections(site: SiteId): AdminPageSection[] {
  return mockList("home_sections", seedHomeSections).filter((s) => s.id.startsWith(`${site}:`));
}

function seedNav() {
  return Object.values(NAV_SEED).map((n) => ({ ...n, id: n.site }));
}

export function getNavigation(site: SiteId): SiteNav {
  const nav = mockGet("site_nav", seedNav, site);
  // Structural copy so callers can't mutate the store by accident.
  return { ...nav!, primary: nav!.primary.map((r) => ({ ...r })), footerColumns: nav!.footerColumns.map((c) => ({ ...c, links: c.links.map((l) => ({ ...l })) })) };
}

export interface SeoRow {
  pageId: string;
  title: string;
  path: string;
  titleLen: number | null;
  descLen: number | null;
  socialSet: boolean;
}

export function listSeoRows(site: SiteId, query: ListQuery): Page<SeoRow> {
  let rows = mockList("site_pages", seedPages)
    .filter((p) => p.site === site)
    .map((p): SeoRow => ({ pageId: p.id, title: p.title, path: p.path, titleLen: p.seoTitleLen, descLen: p.seoDescLen, socialSet: p.socialSet }));
  const tab = query.status;
  if (tab === "needs") rows = rows.filter((r) => r.titleLen === null || r.descLen === null || !r.socialSet);
  if (tab === "complete") rows = rows.filter((r) => r.titleLen !== null && r.descLen !== null && r.socialSet);
  rows = filterByQuery(rows, query.q, (r) => [r.title, r.path]);
  return paginate(rows, query.page);
}

export function seoStats(site: SiteId): { indexed: number; missingDesc: number; missingSocial: number; healthPct: number } {
  const rows = mockList("site_pages", seedPages).filter((p) => p.site === site);
  const missingDesc = rows.filter((r) => r.seoDescLen === null).length;
  const missingSocial = rows.filter((r) => !r.socialSet).length;
  const complete = rows.filter((r) => r.seoTitleLen !== null && r.seoDescLen !== null && r.socialSet).length;
  return {
    indexed: rows.length,
    missingDesc,
    missingSocial,
    healthPct: rows.length ? Math.round((complete / rows.length) * 100) : 0,
  };
}

// — mock mutations (called only from actions.ts after authZ) —

export function updatePagePublic(site: SiteId, id: string, isPublic: boolean): AdminPage | null {
  const page = mockGet("site_pages", seedPages, id);
  // Mirror RLS: a site-scoped write must never touch another site's row.
  if (!page || page.site !== site) return null;
  return mockUpdate("site_pages", seedPages, id, { isPublic });
}

export function updateSectionFields(site: SiteId, pageId: string | "home", sectionKey: string, fields: Record<string, string>): boolean {
  if (pageId === "home") {
    return mockUpdate("home_sections", seedHomeSections, homeId(site, sectionKey), { fields }) !== null;
  }
  const page = mockGet("site_pages", seedPages, pageId);
  if (!page || page.site !== site) return false;
  const sections = page.sections.map((s) => (s.key === sectionKey ? { ...s, fields: { ...s.fields, ...fields } } : s));
  return mockUpdate("site_pages", seedPages, pageId, { sections }) !== null;
}

export function updateSectionLive(site: SiteId, pageId: string | "home", sectionKey: string, isLive: boolean): boolean {
  if (pageId === "home") {
    return mockUpdate("home_sections", seedHomeSections, homeId(site, sectionKey), { isLive }) !== null;
  }
  const page = mockGet("site_pages", seedPages, pageId);
  if (!page || page.site !== site) return false;
  const sections = page.sections.map((s) => (s.key === sectionKey ? { ...s, isLive } : s));
  return mockUpdate("site_pages", seedPages, pageId, { sections }) !== null;
}

export function updateNavRowEnabled(site: SiteId, rowId: string, enabled: boolean): boolean {
  const nav = mockGet("site_nav", seedNav, site);
  if (!nav) return false;
  const primary = nav.primary.map((r) => (r.id === rowId ? { ...r, enabled } : r));
  return mockUpdate("site_nav", seedNav, site, { primary }) !== null;
}

export function updateNavCtas(site: SiteId, headerCta: { label: string; href: string }, footerCta: { label: string; href: string }): boolean {
  return mockUpdate("site_nav", seedNav, site, { headerCta, footerCta }) !== null;
}

export function createPage(site: SiteId, title: string, path: string): AdminPage {
  return mockInsert("site_pages", seedPages, {
    id: mockId("page"),
    site,
    path,
    title,
    world: null,
    status: "draft",
    isPublic: false,
    updatedBy: "You",
    updatedAgo: "now",
    sections: standardSections("new", "Nayokan"),
    seo: {},
    seoTitleLen: null,
    seoDescLen: null,
    socialSet: false,
    provenance: { ...DEMO },
  });
}

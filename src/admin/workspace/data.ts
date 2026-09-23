// MOCK workspace data — notifications (notifications.html) and the global
// search composer (search.html). Search fans out across every module's list
// seam and filters the union by the session's real permissions, so a role
// never sees a result it couldn't open.
import "server-only";
import { mockId, mockInsert, mockList, mockUpdate } from "@/admin/data/mock-store";
import { filterByStatus } from "@/admin/data/query";
import { hasPermission } from "@/platform/auth/permissions";
import type { AdminSession, PermissionArea } from "@/platform/auth/types";
import { SITE_IDS, type SiteId } from "@/platform/sites/types";
import { SITES } from "@/platform/sites/registry";
import { listPages } from "@/admin/content/site/data";
import { listArticles, listStories } from "@/admin/content/articles/data";
import { listProgrammes, listOpportunities, listClusters } from "@/admin/content/programmes/data";
import { listPeople, listMentors, listPartners, listVentures, listProperties } from "@/admin/content/ecosystem/data";
import { listApplications } from "@/admin/operations/applications/data";
import { listEnquiries } from "@/admin/operations/enquiries/data";
import { ENQUIRY_PILL } from "@/admin/operations/enquiries/labels";
import { listMetrics, listEvidence } from "@/admin/operations/impact/data";
import { METRIC_STATUS_PILL, EVIDENCE_STATUS_PILL } from "@/admin/operations/impact/labels";
import { listMedia } from "@/admin/media/data";
import type { AdminNotification, NotificationTab, SearchResult } from "./types";
import type { PillTone } from "@/admin/ui/Pill";
import type { ContentStatus } from "@/platform/content/types";

const DEMO = { isDemo: true } as const;
const COLLECTION = "notifications";

// — notifications (mirrors Designs/admin/notifications.html rows) —

const SEED: AdminNotification[] = [
  { id: "nt-1", kind: "event", label: "Application received", message: "A new application was submitted to Welding · Cohort 4", unread: true, ago: "12m", href: "/admin/applications", provenance: { ...DEMO } },
  { id: "nt-2", kind: "approval", label: "Article awaiting review", message: 'John Bekolo submitted "Building productive capability" for your review', unread: true, ago: "2h", href: "/admin/review-queue", provenance: { ...DEMO } },
  { id: "nt-3", kind: "approval", label: "Metric requires verification", message: "People trained · 2025 · value 240 · missing evidence", unread: true, ago: "4h", href: "/admin/impact/metrics/met-1", provenance: { ...DEMO } },
  { id: "nt-4", kind: "event", label: "Programme deadline approaching", message: "Textile Cluster · Cohort 4 deadline in 3 days", unread: true, ago: "6h", href: "/admin/programmes", provenance: { ...DEMO } },
  { id: "nt-5", kind: "event", label: "Content approved", message: "David Ekwe approved impact metric Enterprises supported · Q2", unread: false, ago: "1d", provenance: { ...DEMO } },
  { id: "nt-6", kind: "event", label: "Enquiry assigned", message: "Enquiry #E-0340 was assigned to David · Hospitality", unread: false, ago: "1d", href: "/admin/enquiries", provenance: { ...DEMO } },
  { id: "nt-7", kind: "system", label: "Scheduled content published", message: "Nayokan Q3 impact review is now live at nayokan.cm", unread: false, ago: "2d", provenance: { ...DEMO } },
  { id: "nt-8", kind: "event", label: "Changes requested", message: 'David requested changes on "Hospitality year in review"', unread: false, ago: "2d", href: "/admin/review-queue", provenance: { ...DEMO } },
  { id: "nt-9", kind: "mention", label: "Mentioned", message: "You were mentioned in a note by Sarah on application #A-2026-0138", unread: false, ago: "3d", href: "/admin/applications", provenance: { ...DEMO } },
  { id: "nt-10", kind: "system", label: "System", message: "Weekly audit digest is ready — 142 entries last 7 days", unread: false, ago: "4d", href: "/admin/admin/audit-log", provenance: { ...DEMO } },
];

export function listNotifications(tab: NotificationTab): AdminNotification[] {
  const rows = mockList(COLLECTION, () => SEED);
  if (tab === "unread") return rows.filter((n) => n.unread);
  if (tab === "all") return rows;
  return filterByStatus(rows, tab, (n) => n.kind);
}

export function notificationCounts(): Record<string, number> {
  const rows = mockList(COLLECTION, () => SEED);
  return {
    all: rows.length,
    unread: rows.filter((n) => n.unread).length,
    mention: rows.filter((n) => n.kind === "mention").length,
    approval: rows.filter((n) => n.kind === "approval").length,
    system: rows.filter((n) => n.kind === "system").length,
  };
}

export function markNotificationRead(id: string): void {
  mockUpdate(COLLECTION, () => SEED, id, { unread: false });
}

export function markAllNotificationsRead(): void {
  for (const n of mockList(COLLECTION, () => SEED).filter((n) => n.unread)) {
    mockUpdate(COLLECTION, () => SEED, n.id, { unread: false });
  }
}

/** Actions elsewhere in the admin can push a notification through this seam. */
export function pushNotification(n: Omit<AdminNotification, "id" | "provenance" | "unread">): AdminNotification {
  return mockInsert(COLLECTION, () => SEED, { id: mockId("nt"), unread: true, provenance: { ...DEMO }, ...n });
}

// — global search —

const CONTENT_STATUS: Record<ContentStatus, { tone: PillTone; label: string }> = {
  draft: { tone: "draft", label: "Draft" },
  in_review: { tone: "review", label: "In review" },
  changes_requested: { tone: "rejected", label: "Changes requested" },
  approved: { tone: "approved", label: "Approved" },
  scheduled: { tone: "scheduled", label: "Scheduled" },
  published: { tone: "published", label: "Published" },
  archived: { tone: "archived", label: "Archived" },
};

const PROG_STATUS: Record<string, { tone: PillTone; label: string }> = {
  open: { tone: "open", label: "Open" },
  closing: { tone: "closing", label: "Closing soon" },
  upcoming: { tone: "upcoming", label: "Upcoming" },
  draft: { tone: "draft", label: "Draft" },
  closed: { tone: "closed", label: "Closed" },
  archived: { tone: "archived", label: "Archived" },
};

const APP_STATUS: Record<string, { tone: PillTone; label: string }> = {
  new: { tone: "needs", label: "New" },
  under_review: { tone: "review", label: "Under review" },
  shortlisted: { tone: "in-progress", label: "Shortlisted" },
  accepted: { tone: "published", label: "Accepted" },
  rejected: { tone: "rejected", label: "Rejected" },
  archived: { tone: "archived", label: "Archived" },
};

const siteName = (site: SiteId) => SITES[site].name;

interface Source {
  kind: string;
  /** Permission area gating this result set (view level). */
  area: PermissionArea;
  run: (q: string) => SearchResult[];
}

const SOURCES: Source[] = [
  {
    kind: "Page",
    area: "pages",
    run: (q) =>
      SITE_IDS.flatMap((site) =>
        listPages(site, { q, pageSize: 50 }).rows.map((p) => ({
          id: `page-${p.id}`,
          kind: "Page",
          area: "pages",
          title: p.title,
          sub: `${siteName(p.site)} · ${p.path}`,
          statusLabel: CONTENT_STATUS[p.status].label,
          statusTone: CONTENT_STATUS[p.status].tone,
          ago: p.updatedAgo,
          href: `/admin/sites/${p.site}/pages/${p.id}`,
        })),
      ),
  },
  {
    kind: "Article",
    area: "articles",
    run: (q) =>
      listArticles("all", { q, pageSize: 50 }).rows.map((a) => ({
        id: `art-${a.id}`,
        kind: "Article",
        area: "articles",
        title: a.title,
        sub: `${siteName(a.site)} · ${a.authorName}`,
        statusLabel: a.statusNote ?? CONTENT_STATUS[a.status].label,
        statusTone: CONTENT_STATUS[a.status].tone,
        ago: a.updatedAgo,
        href: `/admin/content/articles/${a.id}`,
      })),
  },
  {
    kind: "Story",
    area: "stories",
    run: (q) =>
      listStories("all", { q, pageSize: 50 }).rows.map((s) => ({
        id: `st-${s.id}`,
        kind: "Story",
        area: "stories",
        title: s.title,
        sub: `${siteName(s.site)}${s.programme ? ` · ${s.programme}` : ""}`,
        statusLabel: CONTENT_STATUS[s.status].label,
        statusTone: CONTENT_STATUS[s.status].tone,
        ago: s.updatedAgo,
        href: `/admin/content/stories/${s.id}`,
      })),
  },
  {
    kind: "Programme",
    area: "programmes",
    run: (q) => [
      ...listProgrammes("all", { q, pageSize: 50 }).rows.map((p) => ({
        id: `prog-${p.id}`,
        kind: "Programme",
        area: "programmes",
        title: p.name,
        sub: `${siteName(p.site)} · ${p.sub} · Deadline ${p.deadline}`,
        statusLabel: PROG_STATUS[p.status]?.label ?? p.status,
        statusTone: PROG_STATUS[p.status]?.tone ?? ("neutral" as PillTone),
        ago: p.updatedAgo,
        href: `/admin/programmes/${p.id}`,
      })),
      ...listClusters("all")
        .filter((c) => matches(q, [c.name, c.sector, c.cohortLabel]))
        .map((c) => ({
          id: `clu-${c.id}`,
          kind: "Programme",
          area: "programmes",
          title: c.name,
          sub: `${siteName(c.site)} · ${c.sector} · ${c.cohortLabel}`,
          statusLabel: c.isPublic ? "Public" : "Draft",
          statusTone: (c.isPublic ? "published" : "draft") as PillTone,
          ago: "—",
          href: "/admin/programmes/clusters",
        })),
      ...listOpportunities("all", { q, pageSize: 50 }).rows.map((o) => ({
        id: `opp-${o.id}`,
        kind: "Opportunity",
        area: "programmes",
        title: o.title,
        sub: `${siteName(o.site)} · ${o.category} · ${o.deadlineLabel}`,
        statusLabel: o.status,
        statusTone: (o.status === "open" ? "open" : o.status === "closing" ? "closing" : o.status === "expired" ? "expired" : "neutral") as PillTone,
        ago: "—",
        href: "/admin/programmes/opportunities",
      })),
    ],
  },
  {
    kind: "Application",
    area: "applications",
    run: (q) =>
      listApplications("all", { q, pageSize: 50 }).rows.map((a) => ({
        id: `app-${a.id}`,
        kind: "Application",
        area: "applications",
        title: `#${a.code} · ${a.programmeLabel}`,
        sub: `${siteName(a.site)} · ${a.reviewer ? `${a.reviewer.name} reviewing` : "Unassigned"}`,
        statusLabel: APP_STATUS[a.status]?.label ?? a.status,
        statusTone: APP_STATUS[a.status]?.tone ?? ("neutral" as PillTone),
        ago: a.submittedAgo,
        href: `/admin/applications/${a.id}`,
      })),
  },
  {
    kind: "Person",
    area: "people",
    run: (q) => [
      ...listPeople("all", { q, pageSize: 50 }).rows.map((p) => ({
        id: `per-${p.id}`,
        kind: "Person",
        area: "people",
        title: p.name,
        sub: `${p.position} · ${p.division}`,
        statusLabel: p.bioStatus === "complete" ? "Complete" : p.bioStatus === "draft" ? "Draft" : "Missing bio",
        statusTone: (p.bioStatus === "complete" ? "verified" : p.bioStatus === "draft" ? "draft" : "needs") as PillTone,
        ago: "—",
        href: "/admin/ecosystem/people",
      })),
      ...listMentors("all", { q, pageSize: 50 }).rows.map((m) => ({
        id: `men-${m.id}`,
        kind: "Person",
        area: "people",
        title: m.name,
        sub: `Mentor · ${m.expertise} · ${m.sector}`,
        statusLabel: m.status,
        statusTone: (m.status === "active" ? "active" : m.status === "draft" ? "draft" : "inactive") as PillTone,
        ago: "—",
        href: "/admin/ecosystem/mentors",
      })),
    ],
  },
  {
    kind: "Partner",
    area: "partners",
    run: (q) =>
      listPartners("all", { q })
        .map((p) => ({
          id: `par-${p.id}`,
          kind: "Partner",
          area: "partners",
          title: p.name,
          sub: `${siteName(p.site)} · ${p.category}`,
          statusLabel: p.status === "visible" ? "Visible" : p.status === "missing_logo" ? "Missing logo" : "Draft",
          statusTone: (p.status === "visible" ? "published" : p.status === "missing_logo" ? "needs" : "draft") as PillTone,
          ago: "—",
          href: "/admin/ecosystem/partners",
        })),
  },
  {
    kind: "Venture",
    area: "ventures",
    run: (q) =>
      listVentures("all", { q, pageSize: 50 }).rows.map((v) => ({
        id: `ven-${v.id}`,
        kind: "Venture",
        area: "ventures",
        title: v.name,
        sub: `${v.sector} · ${v.location} · ${v.relatedProgramme}`,
        statusLabel: v.listingStatus,
        statusTone: (v.listingStatus === "active" ? "active" : v.listingStatus === "pipeline" ? "pending" : "neutral") as PillTone,
        ago: "—",
        href: "/admin/ecosystem/portfolio",
      })),
  },
  {
    kind: "Property",
    area: "properties",
    run: (q) =>
      listProperties("all")
        .filter((p) => matches(q, [p.name, p.location, p.type]))
        .map((p) => ({
          id: `pro-${p.id}`,
          kind: "Property",
          area: "properties",
          title: p.name,
          sub: `${p.location} · ${p.region} · ${p.type}`,
          statusLabel: p.status === "published" ? "Published" : "Draft",
          statusTone: (p.status === "published" ? "published" : "draft") as PillTone,
          ago: "—",
          href: "/admin/ecosystem/properties",
        })),
  },
  {
    kind: "Metric",
    area: "impact_metrics",
    run: (q) =>
      listMetrics("all", { q, pageSize: 50 }).rows.map((m) => ({
        id: `met-${m.id}`,
        kind: "Metric",
        area: "impact_metrics",
        title: m.title,
        sub: `${m.scopeLabel} · ${m.value !== null ? `${m.value} ${m.unit}` : "No value yet"}`,
        statusLabel: METRIC_STATUS_PILL[m.status].label,
        statusTone: METRIC_STATUS_PILL[m.status].tone,
        ago: "—",
        href: `/admin/impact/metrics/${m.id}`,
      })),
  },
  {
    kind: "Evidence",
    area: "evidence",
    run: (q) =>
      listEvidence("all", { q, pageSize: 50 }).rows.map((e) => ({
        id: `ev-${e.id}`,
        kind: "Evidence",
        area: "evidence",
        title: e.title,
        sub: `Evidence · #${e.code} · ${e.relatedLabel}`,
        statusLabel: EVIDENCE_STATUS_PILL[e.status].label,
        statusTone: EVIDENCE_STATUS_PILL[e.status].tone,
        ago: e.uploadedAt,
        href: "/admin/impact/evidence",
      })),
  },
  {
    kind: "Media",
    area: "media",
    run: (q) =>
      listMedia({ q }).map((m) => ({
        id: `med-${m.id}`,
        kind: "Media",
        area: "media",
        title: m.filename,
        sub: `Media library · ${m.format} · ${m.sizeLabel}`,
        statusLabel: m.alt.trim() ? "Alt set" : "Missing alt",
        statusTone: (m.alt.trim() ? "published" : "needs") as PillTone,
        ago: m.uploadedAgo,
        href: "/admin/media",
      })),
  },
  {
    kind: "Enquiry",
    area: "enquiries",
    run: (q) =>
      listEnquiries("all", { q, pageSize: 50 }).rows.map((e) => ({
        id: `enq-${e.id}`,
        kind: "Enquiry",
        area: "enquiries",
        title: e.title,
        sub: `${siteName(e.site)} · ${e.orgLabel} · ${e.category}`,
        statusLabel: ENQUIRY_PILL[e.status].label,
        statusTone: ENQUIRY_PILL[e.status].tone,
        ago: e.receivedAgo,
        href: `/admin/enquiries/${e.id}`,
      })),
  },
];

function matches(q: string, fields: (string | null | undefined)[]): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((f) => f?.toLowerCase().includes(needle));
}

export interface SearchResults {
  rows: SearchResult[];
  counts: Record<string, number>;
  total: number;
}

/**
 * Search every module the session can view. Each source declares the
 * permission area it belongs to — a role with `none` on e.g. applications
 * gets zero application results, mirroring what RLS will enforce.
 */
export function globalSearch(q: string, session: AdminSession, kindFilter?: string): SearchResults {
  const needle = q.trim();
  const counts: Record<string, number> = {};
  let rows: SearchResult[] = [];
  if (needle) {
    for (const src of SOURCES) {
      if (!hasPermission(session, src.area, "view")) continue;
      const found = src.run(needle);
      counts[src.kind] = found.length;
      rows = rows.concat(found);
    }
  }
  const total = rows.length;
  if (kindFilter && kindFilter !== "all") rows = rows.filter((r) => r.kind === kindFilter);
  return { rows, counts, total };
}

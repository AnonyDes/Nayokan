// MOCK programmes/clusters/opportunities — pending Session B's tables
// (readiness-report §8). Rows mirror Designs/admin/programmes.html,
// clusters.html and opportunities.html verbatim; all carry isDemo provenance.
import "server-only";
import type { SiteFilter } from "@/admin/shell/SiteSelector";
import { filterByQuery, filterBySite, filterByStatus, paginate, type ListQuery, type Page } from "@/admin/data/query";
import { mockGet, mockId, mockInsert, mockList, mockUpdate } from "@/admin/data/mock-store";
import type { SiteId, World } from "@/platform/sites/types";
import type { AdminCluster, AdminOpportunity, AdminProgramme, OpportunityStatus, ProgrammeStatus } from "./types";

const DEMO = { isDemo: true } as const;

const SEED_PROGRAMMES: AdminProgramme[] = [
  {
    id: "prog-1",
    site: "vti",
    world: "vti",
    kind: "programme",
    name: "Welding · Cohort 4",
    sub: "Sept 2026 — Feb 2028 · Yaoundé",
    status: "open",
    appsFilled: 18,
    appsCapacity: 25,
    deadline: "27 Sept 2026",
    isPublic: true,
    updatedAgo: "2h ago",
    type: "Entrepreneurial cluster",
    shortDesc:
      "A structured welding programme for young Cameroonian practitioners, delivered as a peer-accountable cluster with certification against a national metalwork standard.",
    fullDesc:
      "The Welding Cohort 4 programme runs over 18 months at Nayokan's Yaoundé workshop. Participants train in structural, sheet-metal and pipe welding through supervised practice, cluster peer review and quarterly external assessment.\n\nEvery participant leaves with a portfolio, a certification against Nayokan's national metalwork standard, and a formal placement in the Welding Cluster — a peer network with shared tooling, shared orders and shared accountability.\n\nThe programme is delivered in French and English, with fabrication practice conducted primarily in French.",
    duration: "18 months",
    startDate: "15 Oct 2026",
    endDate: "15 Feb 2028",
    location: "Yaoundé workshop · Nayokan Centre",
    delivery: "In-person · workshop",
    certification: "Nayokan National Metalwork Standard",
    appsOpen: true,
    applyPath: "/apply/welding-cohort-4",
    provenance: { ...DEMO },
  },
  { id: "prog-2", site: "vti", world: "vti", kind: "programme", name: "Textile Cluster · Cohort 4", sub: "Sept 2026 — Mar 2028 · Yaoundé", status: "closing", appsFilled: 22, appsCapacity: 30, deadline: "24 Sept 2026 · 3d", isPublic: true, updatedAgo: "4h ago", type: "Entrepreneurial cluster", shortDesc: "", fullDesc: "", duration: "", startDate: "", endDate: "", location: "Yaoundé", delivery: "In-person · workshop", certification: "Nayokan Certificate of Completion", appsOpen: true, applyPath: "/apply/textile-cohort-4", provenance: { ...DEMO } },
  { id: "prog-3", site: "vti", world: "vti", kind: "programme", name: "Agri-processing Cluster · Cohort 4", sub: "Details incomplete", status: "draft", appsFilled: null, appsCapacity: null, deadline: "Missing", isPublic: false, updatedAgo: "3d ago", type: "Entrepreneurial cluster", shortDesc: "", fullDesc: "", duration: "", startDate: "", endDate: "", location: "", delivery: "In-person · workshop", certification: "None", appsOpen: false, applyPath: "", provenance: { ...DEMO } },
  { id: "prog-4", site: "startup", world: "startup", kind: "programme", name: "Innovator Residency · 2026", sub: "6-month residency · university-affiliated", status: "open", appsFilled: 42, appsCapacity: 60, deadline: "15 Oct 2026", isPublic: true, updatedAgo: "1d ago", type: "Cohort programme", shortDesc: "", fullDesc: "", duration: "6 months", startDate: "", endDate: "", location: "", delivery: "Hybrid", certification: "None", appsOpen: true, applyPath: "/apply/innovator-residency-2026", provenance: { ...DEMO } },
  { id: "prog-5", site: "startup", world: "startup", kind: "programme", name: "Commercialisation Track", sub: "University IP → market pathway", status: "open", appsFilled: 14, appsCapacity: 20, deadline: "Rolling", isPublic: true, updatedAgo: "1w ago", type: "Rolling admission", shortDesc: "", fullDesc: "", duration: "", startDate: "", endDate: "", location: "", delivery: "Hybrid", certification: "None", appsOpen: true, applyPath: "/apply/commercialisation-track", provenance: { ...DEMO } },
  { id: "prog-6", site: "startup", world: null, kind: "opportunity", name: "Enterprise Grant · 2026 Q4", sub: "Small enterprise capital", status: "upcoming", appsFilled: null, appsCapacity: null, deadline: "Opens 1 Nov 2026", isPublic: false, updatedAgo: "2w ago", type: "Rolling admission", shortDesc: "", fullDesc: "", duration: "", startDate: "", endDate: "", location: "", delivery: "Hybrid", certification: "None", appsOpen: false, applyPath: "", provenance: { ...DEMO } },
  { id: "prog-7", site: "vti", world: "vti", kind: "programme", name: "Solar Micro-Enterprise · Pilot", sub: "Pilot cluster · Bafoussam", status: "closed", appsFilled: 30, appsCapacity: 30, deadline: "Closed · Jul 2026", isPublic: true, updatedAgo: "2mo ago", type: "Entrepreneurial cluster", shortDesc: "", fullDesc: "", duration: "", startDate: "", endDate: "", location: "Bafoussam", delivery: "In-person · workshop", certification: "Nayokan Certificate of Completion", appsOpen: false, applyPath: "", provenance: { ...DEMO } },
  { id: "prog-8", site: "vti", world: "vti", kind: "programme", name: "Legacy Programme · Cohort 1", sub: "2022 launch cohort", status: "archived", appsFilled: 18, appsCapacity: 18, deadline: "Completed 2024", isPublic: false, updatedAgo: "6mo ago", type: "Cohort programme", shortDesc: "", fullDesc: "", duration: "", startDate: "", endDate: "", location: "", delivery: "In-person · workshop", certification: "None", appsOpen: false, applyPath: "", provenance: { ...DEMO } },
];

const SEED_CLUSTERS: AdminCluster[] = [
  { id: "cl-1", site: "vti", world: "vti", name: "Textile Cluster", sector: "Textile · garments · Yaoundé", location: "Yaoundé", cohortLabel: "Cohort 4 open", memberCount: 22, isPublic: true, provenance: { ...DEMO } },
  { id: "cl-2", site: "vti", world: "vti", name: "Welding Cluster", sector: "Metalwork · fabrication · Yaoundé", location: "Yaoundé", cohortLabel: "Cohort 4 open", memberCount: 18, isPublic: true, provenance: { ...DEMO } },
  { id: "cl-3", site: "vti", world: "vti", name: "Agri-processing Cluster", sector: "Agri-food · Yaoundé", location: "Yaoundé", cohortLabel: "Draft — details missing", memberCount: 0, isPublic: false, provenance: { ...DEMO } },
  { id: "cl-4", site: "vti", world: "vti", name: "Digital Services Cluster", sector: "Digital services · Yaoundé", location: "Yaoundé", cohortLabel: "Cohort 3 active", memberCount: 14, isPublic: true, provenance: { ...DEMO } },
  { id: "cl-5", site: "vti", world: "vti", name: "Solar Micro-enterprise Cluster", sector: "Energy · Bafoussam", location: "Bafoussam", cohortLabel: "Pilot", memberCount: 12, isPublic: true, provenance: { ...DEMO } },
  { id: "cl-6", site: "vti", world: "vti", name: "Furniture & Woodwork", sector: "Wood · furniture · Yaoundé", location: "Yaoundé", cohortLabel: "Planning", memberCount: 0, isPublic: false, provenance: { ...DEMO } },
];

const SEED_OPPORTUNITIES: AdminOpportunity[] = [
  { id: "opp-1", site: "startup", world: "startup", title: "Innovator Residency · 2026", slug: "innovator-residency-2026", category: "Residency", deadlineLabel: "15 Oct 2026", status: "open", isPublic: true, provenance: { ...DEMO } },
  { id: "opp-2", site: "vti", world: "vti", title: "Enterprise Grant · Q4 2026", slug: "enterprise-grant-q4-2026", category: "Grant", deadlineLabel: "Opens 1 Nov", status: "upcoming", isPublic: false, provenance: { ...DEMO } },
  { id: "opp-3", site: "startup", world: "startup", title: "Commercialisation Track · Rolling", slug: "commercialisation-track-rolling", category: "Programme", deadlineLabel: "Rolling", status: "open", isPublic: true, provenance: { ...DEMO } },
  { id: "opp-4", site: "vti", world: "vti", title: "Textile Cluster · Cohort 4", slug: "textile-cluster-cohort-4", category: "Programme", deadlineLabel: "24 Sep 2026 · 3d", status: "closing", isPublic: true, provenance: { ...DEMO } },
  { id: "opp-5", site: "vti", world: "vti", title: "Welding Cluster · Cohort 4", slug: "welding-cluster-cohort-4", category: "Programme", deadlineLabel: "27 Sep 2026 · 6d", status: "open", isPublic: true, provenance: { ...DEMO } },
  { id: "opp-6", site: "startup", world: "startup", title: "Solar Innovator Grant", slug: "solar-innovator-grant", category: "Grant", deadlineLabel: "Opens 15 Oct", status: "upcoming", isPublic: false, provenance: { ...DEMO } },
  { id: "opp-7", site: "vti", world: "vti", title: "Grant · Community enterprise", slug: "grant-community-enterprise", category: "Grant", deadlineLabel: "1 Sep 2026", status: "expired", isPublic: true, provenance: { ...DEMO } },
  { id: "opp-8", site: "vti", world: "vti", title: "Grant · Vocational scholarship", slug: "grant-vocational-scholarship", category: "Grant", deadlineLabel: "15 Aug 2026", status: "expired", isPublic: true, provenance: { ...DEMO } },
  { id: "opp-9", site: "vti", world: "vti", title: "Legacy · Programme call", slug: "legacy-programme-call", category: "Programme", deadlineLabel: "—", status: "archived", isPublic: false, provenance: { ...DEMO } },
  { id: "opp-10", site: "startup", world: "startup", title: "Legacy · Innovator grant", slug: "legacy-innovator-grant", category: "Grant", deadlineLabel: "—", status: "archived", isPublic: false, provenance: { ...DEMO } },
];

// Programmes page tabs mix two dimensions (world + kind) per the design —
// "Opportunities" selects kind=opportunity rows regardless of world.
export type ProgrammeTab = "all" | "vti" | "startup" | "opportunities";

export function listProgrammes(site: SiteFilter, query: ListQuery & { tab?: string }): Page<AdminProgramme> {
  let rows = mockList("programmes", () => SEED_PROGRAMMES);
  rows = filterBySite(rows, site, (r) => r.site);
  const tab = query.tab ?? "all";
  if (tab === "opportunities") rows = rows.filter((r) => r.kind === "opportunity");
  else if (tab === "vti" || tab === "startup") rows = rows.filter((r) => r.world === tab);
  rows = filterByStatus(rows, query.status, (r) => r.status);
  rows = filterByQuery(rows, query.q, (r) => [r.name, r.sub]);
  return paginate(rows, query.page, query.pageSize);
}

export function programmeTabCounts(site: SiteFilter): Record<string, number> {
  const rows = filterBySite(mockList("programmes", () => SEED_PROGRAMMES), site, (r) => r.site);
  return {
    all: rows.length,
    vti: rows.filter((r) => r.world === "vti").length,
    startup: rows.filter((r) => r.world === "startup").length,
    opportunities: rows.filter((r) => r.kind === "opportunity").length,
  };
}

export function getProgramme(id: string): AdminProgramme | null {
  return mockGet("programmes", () => SEED_PROGRAMMES, id);
}

export function listClusters(site: SiteFilter): AdminCluster[] {
  return filterBySite(mockList("clusters", () => SEED_CLUSTERS), site, (r) => r.site);
}

export function getCluster(id: string): AdminCluster | null {
  return mockGet("clusters", () => SEED_CLUSTERS, id);
}

export function listOpportunities(site: SiteFilter, query: ListQuery): Page<AdminOpportunity> {
  let rows = mockList("opportunities", () => SEED_OPPORTUNITIES);
  rows = filterBySite(rows, site, (r) => r.site);
  rows = filterByStatus(rows, query.status, (r) => r.status);
  rows = filterByQuery(rows, query.q, (r) => [r.title, r.slug, r.category]);
  return paginate(rows, query.page, query.pageSize);
}

export function opportunityStatusCounts(site: SiteFilter): Record<string, number> {
  const rows = filterBySite(mockList("opportunities", () => SEED_OPPORTUNITIES), site, (r) => r.site);
  const counts: Record<string, number> = { all: rows.length };
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
  return counts;
}

export function getOpportunity(id: string): AdminOpportunity | null {
  return mockGet("opportunities", () => SEED_OPPORTUNITIES, id);
}

export function expiredOpportunityCount(site: SiteFilter): number {
  return filterBySite(mockList("opportunities", () => SEED_OPPORTUNITIES), site, (r) => r.site).filter((o) => o.status === "expired").length;
}

// — mock mutations (called only from actions.ts after authZ) —

export function saveProgramme(id: string, patch: Partial<AdminProgramme>): AdminProgramme | null {
  return mockUpdate("programmes", () => SEED_PROGRAMMES, id, { ...patch, updatedAgo: "now" });
}

export function createProgramme(site: SiteId, world: World | null): AdminProgramme {
  return mockInsert("programmes", () => SEED_PROGRAMMES, {
    id: mockId("prog"),
    site,
    world,
    kind: "programme",
    name: "Untitled programme",
    sub: "Details incomplete",
    status: "draft",
    appsFilled: null,
    appsCapacity: null,
    deadline: "Missing",
    isPublic: false,
    updatedAgo: "now",
    type: "Entrepreneurial cluster",
    shortDesc: "",
    fullDesc: "",
    duration: "",
    startDate: "",
    endDate: "",
    location: "",
    delivery: "In-person · workshop",
    certification: "None",
    appsOpen: false,
    applyPath: "",
    provenance: { ...DEMO },
  });
}

export function saveCluster(id: string, patch: Partial<AdminCluster>): AdminCluster | null {
  return mockUpdate("clusters", () => SEED_CLUSTERS, id, patch);
}

export function createCluster(site: SiteId): AdminCluster {
  return mockInsert("clusters", () => SEED_CLUSTERS, {
    id: mockId("cl"),
    site,
    world: "vti",
    name: "Untitled cluster",
    sector: "",
    location: "",
    cohortLabel: "Planning",
    memberCount: 0,
    isPublic: false,
    provenance: { ...DEMO },
  });
}

export function saveOpportunity(id: string, patch: Partial<AdminOpportunity>): AdminOpportunity | null {
  return mockUpdate("opportunities", () => SEED_OPPORTUNITIES, id, patch);
}

export function createOpportunity(site: SiteId, world: World | null): AdminOpportunity {
  const n = mockList("opportunities", () => SEED_OPPORTUNITIES).length + 1;
  return mockInsert("opportunities", () => SEED_OPPORTUNITIES, {
    id: mockId("opp"),
    site,
    world,
    title: "Untitled opportunity",
    slug: `untitled-opportunity-${n}`,
    category: "Grant",
    deadlineLabel: "—",
    status: "upcoming" as OpportunityStatus,
    isPublic: false,
    provenance: { ...DEMO },
  });
}

export function setProgrammeStatus(id: string, status: ProgrammeStatus): AdminProgramme | null {
  return mockUpdate("programmes", () => SEED_PROGRAMMES, id, { status });
}

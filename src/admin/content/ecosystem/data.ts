// MOCK ecosystem records — pending Session B's tables (readiness-report §8).
// Rows mirror Designs/admin/{people,mentors,partners,portfolio,properties}.html
// verbatim, including deliberate "to be confirmed" placeholders — no fabricated
// names. All rows carry isDemo provenance.
import "server-only";
import type { SiteFilter } from "@/admin/shell/SiteSelector";
import { filterByQuery, filterBySite, filterByStatus, paginate, type ListQuery, type Page } from "@/admin/data/query";
import { mockGet, mockId, mockInsert, mockList, mockUpdate } from "@/admin/data/mock-store";
import type { Provenance } from "@/platform/content/types";
import type { AdminMentor, AdminPartner, AdminPerson, AdminProperty, AdminVenture } from "./types";

const DEMO: Provenance = { isDemo: true, unconfirmedFields: ["name"] };

const person = (n: number, position: string, division: AdminPerson["division"], hasPhoto: boolean, bioStatus: AdminPerson["bioStatus"], isPublic: boolean): AdminPerson => ({
  id: `person-${n}`,
  site: "corporate",
  code: `P-${String(n).padStart(3, "0")}`,
  name: "Person · to be confirmed",
  initials: `P${n}`,
  position,
  division,
  hasPhoto,
  bioStatus,
  order: n,
  consentRecorded: isPublic,
  isPublic,
  provenance: { ...DEMO },
});

const SEED_PEOPLE: AdminPerson[] = [
  person(1, "Founding Director", "leadership", false, "complete", true),
  person(2, "Executive Director", "leadership", true, "complete", true),
  person(3, "VTI Lead", "leadership", true, "draft", true),
  person(4, "Startup Centre Lead", "leadership", false, "complete", true),
  person(5, "Venture Capital Lead", "leadership", true, "complete", false),
  person(6, "Hospitality Lead", "leadership", true, "complete", true),
  person(7, "Programme Lead · Welding", "programme", false, "draft", true),
  person(8, "Programme Lead · Textile", "programme", true, "complete", true),
  person(9, "Advisor · Institutional", "advisor", true, "complete", false),
  person(10, "Advisor · Investment", "advisor", false, "complete", false),
];

const mentor = (n: number, expertise: string, sector: string, availability: AdminMentor["availability"], cohortLabel: string, status: AdminMentor["status"], isPublic: boolean): AdminMentor => ({
  id: `mentor-${n}`,
  site: "startup",
  code: `M-${String(n).padStart(3, "0")}`,
  name: "Mentor · to be confirmed",
  initials: `M${n}`,
  expertise,
  sector,
  availability,
  cohortLabel,
  status,
  isPublic,
  provenance: { ...DEMO },
});

const SEED_MENTORS: AdminMentor[] = [
  mentor(1, "Product & operations", "Consumer", "open", "Cohort 4", "active", true),
  mentor(2, "Financial modelling", "Any", "open", "Cohort 4", "active", true),
  mentor(3, "Digital go-to-market", "Digital", "limited", "Cohort 3", "active", true),
  mentor(4, "Manufacturing scale-up", "Industrial", "open", "Cohort 4", "active", true),
  mentor(5, "Legal & IP", "Any", "by_request", "Cohort 3", "active", true),
  mentor(6, "Fundraising", "Any", "open", "Cohort 4", "active", true),
  mentor(7, "Impact measurement", "Development", "open", "—", "inactive", false),
  mentor(8, "Cluster development", "Vocational", "open", "Cohort 4", "active", true),
  mentor(9, "Design & branding", "Consumer", "limited", "Cohort 3", "active", true),
  mentor(10, "University partnerships", "Academia", "by_request", "—", "draft", false),
];

const partner = (id: string, name: string, category: AdminPartner["category"], hasLogo: boolean, status: AdminPartner["status"]): AdminPartner => ({
  id,
  site: "corporate",
  name,
  category,
  hasLogo,
  consentRecorded: status === "visible",
  status,
  isPublic: status === "visible",
  provenance: { ...DEMO },
});

const SEED_PARTNERS: AdminPartner[] = [
  partner("ptn-1", "University of Yaoundé I", "university", true, "visible"),
  partner("ptn-2", "ENSPY Polytechnic", "university", true, "visible"),
  partner("ptn-3", "U. de Ngaoundéré", "university", true, "visible"),
  partner("ptn-4", "U. de Buea", "university", false, "missing_logo"),
  partner("ptn-5", "Corporate · Cement", "corporate", true, "visible"),
  partner("ptn-6", "Corporate · Telecom", "corporate", true, "draft"),
  partner("ptn-7", "Corporate · Agri-food", "corporate", true, "visible"),
  partner("ptn-8", "GIZ Cameroon", "development", true, "visible"),
  partner("ptn-9", "World Bank Group", "development", true, "visible"),
  partner("ptn-10", "AFD · France", "development", true, "visible"),
  partner("ptn-11", "UNDP Cameroon", "development", true, "visible"),
  partner("ptn-12", "Africa Enterprise Challenge", "development", true, "visible"),
  partner("ptn-13", "Ministry of Vocational Training", "government", true, "draft"),
  partner("ptn-14", "Ministry of SME", "government", true, "visible"),
  partner("ptn-15", "Fund · Africa Pre-Seed", "investor", true, "visible"),
  partner("ptn-16", "Fund · Cameroon Growth", "investor", true, "visible"),
  partner("ptn-17", "Community · Yaoundé Trades", "community", true, "visible"),
  partner("ptn-18", "Community · Bamenda Makers", "community", true, "visible"),
];

const venture = (n: number, sectorLabel: string, sector: string, stage: string, location: string, relatedProgramme: string, status: AdminVenture["listingStatus"], isPublic: boolean): AdminVenture => ({
  id: `venture-${n}`,
  site: "corporate",
  code: `V-2026-${String(n).padStart(3, "0")}`,
  name: `Venture · ${sectorLabel}`,
  slug: `venture-${sectorLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  sector,
  stage,
  location,
  relatedProgramme,
  listingStatus: status,
  isPublic,
  provenance: { ...DEMO },
});

const SEED_VENTURES: AdminVenture[] = [
  venture(1, "Agri-processing", "Agri-processing", "Seed", "Yaoundé", "VTI Cluster · Agri", "pipeline", false),
  venture(2, "Micro-solar", "Energy", "Pre-seed", "Bafoussam", "Startup · Innovator", "pipeline", false),
  venture(3, "Digital textile", "Textile · digital", "Seed", "Douala", "Startup · Commercialisation", "active", true),
  venture(4, "Cold-chain logistics", "Logistics", "Series A", "Douala", "VTI · Cluster", "active", true),
  venture(5, "Farm-to-market", "Agri-tech", "Seed", "Yaoundé", "Startup · Innovator", "active", true),
  venture(6, "Health diagnostics", "Health", "Pre-seed", "Buea", "Startup · Innovator", "pipeline", false),
  venture(7, "EdTech · vocational", "EdTech", "Seed", "Yaoundé", "VTI · Digital", "active", true),
  venture(8, "Construction materials", "Construction", "Seed", "Douala", "VTI · Metalwork", "active", true),
  venture(9, "Waste circular", "Circular economy", "Pre-seed", "Yaoundé", "Community", "pipeline", false),
];

const SEED_PROPERTIES: AdminProperty[] = [
  { id: "prop-1", site: "corporate", name: "Nayokan Guesthouse · Yaoundé", slug: "nayokan-guesthouse-yaounde", location: "Yaoundé", region: "Centre Region", type: "Guesthouse", rooms: 6, externalBookingUrl: "", galleryCount: 8, amenitiesCount: 12, enquiriesCount: 11, status: "published", isPublic: true, provenance: { ...DEMO } },
  { id: "prop-2", site: "corporate", name: "Nayokan Riverside · Douala", slug: "nayokan-riverside-douala", location: "Douala", region: "Littoral", type: "Short stay", rooms: 4, externalBookingUrl: "", galleryCount: null, amenitiesCount: 12, enquiriesCount: 4, status: "published", isPublic: true, provenance: { ...DEMO } },
  { id: "prop-3", site: "corporate", name: "Nayokan Highland · Buea", slug: "nayokan-highland-buea", location: "Buea", region: "South-West", type: "Guesthouse", rooms: 3, externalBookingUrl: "", galleryCount: null, amenitiesCount: 12, enquiriesCount: null, status: "draft", isPublic: false, provenance: { ...DEMO } },
];

// — reads —

export function listPeople(site: SiteFilter, query: ListQuery & { division?: string }): Page<AdminPerson> {
  let rows = mockList("people", () => SEED_PEOPLE).slice().sort((a, b) => a.order - b.order);
  rows = filterBySite(rows, site, (r) => r.site);
  if (query.division && query.division !== "all") rows = rows.filter((r) => r.division === query.division);
  rows = filterByQuery(rows, query.q, (r) => [r.name, r.position, r.code]);
  return paginate(rows, query.page, query.pageSize);
}

export function peopleDivisionCounts(site: SiteFilter): Record<string, number> {
  const rows = filterBySite(mockList("people", () => SEED_PEOPLE), site, (r) => r.site);
  return {
    all: rows.length,
    leadership: rows.filter((r) => r.division === "leadership").length,
    programme: rows.filter((r) => r.division === "programme").length,
    advisor: rows.filter((r) => r.division === "advisor").length,
  };
}

export function listMentors(site: SiteFilter, query: ListQuery & { sector?: string }): Page<AdminMentor> {
  let rows = mockList("mentors", () => SEED_MENTORS);
  rows = filterBySite(rows, site, (r) => r.site);
  rows = filterByStatus(rows, query.status, (r) => r.status);
  if (query.sector && query.sector !== "all") rows = rows.filter((r) => r.sector === query.sector);
  rows = filterByQuery(rows, query.q, (r) => [r.name, r.expertise, r.code]);
  return paginate(rows, query.page, query.pageSize);
}

export function mentorStatusCounts(site: SiteFilter): Record<string, number> {
  const rows = filterBySite(mockList("mentors", () => SEED_MENTORS), site, (r) => r.site);
  const counts: Record<string, number> = { all: rows.length };
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
  return counts;
}

export function mentorSectors(site: SiteFilter): string[] {
  return [...new Set(filterBySite(mockList("mentors", () => SEED_MENTORS), site, (r) => r.site).map((m) => m.sector))].sort();
}

export function listPartners(site: SiteFilter, query: ListQuery & { category?: string }): AdminPartner[] {
  let rows = mockList("partners", () => SEED_PARTNERS);
  rows = filterBySite(rows, site, (r) => r.site);
  if (query.category && query.category !== "all") rows = rows.filter((r) => r.category === query.category);
  rows = filterByQuery(rows, query.q, (r) => [r.name]);
  return rows;
}

export function partnerCategoryCounts(site: SiteFilter): Record<string, number> {
  const rows = filterBySite(mockList("partners", () => SEED_PARTNERS), site, (r) => r.site);
  const counts: Record<string, number> = { all: rows.length };
  for (const r of rows) counts[r.category] = (counts[r.category] ?? 0) + 1;
  return counts;
}

export function listVentures(site: SiteFilter, query: ListQuery & { stage?: string }): Page<AdminVenture> {
  let rows = mockList("ventures", () => SEED_VENTURES);
  rows = filterBySite(rows, site, (r) => r.site);
  if (query.stage && query.stage !== "all") rows = rows.filter((r) => r.listingStatus === query.stage);
  rows = filterByQuery(rows, query.q, (r) => [r.name, r.sector, r.code]);
  return paginate(rows, query.page, query.pageSize);
}

export function ventureStageCounts(site: SiteFilter): Record<string, number> {
  const rows = filterBySite(mockList("ventures", () => SEED_VENTURES), site, (r) => r.site);
  return {
    all: rows.length,
    pipeline: rows.filter((r) => r.listingStatus === "pipeline").length,
    active: rows.filter((r) => r.listingStatus === "active").length,
    exited: rows.filter((r) => r.listingStatus === "exited").length,
  };
}

export function listProperties(site: SiteFilter): AdminProperty[] {
  return filterBySite(mockList("properties", () => SEED_PROPERTIES), site, (r) => r.site);
}

// — mock mutations (called only from actions.ts after authZ) —

export const savePerson = (id: string, patch: Partial<AdminPerson>) => mockUpdate("people", () => SEED_PEOPLE, id, patch);
export const saveMentor = (id: string, patch: Partial<AdminMentor>) => mockUpdate("mentors", () => SEED_MENTORS, id, patch);
export const savePartner = (id: string, patch: Partial<AdminPartner>) => mockUpdate("partners", () => SEED_PARTNERS, id, patch);
export const saveVenture = (id: string, patch: Partial<AdminVenture>) => mockUpdate("ventures", () => SEED_VENTURES, id, patch);
export const saveProperty = (id: string, patch: Partial<AdminProperty>) => mockUpdate("properties", () => SEED_PROPERTIES, id, patch);

export const getPerson = (id: string) => mockGet("people", () => SEED_PEOPLE, id);
export const getMentor = (id: string) => mockGet("mentors", () => SEED_MENTORS, id);
export const getPartner = (id: string) => mockGet("partners", () => SEED_PARTNERS, id);
export const getVenture = (id: string) => mockGet("ventures", () => SEED_VENTURES, id);
export const getProperty = (id: string) => mockGet("properties", () => SEED_PROPERTIES, id);

export function createPerson(): AdminPerson {
  const n = mockList("people", () => SEED_PEOPLE).length + 1;
  return mockInsert("people", () => SEED_PEOPLE, person(n, "", "leadership", false, "missing", false));
}

export function createMentor(): AdminMentor {
  const n = mockList("mentors", () => SEED_MENTORS).length + 1;
  return mockInsert("mentors", () => SEED_MENTORS, mentor(n, "", "Any", "open", "—", "draft", false));
}

export function createPartner(): AdminPartner {
  return mockInsert("partners", () => SEED_PARTNERS, partner(mockId("ptn"), "Partner · to be confirmed", "community", false, "draft"));
}

export function createVenture(): AdminVenture {
  const n = mockList("ventures", () => SEED_VENTURES).length + 1;
  return mockInsert("ventures", () => SEED_VENTURES, venture(n, "to be confirmed", "", "", "", "", "pipeline", false));
}

export function createProperty(): AdminProperty {
  const n = mockList("properties", () => SEED_PROPERTIES).length + 1;
  return mockInsert("properties", () => SEED_PROPERTIES, {
    id: mockId("prop"),
    site: "corporate",
    name: "Property · to be confirmed",
    slug: `property-${n}`,
    location: "",
    region: "",
    type: "Guesthouse",
    rooms: null,
    externalBookingUrl: "",
    galleryCount: null,
    amenitiesCount: 0,
    enquiriesCount: null,
    status: "draft",
    isPublic: false,
    provenance: { ...DEMO },
  });
}

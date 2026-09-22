// MOCK enquiries — pending Session B's enquiries/notes tables. Rows mirror
// enquiries.html verbatim; senders are withheld placeholders and all emails
// use nayokan.demo. Nothing here is real correspondence.
import "server-only";
import type { Provenance } from "@/platform/content/types";
import type { SiteFilter } from "@/admin/shell/SiteSelector";
import { filterByQuery, filterBySite, filterByStatus, paginate, type ListQuery, type Page } from "@/admin/data/query";
import { mockGet, mockId, mockList, mockUpdate } from "@/admin/data/mock-store";
import type { AdminEnquiry, EnquiryAssignee, EnquiryCategory, EnquiryStatus } from "./types";

const DEMO: Provenance = { isDemo: true, unconfirmedFields: ["senderLabel", "orgLabel"] };

// Same mock staff identities as platform/auth/directory.ts.
export const ASSIGNEES: EnquiryAssignee[] = [
  { id: "rev-sarah", name: "Sarah Ndenge", initials: "SN", role: "Communications" },
  { id: "rev-maria", name: "Maria Ndongo", initials: "MN", role: "Super Admin" },
  { id: "rev-john", name: "John Bekolo", initials: "JB", role: "Programme Manager" },
];

export const ROUTE_OPTIONS = ["Startup Centre · Commercialisation Track", "Startup Centre · University Partnerships", "General intake"];

const enq = (
  n: number,
  site: AdminEnquiry["site"],
  emailLocal: string,
  senderLabel: string,
  orgLabel: string,
  category: EnquiryCategory,
  sourcePage: string,
  receivedAt: string,
  receivedAgo: string,
  assignee: EnquiryAssignee | null,
  status: EnquiryStatus,
): AdminEnquiry => ({
  id: `enq-${n}`,
  site,
  code: `E-${String(n).padStart(4, "0")}`,
  title: `Enquiry #E-${String(n).padStart(4, "0")}`,
  senderLabel,
  email: `${emailLocal}.${String(n).padStart(4, "0")}@nayokan.demo`,
  orgLabel,
  category,
  sourcePage,
  referrer: "Direct",
  receivedAt,
  receivedAgo,
  language: "EN",
  priority: "Normal",
  publicConsent: "not_granted",
  status,
  assignee,
  routeLabel: null,
  bodyParagraphs: [
    "— Demo content — do not treat as real correspondence.",
    "Hello Nayokan,",
    "I lead the entrepreneurship programme at a Cameroonian university and I have been reading about the Nayokan Startup Centre's commercialisation track. We are looking for an institutional partner to help our students take university research into productive enterprise. Our current pipeline sits between the research stage and the market — exactly the gap your commercialisation programme seems designed to close.",
    "Could we arrange a first conversation to explore whether a formal university partnership is possible? We can send our current programme brief and a shortlist of research units we would like to include in a first cohort.",
    "Thank you for your time and for the work Nayokan is doing.",
    "— Sender withheld until enquiry is assigned.",
  ],
  notes: [{ id: `enote-${n}-1`, author: "Sarah Ndenge · flagged", time: "1h ago", body: "Looks promising · route to Commercialisation Track and copy Maria on any reply." }],
  provenance: { ...DEMO },
});

const SEED_ENQUIRIES: AdminEnquiry[] = [
  enq(342, "startup", "contact", "— Withheld · consent required —", "— Withheld —", "university", "/startup-university-partnerships", "Today · 11:14 WAT", "3h ago", null, "new"),
  enq(341, "startup", "partner.enquiry", "— Withheld —", "Development NGO · to be confirmed", "partnership", "/partners", "Today · 08:02 WAT", "6h ago", null, "new"),
  enq(340, "corporate", "stay", "— Withheld —", "Individual", "hospitality", "/hospitality-properties", "Yesterday · 19:40 WAT", "Yesterday", ASSIGNEES[0], "in_progress"),
  enq(339, "corporate", "vc.enquiry", "— Withheld —", "Fund · Africa focus · to be confirmed", "vc", "/vc-partner", "Yesterday · 15:26 WAT", "Yesterday", ASSIGNEES[1], "in_progress"),
  enq(338, "corporate", "general", "— Withheld —", "Individual", "general", "/contact", "2 days ago", "2d ago", ASSIGNEES[0], "in_progress"),
  enq(337, "corporate", "partner.enquiry", "— Withheld —", "Corporate · to be confirmed", "partnership", "/partners", "3 days ago", "3d ago", ASSIGNEES[0], "resolved"),
  enq(336, "corporate", "stay", "— Withheld —", "Individual", "hospitality", "/hospitality", "5 days ago", "5d ago", ASSIGNEES[1], "resolved"),
  enq(335, "vti", "general", "— Withheld —", "Individual", "general", "/vti", "1 week ago", "1w ago", ASSIGNEES[1], "archived"),
];

// — reads —

export interface EnquiryQuery extends ListQuery {
  category?: string;
  assigned?: string;
}

export function listEnquiries(site: SiteFilter, query: EnquiryQuery): Page<AdminEnquiry> {
  let rows = mockList("enquiries", () => SEED_ENQUIRIES);
  rows = filterBySite(rows, site, (r) => r.site);
  rows = filterByStatus(rows, query.status, (r) => r.status);
  if (query.category && query.category !== "all") rows = rows.filter((r) => r.category === query.category);
  if (query.assigned && query.assigned !== "all") rows = rows.filter((r) => (r.assignee?.id ?? "unassigned") === query.assigned);
  rows = filterByQuery(rows, query.q, (r) => [r.title, r.code, r.email, r.orgLabel, r.sourcePage]);
  return paginate(rows, query.page, query.pageSize);
}

export function enquiryStatusCounts(site: SiteFilter): Record<string, number> {
  const rows = filterBySite(mockList("enquiries", () => SEED_ENQUIRIES), site, (r) => r.site);
  const counts: Record<string, number> = { all: rows.length };
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
  return counts;
}

export function enquiryAssignees(site: SiteFilter): EnquiryAssignee[] {
  const seen = new Map<string, EnquiryAssignee>();
  for (const r of filterBySite(mockList("enquiries", () => SEED_ENQUIRIES), site, (r) => r.site)) {
    if (r.assignee) seen.set(r.assignee.id, r.assignee);
  }
  return [...seen.values()];
}

export const getEnquiry = (id: string) => mockGet("enquiries", () => SEED_ENQUIRIES, id);

// — mock mutations (called only from actions.ts after authZ) —

export const saveEnquiry = (id: string, patch: Partial<AdminEnquiry>) => mockUpdate("enquiries", () => SEED_ENQUIRIES, id, patch);

export function appendEnquiryNote(id: string, author: string, body: string): boolean {
  const record = getEnquiry(id);
  if (!record) return false;
  return (
    mockUpdate("enquiries", () => SEED_ENQUIRIES, id, {
      notes: [...record.notes, { id: mockId("enote"), author, time: "Just now", body }],
    }) !== null
  );
}

// MOCK applications — pending Session B's applications/documents/notes
// tables. Rows mirror applications.html verbatim: applicant identity stays
// withheld ("Applicant · …"), emails use nayokan.demo, nothing here is a
// real institutional record.
import "server-only";
import type { Provenance } from "@/platform/content/types";
import type { SiteFilter } from "@/admin/shell/SiteSelector";
import { filterByQuery, filterBySite, filterByStatus, paginate, type ListQuery, type Page } from "@/admin/data/query";
import { mockGet, mockId, mockList, mockUpdate } from "@/admin/data/mock-store";
import type { AdminApplication, AppTimelineRow, ApplicationStatus, Reviewer } from "./types";

const DEMO: Provenance = { isDemo: true, unconfirmedFields: ["applicantLabel"] };

// Staff reviewers — the same identities as platform/auth/directory.ts's mock
// profiles (not real staff data). Pending Session B's users/profiles list.
export const REVIEWERS: Reviewer[] = [
  { id: "rev-sarah", name: "Sarah Ndenge", initials: "SN", role: "Communications Manager" },
  { id: "rev-maria", name: "Maria Ndongo", initials: "MN", role: "Super Admin" },
  { id: "rev-john", name: "John Bekolo", initials: "JB", role: "Programme Manager" },
  { id: "rev-tbc", name: "Staff · to be confirmed", initials: "DE", role: "Reviewer" },
];

const timeline = (status: ApplicationStatus, submitted: string): AppTimelineRow[] => {
  const rows: AppTimelineRow[] = [
    { label: "Received", sub: "Public form · verified", time: submitted, state: "done" },
    { label: "Under review", sub: "Documents verified · notes added", time: "Now", state: "pending" },
    { label: "Decision pending", sub: "Shortlist · Accept · Reject", time: "—", state: "pending" },
  ];
  if (status === "under_review") rows[1].state = "current";
  else if (status === "shortlisted" || status === "accepted") {
    rows[1].state = "done";
    rows[2] = { label: status === "shortlisted" ? "Shortlisted" : "Accepted · notified", sub: "Decision recorded", time: "Now", state: status === "accepted" ? "done" : "current" };
  } else if (status === "rejected" || status === "archived") {
    rows[1].state = "done";
    rows[2] = { label: status === "rejected" ? "Rejected · notified" : "Archived", sub: "Decision recorded", time: "Now", state: "done" };
  }
  return rows;
};

const app = (
  n: number,
  site: AdminApplication["site"],
  applicantLabel: string,
  programmeId: string | null,
  programmeLabel: string,
  programmeMeta: string,
  world: AdminApplication["world"],
  status: ApplicationStatus,
  stageLabel: string | null,
  reviewer: Reviewer | null,
  submittedAt: string,
  submittedAgo: string,
): AdminApplication => ({
  id: `app-${n}`,
  site,
  code: `A-2026-${String(n).padStart(4, "0")}`,
  applicantLabel,
  initials: `A·${n % 10}`,
  programmeId,
  programmeLabel,
  programmeMeta,
  programmeDeadline: "27 Sept 2026",
  world,
  status,
  stageLabel,
  reviewer,
  submittedAt,
  submittedAgo,
  language: "FR",
  source: "Public application form",
  facts: [
    { label: "Full name", value: "— Confidential during review —" },
    { label: "Preferred pronouns", value: "Not specified" },
    { label: "Email", value: `applicant.${String(n).padStart(4, "0")}@nayokan.demo`, mono: true },
    { label: "Phone", value: "+237 · verified", mono: true },
    { label: "Location", value: "Yaoundé, Centre Region" },
    { label: "Institution", value: "Independent · not university-affiliated" },
    { label: "Prior experience", value: "3 years · informal textile production" },
    { label: "Age range", value: "25 – 34" },
  ],
  responses: [
    { q: `Q1 · Why the ${programmeLabel}?`, a: "— Demo content — I have been producing garments informally for three years and I have reached the limit of what I can do alone. I want to join a peer cluster that will help me improve production standards and connect to larger buyers." },
    { q: "Q2 · What productive capability do you already bring?", a: "— Demo content — Basic pattern-making, tailoring, small-batch dyeing. I currently share a treadle machine with two other tailors in my neighbourhood." },
    { q: "Q3 · What outcome do you want from this programme?", a: "— Demo content — Certification against the national textile standard, a working relationship with at least one wholesale buyer, and an accountable peer group I can grow with." },
    { q: "Q4 · Are you willing to commit to 18 months of cohort activity?", a: "Yes · confirmed" },
  ],
  documents: [
    { name: "Motivation letter · signed", meta: "PDF · 214 KB · Uploaded 17 Sept", status: "received", icon: "file" },
    { name: "Work samples · portfolio", meta: "ZIP · 4 images · 3.1 MB", status: "received", icon: "image" },
    { name: "National ID · scan", meta: "PDF · 512 KB · Verified against registry", status: "verified", icon: "file" },
  ],
  notes: [
    { id: `note-${n}-1`, author: "Sarah Ndenge", role: "Reviewer", time: "Yesterday · 09:14", body: "Strong practical background but limited exposure to formal pattern-making. Recommend cluster placement with mentor pairing. Worth interviewing." },
    { id: `note-${n}-2`, author: "Maria Ndongo", role: "Super Admin", time: "2d ago", body: "Applicant matches Cohort 4 criteria. Move forward pending reference check." },
  ],
  timeline: timeline(status, submittedAt),
  provenance: { ...DEMO },
});

const SEED_APPLICATIONS: AdminApplication[] = [
  app(142, "vti", "Applicant · Welding Cohort 4", "prog-welding", "Welding Cohort 4", "VTI · Cluster · Cohort 4", "vti", "new", null, null, "17 Sept 2026 · 14:22", "8h ago"),
  app(141, "startup", "Applicant · Innovator Residency", "prog-residency", "Innovator Residency", "Startup · Residency", "startup", "new", null, null, "17 Sept 2026 · 10:05", "12h ago"),
  app(140, "startup", "Applicant · Enterprise Grant", null, "Enterprise Grant", "Opportunity", null, "new", null, null, "16 Sept 2026 · 22:41", "16h ago"),
  app(139, "vti", "Applicant · Agri-processing", "prog-agri", "Agri-processing", "VTI · Cluster", "vti", "new", null, null, "16 Sept 2026 · 16:02", "22h ago"),
  app(138, "vti", "Applicant · Textile Cluster · Cohort 4", "prog-textile", "Textile Cluster", "VTI · Cluster · Cohort 4", "vti", "under_review", null, REVIEWERS[0], "17 Sept 2026 · 14:22", "4d ago"),
  app(137, "startup", "Applicant · Commercialisation Track", "prog-commercialisation", "Commercialisation Track", "Startup · Track", "startup", "under_review", null, REVIEWERS[3], "16 Sept 2026 · 09:12", "2d ago"),
  app(135, "vti", "Applicant · Welding Cohort 4", "prog-welding", "Welding Cohort 4", "VTI · Cluster · Cohort 4", "vti", "under_review", null, REVIEWERS[1], "15 Sept 2026 · 11:30", "3d ago"),
  app(132, "startup", "Applicant · Innovator Residency", "prog-residency", "Innovator Residency", "Startup · Residency", "startup", "under_review", null, REVIEWERS[0], "14 Sept 2026 · 08:44", "4d ago"),
  app(131, "vti", "Applicant · Welding Cohort 4", "prog-welding", "Welding Cohort 4", "VTI · Cluster · Cohort 4", "vti", "shortlisted", "Interview scheduled", REVIEWERS[0], "13 Sept 2026 · 15:20", "5d ago"),
  app(129, "startup", "Applicant · Innovator Residency", "prog-residency", "Innovator Residency", "Startup · Residency", "startup", "shortlisted", "Pitch review", REVIEWERS[1], "12 Sept 2026 · 10:11", "6d ago"),
  app(128, "vti", "Applicant · Agri Cluster", "prog-agri", "Agri Cluster", "VTI · Cluster", "vti", "shortlisted", "Reference check", REVIEWERS[2], "11 Sept 2026 · 13:55", "1w ago"),
  app(125, "vti", "Applicant · Cohort 4 · Confirmed", "prog-welding", "Welding Cohort 4", "VTI · Cluster · Cohort 4", "vti", "accepted", "Notified", REVIEWERS[0], "9 Sept 2026 · 09:00", "1w ago"),
  app(122, "startup", "Applicant · Cohort 4 · Confirmed", "prog-residency", "Innovator Residency", "Startup · Residency", "startup", "accepted", "Notified", REVIEWERS[1], "8 Sept 2026 · 17:33", "1w ago"),
  app(118, "vti", "Applicant · Ineligible", "prog-welding", "Welding Cohort 4", "VTI · Cluster", "vti", "rejected", "Notified", REVIEWERS[0], "6 Sept 2026 · 12:10", "2w ago"),
  app(114, "startup", "Applicant · Withdrew", null, "Innovator Residency", "Startup", "startup", "rejected", "Archived", REVIEWERS[1], "4 Sept 2026 · 08:05", "2w ago"),
  app(110, "vti", "Applicant · Metalwork Cohort 3", "prog-metal", "Metalwork Cohort 3", "VTI · Cluster · Cohort 3", "vti", "archived", null, REVIEWERS[2], "20 Aug 2026 · 10:00", "1mo ago"),
];

// — reads —

export interface ApplicationQuery extends ListQuery {
  world?: string;
  programme?: string;
  reviewer?: string;
}

export function listApplications(site: SiteFilter, query: ApplicationQuery): Page<AdminApplication> {
  let rows = mockList("applications", () => SEED_APPLICATIONS);
  rows = filterBySite(rows, site, (r) => r.site);
  rows = filterByStatus(rows, query.status, (r) => r.status);
  if (query.world && query.world !== "all") rows = rows.filter((r) => (r.world ?? "opportunity") === query.world);
  if (query.programme) rows = rows.filter((r) => r.programmeId === query.programme);
  if (query.reviewer && query.reviewer !== "all") rows = rows.filter((r) => (r.reviewer?.id ?? "unassigned") === query.reviewer);
  rows = filterByQuery(rows, query.q, (r) => [r.applicantLabel, r.code, r.programmeLabel]);
  return paginate(rows, query.page, query.pageSize ?? 100);
}

export function applicationStatusCounts(site: SiteFilter): Record<string, number> {
  const rows = filterBySite(mockList("applications", () => SEED_APPLICATIONS), site, (r) => r.site);
  const counts: Record<string, number> = { all: rows.length };
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
  return counts;
}

export function applicationProgrammes(site: SiteFilter): { id: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const r of filterBySite(mockList("applications", () => SEED_APPLICATIONS), site, (r) => r.site)) {
    if (r.programmeId) seen.set(r.programmeId, r.programmeLabel);
  }
  return [...seen.entries()].map(([id, label]) => ({ id, label }));
}

export function applicationReviewers(site: SiteFilter): Reviewer[] {
  const seen = new Map<string, Reviewer>();
  for (const r of filterBySite(mockList("applications", () => SEED_APPLICATIONS), site, (r) => r.site)) {
    if (r.reviewer) seen.set(r.reviewer.id, r.reviewer);
  }
  return [...seen.values()];
}

export const getApplication = (id: string) => mockGet("applications", () => SEED_APPLICATIONS, id);

// — mock mutations (called only from actions.ts after authZ) —

export const saveApplication = (id: string, patch: Partial<AdminApplication>) => mockUpdate("applications", () => SEED_APPLICATIONS, id, patch);

export function appendNote(id: string, author: string, role: string, body: string): boolean {
  const record = getApplication(id);
  if (!record) return false;
  return (
    mockUpdate("applications", () => SEED_APPLICATIONS, id, {
      notes: [...record.notes, { id: mockId("note"), author, role, time: "Just now", body }],
    }) !== null
  );
}

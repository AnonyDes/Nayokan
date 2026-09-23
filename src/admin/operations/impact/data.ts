// MOCK impact governance — pending Session B's impact_metrics, metric_values
// and evidence tables. Rows mirror impact-metrics.html / evidence.html /
// impact-stories.html verbatim; every record carries isDemo provenance and
// figures are demo values, not verified institutional metrics.
import "server-only";
import type { Provenance } from "@/platform/content/types";
import type { SiteFilter } from "@/admin/shell/SiteSelector";
import { filterByQuery, filterBySite, filterByStatus, paginate, type ListQuery, type Page } from "@/admin/data/query";
import { mockGet, mockId, mockInsert, mockList, mockUpdate } from "@/admin/data/mock-store";
import type { EvidenceItem, EvidenceType, ImpactMetric, ImpactStory, MetricStatus, MetricVerifier, MetricWorld } from "./types";
import type { SiteId } from "@/platform/sites/types";

const DEMO: Provenance = { isDemo: true, unconfirmedFields: ["value"] };

// Same mock staff identities as platform/auth/directory.ts.
export const VERIFIERS: MetricVerifier[] = [
  { id: "rev-maria", name: "Maria Ndongo", role: "Super Admin" },
  { id: "rev-john", name: "John Bekolo", role: "Programme Manager" },
  { id: "rev-sarah", name: "Sarah Ndenge", role: "Communications" },
];

/** World → site used for scoped permission checks. "all" has no site scope. */
export const WORLD_SITE: Record<MetricWorld, SiteId | null> = {
  vti: "vti",
  startup: "startup",
  venture_capital: "corporate",
  hospitality: "corporate",
  all: null,
};

const metric = (
  n: number,
  title: string,
  name: string,
  scopeLabel: string,
  value: number | null,
  unit: string,
  periodLabel: string,
  periodRangeLabel: string,
  periodNote: string,
  geographicScope: string,
  world: MetricWorld,
  programmeLabel: string,
  status: MetricStatus,
  isPublic: boolean,
  evidence: ImpactMetric["evidence"],
  verifier: MetricVerifier | null,
): ImpactMetric => ({
  id: `met-${n}`,
  title,
  name,
  scopeLabel,
  value,
  unit,
  description: "",
  periodLabel,
  periodRangeLabel,
  periodNote,
  geographicScope,
  world,
  programmeLabel,
  status,
  isPublic: status === "approved" && isPublic,
  evidence,
  verifier,
  valueHistory: [],
  audit: [{ label: "Metric created", actor: "Maria Ndongo", ago: "12m ago" }],
  provenance: { ...DEMO },
});

const SEED_METRICS: ImpactMetric[] = [
  {
    ...metric(1, "People trained · 2025", "People trained", "VTI · All clusters · Cameroon", 240, "people", "Full year · 2025", "Jan – Dec 2025", "Annual · Cameroon-wide", "Cameroon · nationwide", "vti", "All VTI programmes", "needs_verification", false, { state: "none", label: "No evidence" }, null),
    description:
      "Number of people who completed a Nayokan Vocational Training Institute programme in the 2025 calendar year, including certification and cluster-based programmes.",
    valueHistory: [
      { period: "2025", value: 240, verifiedBy: null, verifiedAt: null, public: false },
      { period: "2024", value: 168, verifiedBy: "Maria Ndongo", verifiedAt: "14 Feb 2025", public: true },
      { period: "2023", value: 102, verifiedBy: "Maria Ndongo", verifiedAt: "21 Jan 2024", public: true },
    ],
    audit: [
      { label: "Value updated · 240", actor: "Maria Ndongo", ago: "2m ago" },
      { label: "Metric created", actor: "Maria Ndongo", ago: "12m ago" },
    ],
  },
  metric(2, "Enterprises supported · Q2 2026", "Enterprises supported", "Startup Centre · All programmes", 48, "enterprises", "Q2 · 2026", "Apr – Jun 2026", "Quarterly", "Cameroon · nationwide", "startup", "All programmes", "approved", true, { state: "verified", label: "Evidence attached", count: "3 files · 2 refs" }, VERIFIERS[0]),
  metric(3, "Cluster members active · Sept 2026", "Cluster members active", "VTI · All clusters", 312, "members", "Sept · 2026", "Sept 2026", "Monthly", "Cameroon · nationwide", "vti", "All VTI programmes", "verified", false, { state: "verified", label: "Verified · Programme records" }, VERIFIERS[1]),
  metric(4, "Mentors engaged · YTD", "Mentors engaged", "Startup Centre", 19, "mentors", "2026 · YTD", "Jan – Sept 2026", "Year to date", "Cameroon · nationwide", "startup", "All programmes", "approved", true, { state: "verified", label: "Verified · Internal registry" }, VERIFIERS[0]),
  metric(5, "Portfolio ventures active", "Portfolio ventures active", "Venture Capital", 9, "ventures", "Sept · 2026", "Sept 2026", "Monthly", "Cameroon · nationwide", "venture_capital", "Portfolio", "approved", true, { state: "verified", label: "Internal portfolio ledger" }, VERIFIERS[0]),
  metric(6, "Guests hosted · 30 days", "Guests hosted", "Hospitality · All properties", null, "guests", "30d rolling", "Rolling 30 days", "Rolling", "Cameroon · nationwide", "hospitality", "All properties", "draft", false, { state: "none", label: "Value not entered" }, null),
  metric(7, "Certificates issued · 2025", "Certificates issued", "VTI · Certification pathway", 184, "certificates", "Full year · 2025", "Jan – Dec 2025", "Annual", "Cameroon · nationwide", "vti", "Certification pathway", "approved", true, { state: "verified", label: "Verified · Certification body" }, VERIFIERS[1]),
  metric(8, "Female participation rate · VTI", "Female participation rate", "VTI · Cohorts 1 – 4", 42, "%", "Cohort 1–4", "Cohorts 1 – 4", "Cumulative", "Cameroon · nationwide", "vti", "All VTI programmes", "needs_verification", false, { state: "awaiting", label: "Awaiting evidence review" }, VERIFIERS[1]),
  metric(9, "University partnerships", "University partnerships", "Startup Centre · Signed MoUs", 4, "universities", "2026 · YTD", "Jan – Sept 2026", "Year to date", "Cameroon · nationwide", "startup", "University partnerships", "approved", true, { state: "verified", label: "Verified · Signed MoUs" }, VERIFIERS[0]),
  metric(10, "Applications received · 30 days", "Applications received", "All worlds · rolling", 72, "apps", "30d rolling", "Rolling 30 days", "Rolling", "Cameroon · nationwide", "all", "All programmes", "verified", false, { state: "verified", label: "Auto · System" }, null),
  metric(11, "Enterprises still trading · 12 months", "Enterprises still trading", "Startup Centre · Alumni", null, "%", "2025 cohort", "Cohort 2025", "Annual", "Cameroon · nationwide", "startup", "Alumni outcomes", "draft", false, { state: "none", label: "Value not entered" }, null),
  metric(12, "Placement rate · certification", "Placement rate", "VTI · Cohorts 1 – 4", 68, "%", "Cohort 1–4", "Cohorts 1 – 4", "Cumulative", "Cameroon · nationwide", "vti", "Certification pathway", "needs_verification", false, { state: "awaiting", label: "Awaiting evidence review" }, VERIFIERS[1]),
];

const SEED_EVIDENCE: EvidenceItem[] = [
  { id: "ev-522", code: "EV-2026-522", title: "Impact report 2024 · signed PDF", type: "report", metricId: null, relatedLabel: "Multiple metrics · 2024", uploadedBy: "Maria Ndongo", uploadedAt: "14 Feb 2025", status: "verified", provenance: { isDemo: true } },
  { id: "ev-898", code: "EV-2026-898", title: "Cohort 3 completion register", type: "programme_record", metricId: null, relatedLabel: "Certificates issued · 2024", uploadedBy: "John Bekolo", uploadedAt: "21 Jan 2025", status: "verified", provenance: { isDemo: true } },
  { id: "ev-796", code: "EV-2026-796", title: "Cohort 4 attendance register", type: "programme_record", metricId: "met-1", relatedLabel: "People trained · 2025", uploadedBy: "John Bekolo", uploadedAt: "15 Sep 2026", status: "awaiting_review", provenance: { isDemo: true } },
  { id: "ev-854", code: "EV-2026-854", title: "Textile cluster · production log", type: "spreadsheet", metricId: "met-3", relatedLabel: "Cluster members active", uploadedBy: "John Bekolo", uploadedAt: "12 Sep 2026", status: "verified", provenance: { isDemo: true } },
  { id: "ev-459", code: "EV-2026-459", title: "Startup Centre · portfolio ledger", type: "spreadsheet", metricId: "met-5", relatedLabel: "Portfolio ventures active", uploadedBy: "Maria Ndongo", uploadedAt: "8 Sep 2026", status: "verified", provenance: { isDemo: true } },
  { id: "ev-614", code: "EV-2026-614", title: "Startup Centre · mentor register", type: "programme_record", metricId: "met-4", relatedLabel: "Mentors engaged", uploadedBy: "Sarah Ndenge", uploadedAt: "5 Sep 2026", status: "verified", provenance: { isDemo: true } },
  { id: "ev-779", code: "EV-2026-779", title: "University MoU · signed 4 counterparts", type: "report", metricId: "met-9", relatedLabel: "University partnerships", uploadedBy: "Maria Ndongo", uploadedAt: "21 Mar 2026", status: "verified", provenance: { isDemo: true } },
  { id: "ev-368", code: "EV-2026-368", title: "Photo evidence · Cohort 4 workshop", type: "photo", metricId: "met-1", relatedLabel: "People trained · 2025", uploadedBy: "John Bekolo", uploadedAt: "21 Sep 2026", status: "awaiting_review", provenance: { isDemo: true } },
];

const SEED_STORIES: ImpactStory[] = [
  { id: "is-1", title: "A cohort becomes a cluster · one year on", eyebrowLabel: "Cohort 3 · VTI", outcomeLabel: "12 verified outcomes", status: "published", world: "vti", provenance: { isDemo: true, unconfirmedFields: ["title"] } },
  { id: "is-2", title: "From workshop to registered enterprise", eyebrowLabel: "Enterprise · Textile", outcomeLabel: "3 verified outcomes", status: "published", world: "vti", provenance: { isDemo: true, unconfirmedFields: ["title"] } },
  { id: "is-3", title: "A welder becomes a certified trainer", eyebrowLabel: "Individual · Welding", outcomeLabel: "2 verified outcomes", status: "published", world: "vti", provenance: { isDemo: true, unconfirmedFields: ["title"] } },
  { id: "is-4", title: "University research reaches market", eyebrowLabel: "Enterprise · Startup Centre", outcomeLabel: "No evidence yet", status: "draft", world: "startup", provenance: { isDemo: true, unconfirmedFields: ["title"] } },
];

// — metric reads —

const metricSite = (m: ImpactMetric) => WORLD_SITE[m.world];

export interface MetricQuery extends ListQuery {
  world?: string;
  period?: string;
}

export function listMetrics(site: SiteFilter, query: MetricQuery): Page<ImpactMetric> {
  let rows = mockList("impact_metrics", () => SEED_METRICS);
  rows = filterBySite(rows, site, metricSite);
  rows = filterByStatus(rows, query.status, (r) => r.status);
  if (query.world && query.world !== "all") rows = rows.filter((r) => r.world === query.world);
  rows = filterByQuery(rows, query.q, (r) => [r.title, r.scopeLabel, r.unit]);
  return paginate(rows, query.page, query.pageSize);
}

export function metricStatusCounts(site: SiteFilter): Record<string, number> {
  const rows = filterBySite(mockList("impact_metrics", () => SEED_METRICS), site, metricSite);
  const counts: Record<string, number> = { all: rows.length };
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
  return counts;
}

/** Governance-strip stats for the list header. */
export function metricGovernanceStats(site: SiteFilter) {
  const rows = filterBySite(mockList("impact_metrics", () => SEED_METRICS), site, metricSite);
  return {
    publicLive: rows.filter((r) => r.isPublic).length,
    verifiedNotPublic: rows.filter((r) => r.status === "verified" && !r.isPublic).length,
    needsVerification: rows.filter((r) => r.status === "needs_verification").length,
    draftNoEvidence: rows.filter((r) => r.status === "draft").length,
  };
}

export const getMetric = (id: string) => mockGet("impact_metrics", () => SEED_METRICS, id);

// — evidence reads —

export interface EvidenceQuery extends ListQuery {
  type?: string;
  linked?: string;
}

export function listEvidence(site: SiteFilter, query: EvidenceQuery): Page<EvidenceItem> {
  let rows = mockList("evidence", () => SEED_EVIDENCE);
  rows = filterBySite(rows, site, (r) => {
    const m = r.metricId ? getMetric(r.metricId) : null;
    return m ? metricSite(m) : null; // unlinked evidence shows under every site filter
  });
  const tab = query.status ?? "all";
  if (tab !== "all") rows = rows.filter((r) => r.type === tab);
  if (query.linked === "unlinked") rows = rows.filter((r) => r.metricId === null);
  rows = filterByQuery(rows, query.q, (r) => [r.title, r.code, r.relatedLabel, r.uploadedBy]);
  return paginate(rows, query.page, query.pageSize);
}

export function evidenceTypeCounts(site: SiteFilter): Record<string, number> {
  const rows = filterBySite(mockList("evidence", () => SEED_EVIDENCE), site, (r) => {
    const m = r.metricId ? getMetric(r.metricId) : null;
    return m ? metricSite(m) : null;
  });
  const counts: Record<string, number> = { all: rows.length };
  for (const r of rows) counts[r.type] = (counts[r.type] ?? 0) + 1;
  return counts;
}

/** Evidence items linked to a metric (non-superseded), newest first. */
export function metricEvidence(metricId: string): EvidenceItem[] {
  return mockList("evidence", () => SEED_EVIDENCE).filter((e) => e.metricId === metricId && e.status !== "superseded");
}

export const getEvidence = (id: string) => mockGet("evidence", () => SEED_EVIDENCE, id);

/** Recompute a metric's Source·Evidence ref from its live evidence links —
 *  called by actions after link/verify/supersede so the chain stays honest. */
export function refreshMetricEvidence(metricId: string): void {
  const m = getMetric(metricId);
  if (!m) return;
  const items = metricEvidence(metricId);
  const evidence: ImpactMetric["evidence"] =
    items.length === 0
      ? { state: "none", label: m.value === null ? "Value not entered" : "No evidence" }
      : items.some((i) => i.status === "awaiting_review")
        ? { state: "awaiting", label: "Awaiting evidence review" }
        : { state: "verified", label: "Evidence attached", count: `${items.length} file${items.length === 1 ? "" : "s"}` };
  saveMetric(metricId, { evidence });
}

// — impact story reads —

export function listImpactStories(site: SiteFilter): ImpactStory[] {
  return filterBySite(mockList("impact_stories", () => SEED_STORIES), site, (s) => WORLD_SITE[s.world]);
}

// — mock mutations (called only from actions.ts after authZ) —

export const saveMetric = (id: string, patch: Partial<ImpactMetric>) => mockUpdate("impact_metrics", () => SEED_METRICS, id, patch);

/** New metrics start as empty drafts — value and evidence are filled in the
 *  editor before anything can be submitted for verification. */
export function insertMetric(creator: string): ImpactMetric {
  const m: ImpactMetric = {
    id: mockId("met"),
    title: "Untitled metric",
    name: "",
    scopeLabel: "—",
    value: null,
    unit: "people",
    description: "",
    periodLabel: "Draft",
    periodRangeLabel: "",
    periodNote: "",
    geographicScope: "Cameroon · nationwide",
    world: "all",
    programmeLabel: "",
    status: "draft",
    isPublic: false,
    evidence: { state: "none", label: "Value not entered" },
    verifier: null,
    valueHistory: [],
    audit: [{ label: "Metric created", actor: creator, ago: "Just now" }],
    provenance: { isDemo: true },
  };
  return mockInsert("impact_metrics", () => SEED_METRICS, m);
}

export function appendMetricAudit(id: string, actor: string, label: string): void {
  const m = getMetric(id);
  if (!m) return;
  mockUpdate("impact_metrics", () => SEED_METRICS, id, { audit: [{ label, actor, ago: "Just now" }, ...m.audit] });
}

export const saveEvidence = (id: string, patch: Partial<EvidenceItem>) => mockUpdate("evidence", () => SEED_EVIDENCE, id, patch);

export function insertEvidence(input: { title: string; type: EvidenceType; metricId: string | null; relatedLabel: string; uploadedBy: string }): EvidenceItem {
  const item: EvidenceItem = {
    id: mockId("ev"),
    code: `EV-2026-${Math.floor(100 + Math.random() * 900)}`,
    title: input.title,
    type: input.type,
    metricId: input.metricId,
    relatedLabel: input.relatedLabel,
    uploadedBy: input.uploadedBy,
    uploadedAt: "Just now",
    status: "awaiting_review",
    provenance: { isDemo: true },
  };
  return mockInsert("evidence", () => SEED_EVIDENCE, item);
}

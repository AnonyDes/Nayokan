// Typed dashboard data interface (readiness-report §7: "Dashboard uses real
// queries only"). Session B owns the tables these queries will read
// (applications, enquiries, content_versions, audit_log, impact_metrics —
// readiness-report §8-9). Until those land, `getDashboardData` returns the
// MOCK_ shape below, deliberately matching Designs/admin/dashboard.html's
// numbers so the screen is demoable — never rendered as real institutional
// fact (AGENTS.md: no fabricated figures reach the *public* site; this is
// staff-only tooling, but the mock/real boundary still has to be explicit).
import "server-only";
import type { SiteFilter } from "@/admin/shell/SiteSelector";

export interface AttentionItem {
  id: string;
  severity: "danger" | "warn" | "info";
  title: string;
  subtitle: string;
  pillLabel: string;
  age: string;
}

export interface ApplicationsPipelineColumn {
  status: string;
  count: number;
}

export interface ActivityItem {
  id: string;
  actorInitials: string;
  actor: string;
  verb: string;
  object: string;
  time: string;
}

export interface ScheduledItem {
  id: string;
  title: string;
  kind: string;
  when: string;
}

export interface WorldSummary {
  id: string;
  num: string;
  name: string;
  stats: { label: string; value: string }[];
}

export interface DashboardData {
  isMock: true;
  awaitingYou: number;
  assignedTeam: number;
  inReview: number;
  scheduledToday: number;
  drafts: number;
  pendingReview: number;
  scheduled: number;
  publishedLast30d: number;
  needsAttention: number;
  attentionItems: AttentionItem[];
  applicationsPipeline: ApplicationsPipelineColumn[];
  recentActivity: ActivityItem[];
  scheduledForPublication: ScheduledItem[];
  worlds: WorldSummary[];
  enquiries: { new: number; inProgress: number; resolved: number; medianResponse: string };
}

const MOCK_DASHBOARD: DashboardData = {
  isMock: true,
  awaitingYou: 4,
  assignedTeam: 17,
  inReview: 9,
  scheduledToday: 2,
  drafts: 14,
  pendingReview: 9,
  scheduled: 6,
  publishedLast30d: 28,
  needsAttention: 11,
  attentionItems: [
    { id: "a1", severity: "danger", title: "Impact metric “People trained · 2025” has no supporting evidence", subtitle: "Impact · Verification required before public toggle", pillLabel: "Unverified", age: "4d" },
    { id: "a2", severity: "warn", title: "Article “How Cameroon builds productive capability” missing SEO description", subtitle: "Content · Draft · blocked from scheduling", pillLabel: "SEO gap", age: "2d" },
    { id: "a3", severity: "warn", title: "VTI programme “Agri-processing Cluster · Cohort 4” missing application deadline", subtitle: "Programme · Cannot open applications", pillLabel: "Field missing", age: "3d" },
    { id: "a4", severity: "warn", title: "Partner record “University of Yaoundé I” missing logo", subtitle: "Ecosystem · Not visible on public partner grid", pillLabel: "Asset missing", age: "6d" },
    { id: "a5", severity: "info", title: "3 drafts have not been touched in over 30 days", subtitle: "Content · Consider archiving or completing", pillLabel: "Stale", age: "30d+" },
    { id: "a6", severity: "danger", title: "2 opportunities have passed their deadline but are still marked Open", subtitle: "Programmes · Must be closed manually", pillLabel: "Expired", age: "Now" },
  ],
  applicationsPipeline: [
    { status: "New", count: 12 },
    { status: "Under review", count: 8 },
    { status: "Shortlisted", count: 5 },
    { status: "Accepted", count: 3 },
    { status: "Rejected", count: 2 },
  ],
  recentActivity: [
    { id: "r1", actorInitials: "MN", actor: "Maria", verb: "updated the VTI programme", object: "Agri-processing Cluster · Cohort 4", time: "2m" },
    { id: "r2", actorInitials: "JB", actor: "John", verb: "submitted for review", object: "“Building productive capability”", time: "18m" },
    { id: "r3", actorInitials: "DE", actor: "David", verb: "approved impact metric", object: "Enterprises supported · Q2", time: "1h" },
    { id: "r4", actorInitials: "SN", actor: "Sarah", verb: "published Startup Centre opportunity", object: "Innovator Residency · 2026", time: "2h" },
  ],
  scheduledForPublication: [
    { id: "s1", title: "“Nayokan Q3 impact review”", kind: "Article · Communications", when: "Wed · 24 Sep · 08:00" },
    { id: "s2", title: "“Cohort 4 — welcome cohort”", kind: "Story · VTI", when: "Fri · 26 Sep · 12:00" },
  ],
  worlds: [
    { id: "vti", num: "01 · World", name: "Vocational Training Institute", stats: [{ label: "Programmes", value: "8" }, { label: "Clusters", value: "14" }, { label: "Open apps", value: "42" }] },
    { id: "startup", num: "02 · World", name: "Startup Centre", stats: [{ label: "Programmes", value: "6" }, { label: "Mentors", value: "19" }, { label: "Open apps", value: "28" }] },
    { id: "vc", num: "03 · World", name: "Venture Capital", stats: [{ label: "Ventures", value: "9" }, { label: "In pipeline", value: "4" }, { label: "Applications", value: "—" }] },
    { id: "hospitality", num: "04 · World", name: "Hospitality", stats: [{ label: "Properties", value: "3" }, { label: "Enquiries · 30d", value: "18" }, { label: "Draft entries", value: "2" }] },
  ],
  enquiries: { new: 7, inProgress: 11, resolved: 34, medianResponse: "6h 12m" },
};

/**
 * `site` narrows the query once Session B's tables exist (`applications.site`,
 * `enquiries.site`, etc.) — the mock ignores it today since it isn't
 * per-site data yet.
 */
export async function getDashboardData(site: SiteFilter): Promise<DashboardData> {
  void site; // ignored until Session B's per-site tables exist (see comment above)
  return MOCK_DASHBOARD;
}

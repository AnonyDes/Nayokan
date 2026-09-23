// Impact governance records — mirrors Designs/admin/impact-metrics.html,
// metric-editor.html, evidence.html, impact-stories.html. Governance rule
// (readiness-report §8): a metric may be public only after verification and
// approval — enforced server-side in actions.ts, not just hidden in the UI.
// DB shape pending Session B.
import type { Provenance } from "@/platform/content/types";
import type { World } from "@/platform/sites/types";

/** Verification chain: draft (no value) → needs_verification (value set,
 *  evidence missing or under review) → verified (evidence verified,
 *  awaiting approval) → approved. Public is a separate flag gated on
 *  status === "approved". */
export type MetricStatus = "draft" | "needs_verification" | "verified" | "approved";

export type EvidenceType = "report" | "programme_record" | "spreadsheet" | "photo";
/** Append-only: records are never edited or deleted — a correction is a new
 *  record that supersedes the old one (evidence.html). */
export type EvidenceStatus = "awaiting_review" | "verified" | "superseded";

/** Related world for a metric — the editor's selector offers the four
 *  operational worlds plus "All worlds"; "corporate" is a site, not a world. */
export type MetricWorld = Exclude<World, "corporate"> | "all";

export interface MetricEvidenceRef {
  /** Evidence state for the list row's Source·Evidence cell. */
  state: "none" | "awaiting" | "verified";
  label: string;
  /** e.g. "3 files · 2 refs". */
  count?: string;
}

export interface MetricValueHistoryRow {
  period: string;
  value: number | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  /** Public-site state for that period. */
  public: boolean;
}

export interface MetricAuditEntry {
  label: string;
  actor: string;
  ago: string;
}

export interface MetricVerifier {
  id: string;
  name: string;
  role: string;
}

export interface ImpactMetric {
  id: string;
  /** Display name, e.g. "People trained · 2025". */
  title: string;
  name: string;
  /** Scope line under the title, e.g. "VTI · All clusters · Cameroon". */
  scopeLabel: string;
  value: number | null;
  unit: string;
  description: string;
  periodLabel: string;
  periodRangeLabel: string;
  periodNote: string;
  geographicScope: string;
  world: MetricWorld;
  programmeLabel: string;
  status: MetricStatus;
  isPublic: boolean;
  evidence: MetricEvidenceRef;
  verifier: MetricVerifier | null;
  valueHistory: MetricValueHistoryRow[];
  audit: MetricAuditEntry[];
  provenance: Provenance;
}

export interface EvidenceItem {
  id: string;
  /** e.g. EV-2026-522. */
  code: string;
  title: string;
  type: EvidenceType;
  /** Linked metric id, or null when unlinked. */
  metricId: string | null;
  relatedLabel: string;
  uploadedBy: string;
  uploadedAt: string;
  status: EvidenceStatus;
  provenance: Provenance;
}

export interface ImpactStory {
  id: string;
  title: string;
  /** Mono eyebrow on the card, e.g. "Cohort 3 · VTI". */
  eyebrowLabel: string;
  /** e.g. "12 verified outcomes" / "No evidence yet". */
  outcomeLabel: string;
  status: "published" | "draft";
  world: MetricWorld;
  provenance: Provenance;
}

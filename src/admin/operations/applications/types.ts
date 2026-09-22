// Admin application records — mirrors Designs/admin/applications.html +
// application-detail.html. Applicant identity is withheld during review by
// design ("— Confidential during review —"); never surface real PII in mocks.
// DB shape pending Session B (readiness-report §8: applications, documents,
// notes, assignments live in Session B's tables; documents resolve via signed
// URLs against a private bucket — never public URLs).
import type { Provenance } from "@/platform/content/types";
import type { SiteId, World } from "@/platform/sites/types";

export type ApplicationStatus = "new" | "under_review" | "shortlisted" | "accepted" | "rejected" | "archived";

export interface Reviewer {
  id: string;
  name: string;
  initials: string;
  role: string;
}

export interface AppFact {
  label: string;
  value: string;
  mono?: boolean;
}

export interface AppResponse {
  q: string;
  a: string;
}

export type AppDocStatus = "received" | "verified";

export interface AppDoc {
  name: string;
  meta: string;
  status: AppDocStatus;
  icon: "file" | "image";
}

export interface AppNote {
  id: string;
  author: string;
  role: string;
  time: string;
  body: string;
}

export interface AppTimelineRow {
  label: string;
  sub: string;
  time: string;
  state: "done" | "current" | "pending";
}

export interface AdminApplication {
  id: string;
  site: SiteId;
  /** e.g. A-2026-0138. */
  code: string;
  /** Display label — applicant name stays withheld during review. */
  applicantLabel: string;
  initials: string;
  programmeId: string | null;
  programmeLabel: string;
  /** e.g. "VTI · Cluster · Cohort 4". */
  programmeMeta: string;
  programmeDeadline: string;
  world: World | null;
  status: ApplicationStatus;
  /** Kanban card meta pill, e.g. "Interview scheduled", "Notified". */
  stageLabel: string | null;
  reviewer: Reviewer | null;
  submittedAt: string;
  submittedAgo: string;
  language: string;
  source: string;
  facts: AppFact[];
  responses: AppResponse[];
  documents: AppDoc[];
  notes: AppNote[];
  timeline: AppTimelineRow[];
  provenance: Provenance;
}

// Admin audit-log model — append-only record of every platform action,
// with actor, timestamp and before/after state where relevant. Mirrors
// Designs/admin/audit-log.html. DB shape pending Session B's `audit_log`
// table (readiness-report §9 — already landed as append-only with RLS).
import type { Provenance } from "@/platform/content/types";

export const AUDIT_CATEGORIES = ["content", "impact", "programme", "users", "security", "system"] as const;
export type AuditCategory = (typeof AUDIT_CATEGORIES)[number];

export interface AuditStatePair {
  prev: [string, string][];
  next: [string, string][];
  /** Session/object metadata line, e.g. "IP 41.204 · WAT · Session id S-2026-3812". */
  meta: string;
}

export interface AuditEntry {
  id: string;
  /** Display timestamp, e.g. "21 Sep · 14:12". */
  at: string;
  /** Relative label, e.g. "2m ago". */
  ago: string;
  actor: string;
  initials: string;
  /** System rows render a dark SYS avatar. */
  system?: boolean;
  verb: string;
  object: string;
  objectType: string;
  category: AuditCategory;
  tag?: { label: string; tone: "dangerous" | "governance" };
  pillLabel: string;
  pillTone: "info" | "approved" | "published" | "rejected" | "verified" | "archived" | "expired" | "neutral";
  detail?: AuditStatePair;
  provenance: Provenance;
}

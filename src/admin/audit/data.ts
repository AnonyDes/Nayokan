// MOCK audit log — pending Session B's append-only `audit_log` table
// (20260922130001_helpers_and_enums.sql already landed it with RLS; this
// mock mirrors its semantics: inserts only, never update/delete). Rows
// mirror Designs/admin/audit-log.html; every mutation in the admin writes
// through appendAudit() so screens stay consistent.
import "server-only";
import { filterByQuery, filterByStatus, paginate, type ListQuery, type Page } from "@/admin/data/query";
import { mockId, mockInsert, mockList } from "@/admin/data/mock-store";
import type { AuditCategory, AuditEntry } from "./types";

const DEMO = { isDemo: true } as const;
const COLLECTION = "audit_log";

const SEED: AuditEntry[] = [
  {
    id: "au-1",
    at: "21 Sep · 14:12",
    ago: "2m ago",
    actor: "Maria Ndongo",
    initials: "MN",
    verb: "updated impact metric",
    object: "People trained · 2025",
    objectType: "Impact metric",
    category: "impact",
    tag: { label: "Impact", tone: "governance" },
    pillLabel: "Update",
    pillTone: "info",
    detail: {
      prev: [
        ["value", "198"],
        ["status", "Draft"],
        ["public", "false"],
      ],
      next: [
        ["value", "240"],
        ["status", "Needs verification"],
        ["public", "false"],
      ],
      meta: "IP 41.204 · WAT · Session id S-2026-3812 · Object id IM-004",
    },
    provenance: { ...DEMO },
  },
  { id: "au-2", at: "21 Sep · 13:52", ago: "22m ago", actor: "John Bekolo", initials: "JB", verb: "submitted article for review", object: '"Building productive capability"', objectType: "Article", category: "content", pillLabel: "Submit", pillTone: "info", provenance: { ...DEMO } },
  { id: "au-3", at: "21 Sep · 13:04", ago: "1h ago", actor: "David Ekwe", initials: "DE", verb: "approved impact metric", object: "Enterprises supported · Q2", objectType: "Impact metric", category: "impact", tag: { label: "Impact", tone: "governance" }, pillLabel: "Approve", pillTone: "approved", provenance: { ...DEMO } },
  { id: "au-4", at: "21 Sep · 11:44", ago: "2h ago", actor: "Sarah Ndenge", initials: "SN", verb: "published Startup Centre opportunity", object: "Innovator Residency · 2026", objectType: "Opportunity", category: "programme", pillLabel: "Publish", pillTone: "published", provenance: { ...DEMO } },
  { id: "au-5", at: "21 Sep · 10:22", ago: "3h ago", actor: "Maria Ndongo", initials: "MN", verb: "changed user permissions for", object: "Aïssa Tchoumi", objectType: "User", category: "users", tag: { label: "Dangerous", tone: "dangerous" }, pillLabel: "Perm change", pillTone: "rejected", provenance: { ...DEMO } },
  { id: "au-6", at: "21 Sep · 09:41", ago: "4h ago", actor: "John Bekolo", initials: "JB", verb: "uploaded 12 images to media library", object: "· Cohort 4", objectType: "Media", category: "content", pillLabel: "Upload", pillTone: "info", provenance: { ...DEMO } },
  { id: "au-7", at: "20 Sep · 17:12", ago: "Yesterday", actor: "David Ekwe", initials: "DE", verb: "requested changes on", object: '"Hospitality year in review"', objectType: "Article", category: "content", pillLabel: "Reject", pillTone: "rejected", provenance: { ...DEMO } },
  { id: "au-8", at: "20 Sep · 16:04", ago: "Yesterday", actor: "Maria Ndongo", initials: "MN", verb: "created programme", object: "Welding · Cohort 4", objectType: "Programme", category: "programme", pillLabel: "Create", pillTone: "verified", provenance: { ...DEMO } },
  { id: "au-9", at: "20 Sep · 14:22", ago: "Yesterday", actor: "Sarah Ndenge", initials: "SN", verb: "signed in from new device", object: "Firefox · macOS · Yaoundé", objectType: "Session", category: "security", tag: { label: "Security", tone: "dangerous" }, pillLabel: "Auth", pillTone: "info", provenance: { ...DEMO } },
  { id: "au-10", at: "20 Sep · 09:14", ago: "Yesterday", actor: "Maria Ndongo", initials: "MN", verb: "disabled user account", object: "Contractor · former staff", objectType: "User", category: "users", tag: { label: "Dangerous", tone: "dangerous" }, pillLabel: "Disable", pillTone: "rejected", provenance: { ...DEMO } },
  { id: "au-11", at: "19 Sep · 15:41", ago: "2d ago", actor: "Sarah Ndenge", initials: "SN", verb: "edited homepage section", object: "Featured programmes", objectType: "Homepage", category: "content", pillLabel: "Update", pillTone: "info", provenance: { ...DEMO } },
  { id: "au-12", at: "19 Sep · 11:32", ago: "2d ago", actor: "David Ekwe", initials: "DE", verb: "restored previous version", object: '"On patient capital: a Nayokan letter" · v3', objectType: "Version", category: "content", pillLabel: "Restore", pillTone: "info", provenance: { ...DEMO } },
  { id: "au-13", at: "18 Sep · 09:24", ago: "3d ago", actor: "Maria Ndongo", initials: "MN", verb: "archived programme", object: "Legacy Programme · Cohort 1", objectType: "Programme", category: "programme", pillLabel: "Archive", pillTone: "archived", provenance: { ...DEMO } },
  { id: "au-14", at: "18 Sep · 08:12", ago: "3d ago", actor: "System", initials: "SYS", system: true, verb: "auto-closed opportunity", object: "Grant · 2026 Q3 · deadline passed", objectType: "Opportunity", category: "system", pillLabel: "Auto", pillTone: "expired", provenance: { ...DEMO } },
];

export interface AuditQuery extends ListQuery {
  actor?: string;
  object?: string;
  category?: string;
  range?: string;
}

export function listAuditEntries(query: AuditQuery): Page<AuditEntry> {
  let rows = mockList(COLLECTION, () => SEED);
  rows = filterByQuery(rows, query.q, (r) => [r.actor, r.verb, r.object, r.objectType]);
  rows = filterByStatus(rows, query.actor, (r) => r.actor);
  rows = filterByStatus(rows, query.object, (r) => r.objectType);
  rows = filterByStatus(rows, query.category, (r) => r.category);
  // `range` is display-only in the mock: every seeded entry is "last 7 days".
  return paginate(rows, query.page, query.pageSize);
}

export function auditActors(): string[] {
  return [...new Set(mockList(COLLECTION, () => SEED).map((r) => r.actor))];
}

export function auditObjectTypes(): string[] {
  return [...new Set(mockList(COLLECTION, () => SEED).map((r) => r.objectType))];
}

/** All entries, unfiltered — export path. */
export function allAuditEntries(): AuditEntry[] {
  return mockList(COLLECTION, () => SEED);
}

/**
 * Append an entry. The mock mirrors Session B's append-only table: there is
 * deliberately no update/delete here. Callers supply display fields; id is
 * generated. `at`/`ago` default to "now" so actions don't need a clock.
 */
export function appendAudit(
  entry: Omit<AuditEntry, "id" | "at" | "ago" | "provenance"> & { at?: string; ago?: string },
): AuditEntry {
  return mockInsert(COLLECTION, () => SEED, {
    id: mockId("au"),
    at: entry.at ?? "Now",
    ago: entry.ago ?? "now",
    provenance: { ...DEMO },
    ...entry,
  });
}

export const AUDIT_CATEGORY_LABELS: Record<AuditCategory, string> = {
  content: "Content",
  impact: "Impact",
  programme: "Programme",
  users: "Users",
  security: "Security",
  system: "System",
};

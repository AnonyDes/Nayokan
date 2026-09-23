// Serialise audit entries for the CSV/JSON export endpoints. Pure functions
// (no server-only) so they're unit-testable and the route handlers stay thin.
import type { AuditEntry } from "./types";

const CSV_HEADERS = ["id", "timestamp", "actor", "verb", "object", "object_type", "category", "action", "detail_meta"] as const;

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function auditToCsv(entries: AuditEntry[]): string {
  const rows = entries.map((e) =>
    [e.id, e.at, e.actor, e.verb, e.object, e.objectType, e.category, e.pillLabel, e.detail?.meta ?? ""]
      .map(csvCell)
      .join(","),
  );
  return [CSV_HEADERS.join(","), ...rows].join("\n");
}

export function auditToJson(entries: AuditEntry[]): string {
  return JSON.stringify(
    entries.map((e) => ({
      id: e.id,
      at: e.at,
      ago: e.ago,
      actor: e.actor,
      system: e.system === true,
      verb: e.verb,
      object: e.object,
      objectType: e.objectType,
      category: e.category,
      action: e.pillLabel,
      tag: e.tag?.label ?? null,
      detail: e.detail ?? null,
      demo: e.provenance.isDemo,
    })),
    null,
    2,
  );
}

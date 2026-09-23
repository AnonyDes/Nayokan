// GET /admin/admin/audit-log/export?format=csv|json — download the full
// (filtered-less) audit log. Gated by audit_log:view like the screen; the
// log itself stays append-only — export is a read.
import { NextRequest } from "next/server";
import { requirePermission } from "@/platform/auth/permissions";
import { allAuditEntries } from "@/admin/audit/data";
import { auditToCsv, auditToJson } from "@/admin/audit/export";

export async function GET(request: NextRequest) {
  await requirePermission("audit_log", "view");
  const format = request.nextUrl.searchParams.get("format") === "json" ? "json" : "csv";
  const entries = allAuditEntries();
  const body = format === "json" ? auditToJson(entries) : auditToCsv(entries);
  return new Response(body, {
    headers: {
      "content-type": format === "json" ? "application/json; charset=utf-8" : "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="nayokan-audit-log.${format}"`,
    },
  });
}

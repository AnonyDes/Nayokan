// GET /admin/admin/roles/export — the permission matrix as CSV, gated by
// roles:view like the screen.
import { requirePermission } from "@/platform/auth/permissions";
import { ROLE_LABELS } from "@/platform/auth/roles";
import { ROLE_IDS } from "@/platform/auth/types";
import { getRoleMatrix, MATRIX_SECTIONS } from "@/admin/administration/data";

const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export async function GET() {
  await requirePermission("roles", "view");
  const matrix = getRoleMatrix();
  const lines = [["Area", ...ROLE_IDS.map((r) => ROLE_LABELS[r])].join(",")];
  for (const section of MATRIX_SECTIONS) {
    lines.push(cell(section.label));
    for (const a of section.areas) {
      lines.push([cell(a.label), ...ROLE_IDS.map((r) => matrix[r][a.area])].join(","));
    }
  }
  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="nayokan-role-matrix.csv"',
    },
  });
}

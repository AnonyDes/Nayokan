import type { Metadata } from "next";
import { requirePermission } from "@/platform/auth/permissions";
import { Page, PageHead } from "@/admin/ui/Page";
import { Panel } from "@/admin/ui/Panel";
import { Empty, DemoTag } from "@/admin/ui/Feedback";
import { ListControls, PaginationControl } from "@/admin/ui/ListControls";
import { parseListQuery, param } from "@/admin/data/query";
import { auditActors, auditObjectTypes, listAuditEntries, AUDIT_CATEGORY_LABELS } from "@/admin/audit/data";
import { AuditRows } from "@/admin/audit/AuditRows";

export const metadata: Metadata = { title: "Audit log" };

export default async function AuditLogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("audit_log", "view");
  const sp = await searchParams;
  const query = parseListQuery(sp);
  const result = listAuditEntries({
    ...query,
    actor: param(sp, "actor"),
    object: param(sp, "object"),
    category: param(sp, "category"),
    range: param(sp, "range"),
    pageSize: 14,
  });

  const actorFilter = {
    key: "actor",
    label: "Actor",
    options: [{ value: "", label: "All" }, ...auditActors().map((a) => ({ value: a, label: a }))],
  };
  const objectFilter = {
    key: "object",
    label: "Object",
    options: [{ value: "", label: "Any" }, ...auditObjectTypes().map((o) => ({ value: o, label: o }))],
  };
  const categoryFilter = {
    key: "category",
    label: "Category",
    options: [{ value: "", label: "Any" }, ...Object.entries(AUDIT_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))],
  };

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § H · 06 · Administration · Governance <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Audit log"
        lede="Every action on the platform, with actor, timestamp and — where relevant — the before-and-after values. The audit log is append-only and cannot be edited or deleted."
        actions={
          <>
            <a className="ax-btn ax-btn--soft" href="/admin/admin/audit-log/export?format=csv">Export · CSV</a>
            <a className="ax-btn ax-btn--soft" href="/admin/admin/audit-log/export?format=json">Export · JSON</a>
          </>
        }
      />

      <Panel>
        <ListControls
          searchPlaceholder="Search actor, action, object…"
          filters={[actorFilter, objectFilter, categoryFilter]}
        />
        {result.rows.length === 0 ? (
          <Empty title="No audit entries match" lede="Adjust the filters or search." />
        ) : (
          <AuditRows entries={result.rows} />
        )}
        <PaginationControl from={result.from} to={result.to} total={result.total} noun="entries" page={result.page} pages={Math.ceil(result.total / result.pageSize)} />
      </Panel>
    </Page>
  );
}

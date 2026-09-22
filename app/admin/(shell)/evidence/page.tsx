import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Evidence" };
export const dynamic = "force-dynamic";

export default async function EvidencePage() {
  const supabase = await createServerReadClient();
  const { data: rows } = await supabase
    .from("evidence")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ F · 02 · Impact · Evidence" title="Evidence" lede="Source documents backing every public impact claim." />
      <Panel>
        <DataTable
          head={["Evidence", "Type", "Linked metric", "Uploaded"]}
          empty="No evidence records yet."
          rows={(rows ?? []).map((e) => {
            const r = e as Record<string, unknown>;
            return [
              <div key="n">
                <div className="ax-table__title">{String(r.title ?? r.name ?? r.filename ?? `Evidence ${r.id}`)}</div>
                <div className="ax-table__sub ax-mono ax-mono--sm">{String(r.description ?? r.source ?? "")}</div>
              </div>,
              <span key="t">{String(r.type ?? r.kind ?? "—")}</span>,
              <span key="m" className="ax-mono ax-mono--sm">{String(r.metric_id ?? "—")}</span>,
              <span key="d" className="is-mono">{fmtDate(String(r.created_at ?? ""))}</span>,
            ];
          })}
        />
      </Panel>
    </div>
  );
}

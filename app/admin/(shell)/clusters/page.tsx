import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable, StatusPill, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Clusters" };
export const dynamic = "force-dynamic";

export default async function ClustersPage() {
  const supabase = await createServerReadClient();
  const { data: rows } = await supabase
    .from("clusters")
    .select("id,slug,code,name,sector,location,member_count,status_label,status_content,updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ D · 02 · Programmes · Clusters" title="Clusters" lede="Enterprise clusters attached to VTI programmes." />
      <Panel>
        <DataTable
          head={["Cluster", "Sector", "Location", "Members", "Status", "Updated"]}
          empty="No clusters yet."
          rows={(rows ?? []).map((c) => [
            <div key="t">
              <div className="ax-table__title">{c.name}</div>
              <div className="ax-table__sub ax-mono ax-mono--sm">{c.code ?? c.slug}</div>
            </div>,
            <span key="s">{c.sector ?? "—"}</span>,
            <span key="l">{c.location ?? "—"}</span>,
            <span key="m" className="is-num is-mono">{c.member_count ?? "—"}</span>,
            <StatusPill key="st" status={c.status_content ?? "draft"} label={c.status_label ?? undefined} />,
            <span key="u" className="is-mono">{fmtDate(c.updated_at)}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}

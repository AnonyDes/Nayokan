import Link from "next/link";
import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable, StatusPill, WorldTag, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Impact metrics" };
export const dynamic = "force-dynamic";

export default async function ImpactMetricsPage() {
  const supabase = await createServerReadClient();
  const { data: rows } = await supabase
    .from("impact_metrics")
    .select("id,slug,name,unit,world,reporting_scope,status,is_public,verified_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ F · 01 · Impact · Metrics" title="Impact metrics" lede="Verified-only figures. Unverified metrics never render publicly." />
      <Panel>
        <DataTable
          head={["Metric", "Unit", "World", "Verified", "Status", "Public", "Updated"]}
          empty="No metrics yet."
          rows={(rows ?? []).map((m) => [
            <div key="n">
              <div className="ax-table__title"><Link href={`/admin/impact-metrics/${m.id}`}>{m.name}</Link></div>
              <div className="ax-table__sub ax-mono ax-mono--sm">{m.slug}</div>
            </div>,
            <span key="u">{m.unit ?? "—"}</span>,
            <WorldTag key="w" world={m.world} />,
            m.verified_at
              ? <span key="v" className="ax-pill ax-pill--verified">Verified</span>
              : <span key="v" className="ax-pill ax-pill--needs">Unverified</span>,
            <StatusPill key="s" status={m.status ?? "draft"} />,
            <span key="p" className={`ax-toggle${m.is_public ? " is-on" : ""}`}><span className="ax-toggle__track" /></span>,
            <span key="d" className="is-mono">{fmtDate(m.updated_at)}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}

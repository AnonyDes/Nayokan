import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable, StatusPill, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Portfolio" };
export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const supabase = await createServerReadClient();
  const { data: rows } = await supabase
    .from("ventures")
    .select("id,slug,code,name,sector,stage,location,status,updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ E · 04 · Ecosystem · Portfolio" title="Portfolio / Ventures" lede="Ventures backed by Nayokan Venture Capital and the Startup Centre." />
      <Panel>
        <DataTable
          head={["Venture", "Sector", "Stage", "Location", "Status", "Updated"]}
          empty="No ventures yet."
          rows={(rows ?? []).map((v) => [
            <div key="n">
              <div className="ax-table__title">{v.name}</div>
              <div className="ax-table__sub ax-mono ax-mono--sm">{v.code ?? v.slug}</div>
            </div>,
            <span key="s">{v.sector ?? "—"}</span>,
            <span key="st">{v.stage ?? "—"}</span>,
            <span key="l">{v.location ?? "—"}</span>,
            <StatusPill key="sc" status={v.status ?? "draft"} />,
            <span key="u" className="is-mono">{fmtDate(v.updated_at)}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}

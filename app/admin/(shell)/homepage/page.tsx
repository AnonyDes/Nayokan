import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Homepage" };
export const dynamic = "force-dynamic";

export default async function HomepagePage() {
  const supabase = await createServerReadClient();
  const { data: rows } = await supabase
    .from("site_home_sections")
    .select("id,site,key,sort_order,is_live,updated_at")
    .order("site")
    .order("sort_order");

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ I · 01 · Website · Homepage" title="Homepage sections" lede="Ordered homepage blocks per site — toggled live or hidden." />
      <Panel>
        <DataTable
          head={["Site", "Section", "Order", "Live", "Updated"]}
          empty="No homepage sections."
          rows={(rows ?? []).map((s) => [
            <span key="s" className="ax-pill ax-pill--dark">{s.site}</span>,
            <span key="k" className="ax-table__title">{s.key}</span>,
            <span key="o" className="is-num is-mono">{s.sort_order}</span>,
            <span key="v" className={`ax-toggle${s.is_live ? " is-on" : ""}`}><span className="ax-toggle__track" /></span>,
            <span key="u" className="is-mono">{fmtDate(s.updated_at)}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}

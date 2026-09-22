import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable } from "@/admin/components/kit";

export const metadata = { title: "Navigation" };
export const dynamic = "force-dynamic";

export default async function NavigationPage() {
  const supabase = await createServerReadClient();
  const { data: rows } = await supabase
    .from("navigation_items")
    .select("id,site,area,label,href,sort_order,is_live,cross_site,parent_id")
    .order("site")
    .order("area")
    .order("sort_order")
    .limit(300);

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ I · 02 · Website · Navigation" title="Navigation" lede="Header and footer items per site. Ordering is by sort_order." />
      <Panel>
        <DataTable
          head={["Site", "Area", "Label", "Href", "Order", "Live", "Cross-site"]}
          empty="No navigation items."
          rows={(rows ?? []).map((n) => [
            <span key="s" className="ax-pill ax-pill--dark">{n.site}</span>,
            <span key="a">{n.area}</span>,
            <span key="l" className="ax-table__title">{n.label}</span>,
            <span key="h" className="ax-mono ax-mono--sm">{n.href}</span>,
            <span key="o" className="is-num is-mono">{n.sort_order}</span>,
            <span key="v" className={`ax-toggle${n.is_live ? " is-on" : ""}`}><span className="ax-toggle__track" /></span>,
            <span key="x">{n.cross_site ? "↗" : "—"}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}

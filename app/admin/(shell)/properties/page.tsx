import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable, StatusPill, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Properties" };
export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  const supabase = await createServerReadClient();
  const { data: rows } = await supabase
    .from("properties")
    .select("id,slug,code,name,location,type,status_content,updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ E · 05 · Ecosystem · Properties" title="Properties" lede="Hospitality properties — guesthouses, training venues, lodges." />
      <Panel>
        <DataTable
          head={["Property", "Type", "Location", "Status", "Updated"]}
          empty="No properties yet."
          rows={(rows ?? []).map((p) => [
            <div key="n">
              <div className="ax-table__title">{p.name}</div>
              <div className="ax-table__sub">/hospitality/properties/{p.slug}</div>
            </div>,
            <span key="t">{p.type ?? "—"}</span>,
            <span key="l">{p.location ?? "—"}</span>,
            <StatusPill key="s" status={p.status_content ?? "draft"} />,
            <span key="u" className="is-mono">{fmtDate(p.updated_at)}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}

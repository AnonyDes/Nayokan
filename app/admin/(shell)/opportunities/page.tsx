import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable, StatusPill, WorldTag, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Opportunities" };
export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const supabase = await createServerReadClient();
  const { data: rows } = await supabase
    .from("opportunities")
    .select("id,slug,code,title,category,status,status_content,deadline,site,world,updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ D · 03 · Programmes · Opportunities" title="Opportunities" lede="Grants, residencies, calls and open applications." />
      <Panel>
        <DataTable
          head={["Opportunity", "Category", "World", "Intake", "Deadline", "Content", "Updated"]}
          empty="No opportunities yet."
          rows={(rows ?? []).map((o) => [
            <div key="t">
              <div className="ax-table__title">{o.title}</div>
              <div className="ax-table__sub ax-mono ax-mono--sm">{o.code ?? o.slug}</div>
            </div>,
            <span key="c">{o.category ?? "—"}</span>,
            <WorldTag key="w" world={o.world} site={o.site} />,
            <StatusPill key="s" status={o.status ?? "open"} />,
            <span key="d" className="is-mono">{fmtDate(o.deadline)}</span>,
            <StatusPill key="sc" status={o.status_content ?? "draft"} />,
            <span key="u" className="is-mono">{fmtDate(o.updated_at)}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}

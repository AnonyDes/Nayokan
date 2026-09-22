import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable, StatusPill, Avatar, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "People" };
export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const supabase = await createServerReadClient();
  const { data: rows } = await supabase
    .from("people")
    .select("id,name,position,division,status,is_public,updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ E · 01 · Ecosystem · People" title="People" lede="Leadership, team and board records shown on public pages." />
      <Panel>
        <DataTable
          head={["Person", "Position", "Division", "Status", "Public", "Updated"]}
          empty="No people records yet."
          rows={(rows ?? []).map((p) => [
            <span key="n" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Avatar name={p.name} /> <span className="ax-table__title">{p.name}</span>
            </span>,
            <span key="p">{p.position ?? "—"}</span>,
            <span key="d">{p.division ?? "—"}</span>,
            <StatusPill key="s" status={p.status ?? "draft"} />,
            <span key="v" className={`ax-toggle${p.is_public ? " is-on" : ""}`}><span className="ax-toggle__track" /></span>,
            <span key="u" className="is-mono">{fmtDate(p.updated_at)}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}

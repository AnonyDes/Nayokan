import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable, StatusPill, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Partners" };
export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const supabase = await createServerReadClient();
  const { data: rows } = await supabase
    .from("partners")
    .select("id,name,category,website,consent_recorded,status,is_public,updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ E · 03 · Ecosystem · Partners" title="Partners" lede="Institutional partners — logos stay hidden until consent is recorded." />
      <Panel>
        <DataTable
          head={["Partner", "Category", "Consent", "Status", "Public", "Updated"]}
          empty="No partners yet."
          rows={(rows ?? []).map((p) => [
            <div key="n">
              <div className="ax-table__title">{p.name}</div>
              {p.website && <div className="ax-table__sub">{p.website}</div>}
            </div>,
            <span key="c">{p.category ?? "—"}</span>,
            p.consent_recorded
              ? <span key="co" className="ax-pill ax-pill--verified">Recorded</span>
              : <span key="co" className="ax-pill ax-pill--needs">Pending</span>,
            <StatusPill key="s" status={p.status ?? "draft"} />,
            <span key="v" className={`ax-toggle${p.is_public ? " is-on" : ""}`}><span className="ax-toggle__track" /></span>,
            <span key="u" className="is-mono">{fmtDate(p.updated_at)}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}

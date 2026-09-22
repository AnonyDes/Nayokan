import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable, StatusPill, WorldTag, FilterTabs, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Programmes" };
export const dynamic = "force-dynamic";

const STATUSES = ["draft", "in_review", "changes_requested", "approved", "scheduled", "published", "archived"];

export default async function ProgrammesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const current = status ?? "all";
  const supabase = await createServerReadClient();

  const counts = await Promise.all(
    STATUSES.map(async (s) => {
      const { count } = await supabase.from("programmes").select("id", { count: "exact", head: true }).eq("status_content", s);
      return count ?? 0;
    }),
  );
  const { count: total } = await supabase.from("programmes").select("id", { count: "exact", head: true });

  let q = supabase
    .from("programmes")
    .select("id,slug,code,name,world,site,type,status,status_content,application_deadline,updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (current !== "all") q = q.eq("status_content", current);
  const { data: rows } = await q;

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ D · 01 · Programmes" title="Programmes" lede="VTI programmes, Startup Centre tracks and structured offers." />
      <Panel>
        <div className="ax-toolbar">
          <FilterTabs
            base="/admin/programmes"
            current={current}
            tabs={[
              { key: "all", label: "All", count: total ?? 0 },
              ...STATUSES.map((s, i) => ({ key: s, label: s.replace(/_/g, " "), count: counts[i] })),
            ]}
          />
        </div>
        <DataTable
          head={["Programme", "Code", "World", "Intake", "Deadline", "Status", "Updated"]}
          empty="No programmes in this state."
          rows={(rows ?? []).map((p) => [
            <div key="t">
              <div className="ax-table__title">{p.name}</div>
              <div className="ax-table__sub">/{p.site}/programmes/{p.slug}</div>
            </div>,
            <span key="c" className="ax-mono ax-mono--sm">{p.code ?? "—"}</span>,
            <WorldTag key="w" world={p.world} site={p.site} />,
            <span key="s">{p.status ?? "—"}</span>,
            <span key="d" className="is-mono">{fmtDate(p.application_deadline)}</span>,
            <StatusPill key="sc" status={p.status_content ?? "draft"} />,
            <span key="u" className="is-mono">{fmtDate(p.updated_at)}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}

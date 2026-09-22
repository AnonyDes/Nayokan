import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable, StatusPill, WorldTag, FilterTabs, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Pages" };
export const dynamic = "force-dynamic";

const STATUSES = ["draft", "in_review", "changes_requested", "scheduled", "published", "archived"];

export default async function PagesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const current = status ?? "all";
  const supabase = await createServerReadClient();

  const counts = await Promise.all(
    STATUSES.map(async (s) => {
      const { count } = await supabase.from("pages").select("id", { count: "exact", head: true }).eq("status", s);
      return count ?? 0;
    }),
  );
  const { count: total } = await supabase.from("pages").select("id", { count: "exact", head: true });

  let q = supabase
    .from("pages")
    .select("id,path,title,world,site,status,is_public,updated_at")
    .order("path")
    .limit(100);
  if (current !== "all") q = q.eq("status", current);
  const { data: rows } = await q;

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ C · 01 · Content · Pages" title="Pages" lede="Every page published across the Nayokan ecosystem." />
      <Panel>
        <div className="ax-toolbar">
          <FilterTabs
            base="/admin/pages"
            current={current}
            tabs={[
              { key: "all", label: "All", count: total ?? 0 },
              ...STATUSES.map((s, i) => ({ key: s, label: s.replace(/_/g, " "), count: counts[i] })),
            ]}
          />
        </div>
        <DataTable
          head={["Page", "World", "Status", "Public", "Updated"]}
          empty="No pages in this state."
          rows={(rows ?? []).map((p) => [
            <div key="t">
              <div className="ax-table__title">{p.title}</div>
              <div className="ax-table__sub">{p.path}</div>
            </div>,
            <WorldTag key="w" world={p.world} site={p.site} />,
            <StatusPill key="s" status={p.status} />,
            <span key="p" className={`ax-toggle${p.is_public ? " is-on" : ""}`}><span className="ax-toggle__track" /></span>,
            <span key="u" className="is-mono">{fmtDate(p.updated_at)}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}

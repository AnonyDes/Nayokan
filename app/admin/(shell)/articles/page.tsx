import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable, StatusPill, WorldTag, FilterTabs, Avatar, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Articles" };
export const dynamic = "force-dynamic";

const STATUSES = ["draft", "in_review", "changes_requested", "approved", "scheduled", "published", "archived"];

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const current = status ?? "all";
  const supabase = await createServerReadClient();

  const counts = await Promise.all(
    STATUSES.map(async (s) => {
      const { count } = await supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", s);
      return count ?? 0;
    }),
  );
  const { count: total } = await supabase.from("articles").select("id", { count: "exact", head: true });

  let q = supabase
    .from("articles")
    .select("id,slug,title,world,site,author_name,status,updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);
  if (current !== "all") q = q.eq("status", current);
  const { data: rows } = await q;

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ C · 02 · Content · Articles" title="Articles / Insights" lede="Editorial content across all Nayokan worlds." />
      <Panel>
        <div className="ax-toolbar">
          <FilterTabs
            base="/admin/articles"
            current={current}
            tabs={[
              { key: "all", label: "All", count: total ?? 0 },
              ...STATUSES.map((s, i) => ({ key: s, label: s.replace(/_/g, " "), count: counts[i] })),
            ]}
          />
        </div>
        <DataTable
          head={["Title", "World", "Author", "Status", "Updated"]}
          empty="No articles in this state."
          rows={(rows ?? []).map((a) => [
            <div key="t">
              <div className="ax-table__title">
                {a.title}
                {(a as { provenance?: { isDemo?: boolean } }).provenance?.isDemo && <span className="ax-demo-tag">Demo</span>}
              </div>
              <div className="ax-table__sub">/insights/{a.slug}</div>
            </div>,
            <WorldTag key="w" world={a.world} site={a.site} />,
            <span key="a" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Avatar name={a.author_name ?? "?"} /> {a.author_name ?? "—"}
            </span>,
            <StatusPill key="s" status={a.status} />,
            <span key="u" className="is-mono">{fmtDate(a.updated_at)}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}

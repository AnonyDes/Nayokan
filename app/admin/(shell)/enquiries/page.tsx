import Link from "next/link";
import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable, StatusPill, WorldTag, FilterTabs, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Enquiries" };
export const dynamic = "force-dynamic";

const STATUSES = ["new", "assigned", "in_progress", "resolved", "archived"];

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const current = status ?? "all";
  const supabase = await createServerReadClient();

  const counts = await Promise.all(
    STATUSES.map(async (s) => {
      const { count } = await supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", s);
      return count ?? 0;
    }),
  );
  const { count: total } = await supabase.from("enquiries").select("id", { count: "exact", head: true });

  let q = supabase
    .from("enquiries")
    .select("id,reference,name,email,category,site,world,status,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (current !== "all") q = q.eq("status", current);
  const { data: rows } = await q;

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ G · 01 · Operations · Enquiries" title="Enquiries" lede="Inbound contact from all public forms — assigned, answered, archived." />
      <Panel>
        <div className="ax-toolbar">
          <FilterTabs
            base="/admin/enquiries"
            current={current}
            tabs={[
              { key: "all", label: "All", count: total ?? 0 },
              ...STATUSES.map((s, i) => ({ key: s, label: s.replace(/_/g, " "), count: counts[i] })),
            ]}
          />
        </div>
        <DataTable
          head={["Reference", "From", "Category", "World", "Status", "Received"]}
          empty="No enquiries in this state."
          rows={(rows ?? []).map((e) => [
            <Link key="r" href={`/admin/enquiries/${e.id}`} className="ax-mono ax-mono--sm">{e.reference}</Link>,
            <div key="f">
              <div className="ax-table__title">{e.name}</div>
              <div className="ax-table__sub">{e.email}</div>
            </div>,
            <span key="c">{e.category ?? "—"}</span>,
            <WorldTag key="w" world={e.world} site={e.site} />,
            <StatusPill key="s" status={e.status} />,
            <span key="d" className="is-mono">{fmtDate(e.created_at)}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}

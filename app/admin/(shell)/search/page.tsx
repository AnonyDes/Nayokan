import Link from "next/link";
import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, StatusPill, Empty } from "@/admin/components/kit";

export const metadata = { title: "Search" };
export const dynamic = "force-dynamic";

const SOURCES = [
  { table: "articles", label: "Article", col: "title", href: () => `/admin/articles` },
  { table: "programmes", label: "Programme", col: "name", href: () => `/admin/programmes` },
  { table: "applications", label: "Application", col: "full_name", href: (r: Record<string, unknown>) => `/admin/applications/${r.id}` },
  { table: "enquiries", label: "Enquiry", col: "name", href: (r: Record<string, unknown>) => `/admin/enquiries/${r.id}` },
] as const;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();
  const supabase = await createServerReadClient();

  const results = term
    ? await Promise.all(
        SOURCES.map(async (s) => {
          const { data } = await supabase
            .from(s.table)
            .select(`id,${s.col},status`)
            .ilike(s.col, `%${term}%`)
            .limit(10);
          return (data ?? []).map((r) => ({ type: s.label, row: r as Record<string, unknown>, href: s.href }));
        }),
      )
    : [];

  const flat = results.flat();

  return (
    <div className="ax-page">
      <PageHead eyebrow="§ A · 04 · Workspace · Search" title="Search" lede="Full-text lookup across content and submissions." />
      <form action="/admin/search" method="get" style={{ marginBottom: 20 }}>
        <input className="ax-input" name="q" defaultValue={term} placeholder="Search…" autoFocus />
      </form>
      {term && (
        <Panel flush>
          {flat.map((r, i) => (
            <Link key={i} href={r.href(r.row)} style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 12, padding: "12px 18px", borderBottom: "1px solid var(--line)", color: "inherit", textDecoration: "none" }}>
              <span className="ax-pill ax-pill--dark">{r.type}</span>
              <span>{String(r.row[r.row.title !== undefined ? "title" : r.row.name !== undefined ? "name" : "full_name"] ?? "—")}</span>
              <StatusPill status={String(r.row.status ?? "draft")} />
            </Link>
          ))}
          {!flat.length && <Empty title={`No matches for “${term}”`} />}
        </Panel>
      )}
    </div>
  );
}

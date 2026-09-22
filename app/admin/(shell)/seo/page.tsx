import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable, StatusPill, WorldTag } from "@/admin/components/kit";

export const metadata = { title: "SEO" };
export const dynamic = "force-dynamic";

const TABLES = [
  { table: "pages", label: "Page", titleCol: "title", slugCol: "path" },
  { table: "articles", label: "Article", titleCol: "title", slugCol: "slug" },
  { table: "programmes", label: "Programme", titleCol: "name", slugCol: "slug" },
  { table: "opportunities", label: "Opportunity", titleCol: "title", slugCol: "slug" },
] as const;

export default async function SeoPage() {
  const supabase = await createServerReadClient();

  const results = await Promise.all(
    TABLES.map(async ({ table, label, titleCol, slugCol }) => {
      const { data } = await supabase
        .from(table)
        .select(`id,world,site,status,seo,${titleCol},${slugCol}`)
        .neq("status", "archived")
        .limit(200);
      return (data ?? []).map((raw) => {
        const row = raw as Record<string, unknown>;
        const seo = (row.seo ?? {}) as { title?: string; description?: string };
        return {
          id: String(row.id),
          label,
          title: String(row[titleCol] ?? "Untitled"),
          slug: String(row[slugCol] ?? ""),
          world: (row.world as string) ?? (row.site as string),
          status: String(row.status),
          hasTitle: Boolean(seo.title),
          hasDesc: Boolean(seo.description),
        };
      });
    }),
  );

  const items = results.flat();
  const gaps = items.filter((i) => !i.hasTitle || !i.hasDesc);

  return (
    <div className="ax-page ax-page--wide">
      <PageHead
        eyebrow="§ I · 03 · Website · SEO"
        title="SEO health"
        lede={`${gaps.length} of ${items.length} records are missing a meta title or description. Publish preflight blocks records without both.`}
      />
      <Panel>
        <DataTable
          head={["Record", "Type", "World", "Meta title", "Meta description", "Status"]}
          empty="All records have complete SEO metadata."
          rows={gaps.map((i) => [
            <div key="t">
              <div className="ax-table__title">{i.title}</div>
              <div className="ax-table__sub">{i.slug}</div>
            </div>,
            <span key="l">{i.label}</span>,
            <WorldTag key="w" world={i.world} />,
            i.hasTitle ? <span key="mt" className="ax-pill ax-pill--verified">Set</span> : <span key="mt" className="ax-pill ax-pill--needs">Missing</span>,
            i.hasDesc ? <span key="md" className="ax-pill ax-pill--verified">Set</span> : <span key="md" className="ax-pill ax-pill--needs">Missing</span>,
            <StatusPill key="s" status={i.status} />,
          ])}
        />
      </Panel>
    </div>
  );
}

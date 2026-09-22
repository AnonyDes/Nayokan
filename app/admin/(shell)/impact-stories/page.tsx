import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable, StatusPill, WorldTag, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Impact stories" };
export const dynamic = "force-dynamic";

export default async function ImpactStoriesPage() {
  const supabase = await createServerReadClient();
  const { data: rows } = await supabase
    .from("stories")
    .select("id,slug,title,type,world,site,status,updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  const impact = (rows ?? []).filter((s) => s.type === "impact" || s.type === "story");
  const list = impact.length ? impact : rows ?? [];

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ F · 03 · Impact · Stories" title="Impact stories" lede="Narratives tied to verified metrics and evidence." />
      <Panel>
        <DataTable
          head={["Story", "Type", "World", "Status", "Updated"]}
          empty="No impact stories yet."
          rows={list.map((s) => [
            <div key="t">
              <div className="ax-table__title">{s.title}</div>
              <div className="ax-table__sub">/stories/{s.slug}</div>
            </div>,
            <span key="ty">{s.type ?? "—"}</span>,
            <WorldTag key="w" world={s.world} site={s.site} />,
            <StatusPill key="s" status={s.status} />,
            <span key="u" className="is-mono">{fmtDate(s.updated_at)}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}

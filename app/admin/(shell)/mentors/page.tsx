import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable, StatusPill, WorldTag, Avatar, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Mentors" };
export const dynamic = "force-dynamic";

export default async function MentorsPage() {
  const supabase = await createServerReadClient();
  const { data: rows } = await supabase
    .from("mentors")
    .select("id,name,role,expertise,sector,availability,world,site,status_content,updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ E · 02 · Ecosystem · Mentors" title="Mentors" lede="Startup Centre mentor network records." />
      <Panel>
        <DataTable
          head={["Mentor", "Role", "Expertise", "Availability", "World", "Status", "Updated"]}
          empty="No mentors yet."
          rows={(rows ?? []).map((m) => [
            <span key="n" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Avatar name={m.name} /> <span className="ax-table__title">{m.name}</span>
            </span>,
            <span key="r">{m.role ?? "—"}</span>,
            <span key="e">{Array.isArray(m.expertise) ? m.expertise.join(", ") : (m.expertise ?? "—")}</span>,
            <span key="a">{m.availability ?? "—"}</span>,
            <WorldTag key="w" world={m.world} site={m.site} />,
            <StatusPill key="s" status={m.status_content ?? "draft"} />,
            <span key="u" className="is-mono">{fmtDate(m.updated_at)}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}

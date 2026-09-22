import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createServerReadClient();
  const { data: rows } = await supabase.from("site_settings").select("*").order("site");

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ J · 04 · Administration · Settings" title="Site settings" lede="Per-site identity, contact and default SEO values." />
      <Panel>
        <DataTable
          head={["Site", "Name", "Tagline", "Contact", "Updated"]}
          empty="No site settings."
          rows={(rows ?? []).map((s) => [
            <span key="s" className="ax-pill ax-pill--dark">{s.site}</span>,
            <span key="n" className="ax-table__title">{s.name}</span>,
            <span key="t" className="ax-mute">{s.tagline ?? "—"}</span>,
            <span key="c">{s.contact_email ?? "—"}</span>,
            <span key="u" className="is-mono">{fmtDate(s.updated_at)}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}

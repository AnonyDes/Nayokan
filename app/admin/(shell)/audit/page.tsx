import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable } from "@/admin/components/kit";

export const metadata = { title: "Audit log" };
export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const supabase = await createServerReadClient();
  const { data: rows } = await supabase
    .from("audit_log")
    .select("id,actor_id,action,object_type,object_id,site,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ J · 03 · Administration · Audit" title="Audit log" lede="Every state change, sign-in and governance action — immutable." />
      <Panel>
        <DataTable
          head={["When", "Actor", "Action", "Object", "Site"]}
          empty="No audit entries."
          rows={(rows ?? []).map((a) => [
            <span key="w" className="is-mono">{new Date(a.created_at).toLocaleString("en-GB")}</span>,
            <span key="a" className="ax-mono ax-mono--sm">{a.actor_id ? String(a.actor_id).slice(0, 8) : "system"}</span>,
            <span key="ac">{a.action}</span>,
            <span key="o" className="ax-mono ax-mono--sm">{a.object_type}:{String(a.object_id ?? "").slice(0, 8)}</span>,
            <span key="s">{a.site ?? "—"}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}

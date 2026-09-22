import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable } from "@/admin/components/kit";

export const metadata = { title: "Roles & permissions" };
export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const supabase = await createServerReadClient();
  const { data: roles } = await supabase.from("roles").select("key,label,description").order("key");
  const { data: perms } = await supabase.from("role_permissions").select("*").limit(500);

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ J · 02 · Administration · Roles" title="Roles & permissions" lede="Permission matrix enforced by RLS — this screen is read-only visibility." />
      <Panel title="Roles" num="§ J">
        <DataTable
          head={["Role", "Label", "Description"]}
          empty="No roles."
          rows={(roles ?? []).map((r) => [
            <span key="k" className="ax-pill ax-pill--dark">{r.key}</span>,
            <span key="l" className="ax-table__title">{r.label}</span>,
            <span key="d" className="ax-mute">{r.description ?? "—"}</span>,
          ])}
        />
      </Panel>
      <div style={{ height: 16 }} />
      <Panel title="Permission grants" num="§ J · P">
        <DataTable
          head={["Role", "Permission", "Scope"]}
          empty="No permission records."
          rows={(perms ?? []).map((p) => {
            const r = p as Record<string, unknown>;
            return [
              <span key="r" className="ax-pill ax-pill--dark">{String(r.role_key ?? r.role ?? "—")}</span>,
              <span key="p" className="ax-mono ax-mono--sm">{String(r.permission ?? r.permission_key ?? "—")}</span>,
              <span key="s" className="ax-mute">{String(r.scope ?? r.site ?? "all")}</span>,
            ];
          })}
        />
      </Panel>
    </div>
  );
}

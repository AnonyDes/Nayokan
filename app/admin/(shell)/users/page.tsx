import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable, StatusPill, Avatar, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Users" };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const supabase = await createServerReadClient();
  const { data: rows } = await supabase
    .from("profiles")
    .select("id,email,display_name,role_key,status,last_active_at,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ J · 01 · Administration · Users" title="Users" lede="Staff accounts, roles and access status." />
      <Panel>
        <DataTable
          head={["User", "Role", "Status", "Last active", "Created"]}
          empty="No staff users."
          rows={(rows ?? []).map((u) => [
            <span key="u" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Avatar name={u.display_name || u.email} />
              <span>
                <div className="ax-table__title">{u.display_name || "—"}</div>
                <div className="ax-table__sub">{u.email}</div>
              </span>
            </span>,
            <span key="r" className="ax-pill ax-pill--dark">{u.role_key?.replace(/_/g, " ")}</span>,
            <StatusPill key="s" status={u.status ?? "inactive"} />,
            <span key="l" className="is-mono">{fmtDate(u.last_active_at)}</span>,
            <span key="c" className="is-mono">{fmtDate(u.created_at)}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}

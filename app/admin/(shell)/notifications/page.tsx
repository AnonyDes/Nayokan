import { createServerReadClient } from "@/platform/auth/server";
import { requireStaff } from "@/platform/auth/guard";
import { PageHead, Panel, Empty, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await requireStaff();
  const supabase = await createServerReadClient();
  const { data: rows } = await supabase
    .from("notifications")
    .select("id,kind,title,body,link,read_at,created_at")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="ax-page">
      <PageHead eyebrow="§ A · 03 · Workspace · Notifications" title="Notifications" lede="Assignments, reviews and system events addressed to you." />
      <Panel flush>
        {(rows ?? []).map((n) => (
          <div key={n.id} style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
              {n.body && <div className="ax-mute" style={{ fontSize: 12.5, marginTop: 2 }}>{n.body}</div>}
            </div>
            <div className="ax-mute ax-mono ax-mono--sm">{fmtDate(n.created_at)}</div>
          </div>
        ))}
        {!rows?.length && <Empty title="No notifications" lede="Assignments and review events will appear here." />}
      </Panel>
    </div>
  );
}

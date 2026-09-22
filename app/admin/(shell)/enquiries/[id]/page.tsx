import { notFound } from "next/navigation";
import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, StatusPill, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Enquiry" };
export const dynamic = "force-dynamic";

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerReadClient();
  const { data: e } = await supabase.from("enquiries").select("*").eq("id", id).single();
  if (!e) notFound();

  const { data: notes } = await supabase
    .from("enquiry_notes")
    .select("id,body,created_at")
    .eq("enquiry_id", id)
    .order("created_at", { ascending: false });

  const field = (label: string, value: unknown) =>
    value == null || value === "" ? null : (
      <div style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
        <div className="ax-mono ax-mute" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
        <div style={{ marginTop: 4 }}>{typeof value === "object" ? JSON.stringify(value) : String(value)}</div>
      </div>
    );

  return (
    <div className="ax-page">
      <PageHead
        eyebrow="§ G · 01 · Operations · Enquiries"
        title={e.reference}
        lede={`${e.name} · ${fmtDate(e.created_at)}`}
        actions={<StatusPill status={e.status} />}
      />
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <Panel title="Message" num="§ 01">
          {field("From", `${e.name} <${e.email}>`)}
          {field("Organisation", e.organization)}
          {field("Category", e.category)}
          {field("Message", e.message)}
          {field("Source page", e.source_page)}
        </Panel>
        <div>
          <Panel title="Routing" num="§ 02">
            {field("Site", e.site)}
            {field("World", e.world)}
            {field("Status", e.status)}
            {field("Assigned to", e.assigned_to)}
            {field("Resolved at", e.resolved_at ? fmtDate(e.resolved_at) : null)}
          </Panel>
          <div style={{ height: 16 }} />
          <Panel title="Notes" num="§ 03">
            {(notes ?? []).map((n) => (
              <div key={n.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--line)", fontSize: 13 }}>
                {n.body}
                <div className="ax-mute ax-mono ax-mono--sm" style={{ marginTop: 4 }}>{fmtDate(n.created_at)}</div>
              </div>
            ))}
            {!notes?.length && <div className="ax-mute">No notes yet.</div>}
          </Panel>
        </div>
      </div>
    </div>
  );
}

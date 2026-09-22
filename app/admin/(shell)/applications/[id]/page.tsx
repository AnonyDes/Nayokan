import { notFound } from "next/navigation";
import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, StatusPill, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Application" };
export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerReadClient();
  const { data: a } = await supabase.from("applications").select("*").eq("id", id).single();
  if (!a) notFound();

  const { data: notes } = await supabase
    .from("application_notes")
    .select("id,body,created_at,author_id")
    .eq("application_id", id)
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
        eyebrow="§ D · 01 · Programmes · Applications"
        title={a.reference}
        lede={`${a.full_name} · submitted ${fmtDate(a.submitted_at)}`}
        actions={<StatusPill status={a.status} />}
      />
      <div className="dash-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <Panel title="Applicant" num="§ 01">
          {field("Full name", a.full_name)}
          {field("Email", a.email)}
          {field("Phone", a.phone)}
          {field("City / region", a.city_region)}
          {field("Age band", a.age_band)}
          {field("Education", a.education_level)}
          {field("Occupation", a.occupation)}
          {field("Motivation", a.motivation)}
          {field("Source", `${a.source_host ?? ""}${a.source_url ?? ""}`)}
        </Panel>
        <div>
          <Panel title="Routing" num="§ 02">
            {field("Site", a.site)}
            {field("World", a.world)}
            {field("Status", a.status)}
            {field("Assigned to", a.assigned_to)}
            {field("Reviewed by", a.reviewed_by)}
            {field("Reviewed at", a.reviewed_at ? fmtDate(a.reviewed_at) : null)}
            {field("Decision reason", a.decision_reason)}
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

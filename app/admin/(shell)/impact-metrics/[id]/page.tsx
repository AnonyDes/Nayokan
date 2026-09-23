import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerReadClient } from "@/platform/auth/server";
import { saveMetric, setMetricStatus, setMetricPublic } from "@/admin/actions";
import { PageHead, StatusPill, fmtDate } from "@/admin/components/kit";
import { EditorForm, MetricActions } from "@/admin/components/editor";

export const dynamic = "force-dynamic";

const UNITS = ["people", "enterprises", "certificates", "percent", "ventures", "partnerships", "count"];
const WORLDS = ["corporate", "vti", "startup", "venture_capital", "hospitality"];
const CHAIN = ["Drafted", "Evidence", "Verified", "Approved", "Public"];

export default async function MetricEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerReadClient();

  const { data: m } = await supabase
    .from("impact_metrics")
    .select("id,slug,name,description,unit,world,programme_id,reporting_scope,status,is_public,verified_by,verified_at,approved_by,approved_at,published_at,updated_at,provenance")
    .eq("id", id)
    .single();
  if (!m) notFound();

  const [{ data: values }, { data: evRows }, { data: programmes }, { data: audit }] = await Promise.all([
    supabase.from("impact_metric_values").select("period,value,note,recorded_at").eq("metric_id", id).order("period", { ascending: false }),
    supabase.from("metric_evidence").select("evidence_id, evidence(title,type,source,evidence_date)").eq("metric_id", id),
    supabase.from("programmes").select("id,name").order("name"),
    supabase
      .from("audit_log")
      .select("action,created_at, actor:actor_id(display_name)")
      .eq("object_type", "impact_metrics")
      .eq("object_id", id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const latest = values?.[0];
  const evidenceCount = evRows?.length ?? 0;
  const statusIdx = ["draft", "needs_verification", "verified", "approved", "published"].indexOf(m.status);
  // Chain: drafted → evidence → verified → approved → public
  const chainDone = [true, evidenceCount > 0, statusIdx >= 2, statusIdx >= 3, m.is_public];
  const chainPct = Math.round((chainDone.filter(Boolean).length / CHAIN.length) * 100);

  return (
    <div className="ax-page">
      <PageHead
        eyebrow="§ F · 02 · Impact metric"
        title={m.name}
        lede={
          m.is_public
            ? "This metric is public. Any change to the figure requires re-verification."
            : "This metric is not public. Attach evidence and complete the verification chain to publish it."
        }
        actions={
          <Link href="/admin/impact-metrics" className="ax-btn ax-btn--soft">
            <svg viewBox="0 0 24 24"><path d="M11 6 5 12l6 6M5 12h14" /></svg>
            Back
          </Link>
        }
      />

      <div className="me-hero">
        <div>
          <div className="me-hero__lb">Current value</div>
          <div className={`me-hero__val${statusIdx < 3 ? " me-hero__val--pending" : ""}`}>
            {latest?.value ?? "—"}
            <span className="u">{m.unit}</span>
          </div>
          <div className="me-hero__note">
            <StatusPill status={m.status} /> {m.is_public ? "· public" : "· not public"}
          </div>
        </div>
        <div>
          <div className="me-hero__lb">Reporting period</div>
          <div className="me-hero__val" style={{ fontSize: 26 }}>
            {latest?.period ?? "—"}
          </div>
          <div className="me-hero__note">{m.reporting_scope ?? "Scope not set"}</div>
        </div>
        <div>
          <div className="me-hero__lb">Chain state</div>
          <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
            {CHAIN.map((c, i) => (
              <span key={c} className={`ax-pill ${chainDone[i] ? "ax-pill--verified" : i === chainDone.indexOf(false) ? "ax-pill--needs" : "ax-pill--neutral"}`}>
                {i + 1} · {c}
              </span>
            ))}
          </div>
          <div className="me-hero__note">Progress · {chainPct}%</div>
          <div className="ax-progress" style={{ marginTop: 6 }}>
            <div className={`ax-progress__bar${chainPct < 100 ? " ax-progress__bar--warn" : ""}`} style={{ width: `${chainPct}%` }} />
          </div>
        </div>
      </div>

      <div className="me-grid">
        <EditorForm action={saveMetric}>
          <input type="hidden" name="id" value={m.id} />

          <div className="me-block">
            <div className="me-block__head">
              <div className="me-block__title">Metric definition</div>
              <div className="ax-mono ax-mute">§ F · 02a</div>
            </div>
            <div className="me-block__body ax-form">
              <div className="ax-form-row">
                <div className="ax-form-row__head">
                  <div className="ax-form-row__title">Metric name</div>
                  <div className="ax-form-row__hint">Institutional-quality naming. This is what appears on the public site.</div>
                </div>
                <div className="ax-form-row__body">
                  <input className="ax-input" name="name" defaultValue={m.name} />
                  <div className="ax-field__hint">Use everyday, verifiable language. Avoid marketing framings.</div>
                </div>
              </div>

              <div className="ax-form-row">
                <div className="ax-form-row__head">
                  <div className="ax-form-row__title">Value &amp; unit</div>
                </div>
                <div className="ax-form-row__body">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <div className="ax-field">
                      <label className="ax-field__label" htmlFor="f-period">Reporting period</label>
                      <input id="f-period" className="ax-input ax-input--mono" name="period" defaultValue={latest?.period ?? ""} placeholder="e.g. 2025" />
                    </div>
                    <div className="ax-field">
                      <label className="ax-field__label" htmlFor="f-value">Value</label>
                      <input id="f-value" className="ax-input ax-input--mono" name="value" type="number" step="any" defaultValue={latest?.value ?? ""} />
                    </div>
                    <div className="ax-field">
                      <label className="ax-field__label" htmlFor="f-unit">Unit</label>
                      <select id="f-unit" className="ax-select" name="unit" defaultValue={m.unit}>
                        {UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="ax-field" style={{ marginTop: 10 }}>
                    <label className="ax-field__label" htmlFor="f-note">Value note</label>
                    <input id="f-note" className="ax-input" name="note" defaultValue={latest?.note ?? ""} />
                  </div>
                </div>
              </div>

              <div className="ax-form-row">
                <div className="ax-form-row__head">
                  <div className="ax-form-row__title">Description</div>
                  <div className="ax-form-row__hint">What exactly does this figure count? Public-facing.</div>
                </div>
                <div className="ax-form-row__body">
                  <textarea className="ax-textarea" name="description" rows={3} defaultValue={m.description} />
                </div>
              </div>

              <div className="ax-form-row">
                <div className="ax-form-row__head">
                  <div className="ax-form-row__title">Scope &amp; attribution</div>
                </div>
                <div className="ax-form-row__body">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="ax-field">
                      <label className="ax-field__label" htmlFor="f-scope">Geographic scope</label>
                      <input id="f-scope" className="ax-input" name="reporting_scope" defaultValue={m.reporting_scope ?? ""} />
                    </div>
                    <div className="ax-field">
                      <label className="ax-field__label" htmlFor="f-world">Related world</label>
                      <select id="f-world" className="ax-select" name="world" defaultValue={m.world ?? ""}>
                        <option value="">All worlds</option>
                        {WORLDS.map((w) => (
                          <option key={w} value={w}>{w.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                    </div>
                    <div className="ax-field">
                      <label className="ax-field__label" htmlFor="f-prog">Related programme</label>
                      <select id="f-prog" className="ax-select" name="programme_id" defaultValue={m.programme_id ?? ""}>
                        <option value="">None</option>
                        {(programmes ?? []).map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="me-block">
            <div className="me-block__head">
              <div className="me-block__title">Evidence library</div>
              <Link href="/admin/evidence" className="ax-btn ax-btn--soft ax-btn--sm">
                Manage evidence
              </Link>
            </div>
            <div className="me-block__body">
              {evidenceCount === 0 && (
                <div className="ax-notice ax-notice--warn">
                  <div className="ax-notice__body">
                    <div className="ax-notice__title">Add a source before publishing this impact metric.</div>
                    Without a documented source, this figure cannot be verified — Nayokan does not publish unverified impact.
                  </div>
                </div>
              )}
              {(evRows ?? []).map((r) => {
                const ev = r.evidence as unknown as { title: string; type: string; source: string | null; evidence_date: string | null } | null;
                return (
                  <div className="me-evidence-row" key={r.evidence_id}>
                    <span className="ax-pill ax-pill--neutral">{ev?.type ?? "doc"}</span>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{ev?.title ?? "Evidence"}</div>
                      <div className="ax-mono ax-mute" style={{ fontSize: 10.5 }}>{ev?.source ?? "—"}</div>
                    </div>
                    <span className="ax-mono ax-mute" style={{ fontSize: 10.5 }}>{fmtDate(ev?.evidence_date)}</span>
                    <span className="ax-pill ax-pill--verified">Linked</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="me-block">
            <div className="me-block__head">
              <div className="me-block__title">Value history</div>
              <div className="ax-mono ax-mute">Institutional record</div>
            </div>
            <div className="me-block__body" style={{ padding: "0 20px 14px" }}>
              <table className="ax-table" style={{ fontSize: 12.5 }}>
                <thead>
                  <tr><th>Period</th><th className="is-num">Value</th><th>Note</th><th>Recorded</th></tr>
                </thead>
                <tbody>
                  {(values ?? []).length === 0 ? (
                    <tr><td colSpan={4} className="ax-mute">No values recorded.</td></tr>
                  ) : (
                    (values ?? []).map((v) => (
                      <tr key={v.period}>
                        <td className="is-mono">{v.period}</td>
                        <td className="is-num">{v.value ?? "—"}</td>
                        <td>{v.note ?? "—"}</td>
                        <td className="is-mono">{fmtDate(v.recorded_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </EditorForm>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 76 }}>
          <div className="me-verif-box">
            <div className="me-verif-box__title">Verification chain</div>
            <div className="me-verif-box__note">A metric appears publicly only after every step is complete.</div>
            {CHAIN.map((c, i) => (
              <div className="me-verif-row" key={c}>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>{i + 1} · {c}</span>
                <span className={`ax-pill ${chainDone[i] ? "ax-pill--verified" : "ax-pill--neutral"}`}>{chainDone[i] ? "Complete" : "Pending"}</span>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <MetricActions
                status={m.status}
                isPublic={m.is_public}
                onStatus={setMetricStatus.bind(null, m.id)}
                onPublic={setMetricPublic.bind(null, m.id)}
              />
            </div>
          </div>

          <div className={`me-public${m.is_public || statusIdx >= 3 ? "" : " me-public--blocked"}`}>
            <div>
              <div className="me-public__title">Public on website</div>
              <div className="me-public__note">
                {statusIdx >= 3
                  ? m.is_public
                    ? "This metric is live on the public site."
                    : "Verification complete — the metric can be made public."
                  : "Hidden from the public site. Complete the verification chain to enable."}
              </div>
            </div>
            <span className={`ax-toggle${m.is_public ? " is-on" : ""}`} title={statusIdx >= 3 ? "Use the sidebar action" : "Locked"}>
              <span className="ax-toggle__track" style={statusIdx >= 3 ? undefined : { opacity: 0.55 }} />
            </span>
          </div>

          <div className="me-block" style={{ margin: 0 }}>
            <div className="me-block__head">
              <div className="me-block__title">Audit trail</div>
              <Link href="/admin/audit" className="ax-mono" style={{ fontSize: 10.5, color: "var(--info-ink)" }}>Full log →</Link>
            </div>
            <div className="me-block__body" style={{ padding: "12px 18px", fontSize: 12 }}>
              {(audit ?? []).length === 0 && <div className="ax-mute">No audit entries yet.</div>}
              {(audit ?? []).map((a, i) => (
                <div key={i} style={{ padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
                  <div style={{ fontWeight: 500 }}>{a.action}</div>
                  <div className="ax-mono ax-mute" style={{ fontSize: 10.5, marginTop: 2 }}>
                    {(a.actor as unknown as { display_name?: string } | null)?.display_name ?? "system"} · {fmtDate(a.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

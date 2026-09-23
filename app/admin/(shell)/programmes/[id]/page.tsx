import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerReadClient } from "@/platform/auth/server";
import { siteUrl } from "@/platform/sites/registry";
import { saveProgramme, transitionProgramme } from "@/admin/actions";
import { PageHead, StatusPill, WorldTag, fmtDate } from "@/admin/components/kit";
import { EditorForm, BlocksEditor, TransitionBar, WorkflowSteps } from "@/admin/components/editor";

export const dynamic = "force-dynamic";

const PROGRAMME_STATUSES = ["open", "closing_soon", "upcoming", "closed", "pilot", "under_development"];

interface Seo {
  title?: string;
  description?: string;
}

export default async function ProgrammeEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerReadClient();

  const { data: p } = await supabase
    .from("programmes")
    .select(
      "id,site,world,slug,code,name,summary,body,type,status,duration,delivery_mode,location,certification,application_deadline,application_open,places,status_content,is_public,submitted_at,updated_at,current_version,seo,hero_media_id",
    )
    .eq("id", id)
    .single();
  if (!p) notFound();

  const seo = (p.seo ?? {}) as Seo;
  const published = p.status_content === "published";

  return (
    <div className="ax-page ax-page--wide">
      <PageHead
        eyebrow="§ D · 01 · Programme editor"
        title={p.name}
        lede={`${p.site.toUpperCase()} · ${p.type ?? "Programme"} · ${p.location ?? "—"}`}
        actions={
          <>
            <Link href="/admin/programmes" className="ax-btn ax-btn--soft">
              <svg viewBox="0 0 24 24"><path d="M11 6 5 12l6 6M5 12h14" /></svg>
              Back
            </Link>
            <a href={siteUrl(p.site, `/programmes/${p.slug}`)} target="_blank" className="ax-btn ax-btn--ghost">
              <svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
              Preview
            </a>
          </>
        }
      />

      <EditorForm action={saveProgramme} className="ed-shell">
        <input type="hidden" name="id" value={p.id} />

        <div className="ed-doc">
          <div className="ed-doc__meta">
            <strong>Programme</strong>
            <span className="ed-doc__meta__sep">·</span>
            <StatusPill status={p.status_content} />
            <span className="ed-doc__meta__sep">·</span>
            <span>v{p.current_version}</span>
            <span className="ed-doc__meta__sep">·</span>
            <span className="ax-mono">{p.code ?? p.slug}</span>
          </div>
          <div className="ed-doc__canvas" style={{ maxWidth: "none" }}>
            <div className="ax-form">
              <div className="ax-form-row">
                <div className="ax-form-row__head">
                  <div className="ax-form-row__title">Programme name</div>
                  <div className="ax-form-row__hint">Visible on public site.</div>
                </div>
                <div className="ax-form-row__body">
                  <input className="ax-input" name="name" defaultValue={p.name} />
                </div>
              </div>

              <div className="ax-form-row">
                <div className="ax-form-row__head">
                  <div className="ax-form-row__title">World &amp; type</div>
                </div>
                <div className="ax-form-row__body">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="ax-field">
                      <span className="ax-field__label">Nayokan world</span>
                      <div style={{ padding: "4px 0" }}>
                        <WorldTag world={p.world} site={p.site} />
                      </div>
                    </div>
                    <div className="ax-field">
                      <label className="ax-field__label" htmlFor="f-type">Programme type</label>
                      <input id="f-type" className="ax-input" name="type" defaultValue={p.type ?? ""} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="ax-form-row">
                <div className="ax-form-row__head">
                  <div className="ax-form-row__title">Operational status</div>
                  <div className="ax-form-row__hint">Distinct from publishing status.</div>
                </div>
                <div className="ax-form-row__body">
                  <select className="ax-select" name="status" defaultValue={p.status}>
                    {PROGRAMME_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ax-form-row">
                <div className="ax-form-row__head">
                  <div className="ax-form-row__title">Short description</div>
                  <div className="ax-form-row__hint">One paragraph. Appears in listings.</div>
                </div>
                <div className="ax-form-row__body">
                  <textarea className="ax-textarea" name="summary" rows={2} defaultValue={p.summary} />
                </div>
              </div>

              <div className="ax-form-row">
                <div className="ax-form-row__head">
                  <div className="ax-form-row__title">Full description</div>
                  <div className="ax-form-row__hint">Structured blocks — paragraphs, headings, quotes.</div>
                </div>
                <div className="ax-form-row__body">
                  <BlocksEditor initial={p.body} />
                </div>
              </div>

              <div className="ax-form-row">
                <div className="ax-form-row__head">
                  <div className="ax-form-row__title">Duration &amp; delivery</div>
                </div>
                <div className="ax-form-row__body">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <div className="ax-field">
                      <label className="ax-field__label" htmlFor="f-duration">Duration</label>
                      <input id="f-duration" className="ax-input" name="duration" defaultValue={p.duration ?? ""} />
                    </div>
                    <div className="ax-field">
                      <label className="ax-field__label" htmlFor="f-location">Location</label>
                      <input id="f-location" className="ax-input" name="location" defaultValue={p.location ?? ""} />
                    </div>
                    <div className="ax-field">
                      <label className="ax-field__label" htmlFor="f-mode">Delivery model</label>
                      <input id="f-mode" className="ax-input" name="delivery_mode" defaultValue={p.delivery_mode ?? ""} />
                    </div>
                    <div className="ax-field">
                      <label className="ax-field__label" htmlFor="f-cert">Certification</label>
                      <input id="f-cert" className="ax-input" name="certification" defaultValue={p.certification ?? ""} />
                    </div>
                    <div className="ax-field">
                      <label className="ax-field__label" htmlFor="f-places">Places available</label>
                      <input id="f-places" className="ax-input ax-input--mono" name="places" type="number" min={0} defaultValue={p.places ?? ""} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="ax-form-row">
                <div className="ax-form-row__head">
                  <div className="ax-form-row__title">Application window</div>
                  <div className="ax-form-row__hint">
                    {published ? "Applications can be opened while published." : "Applications open only after the programme is published."}
                  </div>
                </div>
                <div className="ax-form-row__body">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="ax-field">
                      <label className="ax-field__label" htmlFor="f-open" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input id="f-open" type="checkbox" name="application_open" defaultChecked={p.application_open} disabled={!published} />
                        Applications open
                      </label>
                      {!published && <div className="ax-field__hint">Locked until published (database-enforced).</div>}
                    </div>
                    <div className="ax-field">
                      <label className="ax-field__label" htmlFor="f-deadline">Deadline</label>
                      <input id="f-deadline" className="ax-input ax-input--mono" name="application_deadline" type="date" defaultValue={p.application_deadline ?? ""} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="ax-form-row">
                <div className="ax-form-row__head">
                  <div className="ax-form-row__title">SEO</div>
                </div>
                <div className="ax-form-row__body">
                  <div className="ax-field">
                    <label className="ax-field__label" htmlFor="f-seo-title">Meta title</label>
                    <input id="f-seo-title" className="ax-input" name="seo_title" defaultValue={seo.title ?? ""} />
                  </div>
                  <div className="ax-field" style={{ marginTop: 10 }}>
                    <label className="ax-field__label" htmlFor="f-seo-desc">
                      Meta description <span className="ax-req">Required</span>
                    </label>
                    <textarea
                      id="f-seo-desc"
                      className={`ax-textarea${seo.description ? "" : " is-error"}`}
                      name="seo_description"
                      defaultValue={seo.description ?? ""}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ed-side">
          <div className="ed-side__status">
            <div className="ed-side__status-row">
              <span className="ed-side__status-lb">Status</span>
              <StatusPill status={p.status_content} />
            </div>
            <div className="ed-side__status-row">
              <span className="ed-side__status-lb">Operational</span>
              <span className="ed-side__status-val">{p.status.replace(/_/g, " ")}</span>
            </div>
            <div className="ed-side__status-row">
              <span className="ed-side__status-lb">Submitted</span>
              <span className="ed-side__status-val">{fmtDate(p.submitted_at)}</span>
            </div>
            <div className="ed-side__status-row">
              <span className="ed-side__status-lb">Visibility</span>
              <span className="ed-side__status-val">{p.is_public ? "Public" : "Not visible publicly"}</span>
            </div>
            <div style={{ marginTop: 12 }}>
              <TransitionBar status={p.status_content} onAction={transitionProgramme.bind(null, p.id)} />
            </div>
          </div>
          <div className="ed-side__acc">
            <div className="ed-side__acc-head">
              <span>Publishing workflow</span>
              <span className="ed-side__acc-head__num">Content status</span>
            </div>
            <div className="ed-side__acc-body">
              <WorkflowSteps status={p.status_content} />
            </div>
          </div>
        </div>
      </EditorForm>
    </div>
  );
}

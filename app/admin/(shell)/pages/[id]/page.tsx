import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerReadClient } from "@/platform/auth/server";
import { siteUrl } from "@/platform/sites/registry";
import { savePage, transitionPage } from "@/admin/actions";
import { PageHead, StatusPill, fmtDate } from "@/admin/components/kit";
import { EditorForm, SectionsEditor, TransitionBar, WorkflowSteps, type EditableSection } from "@/admin/components/editor";

export const dynamic = "force-dynamic";

interface Seo {
  title?: string;
  description?: string;
}

export default async function PageEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerReadClient();

  const { data: page } = await supabase
    .from("pages")
    .select("id,site,world,path,title,sections,seo,status,is_public,submitted_at,updated_at,current_version")
    .eq("id", id)
    .single();
  if (!page) notFound();

  const seo = (page.seo ?? {}) as Seo;
  const sections: EditableSection[] = Array.isArray(page.sections)
    ? (page.sections as { key?: string; isLive?: boolean; is_live?: boolean; data?: Record<string, unknown> }[]).map((s) => ({
        key: s.key ?? "section",
        isLive: s.isLive ?? s.is_live ?? false,
        data: s.data ?? {},
      }))
    : [];

  return (
    <div className="ax-page ax-page--wide">
      <PageHead
        eyebrow="§ C · 01 · Content · Page editor"
        title={`Page · ${page.title}`}
        lede="Institutional pages are composed of structured sections. Layout is fixed to preserve site coherence."
        actions={
          <>
            <Link href="/admin/pages" className="ax-btn ax-btn--soft">
              <svg viewBox="0 0 24 24"><path d="M11 6 5 12l6 6M5 12h14" /></svg>
              Back
            </Link>
            <a href={siteUrl(page.site, page.path)} target="_blank" className="ax-btn ax-btn--ghost">
              <svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
              Preview
            </a>
          </>
        }
      />

      <EditorForm action={savePage}>
        <input type="hidden" name="id" value={page.id} />

        <div className="ed-shell" style={{ marginBottom: 16 }}>
          <div className="ed-doc">
            <div className="ed-doc__meta">
              <strong>Page</strong>
              <span className="ed-doc__meta__sep">·</span>
              <StatusPill status={page.status} />
              <span className="ed-doc__meta__sep">·</span>
              <span>v{page.current_version}</span>
              <span className="ed-doc__meta__sep">·</span>
              <span className="ax-mono">{page.path}</span>
            </div>
            <div className="ed-doc__canvas" style={{ maxWidth: "none" }}>
              <div className="ax-form">
                <div className="ax-form-row">
                  <div className="ax-form-row__head">
                    <div className="ax-form-row__title">Page title</div>
                  </div>
                  <div className="ax-form-row__body">
                    <input className="ax-input" name="title" defaultValue={page.title} />
                  </div>
                </div>
                <div className="ax-form-row">
                  <div className="ax-form-row__head">
                    <div className="ax-form-row__title">SEO</div>
                    <div className="ax-form-row__hint">Required before publish.</div>
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
                <StatusPill status={page.status} />
              </div>
              <div className="ed-side__status-row">
                <span className="ed-side__status-lb">Submitted</span>
                <span className="ed-side__status-val">{fmtDate(page.submitted_at)}</span>
              </div>
              <div className="ed-side__status-row">
                <span className="ed-side__status-lb">Visibility</span>
                <span className="ed-side__status-val">{page.is_public ? "Public" : "Not visible publicly"}</span>
              </div>
              <div style={{ marginTop: 12 }}>
                <TransitionBar status={page.status} onAction={transitionPage.bind(null, page.id)} />
              </div>
            </div>
            <div className="ed-side__acc">
              <div className="ed-side__acc-head">
                <span>Publishing workflow</span>
                <span className="ed-side__acc-head__num">Content status</span>
              </div>
              <div className="ed-side__acc-body">
                <WorkflowSteps status={page.status} />
              </div>
            </div>
          </div>
        </div>

        <SectionsEditor initial={sections} />
      </EditorForm>
    </div>
  );
}

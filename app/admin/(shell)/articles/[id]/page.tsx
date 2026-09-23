import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerReadClient } from "@/platform/auth/server";
import { siteUrl } from "@/platform/sites/registry";
import { saveArticle, transitionArticle } from "@/admin/actions";
import { PageHead, StatusPill, WorldTag, fmtDate } from "@/admin/components/kit";
import { EditorForm, BlocksEditor, TransitionBar, WorkflowSteps } from "@/admin/components/editor";

export const dynamic = "force-dynamic";

interface Seo {
  title?: string;
  description?: string;
}

export default async function ArticleEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerReadClient();

  const { data: article } = await supabase
    .from("articles")
    .select(
      "id,site,world,slug,title,excerpt,category,author_name,body,seo,status,is_public,submitted_at,updated_at,current_version,published_at,cover_media_id,reviewer_id,provenance",
    )
    .eq("id", id)
    .single();
  if (!article) notFound();

  const { data: reviewer } = article.reviewer_id
    ? await supabase.from("profiles").select("display_name").eq("id", article.reviewer_id).single()
    : { data: null };

  const seo = (article.seo ?? {}) as Seo;
  const seoMissing = !seo.description;
  const wordCount = Array.isArray(article.body)
    ? (article.body as { text?: string; items?: string[] }[]).reduce(
        (n, b) => n + (b.text?.split(/\s+/).filter(Boolean).length ?? 0) + (b.items?.join(" ").split(/\s+/).filter(Boolean).length ?? 0),
        0,
      )
    : 0;

  return (
    <div className="ax-page ax-page--wide">
      <PageHead
        eyebrow={`§ C · 02 · Content · Editing article`}
        title={article.title}
        lede={`Last edited ${fmtDate(article.updated_at)} · v${article.current_version}`}
        actions={
          <>
            <Link href="/admin/articles" className="ax-btn ax-btn--soft">
              <svg viewBox="0 0 24 24"><path d="M11 6 5 12l6 6M5 12h14" /></svg>
              Back to articles
            </Link>
            <a href={siteUrl(article.site, `/insights/${article.slug}`)} target="_blank" className="ax-btn ax-btn--ghost">
              <svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
              Preview
            </a>
          </>
        }
      />

      <EditorForm action={saveArticle} className="ed-shell">
        <input type="hidden" name="id" value={article.id} />

        {/* MAIN DOC */}
        <div className="ed-doc">
          <div className="ed-doc__meta">
            <strong>Article</strong>
            <span className="ed-doc__meta__sep">·</span>
            <StatusPill status={article.status} />
            <span className="ed-doc__meta__sep">·</span>
            <span>v{article.current_version}</span>
            <span className="ed-doc__meta__sep">·</span>
            <span>
              Visibility <strong>{article.is_public ? "Public" : "Not public"}</strong>
            </span>
            <span style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
              <span>
                Words <strong>{wordCount}</strong>
              </span>
              <span>
                Language <strong>EN</strong>
              </span>
            </span>
          </div>

          <div className="ed-doc__canvas">
            <div className="ed-cover">
              <div>{article.cover_media_id ? "COVER IMAGE SET" : "COVER IMAGE · 16 / 8 · Required before publish"}</div>
            </div>

            <input className="ed-title" name="title" defaultValue={article.title} aria-label="Article title" />

            <div className="ed-slug">
              <span>
                {article.site}.nayokan.org/insights/
              </span>
              <input name="slug" defaultValue={article.slug} aria-label="Slug" />
            </div>

            <textarea
              className="ed-excerpt"
              name="excerpt"
              rows={2}
              defaultValue={article.excerpt}
              aria-label="Excerpt"
              placeholder="One-sentence standfirst shown in listings."
            />

            <BlocksEditor initial={article.body} />
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="ed-side">
          <div className="ed-side__status">
            <div className="ed-side__status-row">
              <span className="ed-side__status-lb">Status</span>
              <StatusPill status={article.status} />
            </div>
            <div className="ed-side__status-row">
              <span className="ed-side__status-lb">Assigned reviewer</span>
              <span className="ed-side__status-val">{reviewer?.display_name ?? "Unassigned"}</span>
            </div>
            <div className="ed-side__status-row">
              <span className="ed-side__status-lb">Submitted</span>
              <span className="ed-side__status-val">{fmtDate(article.submitted_at)}</span>
            </div>
            <div className="ed-side__status-row">
              <span className="ed-side__status-lb">Visibility</span>
              <span className="ed-side__status-val">{article.is_public ? "Public" : "Not visible publicly"}</span>
            </div>
            <div style={{ marginTop: 12 }}>
              <TransitionBar status={article.status} onAction={transitionArticle.bind(null, article.id)} />
            </div>
          </div>

          <div className="ed-side__acc">
            <div className="ed-side__acc-head">
              <span>Publishing workflow</span>
              <span className="ed-side__acc-head__num">Content status</span>
            </div>
            <div className="ed-side__acc-body">
              <WorkflowSteps status={article.status} />
            </div>
          </div>

          <div className="ed-side__acc">
            <div className="ed-side__acc-head">
              <span>Article metadata</span>
              <span className="ed-side__acc-head__num">C · 02a</span>
            </div>
            <div className="ed-side__acc-body">
              <div className="ax-field">
                <span className="ax-field__label">Nayokan world</span>
                <div style={{ padding: "4px 0" }}>
                  <WorldTag world={article.world} site={article.site} />
                  <div className="ax-field__hint">Site &amp; world are fixed at creation.</div>
                </div>
              </div>
              <div className="ax-field">
                <label className="ax-field__label" htmlFor="f-category">Category</label>
                <input id="f-category" className="ax-input" name="category" defaultValue={article.category ?? ""} />
              </div>
              <div className="ax-field">
                <label className="ax-field__label" htmlFor="f-author">Author byline</label>
                <input id="f-author" className="ax-input" name="author_name" defaultValue={article.author_name ?? ""} />
              </div>
            </div>
          </div>

          <div className="ed-side__acc">
            <div className="ed-side__acc-head">
              <span>SEO &amp; discovery</span>
              {seoMissing ? (
                <span className="ed-side__acc-head__num" style={{ color: "var(--warn-ink)" }}>Needs work</span>
              ) : (
                <span className="ed-side__acc-head__num" style={{ color: "var(--success-ink)" }}>Ready</span>
              )}
            </div>
            <div className="ed-side__acc-body">
              {seoMissing && (
                <div className="ax-notice ax-notice--warn">
                  <div className="ax-notice__body">
                    <div className="ax-notice__title">Meta description is missing</div>
                    This article cannot be published until the SEO description is added.
                  </div>
                </div>
              )}
              <div className="ax-field">
                <label className="ax-field__label" htmlFor="f-seo-title">Meta title</label>
                <input id="f-seo-title" className="ax-input" name="seo_title" defaultValue={seo.title ?? ""} />
              </div>
              <div className="ax-field">
                <label className="ax-field__label" htmlFor="f-seo-desc">
                  Meta description <span className="ax-req">Required</span>
                </label>
                <textarea
                  id="f-seo-desc"
                  className={`ax-textarea${seoMissing ? " is-error" : ""}`}
                  name="seo_description"
                  defaultValue={seo.description ?? ""}
                  placeholder="One clear paragraph, 140–160 characters."
                />
              </div>
              <div className="ed-seo-preview">
                <div className="ed-seo-preview__site">
                  {article.site}.nayokan.org › insights › {article.slug}
                </div>
                <div className="ed-seo-preview__title">{seo.title || article.title}</div>
                <div className="ed-seo-preview__desc">{seo.description || "— add a meta description to complete the search preview —"}</div>
              </div>
            </div>
          </div>
        </div>
      </EditorForm>
    </div>
  );
}

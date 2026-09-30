import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import { RichBlocks } from "@/ui/components/rich-blocks";
import { articleMeta } from "@/sites/corporate/article-meta";
import { MediaSlot } from "@/ui/components/media-slot";

// Article detail — ports Designs/article.html. For stubs (articles without a
// body) the page still renders the editorial shell; the body region shows the
// excerpt and a neutral note, never invented text. Date and byline appear only
// once confirmed.

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const repo = await getContentRepository();
  const article = await repo.getArticle("corporate", slug);
  if (!article) return {};
  return {
    title: article.seo?.title ?? article.title,
    description: article.seo?.description ?? article.excerpt,
    alternates: canonical(article.seo?.canonicalPath ?? `/insights/${slug}`),
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = await getContentRepository();
  const article = await repo.getArticle("corporate", slug);
  if (!article) notFound();

  const related = (await repo.listArticles({ site: "corporate" })).filter((a) => a.id !== article.id).slice(0, 3);
  const meta = articleMeta(article);

  return (
    <>
      <section className="article-hero">
        <div className="article-hero-inner">
          <div style={{ display: "flex", gap: 8, alignItems: "center", paddingBottom: 24, marginBottom: 32, borderBottom: "1px solid var(--line)", fontFamily: "var(--font-mono)", fontSize: "var(--f-meta)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>
            <a href="/" style={{ color: "var(--muted)" }}>Nayokan</a>
            <span style={{ opacity: 0.4 }}>/</span>
            <a href="/insights" style={{ color: "var(--muted)" }}>Insights</a>
            <span style={{ opacity: 0.4 }}>/</span>
            <span style={{ color: "var(--ink)" }}>Article</span>
          </div>
          <h1 className="article-hero-title">{article.title}</h1>
          {meta.length > 0 && (
            <div className="article-hero-meta">
              {meta.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      {article.cover && (
        <>
          <figure className="article-cover">
            <div className="article-cover-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={article.cover.src} alt={article.cover.alt} />
            </div>
          </figure>
          {article.cover.caption && <div className="article-cover-cap">{article.cover.caption}</div>}
        </>
      )}

      <article className="article-body-wrap">
        {article.body.length > 0 ? (
          <RichBlocks blocks={article.body} />
        ) : (
          <>
            <p className="lede">{article.excerpt}</p>
            <p className="pending-note">The full article will be published here.</p>
          </>
        )}
      </article>

      <div className="article-share">
        <span className="meta">Share this article</span>
        <div className="article-share-buttons">
          <a href={`/insights/${article.slug}`}>Copy link</a>
          <a href="#" aria-disabled="true">LinkedIn</a>
          <a href="#" aria-disabled="true">Email</a>
        </div>
      </div>

      <section className="article-related">
        <div className="wrap">
          <h2 style={{ marginTop: 12, marginBottom: 40 }}>Continue reading.</h2>
          <div className="article-related-grid">
            {related.map((a) => (
              <a key={a.id} href={`/insights/${a.slug}`} className="ins-card ins-card--large">
                <div className="ins-card-media">
                  <MediaSlot slot={a.world === "startup" ? "story-startup" : "article-default"} media={a.cover} fill variant="compact" />
                </div>
                <span className="ins-cat">{a.category}</span>
                <h3>{a.title}</h3>
                {articleMeta(a).length > 0 && <span className="ins-meta">{articleMeta(a).join(" · ")}</span>}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

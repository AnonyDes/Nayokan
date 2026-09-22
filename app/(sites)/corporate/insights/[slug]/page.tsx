import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import { RichBlocks } from "@/ui/components/rich-blocks";
import { Tbc, isTbc } from "@/ui/components/tbc";

// Article detail — ports Designs/article.html. For stubs (articles without a
// body) the page still renders the editorial shell; the body region shows the
// excerpt plus a demo marker rather than invented text.

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
  const fmt = new Date(article.publishedAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

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
          <span className="article-cat">{article.category ? `Feature · ${article.category}` : "Feature"}</span>
          <h1 className="article-hero-title">{article.title}</h1>
          <div className="article-hero-meta">
            <span>{fmt}{isTbc(article.provenance, "publishedAt") && <Tbc>date tbc</Tbc>}</span>
            <span>{article.readingMinutes ?? "—"} min read</span>
            <span>
              By {article.authorName ?? "Nayokan"}
              {isTbc(article.provenance, "authorName") && <Tbc>author tbc</Tbc>}
            </span>
          </div>
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
            <p>
              <Tbc>full text tbc</Tbc> This article is a working placeholder — the editorial draft is
              being prepared for publication.
            </p>
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
          <span className="meta">§ Related insights</span>
          <h2 style={{ marginTop: 12, marginBottom: 40 }}>Continue reading.</h2>
          <div className="article-related-grid">
            {related.map((a, i) => (
              <a key={a.id} href={`/insights/${a.slug}`} className="article-card">
                <div className="article-thumb placeholder" data-num={String(i + 2).padStart(2, "0")} />
                <span className="article-cat">{a.category}</span>
                <h4 className="article-title">{a.title}</h4>
                <span className="article-meta">
                  <span>
                    {new Date(a.publishedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })} · {a.readingMinutes ?? "—"} min
                  </span>
                  <span>{a.authorName}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

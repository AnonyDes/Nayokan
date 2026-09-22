"use client";

import { useState } from "react";
import type { Article } from "@/platform/content/types";
import { Tbc } from "@/ui/components/tbc";
import { trackEvent } from "@/platform/analytics";

// Insights grid — featured card + filterable article grid (insights.html).
// Client-side category filter mirrors the design's chip filters.

const FILTERS = ["All", "Innovation", "Entrepreneurship", "Skills", "Development", "Markets", "Nayokan Updates"];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

const metaLine = (a: Article) => `${fmtDate(a.publishedAt)} · ${a.readingMinutes ?? "—"} min`;

export function ArticleGrid({ articles }: { articles: Article[] }) {
  const [filter, setFilter] = useState("All");
  const [featured, ...rest] = articles;
  const visible = rest.filter((a) => filter === "All" || a.category === filter);

  return (
    <section className="article-list">
      <div className="wrap">
        <div className="article-filters" role="group" aria-label="Filter by category">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`article-filter${filter === f ? " active" : ""}`}
              aria-pressed={filter === f}
              onClick={() => {
                setFilter(f);
                trackEvent("filter", { site: "corporate", world: "corporate", list: "insights", value: f });
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="article-grid">
          {featured && (filter === "All" || featured.category === filter) && (
            <a href={`/insights/${featured.slug}`} className="article-featured">
              <div className="article-thumb">
                {featured.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featured.cover.src} alt={featured.cover.alt} />
                ) : (
                  <div className="article-thumb placeholder" data-num="01" />
                )}
              </div>
              <div className="article-body">
                <span className="article-cat">Feature · {featured.category}</span>
                <h3 className="article-title">{featured.title}</h3>
                <p className="lede">{featured.excerpt}</p>
                <span className="article-meta">
                  <span>{metaLine(featured)} read</span>
                  <span>
                    {featured.authorName}
                    {featured.provenance.unconfirmedFields?.includes("authorName") && <Tbc>author tbc</Tbc>}
                  </span>
                </span>
              </div>
            </a>
          )}
          {visible.map((a, i) => (
            <a key={a.id} href={`/insights/${a.slug}`} className="article-card">
              <div className="article-thumb placeholder" data-num={String(i + 2).padStart(2, "0")} />
              <span className="article-cat">{a.category}</span>
              <h4 className="article-title">{a.title}</h4>
              <span className="article-meta">
                <span>{metaLine(a)}</span>
                <span>{a.authorName}</span>
              </span>
            </a>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="meta" style={{ marginTop: 32 }}>
            No articles in this category yet.
          </p>
        )}
      </div>
    </section>
  );
}

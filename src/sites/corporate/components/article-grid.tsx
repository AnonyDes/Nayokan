"use client";

import { useState } from "react";
import type { Article } from "@/platform/content/types";
import { articleMeta } from "@/sites/corporate/article-meta";
import { MediaSlot } from "@/ui/components/media-slot";
import { trackEvent } from "@/platform/analytics";

// Insights: a publication, not a feed. One featured story (large image,
// headline, excerpt), two secondary stories with weight, then the rest of the
// archive in a lighter grid. Category chips filter everything below the
// featured story. Dates and bylines appear only once confirmed.

const FILTERS = ["All", "Innovation", "Entrepreneurship", "Skills", "Development", "Markets", "Nayokan Updates"];

const WORLD_LABEL: Record<Article["world"], string> = {
  corporate: "Nayokan",
  vti: "VTI",
  startup: "Startup Centre",
  venture_capital: "Venture Capital",
  hospitality: "Hospitality",
};

function Cover({ article, sizes }: { article: Article; sizes: string }) {
  return (
    <MediaSlot
      slot={article.world === "startup" ? "story-startup" : "article-default"}
      media={article.cover}
      fill
      variant="compact"
      sizes={sizes}
    />
  );
}

export function ArticleGrid({ articles }: { articles: Article[] }) {
  const [filter, setFilter] = useState("All");
  const [featured, ...rest] = articles;
  const visible = rest.filter((a) => filter === "All" || a.category === filter);
  const secondary = visible.slice(0, 2);
  const archive = visible.slice(2);

  return (
    <section className="ins">
      <div className="wrap">
        {featured && (
          <a href={`/insights/${featured.slug}`} className="ins-featured">
            <div className="ins-featured-media">
              <Cover article={featured} sizes="(max-width: 899px) 100vw, 60vw" />
            </div>
            <div className="ins-featured-body">
              <span className="ins-cat">Featured · {featured.category}</span>
              <h2>{featured.title}</h2>
              <p>{featured.excerpt}</p>
              <span className="ins-meta">{articleMeta(featured).join(" · ") || WORLD_LABEL[featured.world]}</span>
              <span className="link-inline">
                Read the story <span className="arrow">→</span>
              </span>
            </div>
          </a>
        )}

        <div className="ins-filters" role="group" aria-label="Filter by category">
          <span className="ins-filters-label">Categories</span>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
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

        {secondary.length > 0 && (
          <div className="ins-secondary">
            {secondary.map((a) => (
              <a key={a.id} href={`/insights/${a.slug}`} className="ins-card ins-card--large">
                <div className="ins-card-media">
                  <Cover article={a} sizes="(max-width: 899px) 100vw, 50vw" />
                </div>
                <span className="ins-cat">
                  {a.category} · {WORLD_LABEL[a.world]}
                </span>
                <h3>{a.title}</h3>
                <p>{a.excerpt}</p>
                {articleMeta(a).length > 0 && <span className="ins-meta">{articleMeta(a).join(" · ")}</span>}
              </a>
            ))}
          </div>
        )}

        {archive.length > 0 && (
          <div className="ins-archive">
            {archive.map((a) => (
              <a key={a.id} href={`/insights/${a.slug}`} className="ins-card">
                <span className="ins-cat">
                  {a.category} · {WORLD_LABEL[a.world]}
                </span>
                <h4>{a.title}</h4>
                <p>{a.excerpt}</p>
                <span className="ins-read">
                  Read <span aria-hidden="true">→</span>
                </span>
              </a>
            ))}
          </div>
        )}

        {visible.length === 0 && <p className="ins-empty">No further articles in this category yet.</p>}
      </div>
    </section>
  );
}

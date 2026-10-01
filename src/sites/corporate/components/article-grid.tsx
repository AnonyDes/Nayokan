"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Article } from "@/platform/content/types";
import { articleMeta } from "@/sites/corporate/article-meta";
import { MediaSlot } from "@/ui/components/media-slot";
import type { ImageSlotId } from "@/ui/media/image-briefs";
import { trackEvent } from "@/platform/analytics";

// Insights: a publication, not a feed. One featured story, two secondary stories,
// and an immersive horizontal TikTok/Story reel for all remaining articles.

const FILTERS = ["All", "Innovation", "Entrepreneurship", "Skills", "Development", "Markets", "Nayokan Updates"];

const WORLD_LABEL: Record<Article["world"], string> = {
  corporate: "Nayokan",
  vti: "VTI",
  startup: "Startup Centre",
  venture_capital: "Venture Capital",
  hospitality: "Hospitality",
};

// Rich image slots mapped to give each article a distinct, authentic cover photo
const ARTICLE_SLOTS: Record<string, ImageSlotId> = {
  "commercializing-university-research-central-africa": "startup-commercialization",
  "why-vocational-training-must-precede-innovation": "programme-vti",
  "cluster-formation-practical-guide-graduates": "article-default",
  "building-demand-cameroonian-products-beyond-cameroon": "world-vc",
  "productive-systems-thesis-capability-to-capital": "about-people",
  "what-a-working-commercialization-pipeline-looks-like": "programme-startup",
};

function getArticleSlot(article: Article): ImageSlotId {
  if (ARTICLE_SLOTS[article.slug]) return ARTICLE_SLOTS[article.slug];
  if (article.world === "startup") return "story-startup";
  if (article.world === "vti") return "world-vti";
  if (article.world === "venture_capital") return "vc-hero";
  return "article-default";
}

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
  const reelArticles = archive.length > 0 ? archive : visible;

  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Smooth programmatic scroll to a specific slide
  const scrollToIndex = useCallback((idx: number) => {
    if (!trackRef.current) return;
    const el = trackRef.current;
    const slides = el.querySelectorAll<HTMLElement>(".tiktok-slide");
    if (slides[idx]) {
      slides[idx].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      setActiveIndex(idx);
    }
  }, []);

  // Update active counter and dots when scrolling / swiping
  const handleScroll = useCallback(() => {
    if (!trackRef.current) return;
    const el = trackRef.current;
    const slide = el.querySelector<HTMLElement>(".tiktok-slide");
    if (!slide) return;
    const slideWidth = slide.offsetWidth + 20;
    const index = Math.round(el.scrollLeft / slideWidth);
    if (index >= 0 && index < reelArticles.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  }, [activeIndex, reelArticles.length]);

  // Reset active slide index when category changes
  useEffect(() => {
    setActiveIndex(0);
    if (trackRef.current) {
      trackRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [filter]);

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

        {/* TIKTOK / HORIZONTAL REEL SHOWCASE */}
        {reelArticles.length > 0 && (
          <div className="tiktok-reel-section">
            <div className="tiktok-reel-header">
              <div className="tiktok-reel-title-wrap">
                <span className="tiktok-reel-eyebrow">Horizontal Reel · Insights</span>
                <h3 className="tiktok-reel-heading">Explore all articles</h3>
              </div>
              <div className="tiktok-reel-controls">
                <span className="tiktok-reel-counter">
                  {String(activeIndex + 1).padStart(2, "0")} / {String(reelArticles.length).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  className="tiktok-reel-btn"
                  onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
                  disabled={activeIndex === 0}
                  aria-label="Previous article"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="tiktok-reel-btn"
                  onClick={() => scrollToIndex(Math.min(reelArticles.length - 1, activeIndex + 1))}
                  disabled={activeIndex === reelArticles.length - 1}
                  aria-label="Next article"
                >
                  →
                </button>
              </div>
            </div>

            <div ref={trackRef} className="tiktok-reel-track" onScroll={handleScroll}>
              {reelArticles.map((a, i) => (
                <div key={a.id} className="tiktok-slide">
                  <a href={`/insights/${a.slug}`} className="tiktok-card">
                    {/* Cover photo BEFORE the title */}
                    <div className="tiktok-card-media">
                      <MediaSlot
                        slot={getArticleSlot(a)}
                        media={a.cover}
                        fill
                        variant="compact"
                        sizes="(max-width: 860px) 95vw, 60vw"
                      />
                      <span className="tiktok-card-badge">
                        {a.category} · {WORLD_LABEL[a.world]}
                      </span>
                    </div>

                    <div className="tiktok-card-body">
                      <div className="tiktok-card-meta">
                        <span>Article {String(i + 1).padStart(2, "0")}</span>
                        <span className="sep">/</span>
                        <span>{WORLD_LABEL[a.world]}</span>
                        {a.readingMinutes && (
                          <>
                            <span className="sep">/</span>
                            <span>{a.readingMinutes} min read</span>
                          </>
                        )}
                      </div>

                      <h4 className="tiktok-card-title">{a.title}</h4>
                      <p className="tiktok-card-excerpt">{a.excerpt}</p>

                      <div className="tiktok-card-footer">
                        <span className="link-inline">
                          Read full article <span className="arrow">→</span>
                        </span>
                        <span className="tiktok-card-swipe-hint">
                          Swipe <span className="arrow-pulse">→</span>
                        </span>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>

            {/* Pagination pills */}
            <div className="tiktok-reel-pagination">
              {reelArticles.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`tiktok-reel-dot${activeIndex === i ? " active" : ""}`}
                  onClick={() => scrollToIndex(i)}
                  aria-label={`Go to article ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {visible.length === 0 && <p className="ins-empty">No further articles in this category yet.</p>}
      </div>
    </section>
  );
}

import type { ReactNode } from "react";
import type { MediaRef } from "@/platform/content/types";
import type { ImageSlotId } from "@/ui/media/image-briefs";
import { MediaSlot } from "@/ui/components/media-slot";

// Editorial hero for listing and directory pages: crumbs, eyebrow, title,
// lede and optional facts on the left; a photographic slot on the right.
// Replaces text-only openings (CorpHero / SubHero) where a page needs a
// visual anchor.

export interface EditorialCrumb {
  label: string;
  href?: string;
}

export function EditorialHero({
  crumbs: _crumbs,
  title,
  lede,
  facts,
  slot,
  media,
  figure,
  tone = "light",
  children,
}: {
  crumbs?: EditorialCrumb[];
  title: ReactNode;
  lede: ReactNode;
  /** Confirmed facts only. */
  facts?: { label: string; value: ReactNode }[];
  slot: ImageSlotId;
  media?: MediaRef;
  figure?: string;
  tone?: "light" | "dark" | "green" | "navy" | "sand";
  children?: ReactNode;
}) {
  return (
    <section className="ed-hero">
      <div className="ed-hero-inner">
        <div>
          <h1 className="ed-hero-title">{title}</h1>
          <p className="ed-hero-lede">{lede}</p>
          {facts && facts.length > 0 && (
            <dl className="ed-hero-stats">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {children}
        </div>
        <div className="ed-hero-media">
          <MediaSlot slot={slot} media={media} ratio="4:3" eager tone={tone} />
          {figure && (
            <div className="ed-hero-fig">
              <span>{figure}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

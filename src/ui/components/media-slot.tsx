import type { CSSProperties } from "react";
import type { MediaRef } from "@/platform/content/types";
import { RATIO_CSS, getImageBrief, type ImageAsset, type ImageRatio, type ImageSlotId } from "@/ui/media/image-briefs";

// A photographic slot with a locked aspect ratio. Renders, in order of
// preference: a CMS media override, the brief's approved asset, or an
// art-directed placeholder that states the brief. Swapping the placeholder
// for approved photography never changes the layout.

export interface MediaSlotProps {
  slot: ImageSlotId;
  /** CMS-supplied image; wins over everything else. */
  media?: MediaRef;
  /** Per-record illustrative image (see getNamedIllustrative); wins over the brief's generic one. */
  illustrative?: ImageAsset;
  /** Override the brief's ratio for this placement. */
  ratio?: ImageRatio;
  /** Fill the positioned parent instead of sizing by ratio (panels, heroes). */
  fill?: boolean;
  /** "full" shows the brief; "compact" shows a small tag (for slots under text). */
  variant?: "full" | "compact";
  tone?: "light" | "dark" | "green" | "navy" | "sand";
  eager?: boolean;
  /** `sizes` hint for responsive candidates; defaults follow the slot's usual width. */
  sizes?: string;
  caption?: boolean;
  className?: string;
}

export function MediaSlot({
  slot,
  media,
  illustrative,
  ratio,
  fill = false,
  variant = "full",
  tone = "light",
  eager = false,
  sizes,
  caption = false,
  className = "",
}: MediaSlotProps) {
  const brief = getImageBrief(slot);
  const r = ratio ?? brief.ratio;
  const style: CSSProperties = fill ? {} : { aspectRatio: RATIO_CSS[r] };
  const image = media
    ? { src: media.src, alt: media.alt, width: media.width, height: media.height, position: undefined, caption: media.caption, isIllustrative: false, srcSet: undefined }
    : (brief.asset ?? illustrative ?? brief.illustrative);
  const classes = ["media-slot", fill ? "media-slot--fill" : "", className].filter(Boolean).join(" ");

  if (image) {
    return (
      <figure className={classes} style={style} data-slot={slot}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="media-slot-img"
          src={image.src}
          srcSet={image.srcSet}
          sizes={image.srcSet ? sizes ?? defaultSizes(fill, variant) : undefined}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          style={image.position ? { objectPosition: image.position } : undefined}
        />
        {image.isIllustrative && (
          <span className="media-slot-badge media-slot-badge--illustrative">Illustrative image</span>
        )}
        {caption && image.caption && <figcaption className="media-slot-cap">{image.caption}</figcaption>}
      </figure>
    );
  }

  return (
    <figure
      className={`${classes} media-slot--placeholder media-slot--${tone} media-slot--${variant}`}
      style={style}
      data-slot={slot}
      role="img"
      aria-label={`Photograph to be supplied: ${brief.subject}.`}
    >
      <div className="media-slot-ph" aria-hidden="true">
        <span className="media-slot-ph-tag">
          <span className="media-slot-ph-dot" />
          Photograph to be supplied
        </span>
        {variant === "full" && (
          <>
            <span className="media-slot-ph-subject">{brief.subject}</span>
            <dl className="media-slot-ph-spec">
              <div>
                <dt>Role</dt>
                <dd>{brief.role}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{brief.location}</dd>
              </div>
              <div>
                <dt>Composition</dt>
                <dd>{brief.composition}</dd>
              </div>
              <div>
                <dt>Treatment</dt>
                <dd>{brief.treatment}</dd>
              </div>
            </dl>
          </>
        )}
        <span className="media-slot-ph-ratio">
          {r} · {variant === "compact" ? brief.subject : "Nayokan image brief"}
        </span>
      </div>
    </figure>
  );
}

// Default `sizes`: panels and heroes take about half the viewport on desktop,
// cards a third; everything is full width below the tablet breakpoint.
function defaultSizes(fill: boolean, variant: "full" | "compact"): string {
  if (fill) return "(max-width: 899px) 100vw, 50vw";
  return variant === "compact" ? "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" : "(max-width: 899px) 100vw, 50vw";
}

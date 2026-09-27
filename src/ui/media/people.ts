import manifestJson from "./people-manifest.json";
import type { MediaRef } from "@/platform/content/types";

// Real, named leadership/board photos, confirmed by Nayokan. Separate from
// image-briefs.ts (illustrative/AI documentary stand-ins) on purpose: these
// are actual identifiable people, so they carry no "Illustrative image"
// badge, and there is no placeholder/AI fallback — a person without a
// confirmed photo simply has none (see the initials card in
// app/(sites)/corporate/about/page.tsx).
//
// Source: art-source/people/<slug>.*, built by `npm run images:optimize:people`.

type Manifest = Record<string, { width: number; height: number; variants: { w: number; bytes: number }[] }>;
const MANIFEST = manifestJson as Manifest;
const PREFIX = "/assets/photos/people/";

/** A confirmed person's photo, or undefined until Nayokan supplies one. */
export function getPersonPhoto(slug: string, alt: string): MediaRef | undefined {
  const entry = MANIFEST[slug];
  if (!entry) return undefined;
  const url = (w: number) => `${PREFIX}${slug}-${w}.webp`;
  const fallback = entry.variants.find((v) => v.w >= 640) ?? entry.variants[entry.variants.length - 1];
  return {
    id: `person-${slug}`,
    src: url(fallback.w),
    alt,
    width: entry.width,
    height: entry.height,
  };
}

/** srcSet for a confirmed person's photo; undefined when there's no manifest entry. */
export function getPersonSrcSet(slug: string): string | undefined {
  const entry = MANIFEST[slug];
  if (!entry) return undefined;
  return entry.variants.map((v) => `${PREFIX}${slug}-${v.w}.webp ${v.w}w`).join(", ");
}

// Admin media-library models — mirrors Designs/admin/media-library.html.
// Real storage/metadata shape pending Session B's media_assets table +
// storage bucket (workstreams.md: src/platform/media/** is Session B's).
import type { Provenance } from "@/platform/content/types";

export type MediaKind = "image" | "video" | "document";

export interface AdminMediaAsset {
  id: string;
  filename: string;
  kind: MediaKind;
  /** Placeholder thumb label, e.g. "FIELD PHOTO · Cohort 4". */
  thumbLabel: string;
  /** e.g. JPG / SVG / MP4 / PDF. */
  format: string;
  /** e.g. "4.2 MB". */
  sizeLabel: string;
  /** e.g. "3200 × 2100" or "01:24 · 1080p" for video. */
  dimensions: string | null;
  uploadedBy: string;
  uploadedAgo: string;
  /** e.g. "2 articles · 1 programme" — null when unused. */
  usedIn: string | null;
  collection: string;
  /** Hard-required before the asset can be attached to published content. */
  alt: string;
  caption: string;
  credit: string;
  provenance: Provenance;
}

export type MediaWarning = "missing_alt" | "missing_source" | "unused";

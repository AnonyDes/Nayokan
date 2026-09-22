// MOCK media library — pending Session B's media_assets table and storage
// bucket. Uploads here are metadata-only (no binary is stored); the design's
// hard rule still applies: alt text is required before an asset may be saved.
import "server-only";
import type { Provenance } from "@/platform/content/types";
import { filterByQuery, type ListQuery } from "@/admin/data/query";
import { mockGet, mockId, mockInsert, mockList, mockRemove, mockUpdate } from "@/admin/data/mock-store";
import type { AdminMediaAsset, MediaKind, MediaWarning } from "./types";

const DEMO: Provenance = { isDemo: true, unconfirmedFields: ["credit"] };

const asset = (
  id: string,
  filename: string,
  kind: MediaKind,
  thumbLabel: string,
  format: string,
  sizeLabel: string,
  dimensions: string | null,
  uploadedBy: string,
  uploadedAgo: string,
  usedIn: string | null,
  collection: string,
  alt: string,
  caption: string,
  credit: string,
): AdminMediaAsset => ({
  id,
  filename,
  kind,
  thumbLabel,
  format,
  sizeLabel,
  dimensions,
  uploadedBy,
  uploadedAgo,
  usedIn,
  collection,
  alt,
  caption,
  credit,
  provenance: { ...DEMO },
});

const SEED_MEDIA: AdminMediaAsset[] = [
  asset("med-1", "cohort4-workshop-a01.jpg", "image", "FIELD PHOTO · Cohort 4 workshop", "JPG", "4.2 MB", "3200 × 2100", "John Bekolo", "2h ago", "2 articles · 1 programme", "Cohort 4 workshop", "Nayokan Cohort 4 participants working at welding stations inside the Yaounde workshop.", "Cluster session · September 2026", "Nayokan · Communications"),
  asset("med-2", "cohort4-workshop-a02.jpg", "image", "FIELD PHOTO · Cohort 4", "JPG", "3.8 MB", "3200 × 2100", "John Bekolo", "2h ago", null, "Cohort 4 workshop", "", "", "Nayokan · Communications"),
  asset("med-3", "cohort4-workshop-a03.jpg", "image", "FIELD PHOTO · Cohort 4", "JPG", "4.1 MB", "3200 × 2100", "John Bekolo", "2h ago", null, "Cohort 4 workshop", "Workshop floor, welding bay.", "", "Nayokan · Communications"),
  asset("med-4", "yaounde-workshop.mp4", "video", "▶ VIDEO · Yaoundé workshop", "MP4", "48 MB", "01:24 · 1080p", "Comms team", "3d ago", "1 article", "Cohort 4 workshop", "Short walkthrough of the Yaoundé workshop during a cluster session.", "", "Nayokan · Communications"),
  asset("med-5", "partner-logo-01.svg", "image", "PARTNER LOGO placeholder", "SVG", "24 KB", "Vector", "Comms team", "6d ago", "1 partner", "Partner logos", "Partner logo placeholder — unconfirmed.", "", "tbc"),
  asset("med-6", "portrait-programme-lead.jpg", "image", "PORTRAIT · Programme lead", "JPG", "2.4 MB", "1800 × 2400", "Comms team", "1w ago", "1 person", "Homepage", "Programme lead portrait — record unconfirmed.", "", "tbc"),
  asset("med-7", "guesthouse-yaounde-01.jpg", "image", "PROPERTY · Guesthouse exterior", "JPG", "3.6 MB", "3600 × 2400", "Comms team", "1w ago", "1 property", "Property galleries", "", "", "tbc"),
  asset("med-8", "impact-report-2024.pdf", "document", "PDF · Impact report 2024", "PDF", "2.1 MB", "18 pages", "Comms team", "2mo ago", "1 page", "Impact reports 2025", "Impact report 2024 document cover.", "", "Nayokan · Communications"),
  asset("med-9", "nayokan-hero-a.jpg", "image", "HERO · Institutional", "JPG", "5.8 MB", "3840 × 2160", "Comms team", "3mo ago", "Homepage hero", "Homepage", "Nayokan institutional hero image.", "", "Nayokan · Communications"),
  asset("med-10", "launch-event-01.jpg", "image", "EVENT · Programme launch", "JPG", "3.2 MB", "3200 × 2100", "Comms team", "3mo ago", "1 article", "Homepage", "Programme launch event, Yaoundé.", "", "Nayokan · Communications"),
  asset("med-11", "launch-event-02.jpg", "image", "EVENT · Programme launch", "JPG", "3.4 MB", "3200 × 2100", "Comms team", "3mo ago", null, "Homepage", "Programme launch event, second angle.", "", "Nayokan · Communications"),
  asset("med-12", "mentor-portrait-04.jpg", "image", "PORTRAIT · Mentor", "JPG", "1.8 MB", "1600 × 2100", "Comms team", "4mo ago", "1 mentor", "Cohort 4 workshop", "Mentor portrait — record unconfirmed.", "", "tbc"),
];

export interface MediaQuery extends ListQuery {
  type?: string;
  collection?: string;
  warning?: string;
  sort?: string;
}

function matchesWarning(a: AdminMediaAsset, warning: string): boolean {
  const w = warning as MediaWarning;
  if (w === "missing_alt") return a.alt.trim() === "";
  if (w === "missing_source") return a.credit.trim() === "";
  if (w === "unused") return a.usedIn === null;
  return true;
}

export function listMedia(query: MediaQuery): AdminMediaAsset[] {
  let rows = mockList("media", () => SEED_MEDIA);
  if (query.type && query.type !== "all") rows = rows.filter((a) => a.kind === query.type);
  if (query.collection) rows = rows.filter((a) => a.collection === query.collection);
  if (query.warning) rows = rows.filter((a) => matchesWarning(a, query.warning!));
  rows = filterByQuery(rows, query.q, (a) => [a.filename, a.alt, a.thumbLabel]);
  const sorted = rows.slice();
  if (query.sort === "name") sorted.sort((a, b) => a.filename.localeCompare(b.filename));
  else if (query.sort === "oldest") sorted.reverse();
  return sorted;
}

export interface MediaCounts {
  types: Record<string, number>;
  collections: { name: string; count: number }[];
  warnings: Record<MediaWarning, number>;
  total: number;
}

export function mediaCounts(): MediaCounts {
  const rows = mockList("media", () => SEED_MEDIA);
  const collections = new Map<string, number>();
  for (const a of rows) collections.set(a.collection, (collections.get(a.collection) ?? 0) + 1);
  return {
    types: {
      all: rows.length,
      image: rows.filter((a) => a.kind === "image").length,
      video: rows.filter((a) => a.kind === "video").length,
      document: rows.filter((a) => a.kind === "document").length,
    },
    collections: [...collections.entries()].map(([name, count]) => ({ name, count })),
    warnings: {
      missing_alt: rows.filter((a) => a.alt.trim() === "").length,
      missing_source: rows.filter((a) => a.credit.trim() === "").length,
      unused: rows.filter((a) => a.usedIn === null).length,
    },
    total: rows.length,
  };
}

export const getMedia = (id: string) => mockGet("media", () => SEED_MEDIA, id);

export const saveMedia = (id: string, patch: Partial<AdminMediaAsset>) => mockUpdate("media", () => SEED_MEDIA, id, patch);

export const removeMedia = (id: string) => mockRemove("media", id);

export function uploadMedia(input: Pick<AdminMediaAsset, "filename" | "kind" | "collection" | "alt" | "credit">): AdminMediaAsset {
  return mockInsert("media", () => SEED_MEDIA, {
    id: mockId("med"),
    filename: input.filename,
    kind: input.kind,
    thumbLabel: input.kind === "video" ? "▶ VIDEO · upload pending" : input.kind === "document" ? "DOC · upload pending" : "IMAGE · upload pending",
    format: input.filename.split(".").pop()?.toUpperCase() ?? "—",
    sizeLabel: "—",
    dimensions: null,
    uploadedBy: "Current user",
    uploadedAgo: "just now",
    usedIn: null,
    collection: input.collection,
    alt: input.alt,
    caption: "",
    credit: input.credit,
    provenance: { isDemo: true, unconfirmedFields: ["binary", "dimensions", "sizeLabel"] },
  });
}

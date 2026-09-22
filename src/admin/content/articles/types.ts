// Admin article/story models — the editorial side of the public Article and
// Story contracts (src/platform/content/types.ts), extended with workflow
// fields (status, reviewer, schedule) the CMS needs. DB shape pending
// Session B (readiness-report §8).
import type { ContentStatus, Provenance, RichBlock } from "@/platform/content/types";
import type { SiteId, World } from "@/platform/sites/types";

export const ARTICLE_CATEGORIES = ["Field notes", "Programme updates", "Institutional letter", "Impact review", "Announcement"] as const;

export interface AdminArticle {
  id: string;
  /** Design reference code, e.g. ART-2026-024. */
  code: string;
  site: SiteId;
  world: World | null;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  authorName: string;
  authorInitials: string;
  status: ContentStatus;
  /** Extra pill text, e.g. "Scheduled · Wed 08:00". */
  statusNote?: string;
  tags: string[];
  body: RichBlock[];
  coverImage?: string;
  seoTitle: string;
  seoDesc: string;
  reviewer?: string;
  submittedAgo?: string;
  updatedAgo: string;
  views30d: number | null;
  version: number;
  provenance: Provenance;
}

export const STORY_TYPES = ["beneficiary", "enterprise", "cohort"] as const;

export interface AdminStory {
  id: string;
  site: SiteId;
  world: World | null;
  slug: string;
  title: string;
  excerpt: string;
  type: (typeof STORY_TYPES)[number];
  /** Programme/cluster label the story is attached to. */
  programme?: string;
  /** Governance flags — a story cannot publish without consent. */
  consentRecorded: boolean;
  evidenceAttached: boolean;
  coverImage?: string;
  status: ContentStatus;
  updatedAgo: string;
  provenance: Provenance;
}

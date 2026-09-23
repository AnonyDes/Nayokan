// Publishing workflow models — review queue, content review, version history.
// Mirrors Designs/admin/review-queue.html, content-review.html and
// version-history.html. Queue items are DERIVED from the content modules'
// real statuses (article/story `in_review`, metric `needs_verification`|
// `verified`, programme `draft`) so workflow transitions elsewhere in the
// admin flow through here automatically; per-item review metadata lives in
// the queue_meta mock collection. DB shapes pending Session B.
import type { Provenance, RichBlock } from "@/platform/content/types";
import type { SiteId } from "@/platform/sites/types";

export type ReviewKind = "article" | "story" | "metric" | "programme";

export type QueueSecondary = "reassign" | "request-evidence" | "request-changes" | "approve-now";

/** Per-content review metadata, keyed by content id in the queue_meta collection. */
export interface QueueMeta {
  id: string; // = content id
  kind: ReviewKind;
  submittedBy: string;
  /** null → flagged for leadership review (visible to every reviewer). */
  assignedTo: string | null;
  waitingHours: number;
  waitingLabel: string;
  /** Kind-specific card meta rows (Words / Value / Duration / Media …). */
  meta: { label: string; value: string; tone?: "warn" | "danger" }[];
  secondary: QueueSecondary;
}

/** A queue card as rendered — derived view over content + queue meta. */
export interface ReviewQueueItem {
  id: string;
  kind: ReviewKind;
  kindLabel: string;
  title: string;
  excerpt: string;
  submittedBy: string;
  assignedTo: string | null;
  worldLabel: string;
  meta: QueueMeta["meta"];
  waitingLabel: string;
  waitingHours: number;
  /** >72h → stale (danger), <24h → fresh (success), else normal (warn). */
  aging: "fresh" | "normal" | "stale";
  secondary: QueueSecondary;
  /** Where "Open for review" goes — the review screen for editorial kinds, the owning editor otherwise. */
  href: string;
  /** Owning site — permission context for review actions. */
  site: SiteId;
  /** Display narrowing — null ("all worlds") appears under every site filter. */
  filterSite: SiteId | null;
}

export interface PreflightCheck {
  label: string;
  ok: boolean;
  note: string;
}

export type DiffSeg = { kind: "same" | "ins" | "del"; text: string };

export interface ReviewComment {
  id: string;
  contentId: string;
  author: string;
  body: string;
  ago: string;
}

/** Everything the content-review screen renders for one queue item. */
export interface ReviewDetail {
  item: ReviewQueueItem;
  codeLabel: string;
  submittedLabel: string;
  authorName: string;
  authorInitials: string;
  authorRoleLine: string;
  submittedAt: string;
  assignedTo: string;
  versionLabel: string;
  wordsLabel: string;
  preview: { eyebrow: string; title: string; sub: string; blocks: RichBlock[] };
  preflight: PreflightCheck[];
  diffTitle: string;
  diff: DiffSeg[];
  diffNotes: string[];
  versionsHref: string;
  comments: ReviewComment[];
}

export type VersionBlockTag = "h4" | "p" | "em" | "q";

export interface VersionBodyBlock {
  tag: VersionBlockTag;
  segs: DiffSeg[];
}

export interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  /** Design row label — Published / Approved / Changes requested / Draft. */
  statusLabel: string;
  note: string;
  author: string;
  at: string;
  isCurrent: boolean;
  /** Short stat for the detail head — "42 words added, 18 removed". */
  diffStat: string;
  /** Body rendered as ins/del segments vs the compared version. */
  body: VersionBodyBlock[];
  provenance: Provenance;
}

export const KIND_LABELS: Record<ReviewKind, string> = {
  article: "Article",
  story: "Story",
  metric: "Impact metric",
  programme: "Programme",
};

export const AGING_LABELS: Record<ReviewQueueItem["aging"], string> = {
  fresh: "fresh",
  normal: "normal",
  stale: "stale",
};

/** Reviewer directory for the reassign picker — display names only. */
export const REVIEWERS = [
  { name: "Maria Ndongo", role: "Super Admin" },
  { name: "David Ekwe", role: "Super Admin" },
  { name: "Sarah Ndenge", role: "Communications" },
  { name: "John Bekolo", role: "Programme Manager" },
  { name: "Aïssa Tchoumi", role: "Content Editor" },
] as const;

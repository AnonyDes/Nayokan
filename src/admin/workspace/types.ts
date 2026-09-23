// Workspace models — notifications and global search results.
// Mirrors Designs/admin/notifications.html and search.html.
import type { Provenance } from "@/platform/content/types";
import type { PillTone } from "@/admin/ui/Pill";

export const NOTIFICATION_KINDS = ["event", "mention", "approval", "system"] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export interface AdminNotification {
  id: string;
  kind: NotificationKind;
  /** Mono eyebrow label, e.g. "Application received". */
  label: string;
  /** Row message, e.g. 'John Bekolo submitted "Building productive capability"'. */
  message: string;
  unread: boolean;
  ago: string;
  /** Optional destination the row links to. */
  href?: string;
  provenance: Provenance;
}

export type NotificationTab = "all" | "unread" | "mention" | "approval" | "system";

/** One global-search row — an entity anywhere in the admin. */
export interface SearchResult {
  id: string;
  /** Left pill, e.g. "Programme", "Article", "Metric". */
  kind: string;
  /** Permission area used to filter results per session. */
  area: string;
  title: string;
  /** Meta line, e.g. "VTI · Yaoundé · Deadline 27 Sept". */
  sub: string;
  statusLabel: string;
  statusTone: PillTone;
  ago: string;
  href: string;
}

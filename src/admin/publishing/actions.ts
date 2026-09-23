// Server Actions for the review queue / content review / version history.
// Zod → requirePermission → mock seam → audit append. Review decisions run
// at "review" level on the owning content area (mirroring ROLE_PERMISSIONS'
// reviewer row); version restore is a content write at "full".
"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/platform/auth/permissions";
import type { AdminSession, PermissionArea } from "@/platform/auth/types";
import { appendAudit } from "@/admin/audit/data";
import { getArticle, saveArticle } from "@/admin/content/articles/data";
import { getStory, saveStory } from "@/admin/content/articles/data";
import * as data from "./data";
import { ReassignSchema, RestoreVersionSchema, ReviewChangesSchema, ReviewDecisionSchema } from "./schemas";
import type { ReviewKind, ReviewQueueItem } from "./types";

export type ActionResult = { ok: true } | { ok: false; error: string };
const ok: ActionResult = { ok: true };
const fail = (error: string): ActionResult => ({ ok: false, error });

const KIND_AREA: Record<ReviewKind, PermissionArea> = {
  article: "articles",
  story: "stories",
  metric: "impact_metrics",
  programme: "programmes",
};

function revalidate(id: string) {
  revalidatePath("/admin/review-queue");
  revalidatePath(`/admin/review-queue/${id}`);
  revalidatePath("/admin/content/articles");
  revalidatePath("/admin/content/stories");
}

async function authorize(id: string): Promise<{ item: ReviewQueueItem; session: AdminSession } | null> {
  const item = data.getReviewItem(id);
  if (!item) return null;
  const session = await requirePermission(KIND_AREA[item.kind], "review", item.site);
  return { item, session };
}

export async function approveReview(input: unknown): Promise<ActionResult> {
  const parsed = ReviewDecisionSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid review decision.");
  const auth = await authorize(parsed.data.id);
  if (!auth) return fail("Item is no longer awaiting review.");
  const { item, session } = auth;

  if (parsed.data.comment?.trim()) data.addReviewComment(item.id, session.fullName, parsed.data.comment.trim());
  const noun = item.kind === "article" ? "article" : item.kind;
  if (item.kind === "article") {
    const a = getArticle(item.id);
    if (!a || a.status !== "in_review") return fail("Article is no longer in review.");
    saveArticle(a.id, { status: "approved" });
  } else if (item.kind === "story") {
    const s = getStory(item.id);
    if (!s || s.status !== "in_review") return fail("Story is no longer in review.");
    saveStory(s.id, { status: "approved" });
  } else {
    return fail("This item is reviewed in its own editor.");
  }
  appendAudit({ actor: session.fullName, initials: initialsOf(session.fullName), verb: `approved ${noun} for publication`, object: item.title, objectType: item.kindLabel, category: "content", pillLabel: "Approve", pillTone: "approved" });
  revalidate(item.id);
  return ok;
}

export async function requestChanges(input: unknown): Promise<ActionResult> {
  const parsed = ReviewChangesSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "A comment is required to request changes.");
  const auth = await authorize(parsed.data.id);
  if (!auth) return fail("Item is no longer awaiting review.");
  const { item, session } = auth;

  if (item.kind === "article") {
    const a = getArticle(item.id);
    if (!a || a.status !== "in_review") return fail("Article is no longer in review.");
    saveArticle(a.id, { status: "changes_requested" });
  } else if (item.kind === "story") {
    const s = getStory(item.id);
    if (!s || s.status !== "in_review") return fail("Story is no longer in review.");
    saveStory(s.id, { status: "changes_requested" });
  } else {
    return fail("This item is reviewed in its own editor.");
  }
  data.addReviewComment(item.id, session.fullName, parsed.data.comment);
  appendAudit({ actor: session.fullName, initials: initialsOf(session.fullName), verb: "requested changes on", object: `"${item.title}"`, objectType: item.kindLabel, category: "content", pillLabel: "Changes", pillTone: "rejected" });
  revalidate(item.id);
  return ok;
}

export async function rejectReview(input: unknown): Promise<ActionResult> {
  const parsed = ReviewChangesSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "A comment is required to reject.");
  const auth = await authorize(parsed.data.id);
  if (!auth) return fail("Item is no longer awaiting review.");
  const { item, session } = auth;

  if (item.kind === "article") {
    const a = getArticle(item.id);
    if (!a || a.status !== "in_review") return fail("Article is no longer in review.");
    saveArticle(a.id, { status: "draft", statusNote: "Rejected by reviewer" });
  } else if (item.kind === "story") {
    const s = getStory(item.id);
    if (!s || s.status !== "in_review") return fail("Story is no longer in review.");
    saveStory(s.id, { status: "draft" });
  } else {
    return fail("This item is reviewed in its own editor.");
  }
  data.addReviewComment(item.id, session.fullName, parsed.data.comment);
  appendAudit({ actor: session.fullName, initials: initialsOf(session.fullName), verb: "rejected", object: `"${item.title}"`, objectType: item.kindLabel, category: "content", pillLabel: "Reject", pillTone: "rejected" });
  revalidate(item.id);
  return ok;
}

export async function reassignReview(input: unknown): Promise<ActionResult> {
  const parsed = ReassignSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid reassignment.");
  const auth = await authorize(parsed.data.id);
  if (!auth) return fail("Item is no longer awaiting review.");
  const { item, session } = auth;

  data.setQueueAssignee(item.id, item.kind, item.submittedBy, parsed.data.assignee);
  appendAudit({
    actor: session.fullName,
    initials: initialsOf(session.fullName),
    verb: parsed.data.assignee ? `reassigned ${item.kindLabel.toLowerCase()} to ${parsed.data.assignee}` : "returned item to leadership review",
    object: item.title,
    objectType: item.kindLabel,
    category: "content",
    pillLabel: "Reassign",
    pillTone: "info",
  });
  revalidate(item.id);
  return ok;
}

export async function restoreVersion(input: unknown): Promise<ActionResult> {
  const parsed = RestoreVersionSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid version.");
  const article = getArticle(parsed.data.contentId);
  // Restore is a content write on the owning site — not a review action.
  const session = await requirePermission("articles", "full", article?.site ?? "corporate");
  const restored = data.restoreVersion(parsed.data.contentId, parsed.data.version, session.fullName);
  if (!restored) return fail("Version not found.");
  appendAudit({
    actor: session.fullName,
    initials: initialsOf(session.fullName),
    verb: "restored previous version",
    object: `"${article?.title ?? parsed.data.contentId}" · v${parsed.data.version}`,
    objectType: "Version",
    category: "content",
    pillLabel: "Restore",
    pillTone: "info",
  });
  revalidatePath(`/admin/version-history`);
  revalidatePath("/admin/content/articles");
  return ok;
}

function initialsOf(name: string): string {
  return name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

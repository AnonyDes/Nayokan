// Server Actions for articles + stories. Zod → requirePermission → mock
// seam. Content edits require "full" on the article's owning site;
// submit-for-review moves draft → in_review (approval/publish is Phase 10
// and requires "review" + the workflow RPCs).
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/platform/auth/permissions";
import { isSiteId, isValidSiteWorld, type SiteId } from "@/platform/sites/types";
import * as data from "./data";
import { ArticlePatchSchema, StoryPatchSchema } from "./schemas";

export type ActionResult = { ok: true } | { ok: false; error: string };
const ok: ActionResult = { ok: true };
const fail = (error: string): ActionResult => ({ ok: false, error });

export async function saveArticle(input: unknown): Promise<ActionResult> {
  const parsed = ArticlePatchSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid article.");
  const { id, ...fields } = parsed.data;
  const article = data.getArticle(id);
  if (!article) return fail("Article not found.");
  if (fields.world && !isValidSiteWorld(article.site, fields.world)) return fail("That world doesn't belong to this site.");
  await requirePermission("articles", "full", article.site);
  if (!data.saveArticle(id, fields)) return fail("Article not found.");
  revalidatePath("/admin/content/articles");
  revalidatePath(`/admin/content/articles/${id}`);
  return ok;
}

export async function submitArticleForReview(input: { id: unknown }): Promise<ActionResult> {
  const parsed = z.object({ id: z.string().min(1) }).safeParse(input);
  if (!parsed.success) return fail("Invalid article.");
  const article = data.getArticle(parsed.data.id);
  if (!article) return fail("Article not found.");
  await requirePermission("articles", "full", article.site);
  if (article.status !== "draft" && article.status !== "changes_requested") {
    return fail("Only drafts and changes-requested articles can be submitted for review.");
  }
  // Note: the design's SEO-description gate blocks *scheduling/publishing*,
  // not submission (article-editor.html shows Submit enabled with "2 issues
  // before publish"). That enforcement lands with Phase 10's publish RPC.
  data.saveArticle(article.id, { status: "in_review" });
  revalidatePath("/admin/content/articles");
  revalidatePath(`/admin/content/articles/${article.id}`);
  return ok;
}

export async function createArticle(input: { site: unknown }): Promise<ActionResult & { id?: string }> {
  const parsed = z.object({ site: z.string().refine(isSiteId) }).safeParse(input);
  if (!parsed.success) return fail("Unknown site.");
  const session = await requirePermission("articles", "full", parsed.data.site as SiteId);
  const initials = session.fullName.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const article = data.createArticle(parsed.data.site as SiteId, { name: session.fullName, initials });
  revalidatePath("/admin/content/articles");
  return { ok: true, id: article.id };
}

export async function saveStory(input: unknown): Promise<ActionResult> {
  const parsed = StoryPatchSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid story.");
  const { id, ...fields } = parsed.data;
  const story = data.getStory(id);
  if (!story) return fail("Story not found.");
  if (fields.world && !isValidSiteWorld(story.site, fields.world)) return fail("That world doesn't belong to this site.");
  await requirePermission("stories", "full", story.site);
  if (!data.saveStory(id, fields)) return fail("Story not found.");
  revalidatePath("/admin/content/stories");
  revalidatePath(`/admin/content/stories/${id}`);
  return ok;
}

export async function submitStoryForReview(input: { id: unknown }): Promise<ActionResult> {
  const parsed = z.object({ id: z.string().min(1) }).safeParse(input);
  if (!parsed.success) return fail("Invalid story.");
  const story = data.getStory(parsed.data.id);
  if (!story) return fail("Story not found.");
  await requirePermission("stories", "full", story.site);
  if (story.status !== "draft" && story.status !== "changes_requested") {
    return fail("Only drafts and changes-requested stories can be submitted for review.");
  }
  // Note: consent is a publish-time gate per stories.html's lede ("requires
  // consent ... before publication"); Phase 10's publish transition enforces
  // it server-side. Submission itself stays allowed so reviewers see gaps.
  data.saveStory(story.id, { status: "in_review" });
  revalidatePath("/admin/content/stories");
  revalidatePath(`/admin/content/stories/${story.id}`);
  return ok;
}

export async function createStory(input: { site: unknown }): Promise<ActionResult & { id?: string }> {
  const parsed = z.object({ site: z.string().refine(isSiteId) }).safeParse(input);
  if (!parsed.success) return fail("Unknown site.");
  await requirePermission("stories", "full", parsed.data.site as SiteId);
  const story = data.createStory(parsed.data.site as SiteId);
  revalidatePath("/admin/content/stories");
  return { ok: true, id: story.id };
}



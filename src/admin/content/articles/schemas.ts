// Zod schemas for article/story writes — kept out of actions.ts ("use server"
// files may only export async functions) so they're directly unit-testable.
import { z } from "zod";
import { WORLDS } from "@/platform/sites/types";
import type { RichBlock } from "@/platform/content/types";

export const SlugSchema = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "Slug must be lowercase letters, numbers and hyphens.");
export const WorldSchema = z.union([z.enum(WORLDS), z.null()]);

// Structured body blocks — must match the public RichBlock contract exactly;
// no raw HTML ever reaches the CMS body.
export const RichBlockSchema: z.ZodType<RichBlock> = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text: z.string().max(20000) }),
  z.object({ type: z.literal("heading"), level: z.union([z.literal(2), z.literal(3)]), text: z.string().max(500) }),
  z.object({ type: z.literal("quote"), text: z.string().max(2000), attribution: z.string().max(200).optional() }),
  z.object({
    type: z.literal("image"),
    media: z.object({
      id: z.string(),
      src: z.string(),
      alt: z.string().min(1, "Images require alt text."),
      width: z.number().optional(),
      height: z.number().optional(),
      caption: z.string().optional(),
      credit: z.string().optional(),
    }),
  }),
  z.object({ type: z.literal("callout"), text: z.string().max(2000), tone: z.enum(["info", "warn"]).optional() }),
  z.object({ type: z.literal("list"), ordered: z.boolean().optional(), items: z.array(z.string().max(1000)).max(50) }),
  z.object({ type: z.literal("cta"), cta: z.object({ label: z.string().max(80), href: z.string().max(500), external: z.boolean().optional() }) }),
]);

export const ArticlePatchSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  slug: SlugSchema,
  excerpt: z.string().max(1000),
  world: WorldSchema,
  category: z.string().max(80),
  tags: z.array(z.string().max(40)).max(12),
  seoTitle: z.string().max(80),
  seoDesc: z.string().max(200),
  body: z.array(RichBlockSchema).max(200),
});

export const StoryPatchSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  slug: SlugSchema,
  excerpt: z.string().max(1000),
  type: z.enum(["beneficiary", "enterprise", "cohort"]),
  programme: z.string().max(120).optional(),
  world: WorldSchema,
  consentRecorded: z.boolean(),
  evidenceAttached: z.boolean(),
});

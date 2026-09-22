// Zod schemas for media writes — testable outside the "use server" file.
import { z } from "zod";

export const MediaPatchSchema = z.object({
  id: z.string().min(1),
  /** Hard requirement per the design — an asset can't be saved without it. */
  alt: z.string().min(1, "Alt text is required.").max(400),
  caption: z.string().max(300),
  credit: z.string().min(1, "Source / credit is required.").max(160),
  collection: z.string().max(80),
});

export const MediaUploadSchema = z.object({
  filename: z.string().min(1).max(240),
  kind: z.enum(["image", "video", "document"]),
  collection: z.string().max(80),
  alt: z.string().min(1, "Alt text is required.").max(400),
  credit: z.string().min(1, "Source / credit is required.").max(160),
});

export const MediaIdSchema = z.object({ id: z.string().min(1) });

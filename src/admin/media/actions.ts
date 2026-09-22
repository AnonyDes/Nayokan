// Server Actions for the media library. Zod → requirePermission("media") →
// mock seam. Uploads are metadata-only until Session B's storage bucket lands.
"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/platform/auth/permissions";
import * as data from "./data";
import { MediaIdSchema, MediaPatchSchema, MediaUploadSchema } from "./schemas";

export type ActionResult = { ok: true } | { ok: false; error: string };
const ok: ActionResult = { ok: true };
const fail = (error: string): ActionResult => ({ ok: false, error });

const PATH = "/admin/media";

export async function saveMediaAsset(input: unknown): Promise<ActionResult> {
  const parsed = MediaPatchSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid asset.");
  const { id, ...fields } = parsed.data;
  const record = data.getMedia(id);
  if (!record) return fail("Asset not found.");
  await requirePermission("media", "full");
  if (!data.saveMedia(id, fields)) return fail("Asset not found.");
  revalidatePath(PATH);
  return ok;
}

export async function uploadAsset(input: unknown): Promise<ActionResult & { id?: string }> {
  const parsed = MediaUploadSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid upload.");
  await requirePermission("media", "full");
  const record = data.uploadMedia(parsed.data);
  revalidatePath(PATH);
  return { ok: true, id: record.id };
}

export async function deleteAsset(input: unknown): Promise<ActionResult> {
  const parsed = MediaIdSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid request.");
  const record = data.getMedia(parsed.data.id);
  if (!record) return fail("Asset not found.");
  await requirePermission("media", "full");
  data.removeMedia(record.id);
  revalidatePath(PATH);
  return ok;
}

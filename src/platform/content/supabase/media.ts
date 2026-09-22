import "server-only";
import { getSupabasePublicEnv } from "@/platform/env/public";
import type { MediaRef } from "../types";
import type { Database } from "@/platform/supabase/types";

type MediaRow = Database["public"]["Tables"]["media"]["Row"];

// Media metadata rows become absolute public URLs from the public-media
// bucket. Rows in the private bucket never appear in public content — RLS
// blocks anon from reading their metadata at all.
export function mediaUrl(row: Pick<MediaRow, "bucket" | "path">): string {
  const env = getSupabasePublicEnv();
  return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${row.bucket}/${row.path}`;
}

export function toMediaRef(row: MediaRow | null | undefined): MediaRef | undefined {
  if (!row) return undefined;
  return {
    id: row.id,
    src: mediaUrl(row),
    alt: row.alt_text,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    caption: row.caption ?? undefined,
    credit: row.source_credit ?? undefined,
  };
}

export const MEDIA_SELECT =
  "id, bucket, path, filename, mime_type, size_bytes, width, height, alt_text, caption, source_credit";

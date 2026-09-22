import "server-only";
import { createClient } from "@/platform/supabase/server";
import type { Json } from "@/platform/supabase/types";

// Thin server-side audit writer. All entries land in the append-only
// audit_log via public.record_audit, which stamps actor = auth.uid() —
// callers cannot write entries in someone else's name.
export async function writeAudit(entry: {
  action: string;
  objectType: string;
  objectId?: string;
  site?: "corporate" | "vti" | "startup";
  previous?: Record<string, unknown>;
  next?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const db = await createClient();
  await db.rpc("record_audit", {
    p_action: entry.action,
    p_object_type: entry.objectType,
    p_object_id: entry.objectId,
    p_site: entry.site,
    p_previous: entry.previous as Json | undefined,
    p_next: entry.next as Json | undefined,
    p_metadata: (entry.metadata ?? {}) as Json,
  });
}

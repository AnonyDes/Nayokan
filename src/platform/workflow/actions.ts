"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/platform/supabase/server";
import { tags } from "@/platform/content/supabase/tags";
import { isContentTable, type ContentTable, type WorkflowAction, WORKFLOW_ACTIONS } from "./transitions";
import type { Json } from "@/platform/supabase/types";

// Server actions over the workflow RPCs. Permission checks, transition
// legality, comments, preflight and audit all happen inside the database;
// these actions add the web-tier concerns: input hygiene, cache
// revalidation on publish/unpublish, and notification delivery already
// handled inside the RPC.

export type ActionResult = { ok: true; status?: string } | { ok: false; error: string };

function isAction(a: string): a is WorkflowAction {
  return (WORKFLOW_ACTIONS as readonly string[]).includes(a);
}

// Publish/unpublish change what anon sees — revalidate the owning site's
// caches. The RPC returns the row's site; slug-specific tags revalidate too.
async function revalidateFor(table: ContentTable, row: { site?: string | null; slug?: string | null; path?: string | null }) {
  if (!row.site) return;
  const s = row.site;
  revalidateTag(tags.site(s), "max");
  const slug = row.slug ?? row.path;
  switch (table) {
    case "articles": if (slug) revalidateTag(tags.article(s, slug), "max"); break;
    case "programmes": if (slug) revalidateTag(tags.programme(s, slug), "max"); break;
    case "clusters": if (slug) revalidateTag(tags.cluster(s, slug), "max"); break;
    case "ventures": if (slug) revalidateTag(tags.venture(s, slug), "max"); break;
    case "properties": if (slug) revalidateTag(tags.property(s, slug), "max"); break;
    case "pages": if (row.path) revalidateTag(tags.page(s, row.path), "max"); break;
  }
}

export async function transitionContent(
  table: string,
  id: string,
  action: string,
  comment?: string,
  scheduledAt?: string,
): Promise<ActionResult> {
  if (!isContentTable(table)) return { ok: false, error: "Unknown content table." };
  if (!isAction(action)) return { ok: false, error: "Unknown action." };

  const db = await createClient();
  const { data, error } = await db.rpc("transition_content", {
    p_table: table,
    p_id: id,
    p_action: action,
    p_comment: comment ?? undefined,
    p_scheduled_at: scheduledAt ?? undefined,
  });
  if (error) return { ok: false, error: error.message };

  if (action === "publish" || action === "unpublish" || action === "restore" || action === "archive") {
    const { data: row } = await db.from(table).select("*").eq("id", id).maybeSingle();
    await revalidateFor(table, (row ?? {}) as { site?: string | null; slug?: string | null; path?: string | null });
  }
  return { ok: true, status: (data as { status?: string } | null)?.status };
}

export async function restoreContentVersion(
  table: string,
  id: string,
  version: number,
): Promise<ActionResult> {
  if (!isContentTable(table)) return { ok: false, error: "Unknown content table." };
  const db = await createClient();
  const { data, error } = await db.rpc("restore_content_version", {
    p_table: table,
    p_id: id,
    p_version: version,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, status: "draft" };
}

export async function requestApproval(
  action: string,
  reason: string,
  table?: string,
  recordId?: string,
  payload: Record<string, unknown> = {},
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const db = await createClient();
  const { data, error } = await db.rpc("request_approval", {
    p_action: action,
    p_table: table ?? undefined,
    p_record_id: recordId ?? undefined,
    p_payload: payload as Json,
    p_reason: reason,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data ?? undefined };
}

export async function approveRequest(requestId: string, approve = true) {
  const db = await createClient();
  const { data, error } = await db.rpc("approve_request", {
    p_request_id: requestId,
    p_approve: approve,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, ...(data as Record<string, unknown> | null) };
}

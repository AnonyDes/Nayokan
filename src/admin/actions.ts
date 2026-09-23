"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createMutableServerClient, createServerReadClient } from "@/platform/auth/server";
import { requireStaff } from "@/platform/auth/guard";

// Admin write path. Field updates go through RLS-guarded UPDATE (the
// guard_status_write trigger rejects direct status writes); every status
// change goes through public.transition_content so governance, audit and
// notifications stay server-side.

export type AdminFormState = { status: "idle" | "error" | "success"; message?: string };

async function transition(
  table: string,
  id: string,
  action: string,
  comment?: string,
  scheduledAt?: string,
): Promise<AdminFormState> {
  const supabase = await createMutableServerClient();
  const { error } = await supabase.rpc("transition_content", {
    p_table: table,
    p_id: id,
    p_action: action,
    p_comment: comment ?? null,
    p_scheduled_at: scheduledAt ?? null,
  });
  if (error) return { status: "error", message: error.message };
  return { status: "success", message: `Transition ${action} applied.` };
}

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export async function saveArticle(prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const session = await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Missing article id." };

  let body: unknown = [];
  try {
    body = JSON.parse(String(formData.get("body") ?? "[]"));
    if (!Array.isArray(body)) throw new Error("not an array");
  } catch {
    return { status: "error", message: "Body blocks are malformed." };
  }

  const seo = {
    title: String(formData.get("seo_title") ?? ""),
    description: String(formData.get("seo_description") ?? ""),
  };

  const supabase = await createMutableServerClient();
  const { error } = await supabase
    .from("articles")
    .update({
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      excerpt: String(formData.get("excerpt") ?? ""),
      category: String(formData.get("category") ?? "") || null,
      author_name: String(formData.get("author_name") ?? "") || null,
      body,
      seo,
      updated_by: session.userId,
    })
    .eq("id", id);
  if (error) return { status: "error", message: error.message };

  revalidatePath(`/admin/articles/${id}`);
  return { status: "success", message: "Draft saved." };
}

export async function transitionArticle(id: string, action: string, comment?: string) {
  await requireStaff();
  const r = await transition("articles", id, action, comment);
  revalidatePath(`/admin/articles/${id}`);
  revalidatePath("/admin/articles");
  return r;
}

// ---------------------------------------------------------------------------
// Pages — sections jsonb is a fixed-layout ordered list.
// ---------------------------------------------------------------------------

export async function savePage(prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const session = await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Missing page id." };

  let sections: unknown = [];
  try {
    sections = JSON.parse(String(formData.get("sections") ?? "[]"));
    if (!Array.isArray(sections)) throw new Error("not an array");
  } catch {
    return { status: "error", message: "Sections payload is malformed." };
  }

  const seo = {
    title: String(formData.get("seo_title") ?? ""),
    description: String(formData.get("seo_description") ?? ""),
  };

  const supabase = await createMutableServerClient();
  const { error } = await supabase
    .from("pages")
    .update({ title: String(formData.get("title") ?? ""), sections, seo, updated_by: session.userId })
    .eq("id", id);
  if (error) return { status: "error", message: error.message };

  revalidatePath(`/admin/pages/${id}`);
  return { status: "success", message: "Page saved." };
}

export async function transitionPage(id: string, action: string, comment?: string) {
  await requireStaff();
  const r = await transition("pages", id, action, comment);
  revalidatePath(`/admin/pages/${id}`);
  revalidatePath("/admin/pages");
  return r;
}

// ---------------------------------------------------------------------------
// Programmes — content status lives in status_content; `status` is the
// operational programme_status and is editable directly.
// ---------------------------------------------------------------------------

const PROGRAMME_STATUSES = new Set(["open", "closing_soon", "upcoming", "closed", "pilot", "under_development"]);

export async function saveProgramme(prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const session = await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Missing programme id." };

  const deadline = String(formData.get("application_deadline") ?? "");
  const places = String(formData.get("places") ?? "");
  const opStatus = String(formData.get("status") ?? "under_development");
  if (!PROGRAMME_STATUSES.has(opStatus)) return { status: "error", message: "Invalid programme status." };

  let body: unknown = [];
  try {
    body = JSON.parse(String(formData.get("body") ?? "[]"));
    if (!Array.isArray(body)) throw new Error("not an array");
  } catch {
    return { status: "error", message: "Body blocks are malformed." };
  }

  const seo = {
    title: String(formData.get("seo_title") ?? ""),
    description: String(formData.get("seo_description") ?? ""),
  };

  const supabase = await createMutableServerClient();
  const { error } = await supabase
    .from("programmes")
    .update({
      name: String(formData.get("name") ?? ""),
      type: String(formData.get("type") ?? "") || null,
      status: opStatus,
      summary: String(formData.get("summary") ?? ""),
      body,
      duration: String(formData.get("duration") ?? "") || null,
      location: String(formData.get("location") ?? "") || null,
      delivery_mode: String(formData.get("delivery_mode") ?? "") || null,
      certification: String(formData.get("certification") ?? "") || null,
      application_deadline: deadline || null,
      application_open: formData.get("application_open") === "on",
      places: places === "" ? null : Number(places),
      seo,
      updated_by: session.userId,
    })
    .eq("id", id);
  if (error) return { status: "error", message: error.message };

  revalidatePath(`/admin/programmes/${id}`);
  return { status: "success", message: "Programme saved." };
}

export async function transitionProgramme(id: string, action: string, comment?: string) {
  await requireStaff();
  const r = await transition("programmes", id, action, comment);
  revalidatePath(`/admin/programmes/${id}`);
  revalidatePath("/admin/programmes");
  return r;
}

// ---------------------------------------------------------------------------
// Impact metrics — verification chain: value → evidence → verify → approve →
// public. metric_status is a distinct enum, so status changes are direct
// UPDATEs enforced by the guard_metric_state trigger (not transition_content):
// verified needs evidence + verified_by/at; approved needs verified; published
// needs approved; is_public is locked until approved/published.
// ---------------------------------------------------------------------------

const METRIC_UNITS = new Set(["people", "enterprises", "certificates", "percent", "ventures", "partnerships", "count"]);
const METRIC_STATUSES = new Set(["draft", "needs_verification", "verified", "approved", "published"]);

export async function saveMetric(prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const session = await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Missing metric id." };

  const unit = String(formData.get("unit") ?? "count");
  const world = String(formData.get("world") ?? "");
  const programmeId = String(formData.get("programme_id") ?? "");
  if (!METRIC_UNITS.has(unit)) return { status: "error", message: "Invalid unit." };

  const supabase = await createMutableServerClient();
  const { error } = await supabase
    .from("impact_metrics")
    .update({
      name: String(formData.get("name") ?? ""),
      unit,
      description: String(formData.get("description") ?? ""),
      reporting_scope: String(formData.get("reporting_scope") ?? "") || null,
      world: world || null,
      programme_id: programmeId || null,
      updated_by: session.userId,
    })
    .eq("id", id);
  if (error) return { status: "error", message: error.message };

  // Current-period value lives in impact_metric_values (upsert per period).
  const period = String(formData.get("period") ?? "");
  const value = String(formData.get("value") ?? "");
  if (period && value !== "") {
    const { error: vErr } = await supabase
      .from("impact_metric_values")
      .upsert(
        { metric_id: id, period, value: Number(value), note: String(formData.get("note") ?? "") || null },
        { onConflict: "metric_id,period" },
      );
    if (vErr) return { status: "error", message: vErr.message };
  }

  revalidatePath(`/admin/impact-metrics/${id}`);
  return { status: "success", message: "Metric saved." };
}

export async function setMetricStatus(id: string, nextStatus: string) {
  const session = await requireStaff();
  if (!METRIC_STATUSES.has(nextStatus)) return { status: "error" as const, message: "Unknown metric status." };

  // The DB trigger enforces the chain; we stamp the actor fields it requires.
  const patch: Record<string, unknown> = { status: nextStatus, updated_by: session.userId };
  if (nextStatus === "verified") {
    patch.verified_by = session.userId;
    patch.verified_at = new Date().toISOString();
  }
  if (nextStatus === "approved") {
    patch.approved_by = session.userId;
    patch.approved_at = new Date().toISOString();
  }

  const supabase = await createMutableServerClient();
  const { error } = await supabase.from("impact_metrics").update(patch).eq("id", id);
  revalidatePath(`/admin/impact-metrics/${id}`);
  revalidatePath("/admin/impact-metrics");
  return error
    ? { status: "error" as const, message: error.message }
    : { status: "success" as const, message: `Status → ${nextStatus}.` };
}

export async function setMetricPublic(id: string, isPublic: boolean) {
  const session = await requireStaff();
  const supabase = await createMutableServerClient();
  const { error } = await supabase
    .from("impact_metrics")
    .update({ is_public: isPublic, updated_by: session.userId })
    .eq("id", id);
  revalidatePath(`/admin/impact-metrics/${id}`);
  revalidatePath("/admin/impact-metrics");
  return error
    ? { status: "error" as const, message: error.message }
    : { status: "success" as const, message: isPublic ? "Metric is public." : "Metric is private." };
}

// ---------------------------------------------------------------------------
// Homepage sections — site_home_sections.data is a per-key fixed-layout bag.
// ---------------------------------------------------------------------------

export async function saveHomeSection(prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const session = await requireStaff();
  const id = String(formData.get("id") ?? "");
  const site = String(formData.get("site") ?? "");
  if (!id) return { status: "error", message: "Missing section id." };

  const supabase = await createMutableServerClient();

  // Load the row so each submitted field is coerced to its existing type —
  // data__<key> inputs carry scalars and JSON-encoded structures alike.
  const { data: current, error: readErr } = await supabase
    .from("site_home_sections")
    .select("data")
    .eq("id", id)
    .single();
  if (readErr || !current) return { status: "error", message: readErr?.message ?? "Section not found." };

  const next: Record<string, unknown> = { ...(current.data as Record<string, unknown>) };
  for (const [k, raw] of formData.entries()) {
    if (!k.startsWith("data__")) continue;
    const key = k.slice(6);
    const prev = next[key];
    const s = String(raw);
    if (typeof prev === "number") next[key] = s === "" ? prev : Number(s);
    else if (typeof prev === "boolean") next[key] = s === "true";
    else if (typeof prev === "object" && prev !== null) {
      try {
        next[key] = JSON.parse(s);
      } catch {
        return { status: "error", message: `Field "${key}" contains invalid JSON.` };
      }
    } else next[key] = s;
  }

  const { error } = await supabase
    .from("site_home_sections")
    .update({ data: next, is_live: formData.get("is_live") === "on", updated_by: session.userId })
    .eq("id", id);
  if (error) return { status: "error", message: error.message };

  revalidatePath(`/admin/homepage${site ? `?site=${site}` : ""}`);
  return { status: "success", message: "Section saved." };
}

export async function setHomeSectionLive(id: string, site: string, live: boolean) {
  await requireStaff();
  const supabase = await createMutableServerClient();
  const { error } = await supabase.from("site_home_sections").update({ is_live: live }).eq("id", id);
  revalidatePath(`/admin/homepage?site=${site}`);
  return error ? { status: "error" as const, message: error.message } : { status: "success" as const };
}

// ---------------------------------------------------------------------------
// Shared reads for editors (RLS-scoped).
// ---------------------------------------------------------------------------

export async function getStaffProfile() {
  const supabase = await createServerReadClient();
  const session = await requireStaff();
  return { supabase, session };
}

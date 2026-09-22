// Server Actions for applications. Zod → requirePermission("applications")
// on the record's site → mock seam. Decision rules enforced server-side:
// rejection requires a reason (decisions notify the applicant), and only
// forward transitions in ALLOWED_TRANSITIONS are accepted. Real transition
// RPCs + notifications are pending Session B (platform/workflow).
"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/platform/auth/permissions";
import * as data from "./data";
import { ApplicationIdSchema, ApplicationNoteSchema, ApplicationTransitionSchema, AssignReviewerSchema, canTransition } from "./schemas";

export type ActionResult = { ok: true } | { ok: false; error: string };
const ok: ActionResult = { ok: true };
const fail = (error: string): ActionResult => ({ ok: false, error });

export async function assignReviewer(input: unknown): Promise<ActionResult> {
  const parsed = AssignReviewerSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid assignment.");
  const record = data.getApplication(parsed.data.id);
  if (!record) return fail("Application not found.");
  const reviewer = data.REVIEWERS.find((r) => r.id === parsed.data.reviewerId);
  if (!reviewer) return fail("Unknown reviewer.");
  await requirePermission("applications", "full", record.site);
  data.saveApplication(record.id, { reviewer });
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${record.id}`);
  return ok;
}

export async function assignToMe(input: unknown): Promise<ActionResult> {
  const parsed = ApplicationIdSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid request.");
  const record = data.getApplication(parsed.data.id);
  if (!record) return fail("Application not found.");
  const session = await requirePermission("applications", "full", record.site);
  const reviewer =
    data.REVIEWERS.find((r) => r.name === session.fullName) ?? {
      id: `rev-${session.userId}`,
      name: session.fullName,
      initials: session.fullName.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      role: session.role,
    };
  data.saveApplication(record.id, { reviewer, status: record.status === "new" ? "under_review" : record.status });
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${record.id}`);
  return ok;
}

export async function postApplicationNote(input: unknown): Promise<ActionResult> {
  const parsed = ApplicationNoteSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid note.");
  const record = data.getApplication(parsed.data.id);
  if (!record) return fail("Application not found.");
  const session = await requirePermission("applications", "full", record.site);
  if (!data.appendNote(record.id, session.fullName, session.role, parsed.data.body)) return fail("Application not found.");
  revalidatePath(`/admin/applications/${record.id}`);
  return ok;
}

export async function transitionApplication(input: unknown): Promise<ActionResult> {
  const parsed = ApplicationTransitionSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid transition.");
  const { id, target, reason } = parsed.data;
  const record = data.getApplication(id);
  if (!record) return fail("Application not found.");
  if (target === "rejected" && !reason?.trim()) return fail("A reason is required — the applicant is notified of rejections.");
  if (!canTransition(record.status, target)) return fail(`Cannot move from ${record.status} to ${target}.`);
  await requirePermission("applications", "full", record.site);
  data.saveApplication(record.id, {
    status: target,
    stageLabel: target === "accepted" || target === "rejected" ? "Notified" : record.stageLabel,
  });
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${record.id}`);
  return ok;
}

// Server Actions for enquiries. Zod → requirePermission("enquiries") on the
// record's site → mock seam. Workflow per enquiry-detail.html: assign &
// acknowledge moves new → in_progress; transitions are forward-only per
// ALLOWED_ENQUIRY_TRANSITIONS. Notifications/delivery pending Session B.
"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/platform/auth/permissions";
import * as data from "./data";
import { canTransitionEnquiry, EnquiryAssignSchema, EnquiryIdSchema, EnquiryNoteSchema, EnquiryTransitionSchema } from "./schemas";

export type ActionResult = { ok: true } | { ok: false; error: string };
const ok: ActionResult = { ok: true };
const fail = (error: string): ActionResult => ({ ok: false, error });

export async function assignEnquiry(input: unknown): Promise<ActionResult> {
  const parsed = EnquiryAssignSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid assignment.");
  const record = data.getEnquiry(parsed.data.id);
  if (!record) return fail("Enquiry not found.");
  const assignee = data.ASSIGNEES.find((a) => a.id === parsed.data.assigneeId);
  if (!assignee) return fail("Unknown assignee.");
  await requirePermission("enquiries", "full", record.site);
  data.saveEnquiry(record.id, {
    assignee,
    routeLabel: parsed.data.routeLabel || record.routeLabel,
    status: record.status === "new" ? "in_progress" : record.status,
  });
  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${record.id}`);
  return ok;
}

export async function assignEnquiryToMe(input: unknown): Promise<ActionResult> {
  const parsed = EnquiryIdSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid request.");
  const record = data.getEnquiry(parsed.data.id);
  if (!record) return fail("Enquiry not found.");
  const session = await requirePermission("enquiries", "full", record.site);
  const assignee =
    data.ASSIGNEES.find((a) => a.name === session.fullName) ?? {
      id: `rev-${session.userId}`,
      name: session.fullName,
      initials: session.fullName.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      role: session.role,
    };
  data.saveEnquiry(record.id, { assignee, status: record.status === "new" ? "in_progress" : record.status });
  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${record.id}`);
  return ok;
}

export async function postEnquiryNote(input: unknown): Promise<ActionResult> {
  const parsed = EnquiryNoteSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid note.");
  const record = data.getEnquiry(parsed.data.id);
  if (!record) return fail("Enquiry not found.");
  const session = await requirePermission("enquiries", "full", record.site);
  if (!data.appendEnquiryNote(record.id, session.fullName, parsed.data.body)) return fail("Enquiry not found.");
  revalidatePath(`/admin/enquiries/${record.id}`);
  return ok;
}

export async function transitionEnquiry(input: unknown): Promise<ActionResult> {
  const parsed = EnquiryTransitionSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid transition.");
  const record = data.getEnquiry(parsed.data.id);
  if (!record) return fail("Enquiry not found.");
  if (!canTransitionEnquiry(record.status, parsed.data.target)) return fail(`Cannot move from ${record.status} to ${parsed.data.target}.`);
  await requirePermission("enquiries", "full", record.site);
  data.saveEnquiry(record.id, { status: parsed.data.target });
  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${record.id}`);
  return ok;
}

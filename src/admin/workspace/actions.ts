// Server Actions for the workspace surfaces — notifications read-state.
// Notifications are user-scoped: any authenticated, MFA'd staff member may
// mark their own feed read, so the gate is requireAdminSession (not an
// area permission). The underlying store stays mock until Session B's
// notifications table lands.
"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/platform/auth/session";
import { markAllNotificationsRead, markNotificationRead } from "./data";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function markAllRead(): Promise<ActionResult> {
  await requireAdminSession();
  markAllNotificationsRead();
  revalidatePath("/admin/notifications");
  return { ok: true };
}

export async function markRead(input: { id: string }): Promise<ActionResult> {
  await requireAdminSession();
  if (!input?.id) return { ok: false, error: "Missing notification id." };
  markNotificationRead(input.id);
  revalidatePath("/admin/notifications");
  return { ok: true };
}

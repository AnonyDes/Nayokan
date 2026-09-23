// Server Actions for administration — users, role matrix, settings, and the
// dual-approval flow for dangerous changes. Every write requires "full" on
// the owning area (super_admin-only per ROLE_PERMISSIONS) and appends an
// audit entry; dangerous changes additionally need a SECOND super admin to
// confirm before anything is applied — mirroring the design's dual-approval
// banner and Session B's planned approval workflow.
"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/platform/auth/permissions";
import type { AdminSession } from "@/platform/auth/types";
import { ROLE_IDS, type RoleId } from "@/platform/auth/types";
import { ROLE_LABELS } from "@/platform/auth/roles";
import { appendAudit } from "@/admin/audit/data";
import * as data from "./data";
import {
  ApprovalIdSchema,
  DangerZoneSchema,
  InviteUserSchema,
  NotificationPrefSchema,
  OrgSettingsSchema,
  RolePermissionSchema,
  SecuritySchema,
  UserIdSchema,
  UserRoleChangeSchema,
  WebsiteDefaultsSchema,
} from "./schemas";
import type { ApprovalKind } from "./types";

export type ActionResult = { ok: true } | { ok: false; error: string };
const ok: ActionResult = { ok: true };
const fail = (error: string): ActionResult => ({ ok: false, error });

const initialsOf = (name: string) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

function audit(session: AdminSession, entry: Omit<Parameters<typeof appendAudit>[0], "actor" | "initials">) {
  appendAudit({ actor: session.fullName, initials: initialsOf(session.fullName), ...entry });
}

// — users —

export async function inviteUser(input: unknown): Promise<ActionResult> {
  const parsed = InviteUserSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid invitation.");
  const session = await requirePermission("users", "full");
  if (data.getUserByEmail(parsed.data.email)) return fail("A user with that email already exists.");
  data.insertUser({ name: parsed.data.name, email: parsed.data.email, role: parsed.data.role });
  audit(session, { verb: `invited ${parsed.data.email} as`, object: ROLE_LABELS[parsed.data.role], objectType: "User", category: "users", tag: { label: "Dangerous", tone: "dangerous" }, pillLabel: "Invite", pillTone: "info" });
  revalidatePath("/admin/admin/users");
  return ok;
}

/** Dangerous: queues a pending approval — a SECOND super admin must confirm. */
export async function requestUserDisable(input: unknown): Promise<ActionResult> {
  const parsed = UserIdSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid user.");
  const session = await requirePermission("users", "full");
  const user = data.getUser(parsed.data.userId);
  if (!user) return fail("User not found.");
  if (user.status === "disabled") return fail("User is already disabled.");
  data.insertApproval({
    kind: "user_disable",
    label: `Disable ${user.name}`,
    detail: `users · ${user.email}`,
    payload: { userId: user.id },
    requestedBy: session.fullName,
    requestedById: session.userId,
    requestedAt: "Now",
  });
  audit(session, { verb: "requested disabling", object: user.name, objectType: "User", category: "users", tag: { label: "Dangerous", tone: "dangerous" }, pillLabel: "Request", pillTone: "rejected" });
  revalidatePath("/admin/admin/users");
  return ok;
}

/** Dangerous (role escalation): queues a pending approval for confirmation. */
export async function requestUserRoleChange(input: unknown): Promise<ActionResult> {
  const parsed = UserRoleChangeSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid role change.");
  const session = await requirePermission("users", "full");
  const user = data.getUser(parsed.data.userId);
  if (!user) return fail("User not found.");
  if (user.role === parsed.data.role) return fail("User already has that role.");
  data.insertApproval({
    kind: "user_role",
    label: `Change ${user.name} → ${ROLE_LABELS[parsed.data.role]}`,
    detail: `users · ${user.email} · ${ROLE_LABELS[user.role]} → ${ROLE_LABELS[parsed.data.role]}`,
    payload: { userId: user.id, role: parsed.data.role },
    requestedBy: session.fullName,
    requestedById: session.userId,
    requestedAt: "Now",
  });
  audit(session, { verb: "requested role change for", object: user.name, objectType: "User", category: "users", tag: { label: "Dangerous", tone: "dangerous" }, pillLabel: "Request", pillTone: "rejected" });
  revalidatePath("/admin/admin/users");
  return ok;
}

// — role matrix —

/**
 * Edit one matrix cell. Non-dangerous areas apply immediately (with audit);
 * dangerous areas (users / roles / settings) queue a pending approval that a
 * second super admin must confirm — the design's dual-approval rule.
 */
export async function requestRolePermission(input: unknown): Promise<ActionResult> {
  const parsed = RolePermissionSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid permission change.");
  const { role, area, level } = parsed.data;
  const session = await requirePermission("roles", "full");
  const matrix = data.getRoleMatrix();
  if (matrix[role][area] === level) return fail("That is already the current level.");

  if (data.isDangerousArea(area)) {
    data.insertApproval({
      kind: "role_permission",
      label: `${ROLE_LABELS[role]} · ${area} → ${level}`,
      detail: `roles · ${ROLE_LABELS[role]} · ${area} · ${matrix[role][area]} → ${level}`,
      payload: { role, area, level },
      requestedBy: session.fullName,
      requestedById: session.userId,
      requestedAt: "Now",
    });
    audit(session, { verb: "requested permission change", object: `${ROLE_LABELS[role]} · ${area}`, objectType: "Role", category: "users", tag: { label: "Dangerous", tone: "dangerous" }, pillLabel: "Request", pillTone: "rejected" });
  } else {
    data.setRolePermission(role, area, level);
    audit(session, { verb: "changed role permission", object: `${ROLE_LABELS[role]} · ${area} → ${level}`, objectType: "Role", category: "users", pillLabel: "Perm change", pillTone: "rejected" });
  }
  revalidatePath("/admin/admin/roles");
  return ok;
}

// — dual approval —

/** Second super admin confirms a pending change and it is applied. */
export async function confirmApproval(input: unknown): Promise<ActionResult> {
  const parsed = ApprovalIdSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid approval.");
  const session = await requirePermission("users", "full");
  const approval = data.getApproval(parsed.data.approvalId);
  if (!approval) return fail("Approval request not found.");
  if (approval.requestedById === session.userId || approval.requestedBy === session.fullName) {
    return fail("Dual approval requires a different Super Admin than the requester.");
  }

  const applied = applyApproval(approval.kind, approval.payload);
  if (!applied) return fail("Could not apply that change.");
  data.removeApproval(approval.id);
  audit(session, { verb: "approved and applied", object: approval.label, objectType: "Approval", category: "users", tag: { label: "Dangerous", tone: "dangerous" }, pillLabel: "Approve", pillTone: "approved" });
  revalidatePath("/admin/admin/users");
  revalidatePath("/admin/admin/roles");
  revalidatePath("/admin/admin/settings");
  return ok;
}

export async function rejectApproval(input: unknown): Promise<ActionResult> {
  const parsed = ApprovalIdSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid approval.");
  const session = await requirePermission("users", "full");
  const approval = data.getApproval(parsed.data.approvalId);
  if (!approval) return fail("Approval request not found.");
  data.removeApproval(approval.id);
  audit(session, { verb: "rejected pending change", object: approval.label, objectType: "Approval", category: "users", pillLabel: "Reject", pillTone: "rejected" });
  revalidatePath("/admin/admin/users");
  revalidatePath("/admin/admin/roles");
  revalidatePath("/admin/admin/settings");
  return ok;
}

function applyApproval(kind: ApprovalKind, payload: Record<string, string>): boolean {
  switch (kind) {
    case "user_disable": {
      const u = data.getUser(payload.userId);
      return u ? data.saveUser(u.id, { status: "disabled", lastActiveLabel: "Disabled now" }) !== null : false;
    }
    case "user_role": {
      const u = data.getUser(payload.userId);
      return u && (ROLE_IDS as readonly string[]).includes(payload.role) ? data.saveUser(u.id, { role: payload.role as RoleId }) !== null : false;
    }
    case "role_permission": {
      const parsed = RolePermissionSchema.safeParse({ role: payload.role, area: payload.area, level: payload.level });
      if (!parsed.success) return false;
      data.setRolePermission(parsed.data.role, parsed.data.area, parsed.data.level);
      return true;
    }
    case "reset_site":
    case "decommission":
      // Both are recorded in the audit log by the caller; the actual reset /
      // decommission is a Session B workflow, not a mock delete.
      return true;
    default:
      return false;
  }
}

// — settings —

export async function saveOrgSettings(input: unknown): Promise<ActionResult> {
  const parsed = OrgSettingsSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid settings.");
  const session = await requirePermission("settings", "full");
  data.saveOrgSettings(parsed.data);
  audit(session, { verb: "updated organisation settings", object: "Organisation", objectType: "Settings", category: "users", pillLabel: "Update", pillTone: "info" });
  revalidatePath("/admin/admin/settings");
  return ok;
}

export async function saveWebsiteDefaults(input: unknown): Promise<ActionResult> {
  const parsed = WebsiteDefaultsSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid website defaults.");
  const session = await requirePermission("settings", "full");
  data.saveWebsiteDefaults(parsed.data);
  audit(session, { verb: "updated website defaults", object: `Default language → ${parsed.data.defaultLang}`, objectType: "Settings", category: "users", pillLabel: "Update", pillTone: "info" });
  revalidatePath("/admin/admin/settings");
  return ok;
}

export async function setNotificationPref(input: unknown): Promise<ActionResult> {
  const parsed = NotificationPrefSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid preference.");
  const session = await requirePermission("settings", "full");
  if (!data.setNotificationPref(parsed.data.id, parsed.data.channel, parsed.data.on)) return fail("Preference not found.");
  audit(session, { verb: "updated notification preference", object: parsed.data.id, objectType: "Settings", category: "users", pillLabel: "Update", pillTone: "info" });
  revalidatePath("/admin/admin/settings");
  return ok;
}

export async function saveSecuritySettings(input: unknown): Promise<ActionResult> {
  const parsed = SecuritySchema.safeParse(input);
  if (!parsed.success) return fail("Invalid security settings.");
  const session = await requirePermission("settings", "full");
  data.saveSecuritySettings(parsed.data);
  audit(session, { verb: "updated security settings", object: "Security", objectType: "Settings", category: "users", tag: { label: "Dangerous", tone: "dangerous" }, pillLabel: "Update", pillTone: "info" });
  revalidatePath("/admin/admin/settings");
  return ok;
}

/** Danger zone — always queued for a second super admin, never immediate. */
export async function requestDangerZone(input: unknown): Promise<ActionResult> {
  const parsed = DangerZoneSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid request.");
  const session = await requirePermission("settings", "full");
  const label = parsed.data.kind === "reset_site" ? "Reset website to draft" : "Export & delete all data (decommission)";
  data.insertApproval({
    kind: parsed.data.kind,
    label,
    detail: `settings · danger zone · requested by ${session.fullName}`,
    payload: {},
    requestedBy: session.fullName,
    requestedById: session.userId,
    requestedAt: "Now",
  });
  audit(session, { verb: "requested dangerous action", object: label, objectType: "Settings", category: "users", tag: { label: "Dangerous", tone: "dangerous" }, pillLabel: "Request", pillTone: "rejected" });
  revalidatePath("/admin/admin/settings");
  return ok;
}

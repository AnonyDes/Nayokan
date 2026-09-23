import { describe, expect, it, vi } from "vitest";
import { InviteUserSchema, OrgSettingsSchema, RolePermissionSchema, SecuritySchema } from "./schemas";
import { getRoleMatrix, getUser, getUserByEmail, isDangerousArea, listPendingApprovals, listUsers, userStats } from "./data";
import { allAuditEntries } from "@/admin/audit/data";

vi.mock("@/platform/auth/permissions", () => ({
  requirePermission: vi.fn(async () => ({ userId: "u1", email: "t@nayokan.cm", fullName: "Test User", role: "super_admin", siteScopes: ["all"] })),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { confirmApproval, inviteUser, rejectApproval, requestDangerZone, requestRolePermission, requestUserDisable, requestUserRoleChange, saveOrgSettings } from "./actions";

describe("administration schemas", () => {
  it("invite requires a name, email and valid role", () => {
    expect(InviteUserSchema.safeParse({ name: "A T", email: "a@nayokan.cm", role: "reviewer" }).success).toBe(true);
    expect(InviteUserSchema.safeParse({ name: "A T", email: "not-an-email", role: "reviewer" }).success).toBe(false);
    expect(InviteUserSchema.safeParse({ name: "A T", email: "a@nayokan.cm", role: "owner" }).success).toBe(false);
  });

  it("role permission requires a real role, area and level", () => {
    expect(RolePermissionSchema.safeParse({ role: "reviewer", area: "articles", level: "review" }).success).toBe(true);
    expect(RolePermissionSchema.safeParse({ role: "reviewer", area: "nonsense", level: "view" }).success).toBe(false);
    expect(RolePermissionSchema.safeParse({ role: "reviewer", area: "articles", level: "admin" }).success).toBe(false);
  });

  it("security accepts partial updates", () => {
    expect(SecuritySchema.safeParse({ require2fa: true }).success).toBe(true);
    expect(SecuritySchema.safeParse({ sessionTimeout: "45" }).success).toBe(false);
  });

  it("org settings validate the contact email", () => {
    const base = { legalName: "Nayokan", contactEmail: "hello@nayokan.cm", address: "Yaoundé", linkedin: "n", twitter: "n", youtube: "n" };
    expect(OrgSettingsSchema.safeParse(base).success).toBe(true);
    expect(OrgSettingsSchema.safeParse({ ...base, contactEmail: "nope" }).success).toBe(false);
  });
});

describe("users data", () => {
  it("lists users with status and role filters", () => {
    expect(listUsers({}).total).toBe(8);
    expect(listUsers({ status: "disabled" }).rows.every((u) => u.status === "disabled")).toBe(true);
    expect(listUsers({ role: "super_admin" }).rows.every((u) => u.role === "super_admin")).toBe(true);
    expect(listUsers({ q: "ndongo" }).rows[0]?.email).toBe("maria.ndongo@nayokan.cm");
  });

  it("derives stats from the rows", () => {
    const stats = userStats();
    expect(stats.total).toBe(8);
    expect(stats.superAdmins).toBe(2);
    expect(stats.twoFaCoverage).toBeGreaterThan(0);
  });
});

describe("user actions", () => {
  it("inviteUser creates an invited account and audits", async () => {
    const auditsBefore = allAuditEntries().length;
    const res = await inviteUser({ name: "New Staff", email: "new.staff@nayokan.cm", role: "content_editor" });
    expect(res.ok).toBe(true);
    const user = getUserByEmail("new.staff@nayokan.cm");
    expect(user?.status).toBe("invited");
    expect(allAuditEntries().length).toBe(auditsBefore + 1);
    expect(allAuditEntries().at(-1)?.objectType).toBe("User");
  });

  it("inviteUser rejects duplicate emails", async () => {
    const res = await inviteUser({ name: "Dup", email: "maria.ndongo@nayokan.cm", role: "reviewer" });
    expect(res.ok).toBe(false);
  });

  it("requestUserDisable queues a dual approval — no immediate effect", async () => {
    const before = listPendingApprovals().length;
    const res = await requestUserDisable({ userId: "usr-5" });
    expect(res.ok).toBe(true);
    expect(getUser("usr-5")?.status).toBe("active"); // unchanged until confirmed
    expect(listPendingApprovals().length).toBe(before + 1);
    expect(listPendingApprovals().at(-1)?.kind).toBe("user_disable");
  });

  it("requestUserRoleChange queues a dual approval with old → new detail", async () => {
    const res = await requestUserRoleChange({ userId: "usr-7", role: "content_editor" });
    expect(res.ok).toBe(true);
    const approval = listPendingApprovals().at(-1);
    expect(approval?.kind).toBe("user_role");
    expect(approval?.payload.role).toBe("content_editor");
    expect(getUser("usr-7")?.role).toBe("reviewer"); // unchanged until confirmed
  });
});

describe("dual approval", () => {
  it("the requester cannot confirm their own change", async () => {
    await requestUserDisable({ userId: "usr-6" });
    const approval = listPendingApprovals().at(-1)!;
    // Session mock is "Test User" but requestedById is the session userId "u1" —
    // confirm uses the same session, so same-requester must fail.
    const res = await confirmApproval({ approvalId: approval.id });
    expect(res.ok).toBe(false);
    expect(getUser("usr-6")?.status).toBe("active");
  });

  it("a second super admin can confirm — the change applies", async () => {
    const { requirePermission } = await import("@/platform/auth/permissions");
    await requestUserRoleChange({ userId: "usr-3", role: "content_editor" });
    const approval = listPendingApprovals().at(-1)!;
    vi.mocked(requirePermission).mockResolvedValueOnce({ userId: "u2", email: "d@nayokan.cm", fullName: "Second Admin", role: "super_admin", siteScopes: ["all"] } as never);
    const res = await confirmApproval({ approvalId: approval.id });
    expect(res.ok).toBe(true);
    expect(getUser("usr-3")?.role).toBe("content_editor");
    expect(listPendingApprovals().some((a) => a.id === approval.id)).toBe(false);
  });

  it("rejectApproval removes the request without applying", async () => {
    await requestUserDisable({ userId: "usr-4" });
    const approval = listPendingApprovals().at(-1)!;
    const res = await rejectApproval({ approvalId: approval.id });
    expect(res.ok).toBe(true);
    expect(getUser("usr-4")?.status).toBe("active");
    expect(listPendingApprovals().some((a) => a.id === approval.id)).toBe(false);
  });
});

describe("role matrix", () => {
  it("seeds from ROLE_PERMISSIONS", () => {
    const matrix = getRoleMatrix();
    expect(matrix.super_admin.users).toBe("full");
    expect(matrix.reviewer.articles).toBe("review");
    expect(matrix.content_editor.users).toBe("none");
  });

  it("non-dangerous changes apply immediately and audit", async () => {
    const auditsBefore = allAuditEntries().length;
    const res = await requestRolePermission({ role: "reviewer", area: "properties", level: "view" });
    expect(res.ok).toBe(true);
    expect(getRoleMatrix().reviewer.properties).toBe("view");
    expect(allAuditEntries().length).toBe(auditsBefore + 1);
  });

  it("dangerous-area changes queue for dual approval instead", async () => {
    const res = await requestRolePermission({ role: "impact_manager", area: "settings", level: "view" });
    expect(res.ok).toBe(true);
    expect(getRoleMatrix().impact_manager.settings).not.toBe("view");
    expect(listPendingApprovals().at(-1)?.kind).toBe("role_permission");
  });

  it("users / roles / settings are the dangerous areas", () => {
    expect(isDangerousArea("users")).toBe(true);
    expect(isDangerousArea("roles")).toBe(true);
    expect(isDangerousArea("settings")).toBe(true);
    expect(isDangerousArea("articles")).toBe(false);
  });

  it("no-op changes are refused", async () => {
    const res = await requestRolePermission({ role: "super_admin", area: "articles", level: "full" });
    expect(res.ok).toBe(false);
  });
});

describe("settings + danger zone", () => {
  it("saveOrgSettings updates and audits", async () => {
    const auditsBefore = allAuditEntries().length;
    const res = await saveOrgSettings({ legalName: "Nayokan · institution", contactEmail: "hello@nayokan.cm", address: "Yaoundé", linkedin: "nayokan", twitter: "nayokan_cm", youtube: "nayokan" });
    expect(res.ok).toBe(true);
    expect(allAuditEntries().length).toBe(auditsBefore + 1);
  });

  it("danger-zone actions always queue — never apply directly", async () => {
    const before = listPendingApprovals().length;
    const res = await requestDangerZone({ kind: "reset_site" });
    expect(res.ok).toBe(true);
    expect(listPendingApprovals().length).toBe(before + 1);
    expect(listPendingApprovals().at(-1)?.kind).toBe("reset_site");
  });
});

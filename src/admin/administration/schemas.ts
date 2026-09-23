// Zod input contracts for administration actions. Kept out of actions.ts
// ("use server" exports only async functions) and directly unit-testable.
import { z } from "zod";
import { PERMISSION_AREAS, PERMISSION_LEVELS, ROLE_IDS } from "@/platform/auth/types";

export const InviteUserSchema = z.object({
  name: z.string().trim().min(2, "A name is required.").max(80),
  email: z.string().trim().email("A valid email is required."),
  role: z.enum(ROLE_IDS),
});

export const UserRoleChangeSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(ROLE_IDS),
});

export const UserIdSchema = z.object({ userId: z.string().min(1) });

export const RolePermissionSchema = z.object({
  role: z.enum(ROLE_IDS),
  area: z.enum(PERMISSION_AREAS),
  level: z.enum(PERMISSION_LEVELS),
});

export const ApprovalIdSchema = z.object({ approvalId: z.string().min(1) });

export const OrgSettingsSchema = z.object({
  legalName: z.string().trim().min(2).max(160),
  contactEmail: z.string().trim().email("A valid contact email is required."),
  address: z.string().trim().max(400),
  linkedin: z.string().trim().max(80),
  twitter: z.string().trim().max(80),
  youtube: z.string().trim().max(80),
});

export const WebsiteDefaultsSchema = z.object({
  defaultLang: z.enum(["EN", "FR"]),
});

export const NotificationPrefSchema = z.object({
  id: z.string().min(1),
  channel: z.enum(["email", "inApp"]),
  on: z.boolean(),
});

export const SecuritySchema = z.object({
  require2fa: z.boolean().optional(),
  sessionTimeout: z.enum(["15", "30", "60", "240"]).optional(),
  dualApproval: z.boolean().optional(),
});

export const DangerZoneSchema = z.object({
  kind: z.enum(["reset_site", "decommission"]),
});

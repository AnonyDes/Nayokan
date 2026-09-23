// Administration models — users, pending dual-approvals, settings.
// Mirrors Designs/admin/users.html, roles-permissions.html, settings.html.
// DB shapes pending Session B (profiles/user_site_scopes landed; the
// approvals and settings tables are still mock).
import type { Provenance } from "@/platform/content/types";
import type { PermissionArea, PermissionLevel, RoleId } from "@/platform/auth/types";

export type UserStatus = "active" | "disabled" | "invited";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  /** Design subtitle — "Owner · founder", "Programme manager". */
  sub: string;
  role: RoleId;
  status: UserStatus;
  twoFaEnrolled: boolean;
  lastActiveLabel: string;
  /** Days since last activity; null = never. Drives the stale-session stat. */
  lastActiveDays: number | null;
  provenance: Provenance;
}

export type ApprovalKind = "user_disable" | "user_role" | "role_permission" | "reset_site" | "decommission";

/** A dangerous change awaiting a second Super Admin's confirmation. */
export interface PendingApproval {
  id: string;
  kind: ApprovalKind;
  label: string;
  detail: string;
  payload: Record<string, string>;
  requestedBy: string;
  requestedById: string;
  requestedAt: string;
  provenance: Provenance;
}

export interface OrgSettings {
  id: string;
  legalName: string;
  contactEmail: string;
  address: string;
  linkedin: string;
  twitter: string;
  youtube: string;
}

export interface WebsiteDefaults {
  id: string;
  defaultLang: "EN" | "FR";
  supportedLangs: string[];
  ogLabel: string;
}

export interface NotificationPref {
  id: string;
  event: string;
  email: boolean;
  inApp: boolean;
  digest: string;
}

export interface SecuritySettings {
  id: string;
  require2fa: boolean;
  sessionTimeout: string;
  dualApproval: boolean;
}

/** Runtime copy of the role→area matrix rendered by the roles screen. */
export type RoleMatrix = Record<RoleId, Record<PermissionArea, PermissionLevel>>;

export interface UserStats {
  total: number;
  active: number;
  disabled: number;
  invited: number;
  superAdmins: number;
  twoFaCoverage: number;
  stale: number;
}

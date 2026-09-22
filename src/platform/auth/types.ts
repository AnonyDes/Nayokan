// Shared auth/RBAC types. See docs/architecture/readiness-report.md §10 and
// Designs/admin/roles-permissions.html for the source matrix.
import type { SiteId } from "@/platform/sites/types";

export const ROLE_IDS = [
  "super_admin",
  "content_editor",
  "programme_manager",
  "communications",
  "impact_manager",
  "reviewer",
] as const;
export type RoleId = (typeof ROLE_IDS)[number];

export const PERMISSION_AREAS = [
  "pages",
  "articles",
  "stories",
  "media",
  "programmes",
  "applications",
  "people",
  "partners",
  "portfolio",
  "properties",
  "impact_metrics",
  "evidence",
  "website",
  "enquiries",
  "users",
  "roles",
  "audit_log",
  "settings",
] as const;
export type PermissionArea = (typeof PERMISSION_AREAS)[number];

/** Ordered weakest to strongest; `hasPermission` checks `level >= required`. */
export const PERMISSION_LEVELS = ["none", "view", "review", "full"] as const;
export type PermissionLevel = (typeof PERMISSION_LEVELS)[number];

/** A staff member's site scope: a specific site, or "all". Never derived from the client. */
export type SiteScope = SiteId | "all";

export interface StaffProfile {
  userId: string;
  email: string;
  fullName: string;
  role: RoleId;
  siteScopes: SiteScope[];
  mfaEnrolled: boolean;
  status: "active" | "disabled";
}

export interface AdminSession {
  userId: string;
  email: string;
  fullName: string;
  role: RoleId;
  siteScopes: SiteScope[];
}

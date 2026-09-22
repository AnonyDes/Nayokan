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

// Area names must match Session B's `permission_area` enum exactly
// (supabase/migrations/20260922130001_helpers_and_enums.sql) — `ventures` and
// `site_config` are the DB names for what the design calls portfolio and
// website/homepage/navigation/SEO.
export const PERMISSION_AREAS = [
  "pages",
  "articles",
  "stories",
  "media",
  "programmes",
  "applications",
  "people",
  "partners",
  "ventures",
  "properties",
  "impact_metrics",
  "evidence",
  "site_config",
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
  /** `profiles.status` — invited | active | suspended. MFA state is AAL-derived in session.ts, not stored here. */
  status: "invited" | "active" | "suspended";
}

export interface AdminSession {
  userId: string;
  email: string;
  fullName: string;
  role: RoleId;
  siteScopes: SiteScope[];
}

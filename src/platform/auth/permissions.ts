// Central authorization check. ADR-004 / readiness-report §10: the site
// selector and hostname are never security inputs — every mutation and every
// gated read calls requirePermission() here, mirrored by RLS's
// `app.has_permission(area, level, site)` once Session B's schema lands.
// UI hiding (sidebar filtering, disabled buttons) is advisory only and uses
// hasPermission(); it never substitutes for this check.
import "server-only";
import { redirect } from "next/navigation";
import { PERMISSION_LEVELS, type AdminSession, type PermissionArea, type PermissionLevel, type SiteScope } from "./types";
import { ROLE_PERMISSIONS } from "./roles";
import { requireAdminSession } from "./session";

function levelRank(level: PermissionLevel): number {
  return PERMISSION_LEVELS.indexOf(level);
}

function hasSiteScope(scopes: readonly SiteScope[], site: SiteScope | undefined): boolean {
  if (!site) return true; // area isn't site-scoped (e.g. users, audit_log)
  return scopes.includes("all") || scopes.includes(site);
}

/** Pure check for advisory UI decisions. Never the sole gate on a mutation. */
export function hasPermission(session: AdminSession, area: PermissionArea, level: PermissionLevel, site?: SiteScope): boolean {
  const granted = ROLE_PERMISSIONS[session.role][area];
  return levelRank(granted) >= levelRank(level) && hasSiteScope(session.siteScopes, site);
}

/**
 * Call after Zod-validating input, before any read or write a permission
 * should gate. Ensures a real, MFA'd session (via requireAdminSession) AND
 * the role/site check; redirects to /admin/denied on failure rather than
 * throwing, matching Designs/admin/states.html's permission-denied screen.
 */
export async function requirePermission(area: PermissionArea, level: PermissionLevel, site?: SiteScope): Promise<AdminSession> {
  const session = await requireAdminSession();
  if (!hasPermission(session, area, level, site)) {
    redirect("/admin/denied");
  }
  return session;
}

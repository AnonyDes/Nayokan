import { hasPermission } from "@/platform/auth/permissions";
import type { AdminSession } from "@/platform/auth/types";
import { NAV_GROUPS, type NavGroup } from "./nav";

/** Advisory only (readiness-report §10) — the routes themselves call requirePermission(). */
export function filterNav(session: AdminSession): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.require || hasPermission(session, item.require.area, item.require.level, item.require.site)),
  })).filter((group) => group.items.length > 0);
}

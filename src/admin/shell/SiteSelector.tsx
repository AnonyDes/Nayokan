"use client";

import { useRouter } from "next/navigation";
import type { SiteId } from "@/platform/sites/types";

export const SITE_FILTER_COOKIE = "nayokan_admin_site_filter";
export type SiteFilter = SiteId | "all";

const OPTIONS: { value: SiteFilter; label: string }[] = [
  { value: "all", label: "All sites" },
  { value: "corporate", label: "Corporate" },
  { value: "vti", label: "VTI" },
  { value: "startup", label: "Startup Centre" },
];

/**
 * A display filter only — never authorization (ADR-004). Sets a plain
 * (non-HttpOnly) cookie the dashboard/list Server Components read to narrow
 * their queries; requirePermission()'s site scope is the real boundary.
 */
export function SiteSelector({ value }: { value: SiteFilter }) {
  const router = useRouter();

  return (
    <select
      className="ax-select"
      style={{ width: "auto", height: 32 }}
      value={value}
      aria-label="Filter by site"
      onChange={(e) => {
        document.cookie = `${SITE_FILTER_COOKIE}=${e.target.value}; path=/; samesite=lax`;
        router.refresh();
      }}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

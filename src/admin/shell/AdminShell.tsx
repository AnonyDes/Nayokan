import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { requireAdminSession } from "@/platform/auth/session";
import { ROLE_LABELS } from "@/platform/auth/roles";
import { isSiteId } from "@/platform/sites/types";
import { filterNav } from "./filterNav";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { SITE_FILTER_COOKIE, type SiteFilter } from "./SiteSelector";

export async function getSiteFilter(): Promise<SiteFilter> {
  const value = (await cookies()).get(SITE_FILTER_COOKIE)?.value;
  return isSiteId(value) ? value : "all";
}

export async function AdminShell({ children }: { children: ReactNode }) {
  const session = await requireAdminSession();
  const groups = filterNav(session);
  const siteFilter = await getSiteFilter();

  return (
    <div className="ax-app">
      <aside className="ax-sidebar">
        <Sidebar groups={groups} userName={session.fullName} roleLabel={ROLE_LABELS[session.role]} />
      </aside>
      <header className="ax-topbar">
        <Topbar siteFilter={siteFilter} />
      </header>
      <main className="ax-workspace">{children}</main>
    </div>
  );
}

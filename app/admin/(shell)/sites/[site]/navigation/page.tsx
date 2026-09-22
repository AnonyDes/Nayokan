import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/platform/auth/permissions";
import { isSiteId } from "@/platform/sites/types";
import { siteUrl, SITES } from "@/platform/sites/registry";
import { Page, PageHead } from "@/admin/ui/Page";
import { Notice } from "@/admin/ui/Notice";
import { DemoTag } from "@/admin/ui/Feedback";
import { getNavigation } from "@/admin/content/site/data";
import { NavigationEditor } from "@/admin/content/site/NavigationEditor";

export const metadata: Metadata = { title: "Navigation" };

export default async function NavigationPage({ params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;
  if (!isSiteId(site)) notFound();
  await requirePermission("site_config", "view", site);

  const nav = getNavigation(site);
  const cfg = SITES[site];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § G · 04 · Website · Navigation <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title={`Navigation · ${cfg.name}`}
        lede="This site's primary navigation, footer menus and global CTAs. Changes go live within minutes of publish."
        actions={
          <a href={siteUrl(site)} target="_blank" rel="noreferrer" className="ax-btn ax-btn--soft">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 3h7v7M10 14 21 3M21 14v7h-7" />
            </svg>
            View live
          </a>
        }
      />

      <div style={{ marginBottom: 20 }}>
        <Notice tone="warn" title="Navigation changes affect every page on the public website.">
          Renaming, removing or reordering top-level items requires a Super Admin. Changes are confirmed with a preview
          step before going live.
          {nav.pendingConfirmation && " This site's navigation is derived, not yet confirmed — treat entries as provisional."}
        </Notice>
      </div>

      <NavigationEditor site={site} nav={nav} />
    </Page>
  );
}

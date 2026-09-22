import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/platform/auth/permissions";
import { isSiteId } from "@/platform/sites/types";
import { siteUrl, SITES } from "@/platform/sites/registry";
import { Page, PageHead } from "@/admin/ui/Page";
import { Notice } from "@/admin/ui/Notice";
import { DemoTag } from "@/admin/ui/Feedback";
import { getHomepageSections } from "@/admin/content/site/data";
import { SectionedEditor } from "@/admin/content/site/SectionEditor";
import "@/admin/content/site/homepage.css";

export const metadata: Metadata = { title: "Homepage editor" };

export default async function HomepageEditorPage({ params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;
  if (!isSiteId(site)) notFound();
  await requirePermission("site_config", "view", site);

  const sections = getHomepageSections(site);
  const cfg = SITES[site];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § G · 03 · Website · Homepage <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title={`Homepage · ${cfg.name}`}
        lede="The public homepage is built from structured sections. You cannot freely restyle it — this preserves institutional consistency. Reorder, enable, disable, and edit copy within each section."
        actions={
          <a href={siteUrl(site)} target="_blank" rel="noreferrer" className="ax-btn ax-btn--soft">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 3h7v7M10 14 21 3M21 14v7h-7" />
            </svg>
            View live homepage
          </a>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <Notice tone="info" title="Preserve institutional consistency.">
          Homepage sections have fixed layouts by design. Reorder, enable, disable, and edit within each section — Nayokan
          does not permit visual freeform editing here to keep the public site coherent.
        </Notice>
      </div>

      <SectionedEditor site={site} pageId="home" sections={sections} basePath={`/admin/sites/${site}/homepage`} showPreview />
    </Page>
  );
}

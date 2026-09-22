import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/platform/auth/permissions";
import { isSiteId } from "@/platform/sites/types";
import { siteUrl } from "@/platform/sites/registry";
import { Page, PageHead } from "@/admin/ui/Page";
import { Notice } from "@/admin/ui/Notice";
import { DemoTag } from "@/admin/ui/Feedback";
import { getPage } from "@/admin/content/site/data";
import { SectionedEditor } from "@/admin/content/site/SectionEditor";
import "@/admin/content/site/homepage.css";

export const metadata: Metadata = { title: "Page editor" };

export default async function PageEditorPage({ params }: { params: Promise<{ site: string; id: string }> }) {
  const { site, id } = await params;
  if (!isSiteId(site)) notFound();
  await requirePermission("pages", "view", site);

  const page = getPage(site, id);
  if (!page) notFound();

  return (
    <Page>
      <PageHead
        eyebrow={
          <>
            § B · 02 · Content · Page editor <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title={`Page · ${page.title}`}
        lede="Institutional pages are composed of structured sections. Add, reorder or edit sections — layout is fixed to preserve site coherence."
        actions={
          <>
            <a href={`/admin/sites/${site}/pages`} className="ax-btn ax-btn--soft">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11 6 5 12l6 6M5 12h14" />
              </svg>
              Back
            </a>
            <a
              href={siteUrl(site, page.path)}
              target="_blank"
              rel="noreferrer"
              className="ax-btn ax-btn--ghost"
              title="Signed preview lands with the preview contract (Session A); this opens the live path"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Preview
            </a>
          </>
        }
      />

      {page.provenance.isDemo && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="info">
            This page record is mock data pending Session B&apos;s content tables — edits persist for this dev session only.
          </Notice>
        </div>
      )}

      <SectionedEditor site={site} pageId={page.id} sections={page.sections} basePath={`/admin/sites/${site}/pages/${page.id}`} />
    </Page>
  );
}

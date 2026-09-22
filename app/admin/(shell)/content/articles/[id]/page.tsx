import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/platform/auth/permissions";
import { siteUrl } from "@/platform/sites/registry";
import { Page, PageHead } from "@/admin/ui/Page";
import { Notice } from "@/admin/ui/Notice";
import { DemoTag } from "@/admin/ui/Feedback";
import { getArticle } from "@/admin/content/articles/data";
import { ArticleEditor } from "@/admin/content/articles/ArticleEditor";

export const metadata: Metadata = { title: "Article editor" };

export default async function ArticleEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("articles", "view");
  const article = getArticle(id);
  if (!article) notFound();

  const host = new URL(siteUrl(article.site)).host;
  const previewPath = siteUrl(article.site, `/insights/${article.slug}`);

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § B · 03a · Content · Article editor <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title={article.title}
        lede={
          <>
            {article.code} · /insights/{article.slug}
          </>
        }
        actions={
          <Link href="/admin/content/articles" className="ax-btn ax-btn--soft">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M11 6 5 12l6 6M5 12h14" />
            </svg>
            Articles
          </Link>
        }
      />

      {article.provenance.isDemo && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="info">
            This article is mock data pending Session B&apos;s content tables — edits persist for this dev session only.
          </Notice>
        </div>
      )}

      <ArticleEditor article={article} host={host} previewPath={previewPath} />
    </Page>
  );
}

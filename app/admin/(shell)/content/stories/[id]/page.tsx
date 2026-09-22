import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/platform/auth/permissions";
import { siteUrl } from "@/platform/sites/registry";
import { previewHref } from "@/platform/preview/token";
import { Page, PageHead } from "@/admin/ui/Page";
import { Notice } from "@/admin/ui/Notice";
import { DemoTag } from "@/admin/ui/Feedback";
import { getStory } from "@/admin/content/articles/data";
import { StoryEditor } from "@/admin/content/stories/StoryEditor";

export const metadata: Metadata = { title: "Story editor" };

export default async function StoryEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("stories", "view");
  const story = getStory(id);
  if (!story) notFound();

  const host = new URL(siteUrl(story.site)).host;
  const preview = previewHref(story.site, `/stories/${story.slug}`);

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § B · 04a · Content · Story editor <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title={story.title}
        lede={`/stories/${story.slug}`}
        actions={
          <Link href="/admin/content/stories" className="ax-btn ax-btn--soft">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M11 6 5 12l6 6M5 12h14" />
            </svg>
            Stories
          </Link>
        }
      />

      {story.provenance.isDemo && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="info">
            This story is mock data pending Session B&apos;s content tables — edits persist for this dev session only.
          </Notice>
        </div>
      )}

      <StoryEditor story={story} host={host} previewPath={preview.href} previewSigned={preview.signed} />
    </Page>
  );
}

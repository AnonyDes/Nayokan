import type { Metadata } from "next";
import { requirePermission } from "@/platform/auth/permissions";
import { Page, PageHead } from "@/admin/ui/Page";
import { DemoTag } from "@/admin/ui/Feedback";
import { parseListQuery, param } from "@/admin/data/query";
import { listMedia, mediaCounts } from "@/admin/media/data";
import { MediaLibrary, MediaRail, UploadButton } from "@/admin/media/MediaLibrary";

export const metadata: Metadata = { title: "Media library" };

export default async function MediaPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("media", "view");
  const sp = await searchParams;
  const query = parseListQuery(sp);
  const assets = listMedia({ ...query, type: param(sp, "type") ?? "all", collection: param(sp, "collection"), warning: param(sp, "warning"), sort: param(sp, "sort") ?? "newest" });
  const counts = mediaCounts();
  const collections = counts.collections.map((c) => c.name);

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § B · 06 · Content · Media library <DemoTag>Mock data · storage pending</DemoTag>
          </>
        }
        title="Media library"
        lede="Images, video, and documents used across the Nayokan website. All assets require alt text and a source credit before they can be attached to published content."
        actions={
          <>
            <a href="#" className="ax-btn ax-btn--soft" aria-disabled="true" title="Folders pending Session B">
              New folder
            </a>
            <UploadButton collections={collections} />
          </>
        }
      />

      <div className="mlib">
        <MediaRail counts={counts} />
        <MediaLibrary assets={assets} collections={collections} total={counts.total} />
      </div>
    </Page>
  );
}

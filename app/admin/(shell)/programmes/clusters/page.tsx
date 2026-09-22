import type { Metadata } from "next";
import { requirePermission } from "@/platform/auth/permissions";
import { getSiteFilter } from "@/admin/shell/AdminShell";
import { Page, PageHead } from "@/admin/ui/Page";
import { Empty, DemoTag } from "@/admin/ui/Feedback";
import { siteFromParams } from "@/admin/data/query";
import { listClusters } from "@/admin/content/programmes/data";
import { ClusterGrid, NewClusterButton } from "@/admin/content/programmes/EditorModals";

export const metadata: Metadata = { title: "Clusters" };

export default async function ClustersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("programmes", "view");
  const site = siteFromParams(await searchParams) ?? (await getSiteFilter());
  const clusters = listClusters(site);

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § C · 03 · Programmes · Entrepreneurial clusters <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Entrepreneurial clusters"
        lede="Sector-based peer clusters within the Vocational Training Institute — where enterprises train, produce and grow together."
        actions={<NewClusterButton site={site === "all" ? "vti" : site} />}
      />

      {clusters.length === 0 ? <Empty title="No clusters" lede="Add a cluster to begin organising VTI peer enterprises." /> : <ClusterGrid clusters={clusters} />}
    </Page>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/platform/auth/permissions";
import { isSiteId, type SiteId } from "@/platform/sites/types";
import { SITES } from "@/platform/sites/registry";
import { Page, PageHead } from "@/admin/ui/Page";
import { Panel } from "@/admin/ui/Panel";
import { Table, Th } from "@/admin/ui/Table";
import { Pill, type PillTone } from "@/admin/ui/Pill";
import { WorldTag } from "@/admin/ui/Data";
import { ListControls, PaginationControl } from "@/admin/ui/ListControls";
import { Empty, DemoTag } from "@/admin/ui/Feedback";
import { parseListQuery } from "@/admin/data/query";
import { listPages, pageStatusCounts } from "@/admin/content/site/data";
import { PublicToggle } from "@/admin/content/site/PublicToggle";
import { NewPageButton } from "@/admin/content/site/NewPageModal";

export const metadata: Metadata = { title: "Pages" };

const STATUS_TONE: Record<string, PillTone> = {
  published: "published",
  draft: "draft",
  in_review: "review",
  changes_requested: "needs",
  approved: "approved",
  scheduled: "scheduled",
  archived: "archived",
};

const WORLD_VARIANT: Record<string, "vti" | "sc" | "vc" | "hos" | undefined> = {
  vti: "vti",
  startup: "sc",
  venture_capital: "vc",
  hospitality: "hos",
};

export default async function SitePagesPage({ params, searchParams }: {
  params: Promise<{ site: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { site } = await params;
  if (!isSiteId(site)) notFound();
  await requirePermission("pages", "view", site);

  const query = parseListQuery(await searchParams);
  const result = listPages(site, query);
  const counts = pageStatusCounts(site);
  const cfg = SITES[site as SiteId];

  const tabs = [
    { key: "all", label: "All", count: counts.all ?? 0 },
    { key: "published", label: "Published", count: counts.published ?? 0 },
    { key: "draft", label: "Draft", count: counts.draft ?? 0 },
    { key: "in_review", label: "In review", count: counts.in_review ?? 0 },
    { key: "archived", label: "Archived", count: counts.archived ?? 0 },
  ];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § B · 01 · Content · Pages <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title={`Pages · ${cfg.name}`}
        lede="Institutional pages for this site — each composed of structured sections, not free HTML."
        actions={
          <>
            <a href="#" className="ax-btn ax-btn--soft" aria-disabled="true" title="Sitemap export pending Session B">
              Sitemap
            </a>
            <NewPageButton site={site as SiteId} />
          </>
        }
      />

      <Panel>
        <ListControls tabs={tabs} activeTab={query.status} searchPlaceholder="Search pages…" />

        {result.rows.length === 0 ? (
          <Empty title="No pages match" lede="Adjust the filters or create a new page." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th style={{ width: "30%" }}>Page</Th>
                <Th>World</Th>
                <Th>Status</Th>
                <Th>Public</Th>
                <Th>Updated by</Th>
                <Th>Updated</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {result.rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <a href={p.path === "/" ? `/admin/sites/${site}/homepage` : `/admin/sites/${site}/pages/${p.id}`} className="ax-table__title">
                      {p.title}
                    </a>
                    <span className="ax-table__sub">{p.path}</span>
                  </td>
                  <td>{p.world ? <WorldTag world={WORLD_VARIANT[p.world]}>{p.world === "venture_capital" ? "VC" : p.world === "hospitality" ? "Hos" : p.world === "startup" ? "Startup" : "VTI"}</WorldTag> : <WorldTag>All worlds</WorldTag>}</td>
                  <td>
                    <Pill tone={STATUS_TONE[p.status] ?? "neutral"}>{p.status.replace("_", " ")}</Pill>
                  </td>
                  <td>
                    <PublicToggle site={site} pageId={p.id} isPublic={p.isPublic} />
                  </td>
                  <td>{p.updatedBy}</td>
                  <td className="is-mono">{p.updatedAgo}</td>
                  <td />
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <PaginationControl from={result.from} to={result.to} total={result.total} noun="pages" page={result.page} pages={Math.ceil(result.total / result.pageSize)} />
      </Panel>
    </Page>
  );
}

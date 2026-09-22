import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/platform/auth/permissions";
import { getSiteFilter } from "@/admin/shell/AdminShell";
import { Page, PageHead } from "@/admin/ui/Page";
import { Panel } from "@/admin/ui/Panel";
import { Table, Th, RowActions } from "@/admin/ui/Table";
import { Pill, type PillTone } from "@/admin/ui/Pill";
import { Avatar, Empty, DemoTag } from "@/admin/ui/Feedback";
import { WorldTag } from "@/admin/ui/Data";
import { ListControls, PaginationControl } from "@/admin/ui/ListControls";
import { parseListQuery } from "@/admin/data/query";
import { listArticles, articleStatusCounts } from "@/admin/content/articles/data";
import { NewArticleButton } from "@/admin/content/articles/CreateButtons";

export const metadata: Metadata = { title: "Articles" };

const STATUS_TONE: Record<string, PillTone> = {
  draft: "draft",
  in_review: "review",
  changes_requested: "rejected",
  approved: "approved",
  scheduled: "scheduled",
  published: "published",
  archived: "archived",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  in_review: "In review",
  changes_requested: "Changes requested",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

const WORLD_VARIANT: Record<string, "vti" | "sc" | "vc" | "hos" | undefined> = {
  vti: "vti",
  startup: "sc",
  venture_capital: "vc",
  hospitality: "hos",
  corporate: undefined,
};
const WORLD_LABEL: Record<string, string> = { vti: "VTI", startup: "Startup", venture_capital: "VC", hospitality: "Hospitality", corporate: "Corporate" };

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("articles", "view");
  const site = await getSiteFilter();
  const query = parseListQuery(await searchParams);
  const result = listArticles(site, query);
  const counts = articleStatusCounts(site);

  const tabs = [
    { key: "all", label: "All", count: counts.all ?? 0 },
    { key: "draft", label: "Draft", count: counts.draft ?? 0 },
    { key: "in_review", label: "In review", count: counts.in_review ?? 0 },
    { key: "changes_requested", label: "Changes requested", count: counts.changes_requested ?? 0 },
    { key: "scheduled", label: "Scheduled", count: counts.scheduled ?? 0 },
    { key: "published", label: "Published", count: counts.published ?? 0 },
    { key: "archived", label: "Archived", count: counts.archived ?? 0 },
  ];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § B · 03 · Content · Articles &amp; Insights <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Articles"
        lede="Editorial pieces published across the Nayokan ecosystem — insights, essays, programme notes, institutional updates."
        actions={<NewArticleButton site={site === "all" ? "corporate" : site} />}
      />

      <Panel>
        <ListControls tabs={tabs} activeTab={query.status} searchPlaceholder="Search articles…" />

        {result.rows.length === 0 ? (
          <Empty title="No articles match" lede="Adjust the filters or create an article." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th style={{ width: "34%" }}>Title</Th>
                <Th>World</Th>
                <Th>Author</Th>
                <Th>Status</Th>
                <Th>Updated</Th>
                <Th className="is-num">Views · 30d</Th>
                <Th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {result.rows.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Link href={`/admin/content/articles/${a.id}`} className="ax-table__title">
                      {a.title}
                      {a.provenance.isDemo && <DemoTag />}
                    </Link>
                    <span className="ax-table__sub">/insights/{a.slug}</span>
                  </td>
                  <td>{a.world ? <WorldTag world={WORLD_VARIANT[a.world]}>{WORLD_LABEL[a.world]}</WorldTag> : <WorldTag>All worlds</WorldTag>}</td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Avatar initials={a.authorInitials} /> {a.authorName}
                    </span>
                  </td>
                  <td>
                    <Pill tone={STATUS_TONE[a.status]}>{a.statusNote ?? STATUS_LABEL[a.status]}</Pill>
                  </td>
                  <td className="is-mono">{a.updatedAgo}</td>
                  <td className="is-num is-mono">{a.views30d === null ? "—" : a.views30d.toLocaleString()}</td>
                  <td>
                    <RowActions>
                      <Link href={`/admin/content/articles/${a.id}`} className="ax-iconbtn" aria-label={`Edit ${a.title}`}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </Link>
                    </RowActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <PaginationControl from={result.from} to={result.to} total={result.total} noun="articles" page={result.page} pages={Math.ceil(result.total / result.pageSize)} />
      </Panel>
    </Page>
  );
}

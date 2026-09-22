import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/platform/auth/permissions";
import { getSiteFilter } from "@/admin/shell/AdminShell";
import { Page, PageHead } from "@/admin/ui/Page";
import { Panel } from "@/admin/ui/Panel";
import { Table, Th, RowActions } from "@/admin/ui/Table";
import { Pill, type PillTone } from "@/admin/ui/Pill";
import { Empty, DemoTag } from "@/admin/ui/Feedback";
import { Notice } from "@/admin/ui/Notice";
import { ListControls, PaginationControl } from "@/admin/ui/ListControls";
import { parseListQuery } from "@/admin/data/query";
import { listStories, storyStatusCounts } from "@/admin/content/articles/data";
import { NewStoryButton } from "@/admin/content/articles/CreateButtons";

export const metadata: Metadata = { title: "Impact stories" };

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

const TYPE_LABEL: Record<string, string> = {
  beneficiary: "Beneficiary",
  enterprise: "Enterprise",
  cohort: "Cohort",
};

export default async function StoriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("stories", "view");
  const site = await getSiteFilter();
  const query = parseListQuery(await searchParams);
  const result = listStories(site, query);
  const counts = storyStatusCounts(site);

  const tabs = [
    { key: "all", label: "All", count: counts.all ?? 0 },
    { key: "draft", label: "Draft", count: counts.draft ?? 0 },
    { key: "in_review", label: "In review", count: counts.in_review ?? 0 },
    { key: "published", label: "Published", count: counts.published ?? 0 },
    { key: "archived", label: "Archived", count: counts.archived ?? 0 },
  ];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § B · 04 · Content · Impact stories <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Stories"
        lede="Human stories behind the numbers — each requires consent and evidence before publication."
        actions={<NewStoryButton site={site === "all" ? "vti" : site} />}
      />

      <Panel>
        <ListControls tabs={tabs} activeTab={query.status} searchPlaceholder="Search stories…" />

        {result.rows.length === 0 ? (
          <Empty title="No stories match" lede="Adjust the filters or add a story." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th style={{ width: "36%" }}>Story</Th>
                <Th>Type</Th>
                <Th>Programme</Th>
                <Th>Consent</Th>
                <Th>Evidence</Th>
                <Th>Status</Th>
                <Th>Updated</Th>
                <Th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {result.rows.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link href={`/admin/content/stories/${s.id}`} className="ax-table__title">
                      {s.title}
                      {s.provenance.isDemo && <DemoTag />}
                    </Link>
                    <span className="ax-table__sub">/stories/{s.slug}</span>
                  </td>
                  <td>{TYPE_LABEL[s.type]}</td>
                  <td className="ax-mute">{s.programme ?? "—"}</td>
                  <td>{s.consentRecorded ? <Pill tone="verified">Recorded</Pill> : <Pill tone="needs">Required</Pill>}</td>
                  <td>{s.evidenceAttached ? <Pill tone="verified">Attached</Pill> : <Pill tone="needs">Missing</Pill>}</td>
                  <td>
                    <Pill tone={STATUS_TONE[s.status]}>{STATUS_LABEL[s.status]}</Pill>
                  </td>
                  <td className="is-mono">{s.updatedAgo}</td>
                  <td>
                    <RowActions>
                      <Link href={`/admin/content/stories/${s.id}`} className="ax-iconbtn" aria-label={`Edit ${s.title}`}>
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

        <PaginationControl from={result.from} to={result.to} total={result.total} noun="stories" page={result.page} pages={Math.ceil(result.total / result.pageSize)} />
      </Panel>

      <div style={{ marginTop: 16 }}>
        <Notice tone="info">
          Consent and evidence are <strong>publish-time gates</strong>, enforced server-side by the workflow RPC — recording
          them here is the author&apos;s declaration, not the check itself.
        </Notice>
      </div>
    </Page>
  );
}

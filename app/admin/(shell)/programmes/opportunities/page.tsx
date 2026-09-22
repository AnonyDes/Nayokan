import type { Metadata } from "next";
import { requirePermission } from "@/platform/auth/permissions";
import { getSiteFilter } from "@/admin/shell/AdminShell";
import { Page, PageHead } from "@/admin/ui/Page";
import { Panel } from "@/admin/ui/Panel";
import { Table, Th } from "@/admin/ui/Table";
import type { PillTone } from "@/admin/ui/Pill";
import { Empty, DemoTag } from "@/admin/ui/Feedback";
import { ListControls, PaginationControl } from "@/admin/ui/ListControls";
import { parseListQuery, siteFromParams } from "@/admin/data/query";
import { expiredOpportunityCount, listOpportunities, opportunityStatusCounts } from "@/admin/content/programmes/data";
import { NewOpportunityButton } from "@/admin/content/programmes/EditorModals";
import { OpportunityRow } from "@/admin/content/programmes/OpportunityRow";
import type { OpportunityStatus } from "@/admin/content/programmes/types";

export const metadata: Metadata = { title: "Opportunities" };

const STATUS_TONE: Record<OpportunityStatus, PillTone> = {
  open: "open",
  closing: "closing",
  upcoming: "upcoming",
  expired: "expired",
  archived: "archived",
};

const STATUS_LABEL: Record<OpportunityStatus, string> = {
  open: "Open",
  closing: "Closing",
  upcoming: "Upcoming",
  expired: "Expired",
  archived: "Archived",
};

const WORLD_VARIANT: Record<string, "vti" | "sc" | "vc" | "hos" | undefined> = {
  vti: "vti",
  startup: "sc",
  venture_capital: "vc",
  hospitality: "hos",
};
const WORLD_LABEL: Record<string, string> = { vti: "VTI", startup: "SC", venture_capital: "VC", hospitality: "Hospitality", corporate: "Corporate" };

export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("programmes", "view");
  const sp = await searchParams;
  const site = siteFromParams(sp) ?? (await getSiteFilter());
  const query = parseListQuery(sp);
  const result = listOpportunities(site, query);
  const counts = opportunityStatusCounts(site);
  const expired = expiredOpportunityCount(site);

  const tabs = [
    { key: "all", label: "All", count: counts.all ?? 0 },
    { key: "open", label: "Open", count: counts.open ?? 0 },
    { key: "closing", label: "Closing soon", count: counts.closing ?? 0 },
    { key: "upcoming", label: "Upcoming", count: counts.upcoming ?? 0 },
    { key: "expired", label: "Expired", count: counts.expired ?? 0 },
    { key: "archived", label: "Archived", count: counts.archived ?? 0 },
  ];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § C · 04 · Programmes · Opportunities <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Opportunities"
        lede="Grants, calls, residencies and open positions that Nayokan promotes. Expired opportunities are automatically marked closed after 24h."
        actions={
          <>
            <a href="#" className="ax-btn ax-btn--soft" aria-disabled="true" title="Auto-close runs as a scheduled job on the backend — pending Session B">
              Auto-close expired · {expired} pending
            </a>
            <NewOpportunityButton site={site === "all" ? "startup" : site} />
          </>
        }
      />

      <Panel>
        <ListControls tabs={tabs} activeTab={query.status} />

        {result.rows.length === 0 ? (
          <Empty title="No opportunities match" lede="Adjust the filters or add an opportunity." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th style={{ width: "30%" }}>Opportunity</Th>
                <Th>Category</Th>
                <Th>World</Th>
                <Th>Deadline</Th>
                <Th>Status</Th>
                <Th>Public</Th>
                <Th style={{ width: 60 }} />
              </tr>
            </thead>
            <tbody>
              {result.rows.map((o) => (
                <OpportunityRow key={o.id} opportunity={o} statusTone={STATUS_TONE[o.status]} statusLabel={STATUS_LABEL[o.status]} worldVariant={o.world ? WORLD_VARIANT[o.world] : undefined} worldLabel={o.world ? WORLD_LABEL[o.world] : "—"} />
              ))}
            </tbody>
          </Table>
        )}

        <PaginationControl from={result.from} to={result.to} total={result.total} noun="opportunities" page={result.page} pages={Math.ceil(result.total / result.pageSize)} />
      </Panel>
    </Page>
  );
}

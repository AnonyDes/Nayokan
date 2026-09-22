import type { Metadata } from "next";
import { requirePermission } from "@/platform/auth/permissions";
import { getSiteFilter } from "@/admin/shell/AdminShell";
import { Page, PageHead } from "@/admin/ui/Page";
import { Panel } from "@/admin/ui/Panel";
import { Table, Th } from "@/admin/ui/Table";
import { Empty, DemoTag } from "@/admin/ui/Feedback";
import { Notice } from "@/admin/ui/Notice";
import { ListControls, PaginationControl } from "@/admin/ui/ListControls";
import { parseListQuery, siteFromParams, param } from "@/admin/data/query";
import { listVentures, ventureStageCounts } from "@/admin/content/ecosystem/data";
import { NewVentureButton, VentureRow } from "@/admin/content/ecosystem/EcoModals";

export const metadata: Metadata = { title: "Portfolio" };

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("ventures", "view");
  const sp = await searchParams;
  const site = siteFromParams(sp) ?? (await getSiteFilter());
  const query = parseListQuery(sp);
  const stage = param(sp, "stage") ?? "all";
  const result = listVentures(site, { ...query, stage });
  const counts = ventureStageCounts(site);

  const tabs = [
    { key: "all", label: "All", count: counts.all ?? 0 },
    { key: "pipeline", label: "Pipeline", count: counts.pipeline ?? 0 },
    { key: "active", label: "Invested", count: counts.active ?? 0 },
    { key: "exited", label: "Exited", count: counts.exited ?? 0 },
  ];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § E · 04 · Ecosystem · VC portfolio <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Portfolio"
        lede="Ventures in Nayokan's Venture Capital pipeline and post-investment portfolio. No financial figures are recorded here unless externally verified and disclosed with venture consent."
        actions={
          <>
            <a href="#" className="ax-btn ax-btn--soft" aria-disabled="true" title="Export pending Session B">
              Export
            </a>
            <NewVentureButton />
          </>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <Notice tone="warn" title="No fake financials.">
          Investment amounts, valuations and ownership percentages are only recorded when supplied and verified. Do not fabricate financial figures for demo purposes.
        </Notice>
      </div>

      <Panel>
        <ListControls tabs={tabs} activeTab={stage} tabsParam="stage" searchPlaceholder="Search ventures…" />

        {result.rows.length === 0 ? (
          <Empty title="No ventures match" lede="Adjust the filters or add a venture." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th style={{ width: "24%" }}>Venture</Th>
                <Th>Sector</Th>
                <Th>Stage</Th>
                <Th>Location</Th>
                <Th>Related programme</Th>
                <Th>Status</Th>
                <Th>Public</Th>
                <Th style={{ width: 60 }} />
              </tr>
            </thead>
            <tbody>
              {result.rows.map((v) => (
                <VentureRow key={v.id} venture={v} />
              ))}
            </tbody>
          </Table>
        )}

        <PaginationControl from={result.from} to={result.to} total={result.total} noun="ventures" page={result.page} pages={Math.ceil(result.total / result.pageSize)} />
      </Panel>
    </Page>
  );
}

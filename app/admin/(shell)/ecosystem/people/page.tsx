import type { Metadata } from "next";
import { requirePermission } from "@/platform/auth/permissions";
import { getSiteFilter } from "@/admin/shell/AdminShell";
import { Page, PageHead } from "@/admin/ui/Page";
import { Panel } from "@/admin/ui/Panel";
import { Table, Th } from "@/admin/ui/Table";
import { Empty, DemoTag } from "@/admin/ui/Feedback";
import { ListControls, PaginationControl } from "@/admin/ui/ListControls";
import { parseListQuery, siteFromParams, param } from "@/admin/data/query";
import { listPeople, peopleDivisionCounts } from "@/admin/content/ecosystem/data";
import { NewPersonButton, PersonRow } from "@/admin/content/ecosystem/EcoModals";

export const metadata: Metadata = { title: "People" };

export default async function PeoplePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("people", "view");
  const sp = await searchParams;
  const site = siteFromParams(sp) ?? (await getSiteFilter());
  const query = parseListQuery(sp);
  const division = param(sp, "division") ?? "all";
  const result = listPeople(site, { ...query, division });
  const counts = peopleDivisionCounts(site);

  const tabs = [
    { key: "all", label: "All", count: counts.all ?? 0 },
    { key: "leadership", label: "Leadership", count: counts.leadership ?? 0 },
    { key: "programme", label: "Programme leads", count: counts.programme ?? 0 },
    { key: "advisor", label: "Advisors", count: counts.advisor ?? 0 },
  ];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § E · 01 · Ecosystem · People <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="People"
        lede="Leadership, programme leads and advisors visible on the public Nayokan site. Each record requires explicit publish consent before appearing publicly."
        actions={
          <>
            <a href="#" className="ax-btn ax-btn--soft" aria-disabled="true" title="Drag reorder pending Session B">
              Reorder
            </a>
            <NewPersonButton />
          </>
        }
      />

      <Panel>
        <ListControls tabs={tabs} activeTab={division} tabsParam="division" searchPlaceholder="Search people…" />

        {result.rows.length === 0 ? (
          <Empty title="No people match" lede="Adjust the filters or add a person." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th style={{ width: "24%" }}>Person</Th>
                <Th>Position</Th>
                <Th>Division</Th>
                <Th>Photo</Th>
                <Th>Bio</Th>
                <Th>Order</Th>
                <Th>Public</Th>
                <Th style={{ width: 60 }} />
              </tr>
            </thead>
            <tbody>
              {result.rows.map((p) => (
                <PersonRow key={p.id} person={p} />
              ))}
            </tbody>
          </Table>
        )}

        <PaginationControl from={result.from} to={result.to} total={result.total} noun="people" page={result.page} pages={Math.ceil(result.total / result.pageSize)} />
      </Panel>
    </Page>
  );
}

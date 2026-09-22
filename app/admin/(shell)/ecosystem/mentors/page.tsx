import type { Metadata } from "next";
import { requirePermission } from "@/platform/auth/permissions";
import { getSiteFilter } from "@/admin/shell/AdminShell";
import { Page, PageHead } from "@/admin/ui/Page";
import { Panel } from "@/admin/ui/Panel";
import { Table, Th } from "@/admin/ui/Table";
import { Empty, DemoTag } from "@/admin/ui/Feedback";
import { ListControls, PaginationControl } from "@/admin/ui/ListControls";
import { parseListQuery, siteFromParams, param } from "@/admin/data/query";
import { listMentors, mentorSectors, mentorStatusCounts } from "@/admin/content/ecosystem/data";
import { MentorRow, NewMentorButton } from "@/admin/content/ecosystem/EcoModals";

export const metadata: Metadata = { title: "Mentors" };

export default async function MentorsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("people", "view");
  const sp = await searchParams;
  const site = siteFromParams(sp) ?? (await getSiteFilter());
  const query = parseListQuery(sp);
  const sector = param(sp, "sector") ?? "all";
  const result = listMentors(site, { ...query, sector });
  const counts = mentorStatusCounts(site);
  const sectors = mentorSectors(site);

  const tabs = [
    { key: "all", label: "All", count: counts.all ?? 0 },
    { key: "active", label: "Active", count: counts.active ?? 0 },
    { key: "inactive", label: "Inactive", count: counts.inactive ?? 0 },
    { key: "draft", label: "Draft", count: counts.draft ?? 0 },
  ];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § E · 02 · Ecosystem · Startup Centre mentors <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Mentors"
        lede="Volunteer and contracted mentors supporting Startup Centre cohorts. Availability is set per-mentor and affects programme matching."
        actions={
          <>
            <a href="#" className="ax-btn ax-btn--soft" aria-disabled="true" title="Export pending Session B">
              Export directory
            </a>
            <NewMentorButton />
          </>
        }
      />

      <Panel>
        <ListControls
          tabs={tabs}
          activeTab={query.status ?? "all"}
          searchPlaceholder="Search mentors…"
          filters={[
            {
              key: "sector",
              label: "Sector",
              options: [{ value: "", label: "Any" }, ...sectors.map((s) => ({ value: s, label: s }))],
            },
          ]}
        />

        {result.rows.length === 0 ? (
          <Empty title="No mentors match" lede="Adjust the filters or add a mentor." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th style={{ width: "22%" }}>Mentor</Th>
                <Th>Expertise</Th>
                <Th>Sector</Th>
                <Th>Availability</Th>
                <Th>Cohort</Th>
                <Th>Status</Th>
                <Th>Public</Th>
                <Th style={{ width: 60 }} />
              </tr>
            </thead>
            <tbody>
              {result.rows.map((m) => (
                <MentorRow key={m.id} mentor={m} />
              ))}
            </tbody>
          </Table>
        )}

        <PaginationControl from={result.from} to={result.to} total={result.total} noun="mentors" page={result.page} pages={Math.ceil(result.total / result.pageSize)} />
      </Panel>
    </Page>
  );
}

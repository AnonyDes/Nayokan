import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/platform/auth/permissions";
import { getSiteFilter } from "@/admin/shell/AdminShell";
import { Page, PageHead } from "@/admin/ui/Page";
import { Panel } from "@/admin/ui/Panel";
import { Table, Th, RowActions } from "@/admin/ui/Table";
import { Pill } from "@/admin/ui/Pill";
import { Empty, DemoTag } from "@/admin/ui/Feedback";
import { ListControls, PaginationControl } from "@/admin/ui/ListControls";
import { parseListQuery, siteFromParams, param } from "@/admin/data/query";
import { enquiryAssignees, enquiryStatusCounts, listEnquiries } from "@/admin/operations/enquiries/data";
import { CATEGORY_LABEL, ENQUIRY_PILL } from "@/admin/operations/enquiries/labels";

export const metadata: Metadata = { title: "Enquiries" };

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("enquiries", "view");
  const sp = await searchParams;
  const site = siteFromParams(sp) ?? (await getSiteFilter());
  const query = parseListQuery(sp);
  const result = listEnquiries(site, {
    ...query,
    category: param(sp, "category") ?? "all",
    assigned: param(sp, "assigned") ?? "all",
  });
  const counts = enquiryStatusCounts(site);
  const assignees = enquiryAssignees(site);

  const tabs = [
    { key: "all", label: "All", count: counts.all ?? 0 },
    { key: "new", label: "New", count: counts.new ?? 0 },
    { key: "in_progress", label: "In progress", count: counts.in_progress ?? 0 },
    { key: "resolved", label: "Resolved", count: counts.resolved ?? 0 },
  ];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § G · 01 · Operations · Enquiries <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Enquiries"
        lede="Inbound messages from the public Nayokan website — from partnerships to hospitality bookings. Every enquiry is assigned, tracked and resolved."
        actions={
          <>
            <a href="#" className="ax-btn ax-btn--soft" aria-disabled="true" title="Export pending Session B">
              Export
            </a>
            <a href="#" className="ax-btn ax-btn--primary" aria-disabled="true" title="Bulk assign pending Session B">
              Assign selected
            </a>
          </>
        }
      />

      <Panel>
        <ListControls
          tabs={tabs}
          activeTab={query.status ?? "all"}
          searchPlaceholder="Search enquiries…"
          filters={[
            {
              key: "category",
              label: "Category",
              options: [{ value: "", label: "All" }, ...Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label }))],
            },
            {
              key: "assigned",
              label: "Assigned",
              options: [
                { value: "", label: "Any" },
                { value: "unassigned", label: "Unassigned" },
                ...assignees.map((a) => ({ value: a.id, label: a.name })),
              ],
            },
          ]}
        />

        <Table>
          <thead>
            <tr>
              <Th style={{ width: "22%" }}>Contact</Th>
              <Th>Organization</Th>
              <Th>Category</Th>
              <Th>Source page</Th>
              <Th>Received</Th>
              <Th>Assigned</Th>
              <Th>Status</Th>
              <Th style={{ width: 60 }} />
            </tr>
          </thead>
          <tbody>
            {result.rows.map((e) => (
              <tr key={e.id}>
                <td>
                  <Link href={`/admin/enquiries/${e.id}`} className="ax-table__title">
                    {e.title} {e.provenance.isDemo && <DemoTag />}
                  </Link>
                  <span className="ax-table__sub">{e.email}</span>
                </td>
                <td>{e.orgLabel}</td>
                <td>
                  <Pill tone="info">{CATEGORY_LABEL[e.category]}</Pill>
                </td>
                <td className="is-mono">{e.sourcePage}</td>
                <td className="is-mono">{e.receivedAgo}</td>
                <td>{e.assignee?.name ?? "—"}</td>
                <td>
                  <Pill tone={ENQUIRY_PILL[e.status].tone}>{ENQUIRY_PILL[e.status].label}</Pill>
                </td>
                <td>
                  <RowActions>
                    <Link href={`/admin/enquiries/${e.id}`} className="ax-iconbtn" aria-label={`Open ${e.title}`}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="5" cy="12" r="1.6" />
                        <circle cx="12" cy="12" r="1.6" />
                        <circle cx="19" cy="12" r="1.6" />
                      </svg>
                    </Link>
                  </RowActions>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {result.rows.length === 0 && <Empty title="No enquiries match" lede="Adjust the filters or status tab." />}
        <PaginationControl from={result.from} to={result.to} total={result.total} noun="enquiries" page={result.page} pages={Math.ceil(result.total / result.pageSize)} />
      </Panel>
    </Page>
  );
}

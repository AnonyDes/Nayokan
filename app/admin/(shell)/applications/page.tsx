import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/platform/auth/permissions";
import { getSiteFilter } from "@/admin/shell/AdminShell";
import { Page, PageHead } from "@/admin/ui/Page";
import { Panel } from "@/admin/ui/Panel";
import { Table, Th } from "@/admin/ui/Table";
import { Pill } from "@/admin/ui/Pill";
import { WorldTag } from "@/admin/ui/Data";
import { Empty, DemoTag } from "@/admin/ui/Feedback";
import { ListControls } from "@/admin/ui/ListControls";
import { parseListQuery, siteFromParams, param } from "@/admin/data/query";
import { applicationProgrammes, applicationReviewers, applicationStatusCounts, listApplications } from "@/admin/operations/applications/data";
import { KanbanBoard, STATUS_PILL, ViewToggle } from "@/admin/operations/applications/ApplicationsClient";
import "@/admin/operations/applications/applications.css";

export const metadata: Metadata = { title: "Applications" };

const WORLD_VARIANT: Record<string, "vti" | "sc" | undefined> = { vti: "vti", startup: "sc" };
const WORLD_LABEL: Record<string, string> = { vti: "VTI", startup: "Startup" };

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("applications", "view");
  const sp = await searchParams;
  const site = siteFromParams(sp) ?? (await getSiteFilter());
  const query = parseListQuery(sp);
  const view = param(sp, "view") ?? "kanban";
  const result = listApplications(site, {
    ...query,
    world: param(sp, "world") ?? "all",
    programme: param(sp, "programme"),
    reviewer: param(sp, "reviewer") ?? "all",
  });
  const counts = applicationStatusCounts(site);
  const programmes = applicationProgrammes(site);
  const reviewers = applicationReviewers(site);

  const tabs = [
    { key: "all", label: "All", count: counts.all ?? 0 },
    { key: "new", label: "New", count: counts.new ?? 0 },
    { key: "under_review", label: "Under review", count: counts.under_review ?? 0 },
    { key: "shortlisted", label: "Shortlisted", count: counts.shortlisted ?? 0 },
    { key: "accepted", label: "Accepted", count: counts.accepted ?? 0 },
    { key: "rejected", label: "Rejected", count: counts.rejected ?? 0 },
    { key: "archived", label: "Archived", count: counts.archived ?? 0 },
  ];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § D · 01 · Programmes · Applications <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Applications"
        lede="Every applicant who reached Nayokan through the public website — filtered, assigned and moved through decision."
        actions={
          <>
            <a href="#" className="ax-btn ax-btn--soft" aria-disabled="true" title="Export pending Session B">
              Export CSV
            </a>
            <ViewToggle />
          </>
        }
      />

      <Panel>
        <ListControls
          tabs={tabs}
          activeTab={query.status ?? "all"}
          searchPlaceholder="Search applicants, programmes…"
          filters={[
            {
              key: "world",
              label: "World",
              options: [
                { value: "", label: "All" },
                { value: "vti", label: "VTI" },
                { value: "startup", label: "Startup" },
                { value: "opportunity", label: "Opportunity" },
              ],
            },
            { key: "programme", label: "Programme", options: [{ value: "", label: "Any" }, ...programmes.map((p) => ({ value: p.id, label: p.label }))] },
            {
              key: "reviewer",
              label: "Reviewer",
              options: [{ value: "", label: "Any" }, { value: "unassigned", label: "Unassigned" }, ...reviewers.map((r) => ({ value: r.id, label: r.name }))],
            },
          ]}
        />
      </Panel>

      <div style={{ marginTop: 16 }}>
        {result.rows.length === 0 ? (
          <Empty title="No applications match" lede="Adjust the filters or status tab." />
        ) : view === "table" ? (
          <Panel>
            <Table>
              <thead>
                <tr>
                  <Th style={{ width: "26%" }}>Applicant</Th>
                  <Th>Programme</Th>
                  <Th>World</Th>
                  <Th>Status</Th>
                  <Th>Reviewer</Th>
                  <Th>Submitted</Th>
                  <Th style={{ width: 60 }} />
                </tr>
              </thead>
              <tbody>
                {result.rows.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <Link href={`/admin/applications/${a.id}`} className="ax-table__title">
                        #{a.code}
                        {a.provenance.isDemo && <DemoTag />}
                      </Link>
                      <span className="ax-table__sub">{a.applicantLabel}</span>
                    </td>
                    <td>{a.programmeLabel}</td>
                    <td>{a.world ? <WorldTag world={WORLD_VARIANT[a.world]}>{WORLD_LABEL[a.world]}</WorldTag> : <WorldTag>Opportunity</WorldTag>}</td>
                    <td>
                      <Pill tone={STATUS_PILL[a.status].tone}>{STATUS_PILL[a.status].label}</Pill>
                    </td>
                    <td>{a.reviewer?.name ?? "—"}</td>
                    <td className="is-mono">{a.submittedAgo}</td>
                    <td />
                  </tr>
                ))}
              </tbody>
            </Table>
          </Panel>
        ) : (
          <KanbanBoard apps={result.rows} />
        )}
      </div>
    </Page>
  );
}

import type { Metadata } from "next";
import { requirePermission } from "@/platform/auth/permissions";
import { getSiteFilter } from "@/admin/shell/AdminShell";
import { Page, PageHead } from "@/admin/ui/Page";
import { Panel } from "@/admin/ui/Panel";
import { Table, Th, RowActions } from "@/admin/ui/Table";
import { Pill } from "@/admin/ui/Pill";
import { Empty, DemoTag } from "@/admin/ui/Feedback";
import { ListControls, PaginationControl } from "@/admin/ui/ListControls";
import { parseListQuery, siteFromParams, param } from "@/admin/data/query";
import { evidenceTypeCounts, listEvidence } from "@/admin/operations/impact/data";
import { EVIDENCE_STATUS_PILL, EVIDENCE_TYPE_LABEL } from "@/admin/operations/impact/labels";
import { EvidenceRowActions, UploadEvidenceButton } from "@/admin/operations/impact/ImpactClient";

export const metadata: Metadata = { title: "Evidence library" };

export default async function EvidencePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("evidence", "view");
  const sp = await searchParams;
  const site = siteFromParams(sp) ?? (await getSiteFilter());
  const query = parseListQuery(sp);
  const result = listEvidence(site, { ...query, linked: param(sp, "linked") });
  const counts = evidenceTypeCounts(site);

  const tabs = [
    { key: "all", label: "All", count: counts.all ?? 0 },
    { key: "report", label: "Reports", count: counts.report ?? 0 },
    { key: "programme_record", label: "Programme records", count: counts.programme_record ?? 0 },
    { key: "spreadsheet", label: "Spreadsheets", count: counts.spreadsheet ?? 0 },
    { key: "photo", label: "Photos", count: counts.photo ?? 0 },
  ];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § F · 03 · Impact · Evidence library <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Evidence library"
        lede="Source documents, reports, programme records and spreadsheets that back every verified impact metric. Every evidence item is timestamped and immutable."
        actions={
          <>
            <a
              href={param(sp, "linked") === "unlinked" ? "?" : "?linked=unlinked"}
              className="ax-btn ax-btn--soft"
              title="Show evidence not yet linked to a metric"
            >
              Filter · Unlinked
            </a>
            <UploadEvidenceButton />
          </>
        }
      />

      <Panel>
        <ListControls tabs={tabs} activeTab={query.status ?? "all"} searchPlaceholder="Search evidence…" />

        <Table>
          <thead>
            <tr>
              <Th style={{ width: "34%" }}>Evidence</Th>
              <Th>Type</Th>
              <Th>Related metric</Th>
              <Th>Uploaded by</Th>
              <Th>Date</Th>
              <Th>Status</Th>
              <Th style={{ width: 200 }} />
            </tr>
          </thead>
          <tbody>
            {result.rows.map((e) => (
              <tr key={e.id}>
                <td>
                  <span className="ax-table__title">
                    {e.title} {e.provenance.isDemo && <DemoTag />}
                  </span>
                  <span className="ax-table__sub">Evidence · #{e.code}</span>
                </td>
                <td className="is-mono">{EVIDENCE_TYPE_LABEL[e.type]}</td>
                <td>{e.relatedLabel}</td>
                <td>{e.uploadedBy}</td>
                <td className="is-mono">{e.uploadedAt}</td>
                <td>
                  <Pill tone={EVIDENCE_STATUS_PILL[e.status].tone}>{EVIDENCE_STATUS_PILL[e.status].label}</Pill>
                </td>
                <td>
                  <RowActions>
                    <EvidenceRowActions item={e} />
                  </RowActions>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {result.rows.length === 0 && <Empty title="No evidence matches" lede="Adjust the type tab or search." />}
        <PaginationControl from={result.from} to={result.to} total={result.total} noun="records" page={result.page} pages={Math.ceil(result.total / result.pageSize)} />
      </Panel>
    </Page>
  );
}

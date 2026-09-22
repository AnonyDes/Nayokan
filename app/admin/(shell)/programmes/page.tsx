import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/platform/auth/permissions";
import { getSiteFilter } from "@/admin/shell/AdminShell";
import { Page, PageHead } from "@/admin/ui/Page";
import { Panel } from "@/admin/ui/Panel";
import { Table, Th, RowActions } from "@/admin/ui/Table";
import { Pill, type PillTone } from "@/admin/ui/Pill";
import { Empty, DemoTag } from "@/admin/ui/Feedback";
import { WorldTag } from "@/admin/ui/Data";
import { ListControls, PaginationControl } from "@/admin/ui/ListControls";
import { parseListQuery, siteFromParams, param } from "@/admin/data/query";
import { listProgrammes, programmeTabCounts } from "@/admin/content/programmes/data";
import { NewProgrammeButton } from "@/admin/content/programmes/EditorModals";
import { VisibilityToggle } from "@/admin/content/programmes/VisibilityToggle";
import type { ProgrammeStatus } from "@/admin/content/programmes/types";

export const metadata: Metadata = { title: "Programmes" };

const STATUS_TONE: Record<ProgrammeStatus, PillTone> = {
  open: "open",
  closing: "closing",
  draft: "draft",
  upcoming: "upcoming",
  closed: "closed",
  archived: "archived",
};

const STATUS_LABEL: Record<ProgrammeStatus, string> = {
  open: "Open",
  closing: "Closing soon",
  draft: "Draft",
  upcoming: "Upcoming",
  closed: "Closed",
  archived: "Archived",
};

const WORLD_VARIANT: Record<string, "vti" | "sc" | "vc" | "hos" | undefined> = {
  vti: "vti",
  startup: "sc",
  venture_capital: "vc",
  hospitality: "hos",
};
const WORLD_LABEL: Record<string, string> = { vti: "VTI", startup: "Startup", venture_capital: "VC", hospitality: "Hospitality", corporate: "Corporate" };

export default async function ProgrammesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("programmes", "view");
  const sp = await searchParams;
  // ?site= from nav links narrows the list; the SiteSelector cookie is the fallback.
  const site = siteFromParams(sp) ?? (await getSiteFilter());
  const query = parseListQuery(sp);
  const tab = param(sp, "tab") ?? "all";
  const result = listProgrammes(site, { ...query, tab });
  const counts = programmeTabCounts(site);

  const tabs = [
    { key: "all", label: "All", count: counts.all ?? 0 },
    { key: "vti", label: "VTI", count: counts.vti ?? 0 },
    { key: "startup", label: "Startup", count: counts.startup ?? 0 },
    { key: "opportunities", label: "Opportunities", count: counts.opportunities ?? 0 },
  ];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § C · 01 · Programmes <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Programmes"
        lede="Every institutional programme running across Nayokan's four worlds. Applications, deadlines and public visibility are managed here."
        actions={
          <>
            <a href="#" className="ax-btn ax-btn--soft" aria-disabled="true" title="Export pending Session B">
              Export
            </a>
            <NewProgrammeButton site={site === "all" ? "vti" : site} />
          </>
        }
      />

      <Panel>
        <ListControls
          tabs={tabs}
          activeTab={tab}
          tabsParam="tab"
          searchPlaceholder="Search programmes…"
          filters={[
            {
              key: "status",
              label: "Status",
              options: [
                { value: "", label: "Any" },
                { value: "open", label: "Open" },
                { value: "closing", label: "Closing soon" },
                { value: "draft", label: "Draft" },
                { value: "upcoming", label: "Upcoming" },
                { value: "closed", label: "Closed" },
                { value: "archived", label: "Archived" },
              ],
            },
          ]}
        />

        {result.rows.length === 0 ? (
          <Empty title="No programmes match" lede="Adjust the filters or add a programme." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th style={{ width: "30%" }}>Programme</Th>
                <Th>World</Th>
                <Th>Status</Th>
                <Th>Applications</Th>
                <Th>Deadline</Th>
                <Th>Public</Th>
                <Th>Updated</Th>
                <Th style={{ width: 60 }} />
              </tr>
            </thead>
            <tbody>
              {result.rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/programmes/${p.id}`} className="ax-table__title">
                      {p.name}
                      {p.provenance.isDemo && <DemoTag />}
                    </Link>
                    <span className="ax-table__sub">{p.sub}</span>
                  </td>
                  <td>
                    {p.kind === "opportunity" ? (
                      <WorldTag>Opportunity</WorldTag>
                    ) : p.world ? (
                      <WorldTag world={WORLD_VARIANT[p.world]}>{WORLD_LABEL[p.world]}</WorldTag>
                    ) : (
                      <WorldTag>—</WorldTag>
                    )}
                  </td>
                  <td>
                    <Pill tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Pill>
                  </td>
                  <td className="is-mono">
                    {p.appsFilled === null ? "—" : `${p.appsFilled} / ${p.appsCapacity ?? "—"}`}
                  </td>
                  <td className="is-mono" style={p.deadline === "Missing" ? { color: "var(--warn-ink)" } : undefined}>
                    {p.deadline}
                  </td>
                  <td>
                    <VisibilityToggle id={p.id} kind="programme" isPublic={p.isPublic} />
                  </td>
                  <td className="is-mono">{p.updatedAgo}</td>
                  <td>
                    <RowActions>
                      <Link href={`/admin/programmes/${p.id}`} className="ax-iconbtn" aria-label={`Edit ${p.name}`}>
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

        <PaginationControl from={result.from} to={result.to} total={result.total} noun="programmes" page={result.page} pages={Math.ceil(result.total / result.pageSize)} />
      </Panel>
    </Page>
  );
}

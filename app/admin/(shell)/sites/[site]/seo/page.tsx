import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/platform/auth/permissions";
import { isSiteId } from "@/platform/sites/types";
import { SITES } from "@/platform/sites/registry";
import { Page, PageHead } from "@/admin/ui/Page";
import { Panel, PanelHead, PanelBody } from "@/admin/ui/Panel";
import { Table, Th, CellTitle } from "@/admin/ui/Table";
import { Pill } from "@/admin/ui/Pill";
import { Stat, ImgSlot } from "@/admin/ui/Data";
import { ListControls, PaginationControl } from "@/admin/ui/ListControls";
import { Empty, DemoTag } from "@/admin/ui/Feedback";
import { parseListQuery } from "@/admin/data/query";
import { listSeoRows, seoStats } from "@/admin/content/site/data";

export const metadata: Metadata = { title: "SEO" };

export default async function SeoPage({ params, searchParams }: {
  params: Promise<{ site: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { site } = await params;
  if (!isSiteId(site)) notFound();
  await requirePermission("site_config", "view", site);

  const query = parseListQuery(await searchParams);
  const result = listSeoRows(site, query);
  const stats = seoStats(site);
  const cfg = SITES[site];
  // SERP/OG previews must show the real public origin (readiness-report §7),
  // never a placeholder domain.
  const host = cfg.origin.replace(/^https?:\/\//, "");

  const tabs = [
    { key: "all", label: "All pages", count: stats.indexed },
    { key: "needs", label: "Needs work", count: stats.missingDesc + stats.missingSocial - Math.min(stats.missingDesc, stats.missingSocial) },
    { key: "complete", label: "Complete", count: stats.indexed - (stats.missingDesc + stats.missingSocial - Math.min(stats.missingDesc, stats.missingSocial)) },
  ];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § G · 05 · Website · SEO <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title={`SEO · ${cfg.name}`}
        lede="Search engine metadata and social preview for every public page. Warnings surface pages that need attention before they can be indexed cleanly."
        actions={
          <>
            <a href="#" className="ax-btn ax-btn--soft" aria-disabled="true" title="Sitemap pending Session B">
              Sitemap
            </a>
            <a href="#" className="ax-btn ax-btn--soft" aria-disabled="true" title="Robots.txt pending Session B">
              Robots.txt
            </a>
          </>
        }
      />

      <div className="ax-grid ax-grid-4" style={{ marginBottom: 20 }}>
        <Stat label="Pages indexed" value={stats.indexed} delta="Public routes" />
        <Stat label="Missing description" value={stats.missingDesc} delta="Fix before publish" tone={stats.missingDesc > 0 ? "attn" : undefined} />
        <Stat label="Missing social image" value={stats.missingSocial} delta="Uses default fallback" tone={stats.missingSocial > 0 ? "attn" : undefined} />
        <Stat label="SEO health" value={stats.healthPct >= 80 ? "Good" : "Needs work"} delta={`${stats.healthPct}% pages complete`} tone={stats.healthPct >= 80 ? "up" : "attn"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, alignItems: "start" }}>
        <Panel>
          <ListControls tabs={tabs} activeTab={query.status} searchPlaceholder="Search pages…" />
          {result.rows.length === 0 ? (
            <Empty title="No pages match" lede="Adjust the filters." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th style={{ width: "34%" }}>Page</Th>
                  <Th>Title</Th>
                  <Th>Description</Th>
                  <Th>Social</Th>
                  <Th>Health</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r) => {
                  const healthy = r.titleLen !== null && r.descLen !== null && r.socialSet;
                  return (
                    <tr key={r.pageId}>
                      <td>
                        <CellTitle title={r.title} sub={r.path} />
                      </td>
                      <td className="is-mono" style={r.titleLen !== null && r.titleLen < 35 ? { color: "var(--warn-ink)" } : undefined}>
                        {r.titleLen === null ? "Missing" : `${r.titleLen} / 60`}
                      </td>
                      <td className="is-mono" style={r.descLen === null ? { color: "var(--warn-ink)" } : undefined}>
                        {r.descLen === null ? "Missing" : `${r.descLen} / 160`}
                      </td>
                      <td>{r.socialSet ? <Pill tone="verified">Set</Pill> : <Pill tone="needs">Missing</Pill>}</td>
                      <td>{healthy ? <Pill tone="verified">Good</Pill> : <Pill tone="needs">Needs work</Pill>}</td>
                      <td />
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
          <PaginationControl from={result.from} to={result.to} total={result.total} noun="pages" page={result.page} pages={Math.ceil(result.total / result.pageSize)} />
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 76 }}>
          <Panel>
            <PanelHead title="Homepage · Search preview" />
            <PanelBody>
              <div style={{ background: "white", border: "1px solid var(--line-2)", borderRadius: "var(--radius)", padding: 14, fontFamily: "Arial, sans-serif" }}>
                <div style={{ fontSize: 11, color: "#202124" }}>{host}</div>
                <div style={{ color: "#1a0dab", fontSize: 17, fontWeight: 400, margin: "3px 0", lineHeight: 1.3 }}>
                  {cfg.titleTemplate.replace("%s", cfg.name)}
                </div>
                <div style={{ fontSize: 13, color: "#4d5156", lineHeight: 1.5 }}>{cfg.defaultDescription}</div>
              </div>
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHead title="Social preview · Open Graph" />
            <PanelBody>
              <div style={{ border: "1px solid var(--line-2)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                <ImgSlot variant="wide" label={`HERO · ${cfg.name} · 1200 × 630`} style={{ borderRadius: 0, border: "none" }} />
                <div style={{ padding: "12px 14px", background: "white" }}>
                  <div className="ax-mono ax-mute" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {host}
                  </div>
                  <div style={{ fontFamily: "var(--f-head)", fontWeight: 700, fontSize: 15, marginTop: 4, lineHeight: 1.2 }}>
                    {cfg.titleTemplate.replace("%s", cfg.name)}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3 }}>{cfg.defaultDescription}</div>
                </div>
              </div>
            </PanelBody>
          </Panel>
        </div>
      </div>
    </Page>
  );
}

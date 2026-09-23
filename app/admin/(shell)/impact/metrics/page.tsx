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
import { listMetrics, metricGovernanceStats, metricStatusCounts } from "@/admin/operations/impact/data";
import { METRIC_STATUS_PILL, WORLD_LABEL } from "@/admin/operations/impact/labels";
import { AddMetricButton, MetricPublicToggle } from "@/admin/operations/impact/ImpactClient";
import "@/admin/operations/impact/impact.css";

export const metadata: Metadata = { title: "Impact metrics" };

export default async function ImpactMetricsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("impact_metrics", "view");
  const sp = await searchParams;
  const site = siteFromParams(sp) ?? (await getSiteFilter());
  const query = parseListQuery(sp);
  const result = listMetrics(site, { ...query, world: param(sp, "world") ?? "all" });
  const counts = metricStatusCounts(site);
  const stats = metricGovernanceStats(site);

  const tabs = [
    { key: "all", label: "All", count: counts.all ?? 0 },
    { key: "draft", label: "Draft", count: counts.draft ?? 0 },
    { key: "needs_verification", label: "Needs verification", count: counts.needs_verification ?? 0 },
    { key: "verified", label: "Verified", count: counts.verified ?? 0 },
    { key: "approved", label: "Approved · public", count: counts.approved ?? 0 },
  ];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § F · 01 · Impact governance <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Impact metrics"
        lede="Every figure Nayokan publishes must be verified with evidence before it appears on the public website. Unverified figures are hidden by default."
        actions={
          <>
            <a href="#" className="ax-btn ax-btn--soft" aria-disabled="true" title="Reporting-period filter pending Session B">
              Reporting period · Q3 2026
            </a>
            <AddMetricButton />
          </>
        }
      />

      <div className="im-head">
        <div>
          <div className="im-head__title">Nayokan verified-first governance</div>
          <div className="im-head__lede">
            A metric can only be marked <strong style={{ color: "white" }}>Public</strong> after being verified against evidence and approved by a reviewer. This screen shows exactly where every figure sits in that chain.
          </div>
        </div>
        <div className="im-head__stat">
          <div className="im-head__lb">Public · live</div>
          <div className="im-head__val im-head__val--good">{stats.publicLive}</div>
        </div>
        <div className="im-head__stat">
          <div className="im-head__lb">Verified · not yet public</div>
          <div className="im-head__val">{stats.verifiedNotPublic}</div>
        </div>
        <div className="im-head__stat">
          <div className="im-head__lb">Needs verification</div>
          <div className="im-head__val im-head__val--warn">{stats.needsVerification}</div>
        </div>
        <div className="im-head__stat">
          <div className="im-head__lb">Draft · no evidence</div>
          <div className="im-head__val im-head__val--danger">{stats.draftNoEvidence}</div>
        </div>
      </div>

      {stats.needsVerification > 0 && (
        <div className="im-notice">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3 2 20h20z" />
            <path d="M12 10v4M12 17.5v.5" />
          </svg>
          <div>
            <strong>{stats.needsVerification} metrics require verification before the next publication.</strong>
            Verify the outstanding figures below to unblock publication — unverified metrics never reach the public site.
          </div>
          <Link href="?status=needs_verification" className="ax-btn ax-btn--soft ax-btn--sm" style={{ marginLeft: "auto", flexShrink: 0 }}>
            Show only unverified
          </Link>
        </div>
      )}

      <Panel>
        <ListControls
          tabs={tabs}
          activeTab={query.status ?? "all"}
          filters={[
            {
              key: "world",
              label: "World",
              options: [{ value: "", label: "All" }, ...Object.entries(WORLD_LABEL).filter(([k]) => k !== "all").map(([value, label]) => ({ value, label }))],
            },
          ]}
        />

        <Table>
          <thead>
            <tr>
              <Th style={{ width: "28%" }}>Metric</Th>
              <Th className="is-num" style={{ width: "14%" }}>
                Value
              </Th>
              <Th>Period</Th>
              <Th>Source · Evidence</Th>
              <Th>Status</Th>
              <Th style={{ textAlign: "center" }}>Public</Th>
              <Th style={{ width: 60 }} />
            </tr>
          </thead>
          <tbody>
            {result.rows.map((m) => (
              <tr key={m.id}>
                <td>
                  <Link href={`/admin/impact/metrics/${m.id}`} className="ax-table__title">
                    {m.title} {m.provenance.isDemo && <DemoTag />}
                  </Link>
                  <span className="ax-table__sub">{m.scopeLabel}</span>
                </td>
                <td className="is-num">
                  <span className={`im-val${m.value === null || m.status === "needs_verification" ? " im-val--pending" : ""}`}>
                    {m.value ?? "—"}
                    <span className="im-val__unit">{m.unit}</span>
                  </span>
                </td>
                <td className="is-mono">{m.periodLabel}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {m.evidence.state === "none" ? (
                      <>
                        <Pill tone="needs">{m.evidence.label}</Pill>
                        <Link href={`/admin/impact/metrics/${m.id}`} style={{ color: "var(--info-ink)", fontFamily: "var(--f-mono)", fontSize: "10.5px", textDecoration: "underline" }}>
                          Upload…
                        </Link>
                      </>
                    ) : (
                      <>
                        <Pill tone={m.evidence.state === "verified" ? "verified" : "pending"}>{m.evidence.label}</Pill>
                        {m.evidence.count && (
                          <span className="ax-mono ax-mute" style={{ fontSize: "10.5px" }}>
                            {m.evidence.count}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td>
                  <Pill tone={METRIC_STATUS_PILL[m.status].tone}>{METRIC_STATUS_PILL[m.status].label}</Pill>
                </td>
                <td style={{ textAlign: "center" }}>
                  <MetricPublicToggle metric={m} />
                </td>
                <td>
                  <RowActions>
                    <Link href={`/admin/impact/metrics/${m.id}`} className="ax-iconbtn" aria-label={`Open ${m.title}`}>
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

        {result.rows.length === 0 && <Empty title="No metrics match" lede="Adjust the filters or status tab." />}
        <PaginationControl from={result.from} to={result.to} total={result.total} noun="metrics" page={result.page} pages={Math.ceil(result.total / result.pageSize)} />
      </Panel>
    </Page>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/platform/auth/permissions";
import { Page, PageHead } from "@/admin/ui/Page";
import { Pill } from "@/admin/ui/Pill";
import { Notice } from "@/admin/ui/Notice";
import { DemoTag, Empty } from "@/admin/ui/Feedback";
import { Progress } from "@/admin/ui/Data";
import { getMetric, metricEvidence, listEvidence, VERIFIERS } from "@/admin/operations/impact/data";
import { verificationChain } from "@/admin/operations/impact/schemas";
import { EVIDENCE_STATUS_PILL, EVIDENCE_TYPE_LABEL, METRIC_STATUS_PILL } from "@/admin/operations/impact/labels";
import { AttachEvidenceButton, EvidenceRowActions, MetricDefinitionForm, MetricPublicToggle, SubmitForVerificationButton, VerificationBox, VerifierAssign } from "@/admin/operations/impact/ImpactClient";
import "@/admin/operations/impact/impact.css";

export const metadata: Metadata = { title: "Impact metric" };

const LEDE: Record<string, string> = {
  draft: "This metric is a draft with no verified value. Enter the figure and attach evidence to begin the verification chain.",
  needs_verification: "This metric is currently not verified and cannot be marked public. Attach evidence and submit for review to complete the verification chain.",
  verified: "This metric is verified against evidence and awaiting approval before it can be marked public.",
  approved: "This metric is approved — the public toggle controls whether it appears on the Nayokan website.",
};

const evIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 16, height: 16, stroke: "var(--text-3)", fill: "none", strokeWidth: 1.5 }}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6" />
  </svg>
);

export default async function MetricEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("impact_metrics", "view");
  const metric = getMetric(id);
  if (!metric) notFound();
  const { steps, pct } = verificationChain(metric);
  const evidence = metricEvidence(metric.id);
  const unlinked = listEvidence("all", { pageSize: 100 }).rows.filter((e) => e.metricId === null && e.status !== "superseded");
  const statusPill = METRIC_STATUS_PILL[metric.status];
  const chainLabels = ["Drafted", "Evidence", "Verify", "Approve", "Public"];

  return (
    <Page>
      <PageHead
        eyebrow={
          <>
            § F · 02 · Impact metric <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title={metric.title}
        lede={LEDE[metric.status]}
        actions={
          <>
            <Link href="/admin/impact/metrics" className="ax-btn ax-btn--soft">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11 6 5 12l6 6M5 12h14" />
              </svg>
              Back
            </Link>
            <SubmitForVerificationButton metric={metric} />
          </>
        }
      />

      <div className="me-hero">
        <div>
          <div className="me-hero__lb">Current value</div>
          <div className={`me-hero__val${metric.value === null || metric.status === "needs_verification" ? " me-hero__val--pending" : ""}`}>
            {metric.value ?? "—"}
            <span className="u">{metric.unit}</span>
          </div>
          <div className="me-hero__note">
            <Pill tone={statusPill.tone}>{statusPill.label}</Pill>
          </div>
        </div>
        <div>
          <div className="me-hero__lb">Reporting period</div>
          <div className="me-hero__val" style={{ fontSize: 26 }}>
            {metric.periodRangeLabel || metric.periodLabel}
          </div>
          <div className="me-hero__note">{metric.periodNote || metric.periodLabel}</div>
        </div>
        <div>
          <div className="me-hero__lb">Chain state</div>
          <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
            {steps.map((s, i) => (
              <Pill key={s.label} tone={s.done ? "verified" : i === 1 && metric.evidence.state === "none" ? "needs" : "neutral"}>
                {i + 1} · {i === 1 && !s.done && metric.evidence.state === "none" ? "Evidence missing" : chainLabels[i]}
              </Pill>
            ))}
          </div>
          <div className="me-hero__note">Progress · {pct} %</div>
          <div style={{ marginTop: 6 }}>
            <Progress value={pct} tone={pct === 100 ? "green" : "warn"} />
          </div>
        </div>
      </div>

      <div className="me-grid">
        <div>
          <MetricDefinitionForm metric={metric} />

          <div className="me-block">
            <div className="me-block__head">
              <div className="me-block__title">Evidence library</div>
              <AttachEvidenceButton metric={metric} unlinked={unlinked} />
            </div>
            <div className="me-block__body">
              {metric.evidence.state === "none" && (
                <Notice tone="warn" title="Add a source before publishing this impact metric.">
                  Without a documented source, this figure cannot be verified — and Nayokan does not publish unverified impact.
                </Notice>
              )}
              {evidence.length === 0 ? (
                <Empty title="No evidence attached yet" lede="Upload programme records, reports, spreadsheets or source documents. Each evidence item is timestamped and versioned." />
              ) : (
                evidence.map((e) => (
                  <div className="me-evidence-row" key={e.id}>
                    <div>{evIcon}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{e.title}</div>
                      <div className="ax-mono ax-mute" style={{ fontSize: 10.5 }}>
                        {e.code} · {EVIDENCE_TYPE_LABEL[e.type]} · {e.uploadedBy} · {e.uploadedAt}
                      </div>
                    </div>
                    <Pill tone={EVIDENCE_STATUS_PILL[e.status].tone}>{EVIDENCE_STATUS_PILL[e.status].label}</Pill>
                    <EvidenceRowActions item={e} />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="me-block">
            <div className="me-block__head">
              <div className="me-block__title">Value history</div>
              <div className="ax-mono ax-mute">Institutional record</div>
            </div>
            <div className="me-block__body" style={{ padding: "0 20px 14px" }}>
              {metric.valueHistory.length === 0 ? (
                <div className="ax-mute" style={{ fontSize: 12.5, padding: "14px 0" }}>
                  No recorded values yet — history is appended as each period is verified.
                </div>
              ) : (
                <table className="ax-table" style={{ fontSize: "12.5px" }}>
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th className="is-num">Value</th>
                      <th>Verified by</th>
                      <th>Verified</th>
                      <th>Public</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metric.valueHistory.map((h) => (
                      <tr key={h.period}>
                        <td className="is-mono">{h.period}</td>
                        <td className="is-num">
                          <span className="im-val">{h.value ?? "—"}</span>
                        </td>
                        <td>{h.verifiedBy ?? "—"}</td>
                        <td>{h.verifiedAt ? <span className="is-mono">{h.verifiedAt}</span> : <Pill tone="needs">Unverified</Pill>}</td>
                        <td>{h.public ? <Pill tone="live">Live</Pill> : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 76 }}>
          <VerificationBox metric={metric} />

          <div className={`me-public${metric.status === "approved" ? "" : " me-public--blocked"}`}>
            <div>
              <div className="me-public__title">Public on website</div>
              <div className="me-public__note">
                {metric.status === "approved"
                  ? metric.isPublic
                    ? "This metric is live on the public Nayokan website."
                    : "Approved — switching this on publishes the figure on the public site."
                  : "This metric is currently hidden from the public Nayokan website. Complete the verification chain to enable this toggle."}
              </div>
            </div>
            <MetricPublicToggle metric={metric} />
          </div>

          <VerifierAssign metric={metric} verifiers={VERIFIERS} />

          <div className="me-block" style={{ margin: 0 }}>
            <div className="me-block__head">
              <div className="me-block__title">Audit trail</div>
              <span className="ax-mono ax-mute" style={{ fontSize: "10.5px" }}>
                Full log pending Phase 10
              </span>
            </div>
            <div className="me-block__body" style={{ padding: "12px 18px", fontSize: 12 }}>
              {metric.audit.map((a, i) => (
                <div key={i} style={{ padding: "6px 0", borderBottom: i < metric.audit.length - 1 ? "1px solid var(--line)" : "none" }}>
                  <div style={{ fontWeight: 500 }}>{a.label}</div>
                  <div className="ax-mono ax-mute" style={{ fontSize: "10.5px", marginTop: 2 }}>
                    {a.actor} · {a.ago}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

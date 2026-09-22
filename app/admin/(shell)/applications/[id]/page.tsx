import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/platform/auth/permissions";
import { Page, PageHead } from "@/admin/ui/Page";
import { Pill } from "@/admin/ui/Pill";
import { Notice } from "@/admin/ui/Notice";
import { DemoTag } from "@/admin/ui/Feedback";
import { getApplication, REVIEWERS } from "@/admin/operations/applications/data";
import { AssignReviewer, DecisionPanel, MoveButton, NoteForm, STATUS_PILL } from "@/admin/operations/applications/ApplicationsClient";
import "@/admin/operations/applications/applications.css";

export const metadata: Metadata = { title: "Application record" };

const docIcon = (kind: "file" | "image") =>
  kind === "image" ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m21 15-4-4-8 8" />
      <circle cx="9" cy="10" r="2" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
    </svg>
  );

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("applications", "view");
  const app = getApplication(id);
  if (!app) notFound();
  const statusPill = STATUS_PILL[app.status];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § D · 02 · Programmes · Application record <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title={`Application #${app.code}`}
        lede={
          <>
            Submitted <strong>{app.submittedAgo}</strong> · Programme: {app.programmeLabel} · World: {app.world ? app.world.toUpperCase() : "Opportunity"}.
          </>
        }
        actions={
          <>
            <Link href="/admin/applications" className="ax-btn ax-btn--soft">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11 6 5 12l6 6M5 12h14" />
              </svg>
              Back
            </Link>
            <AssignReviewer app={app} reviewers={REVIEWERS} />
            <MoveButton app={app} target="shortlisted" label="Move to shortlist" />
          </>
        }
      />

      {app.provenance.isDemo && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="info">This application is mock data pending Session B&apos;s tables — applicant identity is withheld during review by design.</Notice>
        </div>
      )}

      <div className="ap-grid">
        <div>
          <div className="ap-hero">
            <div className="ap-hero__av">{app.initials}</div>
            <div>
              <div className="ap-hero__name">
                {app.applicantLabel} <DemoTag>Content to be confirmed</DemoTag>
              </div>
              <div className="ap-hero__meta">
                <span>
                  ID <strong>{app.code}</strong>
                </span>
                <span>
                  Submitted <strong>{app.submittedAt}</strong>
                </span>
                <span>
                  Source <strong>{app.source}</strong>
                </span>
                <span>
                  Language <strong>{app.language}</strong>
                </span>
              </div>
            </div>
            <div className="ap-hero__actions">
              <Pill tone={statusPill.tone}>{statusPill.label}</Pill>
            </div>
          </div>

          <section className="ap-section">
            <div className="ap-section__head">
              <div className="ap-section__title">Applicant details</div>
              <div className="ap-section__num">§ D · 02a</div>
            </div>
            <div className="ap-section__body">
              <div className="ap-facts">
                {app.facts.map((f) => (
                  <div key={f.label}>
                    <div className="ap-fact__lb">{f.label}</div>
                    <div className={`ap-fact__val${f.mono ? " ax-mono" : ""}`}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="ap-section">
            <div className="ap-section__head">
              <div className="ap-section__title">Application responses</div>
              <div className="ap-section__num">§ D · 02b</div>
            </div>
            <div className="ap-section__body">
              {app.responses.map((r) => (
                <div key={r.q} className="ap-q">
                  <div className="ap-q__q">{r.q}</div>
                  <div className="ap-q__a">{r.a}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="ap-section">
            <div className="ap-section__head">
              <div className="ap-section__title">Supporting documents</div>
              <div className="ap-section__num">{app.documents.length} files</div>
            </div>
            <div className="ap-section__body" style={{ padding: "6px 18px 12px" }}>
              {app.documents.map((d) => (
                <div key={d.name} className="ap-doc-row">
                  <div className="ap-doc__ic">{docIcon(d.icon)}</div>
                  <div>
                    <div className="ap-doc__name">{d.name}</div>
                    <div className="ap-doc__sub">{d.meta}</div>
                  </div>
                  <Pill tone="verified">{d.status === "verified" ? "Verified" : "Received"}</Pill>
                  {/* Documents resolve through signed URLs on a private bucket — pending Session B's media layer. */}
                  <a href="#" className="ax-btn ax-btn--soft ax-btn--sm" aria-disabled="true" title="Signed URL pending Session B's private bucket">
                    View
                  </a>
                </div>
              ))}
            </div>
          </section>

          <section className="ap-section">
            <div className="ap-section__head">
              <div className="ap-section__title">Internal review notes</div>
              <div className="ap-section__num">Staff only · not visible to applicant</div>
            </div>
            <div className="ap-section__body">
              {app.notes.map((n) => (
                <div key={n.id} className="ap-note">
                  <div className="ap-note__head">
                    <span className="ap-note__author">
                      {n.author} · {n.role}
                    </span>
                    <span className="ap-note__time">{n.time}</span>
                  </div>
                  <div className="ap-note__body">{n.body}</div>
                </div>
              ))}
              <NoteForm applicationId={app.id} />
            </div>
          </section>
        </div>

        <aside className="ap-side">
          <DecisionPanel app={app} />

          <div className="ap-section" style={{ marginTop: 0 }}>
            <div className="ap-section__head">
              <div className="ap-section__title">Reviewer</div>
              <div className="ap-section__num">§ D · 02c</div>
            </div>
            <div className="ap-section__body" style={{ paddingTop: 12 }}>
              {app.reviewer ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="ax-avatar ax-avatar--md">{app.reviewer.initials}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{app.reviewer.name}</div>
                      <div className="ax-mono ax-mute" style={{ fontSize: "10.5px" }}>
                        {app.reviewer.role} · reviewing
                      </div>
                    </div>
                  </div>
                  <AssignReviewer app={app} reviewers={REVIEWERS} variant="ghost" />
                </>
              ) : (
                <AssignReviewer app={app} reviewers={REVIEWERS} variant="ghost" />
              )}
            </div>
          </div>

          <div className="ap-section" style={{ marginTop: 0 }}>
            <div className="ap-section__head">
              <div className="ap-section__title">Timeline</div>
              <div className="ap-section__num">Auto</div>
            </div>
            <div className="ap-section__body" style={{ paddingTop: 10 }}>
              <div className="ap-timeline">
                {app.timeline.map((t) => (
                  <div key={t.label} className="ap-timeline__row">
                    <div className={`ap-timeline__dot${t.state === "done" ? " is-done" : t.state === "current" ? " is-current" : ""}`} />
                    <div>
                      <div className="ap-timeline__t" style={t.state === "pending" ? { color: "var(--text-3)" } : undefined}>
                        {t.label}
                      </div>
                      <div className="ap-timeline__s">{t.sub}</div>
                    </div>
                    <div className="ap-timeline__time" style={t.state === "pending" ? { color: "var(--text-4)" } : undefined}>
                      {t.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ap-section" style={{ marginTop: 0 }}>
            <div className="ap-section__head">
              <div className="ap-section__title">Applied to</div>
              <div className="ap-section__num">Programme</div>
            </div>
            <div className="ap-section__body" style={{ padding: "12px 18px" }}>
              {app.programmeId ? (
                <Link href={`/admin/programmes/${app.programmeId}`} style={{ display: "block", padding: 10, border: "1px solid var(--line-2)", borderRadius: "var(--radius)" }}>
                  <div className="ax-mono ax-mute" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    {app.programmeMeta}
                  </div>
                  <div style={{ fontWeight: 600, marginTop: 3 }}>{app.programmeLabel}</div>
                  <div className="ap-fact__lb" style={{ marginTop: 6 }}>
                    Deadline · {app.programmeDeadline}
                  </div>
                </Link>
              ) : (
                <div className="ax-mute" style={{ fontSize: 12.5 }}>
                  {app.programmeLabel} · not linked to a programme record.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </Page>
  );
}

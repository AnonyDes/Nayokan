import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/platform/auth/permissions";
import { Page, PageHead } from "@/admin/ui/Page";
import { Pill } from "@/admin/ui/Pill";
import { Notice } from "@/admin/ui/Notice";
import { DemoTag } from "@/admin/ui/Feedback";
import { getEnquiry, ASSIGNEES, ROUTE_OPTIONS } from "@/admin/operations/enquiries/data";
import { AssignBlock, AssignToMeButton, EnquiryActions, EnquiryNoteForm } from "@/admin/operations/enquiries/EnquiriesClient";
import type { EnquiryCategory } from "@/admin/operations/enquiries/types";
import { CATEGORY_LABEL, ENQUIRY_PILL } from "@/admin/operations/enquiries/labels";
import "@/admin/operations/enquiries/enquiries.css";

export const metadata: Metadata = { title: "Enquiry record" };

/** Design's per-category headline suffixes on the detail title. */
const TITLE_SUFFIX: Record<EnquiryCategory, string> = {
  university: "University partnership",
  partnership: "Partnership",
  hospitality: "Hospitality booking",
  vc: "VC enquiry",
  general: "General",
};

const CONSENT_LABEL = { granted: "Granted", not_granted: "Not granted", unknown: "Unknown" } as const;

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("enquiries", "view");
  const e = getEnquiry(id);
  if (!e) notFound();
  const statusPill = ENQUIRY_PILL[e.status];

  const timeline = [
    { label: "Received", sub: `${e.receivedAgo} · via ${e.sourcePage}`, done: true },
    { label: "Assigned", sub: e.assignee ? `${e.assignee.name}` : "Pending", done: e.assignee !== null },
    { label: "In progress", sub: e.status === "new" ? "—" : e.assignee ? "Being handled" : "—", done: e.status !== "new" },
    { label: "Resolved", sub: e.status === "resolved" ? "Done" : "—", done: e.status === "resolved" },
  ];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § G · 02 · Operations · Enquiry record <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title={`${e.title} · ${TITLE_SUFFIX[e.category]}`}
        actions={
          <>
            <Link href="/admin/enquiries" className="ax-btn ax-btn--soft">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11 6 5 12l6 6M5 12h14" />
              </svg>
              Back
            </Link>
            <a href={`mailto:${e.email}`} className="ax-btn ax-btn--ghost" aria-disabled="true" title="Reply flow pending Session B — opens sender address only">
              Reply by email
            </a>
            <AssignToMeButton enquiry={e} />
          </>
        }
      />

      {e.provenance.isDemo && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="info">Demo enquiry — sender identity withheld per the consent-aware design until assigned. Nothing here is real correspondence.</Notice>
        </div>
      )}

      <div className="eq">
        <div className="eq-msg">
          <div className="eq-msg__meta">
            <span>
              From <strong>{e.senderLabel}</strong>
            </span>
            <span>
              Email <strong className="ax-mono">{e.email}</strong>
            </span>
            <span>
              Received <strong>{e.receivedAt}</strong>
            </span>
            <span>
              Language <strong>{e.language}</strong>
            </span>
          </div>

          <div className="eq-msg__body">
            {e.bodyParagraphs.map((p, i) =>
              p.startsWith("— Demo") ? (
                <p key={i}>
                  <em>{p}</em>
                </p>
              ) : p.startsWith("— Sender withheld") ? (
                <p key={i} style={{ color: "var(--text-3)", fontFamily: "var(--f-mono)", fontSize: "11.5px" }}>
                  {p}
                </p>
              ) : (
                <p key={i}>{p}</p>
              ),
            )}
          </div>
        </div>

        <div className="eq-side">
          <div className="eq-block">
            <div className="eq-block__head">
              Details<span className="ax-mono ax-mute">§ G · 02a</span>
            </div>
            <div className="eq-block__body">
              <div className="eq-block__row">
                <span className="eq-block__lb">Category</span>
                <Pill tone="info">{CATEGORY_LABEL[e.category]}</Pill>
              </div>
              <div className="eq-block__row">
                <span className="eq-block__lb">Status</span>
                <Pill tone={statusPill.tone}>{statusPill.label}</Pill>
              </div>
              <div className="eq-block__row">
                <span className="eq-block__lb">Priority</span>
                <span className="ax-mono">{e.priority}</span>
              </div>
              <div className="eq-block__row">
                <span className="eq-block__lb">Source page</span>
                <span className="ax-mono">{e.sourcePage}</span>
              </div>
              <div className="eq-block__row">
                <span className="eq-block__lb">Referrer</span>
                <span className="ax-mono">{e.referrer}</span>
              </div>
              <div className="eq-block__row">
                <span className="eq-block__lb">Consent · public</span>
                <span className="ax-mono">{CONSENT_LABEL[e.publicConsent]}</span>
              </div>
            </div>
          </div>

          <div className="eq-block">
            <div className="eq-block__head">
              Assignment<span className="ax-mono ax-mute">{e.assignee ? e.assignee.name : "To assign"}</span>
            </div>
            <AssignBlock enquiry={e} assignees={ASSIGNEES} routes={ROUTE_OPTIONS} />
          </div>

          <div className="eq-block">
            <div className="eq-block__head">
              Internal notes<span className="ax-mono ax-mute">Staff only</span>
            </div>
            <div className="eq-block__body">
              {e.notes.map((n) => (
                <div key={n.id} className="eq-note">
                  <div className="eq-note__head">
                    <strong>{n.author}</strong>
                    <span className="ax-mono ax-mute">{n.time}</span>
                  </div>
                  <div className="eq-note__body">{n.body}</div>
                </div>
              ))}
              <EnquiryNoteForm enquiryId={e.id} />
            </div>
          </div>

          <div className="eq-block">
            <div className="eq-block__head">Timeline</div>
            <div className="eq-block__body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {timeline.map((t) => (
                <div key={t.label} style={{ display: "flex", gap: 10 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.done ? "var(--green)" : "var(--ws-3)", marginTop: 6, flexShrink: 0 }} />
                  <div style={t.done ? undefined : { color: "var(--text-3)" }}>
                    <strong>{t.label}</strong>
                    <br />
                    <span className="ax-mono ax-mute" style={{ fontSize: "10.5px" }}>
                      {t.sub}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="eq-block">
            <div className="eq-block__head">Actions</div>
            <EnquiryActions enquiry={e} />
          </div>
        </div>
      </div>
    </Page>
  );
}

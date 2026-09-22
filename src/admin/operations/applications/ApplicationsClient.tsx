"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/admin/ui/Button";
import { Modal } from "@/admin/ui/Modal";
import { Field, Textarea } from "@/admin/ui/Field";
import { Select } from "@/admin/ui/Data";
import { Notice } from "@/admin/ui/Notice";
import { Pill } from "@/admin/ui/Pill";
import { WorldTag } from "@/admin/ui/Data";
import { assignReviewer, assignToMe, postApplicationNote, transitionApplication } from "./actions";
import { canTransition } from "./schemas";
import type { AdminApplication, ApplicationStatus, Reviewer } from "./types";

const KANBAN_COLUMNS: { status: ApplicationStatus; label: string }[] = [
  { status: "new", label: "New" },
  { status: "under_review", label: "Under review" },
  { status: "shortlisted", label: "Shortlisted" },
  { status: "accepted", label: "Accepted" },
  { status: "rejected", label: "Rejected" },
];

export const STATUS_PILL: Record<ApplicationStatus, { tone: "needs" | "in-progress" | "review" | "published" | "rejected" | "archived"; label: string }> = {
  new: { tone: "needs", label: "New" },
  under_review: { tone: "in-progress", label: "Under review" },
  shortlisted: { tone: "review", label: "Shortlisted" },
  accepted: { tone: "published", label: "Accepted" },
  rejected: { tone: "rejected", label: "Rejected" },
  archived: { tone: "archived", label: "Archived" },
};

const WORLD_VARIANT: Record<string, "vti" | "sc" | undefined> = { vti: "vti", startup: "sc" };
const WORLD_LABEL: Record<string, string> = { vti: "VTI", startup: "Startup", corporate: "Corporate" };

// — view toggle (?view=kanban|table) —

export function ViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const view = params.get("view") ?? "kanban";
  const set = (v: string) => {
    const next = new URLSearchParams(params.toString());
    if (v === "kanban") next.delete("view");
    else next.set("view", v);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };
  return (
    <div className="ax-radio-group" role="group" aria-label="View">
      <button className={view === "kanban" ? "is-active" : ""} title="Kanban view" aria-label="Kanban view" onClick={() => set("kanban")}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="3" width="6" height="18" />
          <rect x="10" y="3" width="4" height="14" />
          <rect x="15" y="3" width="6" height="10" />
        </svg>
      </button>
      <button className={view === "table" ? "is-active" : ""} title="Table view" aria-label="Table view" onClick={() => set("table")}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="4" width="18" height="16" />
          <path d="M3 10h18M3 16h18M9 4v16" />
        </svg>
      </button>
    </div>
  );
}

// — kanban —

export function KanbanBoard({ apps }: { apps: AdminApplication[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const showAll = (status: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("status", status);
    next.delete("page");
    router.replace(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="apps-kb">
      {KANBAN_COLUMNS.map((col) => {
        const cards = apps.filter((a) => a.status === col.status);
        const shown = cards.slice(0, 4);
        return (
          <div key={col.status} className="apps-kb__col">
            <div className="apps-kb__head">
              <span className="apps-kb__label">{col.label}</span>
              <span className="apps-kb__count">{cards.length}</span>
            </div>
            {shown.map((a) => (
              <Link key={a.id} href={`/admin/applications/${a.id}`} className="apps-kb__card">
                <div className="apps-kb__id">#{a.code}</div>
                <div className="apps-kb__name">{a.applicantLabel}</div>
                <div className="apps-kb__meta">
                  {a.reviewer ? (
                    <span className="ax-avatar" style={{ width: 16, height: 16, fontSize: 8 }}>
                      {a.reviewer.initials}
                    </span>
                  ) : a.world ? (
                    <WorldTag world={WORLD_VARIANT[a.world]}>{WORLD_LABEL[a.world]}</WorldTag>
                  ) : (
                    <WorldTag>Opportunity</WorldTag>
                  )}
                  {a.stageLabel ? (
                    <Pill tone={a.status === "accepted" ? "published" : a.status === "rejected" ? "rejected" : a.stageLabel === "Archived" ? "archived" : "in-progress"}>{a.stageLabel}</Pill>
                  ) : (
                    <span>· {a.submittedAgo}</span>
                  )}
                </div>
              </Link>
            ))}
            {cards.length > shown.length && (
              <button className="ax-btn ax-btn--soft ax-btn--sm" style={{ marginTop: "auto", justifyContent: "center" }} onClick={() => showAll(col.status)}>
                Show all {cards.length}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// — decision panel —

export function DecisionPanel({ app }: { app: AdminApplication }) {
  const router = useRouter();
  const [modal, setModal] = useState<"accept" | "reject" | "info" | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const move = (target: ApplicationStatus, why?: string) =>
    startTransition(async () => {
      const res = await transitionApplication({ id: app.id, target, reason: why });
      if (res.ok) {
        setModal(null);
        setReason("");
        router.refresh();
      } else setError(res.error);
    });

  const requestInfo = () =>
    startTransition(async () => {
      const res = await postApplicationNote({ id: app.id, body: `Request for more information sent to applicant: ${reason}` });
      if (res.ok) {
        setModal(null);
        setReason("");
        router.refresh();
      } else setError(res.error);
    });

  return (
    <div className="ap-decision">
      <div className="ap-decision__title">Decision</div>
      <div className="ap-decision__note">Actions here notify the applicant. Rejection and archival cannot be undone from this screen — use audit log for corrections.</div>
      {error && <div style={{ fontSize: 11.5, color: "var(--danger-ink, #ffb4a8)" }}>{error}</div>}
      <div className="ap-decision__actions">
        {canTransition(app.status, "shortlisted") && (
          <Button variant="accent" size="sm" disabled={pending} onClick={() => move("shortlisted")}>
            Shortlist
          </Button>
        )}
        {canTransition(app.status, "accepted") && (
          <Button variant="accent" size="sm" style={{ background: "white", color: "var(--ink)" }} disabled={pending} onClick={() => setModal("accept")}>
            Accept
          </Button>
        )}
        <Button variant="soft" size="sm" className="full" style={{ background: "rgba(255,255,255,0.08)", color: "white" }} disabled={pending} onClick={() => setModal("info")}>
          Request more info
        </Button>
        {canTransition(app.status, "rejected") && (
          <Button variant="danger" size="sm" className="full" disabled={pending} onClick={() => setModal("reject")}>
            Reject application…
          </Button>
        )}
      </div>

      <Modal
        open={modal === "accept"}
        onClose={() => setModal(null)}
        title="Accept this application?"
        footer={
          <>
            <Button variant="soft" onClick={() => setModal(null)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => move("accepted")} disabled={pending}>
              Accept &amp; notify
            </Button>
          </>
        }
      >
        The applicant is notified of the decision. The record moves to Accepted and can only be archived afterwards.
      </Modal>

      <Modal
        open={modal === "reject"}
        tone="warn"
        onClose={() => setModal(null)}
        title="Reject application…"
        footer={
          <>
            <Button variant="soft" onClick={() => setModal(null)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => move("rejected", reason)} disabled={pending || !reason.trim()}>
              Reject &amp; notify
            </Button>
          </>
        }
      >
        <div style={{ textAlign: "left" }}>
          <Field label="Reason for rejection" htmlFor="rej-reason" required hint="Required — the applicant is notified. Recorded in the audit log.">
            <Textarea id="rej-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={modal === "info"}
        onClose={() => setModal(null)}
        title="Request more info"
        footer={
          <>
            <Button variant="soft" onClick={() => setModal(null)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="primary" onClick={requestInfo} disabled={pending || !reason.trim()}>
              Send request
            </Button>
          </>
        }
      >
        <div style={{ textAlign: "left" }}>
          <Field label="What do you need from the applicant?" htmlFor="info-msg" required hint="Logged as an internal note; delivery is pending Session B's notification hooks.">
            <Textarea id="info-msg" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

// — reviewer assignment —

export function AssignReviewer({ app, reviewers, variant = "ghost" }: { app: AdminApplication; reviewers: Reviewer[]; variant?: "ghost" | "primary" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reviewerId, setReviewerId] = useState(app.reviewer?.id ?? reviewers[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const assign = () =>
    startTransition(async () => {
      const res = await assignReviewer({ id: app.id, reviewerId });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else setError(res.error);
    });

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        {app.reviewer ? "Assign reviewer" : "Assign reviewer"}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Assign reviewer"
        footer={
          <>
            <Button variant="soft" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="primary" onClick={assign} disabled={pending}>
              Assign
            </Button>
          </>
        }
      >
        <div style={{ textAlign: "left" }}>
          {error && <Notice tone="danger">{error}</Notice>}
          <Field label="Reviewer" htmlFor="as-reviewer">
            <Select id="as-reviewer" value={reviewerId} onChange={(e) => setReviewerId(e.target.value)}>
              {reviewers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} · {r.role}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Modal>
    </>
  );
}

/** Header CTA — "Move to shortlist" (or the next forward step) as a direct
 *  client action; the full decision set lives in the DecisionPanel. */
export function MoveButton({ app, target, label }: { app: AdminApplication; target: ApplicationStatus; label: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  if (!canTransition(app.status, target)) return null;
  return (
    <Button
      variant="primary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await transitionApplication({ id: app.id, target });
          if (res.ok) router.refresh();
        })
      }
    >
      {label}
    </Button>
  );
}

export function AssignToMeButton({ app }: { app: AdminApplication }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="primary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await assignToMe({ id: app.id });
          if (res.ok) router.refresh();
        })
      }
    >
      Assign to me
    </Button>
  );
}

// — internal notes —

export function NoteForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const post = () =>
    startTransition(async () => {
      const res = await postApplicationNote({ id: applicationId, body });
      if (res.ok) {
        setBody("");
        router.refresh();
      } else setError(res.error);
    });

  return (
    <>
      {error && <Notice tone="danger">{error}</Notice>}
      <Textarea style={{ marginTop: 12 }} placeholder="Add an internal note. Notes are visible only to Nayokan staff." value={body} onChange={(e) => setBody(e.target.value)} aria-label="Add an internal note" />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 10 }}>
        <a href="#" className="ax-btn ax-btn--soft ax-btn--sm" aria-disabled="true" title="Evidence linking pending Session B">
          Attach evidence
        </a>
        <Button variant="primary" size="sm" onClick={post} disabled={pending || !body.trim()}>
          Post note
        </Button>
      </div>
    </>
  );
}

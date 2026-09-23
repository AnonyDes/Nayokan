"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonClassName } from "@/admin/ui/Button";
import { Field, Textarea } from "@/admin/ui/Field";
import { Select } from "@/admin/ui/Data";
import { Modal } from "@/admin/ui/Modal";
import { Notice } from "@/admin/ui/Notice";
import { approveReview, reassignReview, rejectReview, requestChanges, restoreVersion } from "./actions";
import { REVIEWERS } from "./types";
import type { ContentVersion, QueueSecondary, ReviewQueueItem } from "./types";

type ErrorFn = (e: string | null) => void;

function useAction(router: ReturnType<typeof useRouter>, onResult: ErrorFn) {
  const [pending, startTransition] = useTransition();
  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>, after?: () => void) =>
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        onResult(null);
        after?.();
        router.refresh();
      } else onResult(res.error);
    });
  return { pending, run };
}

function ErrorLine({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="ax-mono" style={{ fontSize: 10.5, marginTop: 6, color: "var(--danger)" }} role="alert">
      {error}
    </div>
  );
}

type Decision = "approve" | "changes" | "reject";

function decisionAction(id: string, decision: Decision, comment: string | undefined) {
  if (decision === "approve") return approveReview({ id, comment: comment?.trim() ? comment.trim() : undefined });
  if (decision === "changes") return requestChanges({ id, comment: comment ?? "" });
  return rejectReview({ id, comment: comment ?? "" });
}

/** Modal asking for the required reviewer comment before changes/reject. */
function CommentDecisionModal({
  open,
  decision,
  onClose,
  onSubmit,
  pending,
}: {
  open: boolean;
  decision: Exclude<Decision, "approve"> | null;
  onClose: () => void;
  onSubmit: (comment: string) => void;
  pending: boolean;
}) {
  const [comment, setComment] = useState("");
  const isReject = decision === "reject";
  return (
    <Modal
      open={open}
      tone={isReject ? "warn" : "info"}
      title={isReject ? "Reject this submission?" : "Request changes"}
      onClose={onClose}
      footer={
        <>
          <Button variant="soft" onClick={onClose}>Cancel</Button>
          <Button variant={isReject ? "danger" : "primary"} disabled={pending || comment.trim().length < 3} onClick={() => onSubmit(comment.trim())}>
            {isReject ? "Reject" : "Send to author"}
          </Button>
        </>
      }
    >
      <p className="ax-mute" style={{ fontSize: 13, marginBottom: 10 }}>
        {isReject
          ? "The item returns to draft and the author is notified. A comment is required — it becomes part of the record."
          : "The item returns to the author marked “changes requested”. A comment is required."}
      </p>
      <Field label="Reviewer comment">
        <Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What needs to change, and why." />
      </Field>
    </Modal>
  );
}

/** Hero buttons — Approve direct; Request changes / Reject ask for the comment first. */
export function HeroReviewButtons({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<Exclude<Decision, "approve"> | null>(null);
  const { pending, run } = useAction(router, setError);
  return (
    <>
      <div className="cr-hero__actions" style={{ flexWrap: "wrap" }}>
        <Button variant="danger" disabled={pending} onClick={() => setModal("reject")}>Reject</Button>
        <Button variant="ghost" disabled={pending} onClick={() => setModal("changes")} style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}>
          Request changes
        </Button>
        <Button variant="accent" disabled={pending} onClick={() => run(() => approveReview({ id }))}>Approve</Button>
      </div>
      <ErrorLine error={error} />
      <CommentDecisionModal
        open={modal !== null}
        decision={modal}
        pending={pending}
        onClose={() => setModal(null)}
        onSubmit={(comment) => run(() => decisionAction(id, modal ?? "changes", comment), () => setModal(null))}
      />
    </>
  );
}

/** Panel reviewer-comment section — textarea plus the three decision buttons. */
export function ReviewPanelActions({ id }: { id: string }) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction(router, setError);
  const trimmed = comment.trim();
  return (
    <>
      <Textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="If you request changes, add a comment for the author. Required."
      />
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        <Button variant="danger" style={{ flex: 1, justifyContent: "center" }} disabled={pending || trimmed.length < 3} onClick={() => run(() => rejectReview({ id, comment: trimmed }))}>
          Reject
        </Button>
        <Button variant="soft" style={{ flex: 1, justifyContent: "center" }} disabled={pending || trimmed.length < 3} onClick={() => run(() => requestChanges({ id, comment: trimmed }))}>
          Request changes
        </Button>
      </div>
      <Button variant="accent" style={{ width: "100%", justifyContent: "center", marginTop: 6 }} disabled={pending} onClick={() => run(() => approveReview({ id, comment: trimmed || undefined }))}>
        Approve for publication
      </Button>
      <ErrorLine error={error} />
    </>
  );
}

/** Queue-card secondary action per the design: reassign / request evidence / request changes / approve now. */
export function QueueSecondary({ item }: { item: ReviewQueueItem }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<QueueSecondary | null>(null);
  const [assignee, setAssignee] = useState(item.assignedTo ?? "");
  const [comment, setComment] = useState("");
  const { pending, run } = useAction(router, setError);

  const label: Record<QueueSecondary, string> = {
    reassign: "Reassign",
    "request-evidence": "Request evidence",
    "request-changes": "Request changes",
    "approve-now": "Approve now",
  };
  const variant = item.secondary === "approve-now" ? "accent" : "soft";

  if (item.secondary === "request-evidence") {
    return (
      <Link href="/admin/impact/evidence" className={buttonClassName("soft")} style={{ justifyContent: "center" }}>
        {label[item.secondary]}
      </Link>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        style={{ justifyContent: "center" }}
        disabled={pending}
        onClick={() => (item.secondary === "approve-now" ? run(() => approveReview({ id: item.id })) : setModal(item.secondary))}
      >
        {label[item.secondary]}
      </Button>
      <ErrorLine error={error} />

      <Modal
        open={modal === "reassign"}
        title="Reassign review"
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="soft" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="primary" disabled={pending} onClick={() => run(() => reassignReview({ id: item.id, assignee: assignee || null }), () => setModal(null))}>
              Assign
            </Button>
          </>
        }
      >
        <Field label="Reviewer" hint="Leadership review returns the item to every reviewer's queue.">
          <Select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="">Leadership review</option>
            {REVIEWERS.map((r) => (
              <option key={r.name} value={r.name}>{r.name} · {r.role}</option>
            ))}
          </Select>
        </Field>
      </Modal>

      <Modal
        open={modal === "request-changes"}
        title="Request changes"
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="soft" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="primary" disabled={pending || comment.trim().length < 3} onClick={() => run(() => requestChanges({ id: item.id, comment: comment.trim() }), () => setModal(null))}>
              Send to author
            </Button>
          </>
        }
      >
        <Field label="Reviewer comment" hint="Required — it becomes part of the record.">
          <Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What needs to change, and why." />
        </Field>
      </Modal>
    </>
  );
}

/** Version list rail — checkbox compare selection + click-to-view via ?v=. */
export function VersionListClient({ versions, contentId, selected }: { versions: ContentVersion[]; contentId: string; selected: number }) {
  const router = useRouter();
  const [checked, setChecked] = useState<number[]>([selected]);
  const toggle = (v: number) =>
    setChecked((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v].slice(-2)));
  const canCompare = checked.length === 2;
  const compare = () => {
    const [a, b] = [...checked].sort((x, y) => y - x);
    router.push(`/admin/version-history?content=${contentId}&v=${a}&vs=${b}`);
  };
  return (
    <>
      <div className="vh-list__head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span>All versions · {versions.length}</span>
        <Button variant="primary" size="sm" disabled={!canCompare} onClick={compare}>Compare</Button>
      </div>
      {versions.map((v) => (
        <div
          key={v.id}
          role="button"
          tabIndex={0}
          className={`vh-item${v.version === selected ? " is-active" : ""}`}
          onClick={() => router.push(`/admin/version-history?content=${contentId}&v=${v.version}`)}
          onKeyDown={(e) => e.key === "Enter" && router.push(`/admin/version-history?content=${contentId}&v=${v.version}`)}
        >
          <span onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" checked={checked.includes(v.version)} onChange={() => toggle(v.version)} style={{ marginTop: 4 }} aria-label={`Select v${v.version} to compare`} />
          </span>
          <span>
            <span className="vh-item__ver" style={{ display: "block" }}>
              v{v.version} · {v.statusLabel}
              {v.isCurrent && v.statusLabel === "Published" && <span className="ax-pill ax-pill--published" style={{ marginLeft: 6, fontSize: 8.5 }}>Live</span>}
            </span>
            <span className="vh-item__meta" style={{ display: "block" }}>{v.note}</span>
            <span className="vh-item__author" style={{ display: "block" }}>{v.author}</span>
          </span>
          <span className="vh-item__time">{v.at}</span>
        </div>
      ))}
    </>
  );
}

/** Detail-head restore action — appends a new current version, never rewrites. */
export function RestoreVersionButton({ contentId, version }: { contentId: string; version: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction(router, setError);
  return (
    <>
      <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => restoreVersion({ contentId, version }))}>
        Restore v{version}
      </Button>
      <ErrorLine error={error} />
    </>
  );
}

/** Pending-review notice shown when a reviewer comment history exists. */
export function ReviewComments({ comments }: { comments: { id: string; author: string; body: string; ago: string }[] }) {
  if (comments.length === 0) return null;
  return (
    <div className="cr-panel__section">
      <div className="cr-panel__title">Reviewer comments</div>
      {comments.map((c) => (
        <div key={c.id} style={{ marginBottom: 6 }}>
          <Notice tone="soft">
            <div className="ax-mono ax-mute" style={{ fontSize: 10, letterSpacing: "0.08em" }}>{c.author} · {c.ago}</div>
            <div style={{ fontSize: 12.5, marginTop: 4 }}>{c.body}</div>
          </Notice>
        </div>
      ))}
    </div>
  );
}

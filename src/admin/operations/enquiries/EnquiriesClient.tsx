"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/admin/ui/Button";
import { Field, Textarea } from "@/admin/ui/Field";
import { Select } from "@/admin/ui/Data";
import { Notice } from "@/admin/ui/Notice";
import { assignEnquiry, assignEnquiryToMe, postEnquiryNote, transitionEnquiry } from "./actions";
import { canTransitionEnquiry } from "./schemas";
import type { AdminEnquiry, EnquiryAssignee } from "./types";

/** Detail header CTA — "Assign to me". */
export function AssignToMeButton({ enquiry }: { enquiry: AdminEnquiry }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="primary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await assignEnquiryToMe({ id: enquiry.id });
          if (res.ok) router.refresh();
        })
      }
    >
      Assign to me
    </Button>
  );
}

/** Assignment block — assignee + programme routing + "Assign & acknowledge". */
export function AssignBlock({ enquiry, assignees, routes }: { enquiry: AdminEnquiry; assignees: EnquiryAssignee[]; routes: string[] }) {
  const router = useRouter();
  const [assigneeId, setAssigneeId] = useState(enquiry.assignee?.id ?? "");
  const [routeLabel, setRouteLabel] = useState(enquiry.routeLabel ?? routes[0] ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const assign = () =>
    startTransition(async () => {
      const res = await assignEnquiry({ id: enquiry.id, assigneeId, routeLabel });
      if (res.ok) router.refresh();
      else setError(res.error);
    });

  return (
    <div className="eq-block__body">
      {error && <Notice tone="danger">{error}</Notice>}
      <Field label="Assign to" htmlFor="eq-assign">
        <Select id="eq-assign" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
          <option value="">— Not assigned —</option>
          {assignees.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} · {a.role}
            </option>
          ))}
        </Select>
      </Field>
      <div style={{ marginTop: 10 }}>
        <Field label="Route to programme" htmlFor="eq-route">
          <Select id="eq-route" value={routeLabel} onChange={(e) => setRouteLabel(e.target.value)}>
            {routes.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Button variant="primary" style={{ justifyContent: "center", width: "100%", marginTop: 12 }} onClick={assign} disabled={pending || !assigneeId}>
        Assign &amp; acknowledge
      </Button>
    </div>
  );
}

/** Internal notes — staff only. */
export function EnquiryNoteForm({ enquiryId }: { enquiryId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const post = () =>
    startTransition(async () => {
      const res = await postEnquiryNote({ id: enquiryId, body });
      if (res.ok) {
        setBody("");
        router.refresh();
      } else setError(res.error);
    });

  return (
    <>
      {error && <Notice tone="danger">{error}</Notice>}
      <Textarea style={{ marginTop: 8 }} placeholder="Add an internal note" value={body} onChange={(e) => setBody(e.target.value)} aria-label="Add an internal note" />
      <Button variant="soft" size="sm" style={{ marginTop: 8, justifyContent: "center", width: "100%" }} onClick={post} disabled={pending || !body.trim()}>
        Post note
      </Button>
    </>
  );
}

/** Workflow actions block — only valid forward transitions render. */
export function EnquiryActions({ enquiry }: { enquiry: AdminEnquiry }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const move = (target: "in_progress" | "resolved" | "archived" | "spam") =>
    startTransition(async () => {
      const res = await transitionEnquiry({ id: enquiry.id, target });
      if (res.ok) router.refresh();
      else setError(res.error);
    });

  return (
    <div className="eq-block__body" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {error && <Notice tone="danger">{error}</Notice>}
      {canTransitionEnquiry(enquiry.status, "resolved") && (
        <Button variant="accent" style={{ justifyContent: "center" }} onClick={() => move("resolved")} disabled={pending}>
          Mark resolved
        </Button>
      )}
      {canTransitionEnquiry(enquiry.status, "in_progress") && (
        <Button variant="ghost" style={{ justifyContent: "center" }} onClick={() => move("in_progress")} disabled={pending}>
          Move to in-progress
        </Button>
      )}
      {canTransitionEnquiry(enquiry.status, "archived") && (
        <Button variant="soft" style={{ justifyContent: "center" }} onClick={() => move("archived")} disabled={pending}>
          Archive
        </Button>
      )}
      {canTransitionEnquiry(enquiry.status, "spam") && (
        <Button variant="danger" style={{ justifyContent: "center" }} onClick={() => move("spam")} disabled={pending}>
          Flag as spam
        </Button>
      )}
      {enquiry.status === "archived" || enquiry.status === "spam" ? (
        <div className="ax-mute" style={{ fontSize: 12, textAlign: "center", padding: 6 }}>
          {enquiry.status === "archived" ? "Archived — read only." : "Flagged as spam."}
        </div>
      ) : null}
    </div>
  );
}

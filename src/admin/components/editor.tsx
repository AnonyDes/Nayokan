"use client";

import { useActionState, useState, useTransition, type ReactNode } from "react";
import type { AdminFormState } from "@/admin/actions";

// Client-side building blocks for the admin editors. All writes go through
// server actions in src/admin/actions.ts (requireStaff + RLS + governance).

const IDLE: AdminFormState = { status: "idle" };

// ---------------------------------------------------------------------------
// Form shell — action + status line. The server action receives FormData.
// ---------------------------------------------------------------------------

export function EditorForm({
  action,
  children,
  className,
}: {
  action: (prev: AdminFormState, fd: FormData) => Promise<AdminFormState>;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, IDLE);
  return (
    <form action={formAction} className={className}>
      {children}
      <div className="ed-footer-actions">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {state.status === "error" && <span className="ax-pill ax-pill--rejected">{state.message}</span>}
          {state.status === "success" && <span className="ax-pill ax-pill--verified">{state.message}</span>}
          {state.status === "idle" && <span className="ax-mono ax-mute-2">Unsaved changes are not published.</span>}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button type="submit" className="ax-btn ax-btn--primary" disabled={pending}>
            {pending ? "Saving…" : "Save draft"}
          </button>
        </div>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// RichBlock editor — paragraph/heading/quote/callout/list, reordable.
// Serializes into a hidden `body` field as JSON matching RichBlock[].
// ---------------------------------------------------------------------------

type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "callout"; text: string; tone?: "info" | "warn" }
  | { type: "list"; ordered?: boolean; items: string[] };

const BLOCK_TYPES: Block["type"][] = ["paragraph", "heading", "quote", "callout", "list"];

function emptyBlock(type: Block["type"]): Block {
  switch (type) {
    case "paragraph":
      return { type, text: "" };
    case "heading":
      return { type, level: 2, text: "" };
    case "quote":
      return { type, text: "", attribution: "" };
    case "callout":
      return { type, text: "", tone: "info" };
    case "list":
      return { type, ordered: false, items: [""] };
  }
}

function Rail({ onUp, onDown, onRemove }: { onUp: () => void; onDown: () => void; onRemove: () => void }) {
  return (
    <div className="ed-block__rail">
      <button type="button" className="ed-block__rail-btn" aria-label="Move up" onClick={onUp}>
        <svg viewBox="0 0 24 24"><path d="m6 15 6-6 6 6" /></svg>
      </button>
      <button type="button" className="ed-block__rail-btn" aria-label="Move down" onClick={onDown}>
        <svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      <button type="button" className="ed-block__rail-btn" aria-label="Remove block" onClick={onRemove}>
        <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>
    </div>
  );
}

export function BlocksEditor({ name = "body", initial }: { name?: string; initial: unknown }) {
  const [blocks, setBlocks] = useState<Block[]>(() =>
    Array.isArray(initial) ? (initial as Block[]).filter((b) => b && typeof b === "object" && "type" in b) : [],
  );

  const update = (i: number, next: Block) => setBlocks((bs) => bs.map((b, j) => (j === i ? next : b)));
  const move = (i: number, dir: -1 | 1) =>
    setBlocks((bs) => {
      const j = i + dir;
      if (j < 0 || j >= bs.length) return bs;
      const copy = [...bs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  const remove = (i: number) => setBlocks((bs) => bs.filter((_, j) => j !== i));
  const add = (type: Block["type"]) => setBlocks((bs) => [...bs, emptyBlock(type)]);

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(blocks)} />
      {blocks.map((b, i) => (
        <div className="ed-block" key={i}>
          <Rail onUp={() => move(i, -1)} onDown={() => move(i, 1)} onRemove={() => remove(i)} />
          <div className="ed-block__type">
            {b.type}
            {b.type === "heading" && (
              <select
                className="ax-select"
                style={{ width: "auto", padding: "0 4px", fontSize: 9.5 }}
                value={b.level}
                onChange={(e) => update(i, { ...b, level: Number(e.target.value) as 2 | 3 })}
                aria-label="Heading level"
              >
                <option value={2}>H2</option>
                <option value={3}>H3</option>
              </select>
            )}
          </div>
          {b.type === "paragraph" && (
            <textarea className="ed-p" rows={Math.max(2, Math.ceil(b.text.length / 90))} value={b.text}
              onChange={(e) => update(i, { ...b, text: e.target.value })} aria-label="Paragraph" />
          )}
          {b.type === "heading" && (
            <input className="ed-h ed-h-input" value={b.text}
              onChange={(e) => update(i, { ...b, text: e.target.value })} aria-label="Heading" />
          )}
          {b.type === "quote" && (
            <blockquote className="ed-quote">
              <textarea rows={2} value={b.text} onChange={(e) => update(i, { ...b, text: e.target.value })} aria-label="Quote" />
              <input className="ed-quote__cite" style={{ border: "none", outline: "none", background: "transparent", width: "100%" }}
                value={b.attribution ?? ""} placeholder="Attribution"
                onChange={(e) => update(i, { ...b, attribution: e.target.value })} aria-label="Attribution" />
            </blockquote>
          )}
          {b.type === "callout" && (
            <div className="ed-callout">
              <textarea rows={2} value={b.text} onChange={(e) => update(i, { ...b, text: e.target.value })} aria-label="Callout" />
            </div>
          )}
          {b.type === "list" && (
            <textarea className="ed-p" rows={Math.max(2, b.items.length)}
              value={b.items.join("\n")}
              onChange={(e) => update(i, { ...b, items: e.target.value.split("\n") })}
              aria-label="List items, one per line" />
          )}
        </div>
      ))}

      <div className="ed-insert" role="group" aria-label="Add a new block">
        <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
        <span>Add a new block</span>
        <div className="ed-insert__opts">
          {BLOCK_TYPES.map((t) => (
            <button key={t} type="button" className="ed-insert__opt" onClick={() => add(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Governance transitions — each button hits transition_content via action.
// ---------------------------------------------------------------------------

const ACTION_LABEL: Record<string, string> = {
  submit: "Submit for review",
  recall: "Recall to draft",
  request_changes: "Request changes",
  approve: "Approve",
  publish: "Publish",
  unpublish: "Unpublish",
  archive: "Archive",
  restore: "Restore",
};

export function allowedTransitions(status: string): string[] {
  switch (status) {
    case "draft":
    case "changes_requested":
      return ["submit", "archive"];
    case "in_review":
      return ["approve", "request_changes", "recall", "archive"];
    case "approved":
      return ["publish", "archive"];
    case "scheduled":
      return ["publish", "archive"];
    case "published":
      return ["unpublish", "archive"];
    case "archived":
      return ["restore"];
    default:
      return [];
  }
}

export function TransitionBar({
  status,
  onAction,
}: {
  status: string;
  onAction: (action: string, comment?: string) => Promise<AdminFormState>;
}) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<AdminFormState>(IDLE);
  const run = (a: string) => {
    const comment = a === "request_changes" ? window.prompt("Change request comment (required):") ?? "" : undefined;
    if (a === "request_changes" && !comment) return;
    start(async () => setResult(await onAction(a, comment || undefined)));
  };
  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {allowedTransitions(status).map((a) => (
          <button
            key={a}
            type="button"
            className={`ax-btn ax-btn--sm ${a === "publish" || a === "approve" ? "ax-btn--accent" : "ax-btn--ghost"}`}
            style={a === "request_changes" || a === "recall" ? { borderColor: "rgba(255,255,255,0.3)", color: "white" } : undefined}
            disabled={pending}
            onClick={() => run(a)}
          >
            {ACTION_LABEL[a] ?? a}
          </button>
        ))}
      </div>
      {result.message && (
        <div className="ax-mono" style={{ fontSize: 10.5, marginTop: 8, color: result.status === "error" ? "var(--danger)" : "var(--green)" }}>
          {result.message}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Metric verification chain — direct status updates (metric_status enum is
// separate from content_status; guard_metric_state enforces order).
// ---------------------------------------------------------------------------

const METRIC_FLOW = ["draft", "needs_verification", "verified", "approved", "published"];
const METRIC_ACTION_LABEL: Record<string, string> = {
  needs_verification: "Submit for verification",
  verified: "Mark verified",
  approved: "Approve",
  published: "Publish",
  draft: "Return to draft",
};

export function MetricActions({
  status,
  isPublic,
  onStatus,
  onPublic,
}: {
  status: string;
  isPublic: boolean;
  onStatus: (next: string) => Promise<AdminFormState>;
  onPublic: (next: boolean) => Promise<AdminFormState>;
}) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<AdminFormState>(IDLE);
  const idx = METRIC_FLOW.indexOf(status);
  const next = idx >= 0 && idx < METRIC_FLOW.length - 1 ? METRIC_FLOW[idx + 1] : null;
  const back = status === "needs_verification" ? "draft" : null;
  const run = (fn: () => Promise<AdminFormState>) => start(async () => setResult(await fn()));

  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {next && (
          <button type="button" className="ax-btn ax-btn--accent ax-btn--sm" disabled={pending}
            onClick={() => run(() => onStatus(next))}>
            {METRIC_ACTION_LABEL[next]}
          </button>
        )}
        {back && (
          <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" disabled={pending}
            style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}
            onClick={() => run(() => onStatus(back))}>
            {METRIC_ACTION_LABEL[back]}
          </button>
        )}
        {(status === "approved" || status === "published") && (
          <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" disabled={pending}
            style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}
            onClick={() => run(() => onPublic(!isPublic))}>
            {isPublic ? "Make private" : "Make public"}
          </button>
        )}
      </div>
      {result.message && (
        <div className="ax-mono" style={{ fontSize: 10.5, marginTop: 8, color: result.status === "error" ? "var(--danger)" : "var(--green)" }}>
          {result.message}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Workflow steps rail (design: publishing workflow accordion).
// ---------------------------------------------------------------------------

const FLOW = ["Draft", "Submitted", "In review", "Approved", "Scheduled", "Published"];
const FLOW_KEY: Record<string, number> = {
  draft: 0,
  changes_requested: 0,
  in_review: 2,
  approved: 3,
  scheduled: 4,
  published: 5,
};

export function WorkflowSteps({ status }: { status: string }) {
  const cur = FLOW_KEY[status] ?? 0;
  return (
    <ol className="ed-workflow">
      {FLOW.map((label, i) => (
        <li key={label} className={i < cur ? "is-done" : i === cur ? "is-current" : "is-todo"}>
          <span className="ed-workflow__dot">{i < cur ? "✓" : i + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// Section list + generic data-field editor (page + homepage editors).
// Sections are {key, isLive, data} — layout fixed, copy editable. The full
// array serializes into the hidden `sections` field on every change.
// ---------------------------------------------------------------------------

export interface EditableSection {
  id?: string;
  key: string;
  isLive: boolean;
  data: Record<string, unknown>;
}

function FieldForValue({
  label,
  value,
  onChange,
}: {
  label: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (typeof value === "boolean") {
    return (
      <label className="ax-field__label" style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} /> {label}
      </label>
    );
  }
  if (typeof value === "number") {
    return (
      <>
        <label className="ax-field__label">{label}</label>
        <input className="ax-input ax-input--mono" type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
      </>
    );
  }
  if (typeof value === "string" || value == null) {
    const s = value ?? "";
    return (
      <>
        <label className="ax-field__label">{label}</label>
        {s.length > 80 ? (
          <textarea className="ax-textarea" rows={3} value={s} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input className="ax-input" value={s} onChange={(e) => onChange(e.target.value)} />
        )}
      </>
    );
  }
  // Structured data (arrays/objects) — JSON editing surface.
  return (
    <>
      <label className="ax-field__label">{label} · structured</label>
      <textarea
        className="ax-textarea ax-input--mono"
        rows={5}
        defaultValue={JSON.stringify(value, null, 2)}
        onBlur={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch {
            /* keep raw text until valid */
          }
        }}
      />
    </>
  );
}

export function SectionsEditor({
  name = "sections",
  initial,
}: {
  name?: string;
  initial: EditableSection[];
}) {
  const [sections, setSections] = useState<EditableSection[]>(initial);
  const [active, setActive] = useState(0);
  const cur = sections[active];

  const patchData = (key: string, v: unknown) =>
    setSections((ss) => ss.map((s, i) => (i === active ? { ...s, data: { ...s.data, [key]: v } } : s)));

  return (
    <div className="he-grid">
      <input type="hidden" name={name} value={JSON.stringify(sections.map(({ key, isLive, data }) => ({ key, isLive, data })))} />

      <div className="he-sections">
        <div className="he-sections__head">
          <div className="he-sections__title">Sections</div>
          <div className="ax-mono ax-mute">{sections.length}</div>
        </div>
        <div className="he-sections__list">
          {sections.map((s, i) => (
            <button
              type="button"
              key={s.key}
              className={`he-sec${i === active ? " is-active" : ""}`}
              style={s.isLive ? undefined : { opacity: 0.55 }}
              onClick={() => setActive(i)}
            >
              <div className="he-sec__drag">::</div>
              <div className="he-sec__num">{String(i + 1).padStart(2, "0")}</div>
              <div>
                <div className="he-sec__title">{s.key.replace(/_/g, " ")}</div>
                <div className="he-sec__sub">{s.isLive ? "Live" : "Disabled"}</div>
              </div>
              <div
                role="checkbox"
                aria-checked={s.isLive}
                aria-label={`${s.key} live`}
                tabIndex={0}
                className={`he-sec__toggle${s.isLive ? " is-on" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSections((ss) => ss.map((x, j) => (j === i ? { ...x, isLive: !x.isLive } : x)));
                }}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    setSections((ss) => ss.map((x, j) => (j === i ? { ...x, isLive: !x.isLive } : x)));
                  }
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {cur && (
        <div className="he-canvas">
          <div className="he-canvas__head">
            <div>
              <div className="he-canvas__title">
                Section {String(active + 1).padStart(2, "0")} · {cur.key.replace(/_/g, " ")}
              </div>
              <div className="he-canvas__sub">Fixed layout · edit fields only</div>
            </div>
            <span className={`ax-pill ${cur.isLive ? "ax-pill--live" : "ax-pill--disabled"}`}>{cur.isLive ? "Live" : "Disabled"}</span>
          </div>
          <div className="he-canvas__body">
            <div className="ax-form">
              {Object.entries(cur.data).map(([k, v]) => (
                <div className="ax-form-row" key={k}>
                  <div className="ax-form-row__head">
                    <div className="ax-form-row__title">{k.replace(/_/g, " ")}</div>
                  </div>
                  <div className="ax-form-row__body">
                    <div className="ax-field">
                      <FieldForValue label={k} value={v} onChange={(nv) => patchData(k, nv)} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="ax-form-row">
                <div className="ax-form-row__head">
                  <div className="ax-form-row__title">Visibility</div>
                  <div className="ax-form-row__hint">Whether this section renders on the site.</div>
                </div>
                <div className="ax-form-row__body">
                  <label className="ax-field__label" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={cur.isLive}
                      onChange={(e) => setSections((ss) => ss.map((s, i) => (i === active ? { ...s, isLive: e.target.checked } : s)))}
                    />
                    Section is live
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

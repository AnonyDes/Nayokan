"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/admin/ui/Button";
import { Field, Input, Textarea } from "@/admin/ui/Field";
import { Select } from "@/admin/ui/Data";
import { Toggle } from "@/admin/ui/Toggle";
import { Modal } from "@/admin/ui/Modal";
import { Notice } from "@/admin/ui/Notice";
import { Pill } from "@/admin/ui/Pill";
import { approveMetric, assignVerifier, createMetric, linkEvidence, saveMetric, setMetricPublic, submitMetricForVerification, supersedeEvidence, uploadEvidence, verifyEvidence, verifyMetric } from "./actions";
import { canApproveMetric, canPublishMetric, canSubmitForVerification, canVerifyMetric, METRIC_UNITS, METRIC_WORLDS, verificationChain } from "./schemas";
import { EVIDENCE_TYPE_LABEL, WORLD_LABEL } from "./labels";
import type { EvidenceItem, EvidenceType, ImpactMetric, MetricVerifier, MetricWorld } from "./types";

type ErrorFn = (e: string | null) => void;

function useAction(router: ReturnType<typeof useRouter>, onResult: ErrorFn) {
  const [pending, startTransition] = useTransition();
  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>) =>
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        onResult(null);
        router.refresh();
      } else onResult(res.error);
    });
  return { pending, run };
}

/** Locked public toggle — server re-checks approval on every call. */
export function MetricPublicToggle({ metric }: { metric: ImpactMetric }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction(router, setError);
  const locked = !canPublishMetric(metric);
  return (
    <div>
      <Toggle
        checked={metric.isPublic}
        disabled={pending || locked}
        hint={locked ? "Locked — complete the verification chain" : metric.isPublic ? "Remove from public site" : "Publish on public site"}
        label={locked ? "Locked" : undefined}
        onChange={(v) => run(() => setMetricPublic({ id: metric.id, isPublic: v }))}
      />
      {error && (
        <div className="ax-mono" style={{ fontSize: 10.5, marginTop: 6, color: "var(--danger)" }}>
          {error}
        </div>
      )}
    </div>
  );
}

/** List head action — creates an empty draft and routes to its editor. */
export function AddMetricButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="primary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await createMetric();
          if (res.ok) router.push(`/admin/impact/metrics/${res.id}`);
        })
      }
      icon={
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      }
    >
      Add impact metric
    </Button>
  );
}

/** Header action — "Submit for verification". */
export function SubmitForVerificationButton({ metric }: { metric: ImpactMetric }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction(router, setError);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Button variant="primary" disabled={pending || !canSubmitForVerification(metric)} onClick={() => run(() => submitMetricForVerification({ id: metric.id }))}>
        Submit for verification
      </Button>
      {error && <span className="ax-mono" style={{ fontSize: 10.5, color: "var(--danger)" }}>{error}</span>}
    </span>
  );
}

/** Metric definition form — name, value/unit, description, scope & period. */
export function MetricDefinitionForm({ metric }: { metric: ImpactMetric }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: metric.name,
    value: metric.value === null ? "" : String(metric.value),
    unit: metric.unit,
    description: metric.description,
    periodLabel: metric.periodLabel,
    periodRangeLabel: metric.periodRangeLabel,
    geographicScope: metric.geographicScope,
    world: metric.world,
    programmeLabel: metric.programmeLabel,
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const { pending, run } = useAction(router, (e) => {
    setError(e);
    if (e === null) setSaved(true);
  });
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => {
    setSaved(false);
    setForm({ ...form, [k]: e.target.value });
  };

  const save = () =>
    run(() =>
      saveMetric({
        id: metric.id,
        name: form.name.trim(),
        value: form.value.trim() === "" ? null : Number(form.value),
        unit: form.unit,
        description: form.description,
        periodLabel: form.periodLabel,
        periodRangeLabel: form.periodRangeLabel,
        geographicScope: form.geographicScope,
        world: form.world as MetricWorld,
        programmeLabel: form.programmeLabel,
      }),
    );

  return (
    <div className="me-block">
      <div className="me-block__head">
        <div className="me-block__title">Metric definition</div>
        <div className="ax-mono ax-mute">§ F · 02a</div>
      </div>
      <div className="me-block__body ax-form">
        {error && <Notice tone="danger">{error}</Notice>}
        {saved && !error && <Notice tone="success">Draft saved.</Notice>}
        <div className="ax-form-row">
          <div className="ax-form-row__head">
            <div className="ax-form-row__title">Metric name</div>
            <div className="ax-form-row__hint">Institutional-quality naming. This is what appears on the public site.</div>
          </div>
          <div className="ax-form-row__body">
            <Input value={form.name} onChange={set("name")} />
            <div className="ax-field__hint">Tip: use everyday, verifiable language. Avoid marketing framings like &quot;empowered&quot; or &quot;impacted&quot;.</div>
          </div>
        </div>

        <div className="ax-form-row">
          <div className="ax-form-row__head">
            <div className="ax-form-row__title">Value &amp; unit</div>
            <div className="ax-form-row__hint">Numeric value. If the value is a rate or percentage, use the correct unit.</div>
          </div>
          <div className="ax-form-row__body">
            <div style={{ display: "grid", gridTemplateColumns: "200px 200px", gap: 12 }}>
              <Field label="Value" required htmlFor="me-value">
                <Input id="me-value" className="ax-input--mono" inputMode="decimal" value={form.value} onChange={set("value")} placeholder="—" />
              </Field>
              <Field label="Unit" htmlFor="me-unit">
                <Select id="me-unit" value={form.unit} onChange={set("unit")}>
                  {METRIC_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>
        </div>

        <div className="ax-form-row">
          <div className="ax-form-row__head">
            <div className="ax-form-row__title">Description</div>
            <div className="ax-form-row__hint">What exactly does this figure count? Public-facing.</div>
          </div>
          <div className="ax-form-row__body">
            <Textarea rows={3} value={form.description} onChange={set("description")} />
          </div>
        </div>

        <div className="ax-form-row">
          <div className="ax-form-row__head">
            <div className="ax-form-row__title">Scope &amp; period</div>
            <div className="ax-form-row__hint">Geographic and temporal boundary of this figure.</div>
          </div>
          <div className="ax-form-row__body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Reporting period" htmlFor="me-period">
                <Input id="me-period" value={form.periodLabel} onChange={set("periodLabel")} />
              </Field>
              <Field label="Period range" htmlFor="me-range">
                <Input id="me-range" value={form.periodRangeLabel} onChange={set("periodRangeLabel")} />
              </Field>
              <Field label="Geographic scope" htmlFor="me-geo">
                <Input id="me-geo" value={form.geographicScope} onChange={set("geographicScope")} />
              </Field>
              <Field label="Related world" htmlFor="me-world">
                <Select id="me-world" value={form.world} onChange={set("world")}>
                  {METRIC_WORLDS.map((w) => (
                    <option key={w} value={w}>
                      {WORLD_LABEL[w]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Related programme" htmlFor="me-programme">
                <Input id="me-programme" value={form.programmeLabel} onChange={set("programmeLabel")} />
              </Field>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={save} disabled={pending}>
            Save draft
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Verification-chain box — steps + inline actions at the current step. */
export function VerificationBox({ metric }: { metric: ImpactMetric }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction(router, setError);
  const { steps } = verificationChain(metric);
  const pill = (i: number, done: boolean) => {
    if (done) return <Pill tone="verified">Complete</Pill>;
    if (i === 4) return <Pill tone="neutral">Blocked</Pill>;
    return <Pill tone={i === 1 && metric.evidence.state === "none" ? "needs" : "neutral"}>{i === 1 && metric.evidence.state === "none" ? "Missing" : "Pending"}</Pill>;
  };
  return (
    <div className="me-verif-box">
      <div className="me-verif-box__title">Verification chain</div>
      <div className="me-verif-box__note">A metric appears publicly only after every step is complete.</div>
      {steps.map((s, i) => (
        <div className="me-verif-row" key={s.label}>
          <span style={{ color: "rgba(255,255,255,0.7)" }}>
            {i + 1} · {s.label}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {i === 2 && !s.done && (
              <Button size="sm" variant="ghost" disabled={pending || !canVerifyMetric(metric)} title={canVerifyMetric(metric) ? undefined : "Requires verified evidence"} onClick={() => run(() => verifyMetric({ id: metric.id }))}>
                Verify
              </Button>
            )}
            {i === 3 && !s.done && (
              <Button size="sm" variant="ghost" disabled={pending || !canApproveMetric(metric)} title={canApproveMetric(metric) ? undefined : "Requires verified status"} onClick={() => run(() => approveMetric({ id: metric.id }))}>
                Approve
              </Button>
            )}
            {pill(i, s.done)}
          </span>
        </div>
      ))}
      {error && (
        <div className="ax-mono" style={{ fontSize: 10.5, marginTop: 8, color: "#FF7A7A" }}>
          {error}
        </div>
      )}
    </div>
  );
}

/** Verifier block — assign + request verification. */
export function VerifierAssign({ metric, verifiers }: { metric: ImpactMetric; verifiers: MetricVerifier[] }) {
  const router = useRouter();
  const [verifierId, setVerifierId] = useState(metric.verifier?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction(router, setError);
  return (
    <div className="me-block" style={{ margin: 0 }}>
      <div className="me-block__head">
        <div className="me-block__title">Verifier</div>
        <div className="ax-mono ax-mute">{metric.verifier ? metric.verifier.name : "To assign"}</div>
      </div>
      <div className="me-block__body" style={{ padding: "14px 18px" }}>
        {error && <Notice tone="danger">{error}</Notice>}
        <Field label="Assign to" htmlFor="me-verifier">
          <Select id="me-verifier" value={verifierId} onChange={(e) => setVerifierId(e.target.value)}>
            <option value="">— Select a verifier —</option>
            {verifiers.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} · {v.role}
              </option>
            ))}
          </Select>
        </Field>
        <Button variant="accent" style={{ justifyContent: "center", marginTop: 10, width: "100%" }} disabled={pending || !verifierId} onClick={() => run(() => assignVerifier({ id: metric.id, verifierId }))}>
          Request verification
        </Button>
      </div>
    </div>
  );
}

/** Evidence attach — link an unlinked library item or register a new upload. */
export function AttachEvidenceButton({ metric, unlinked }: { metric: ImpactMetric; unlinked: EvidenceItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [evidenceId, setEvidenceId] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EvidenceType>("report");
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction(router, (e) => {
    setError(e);
    if (e === null) {
      setOpen(false);
      setTitle("");
      setEvidenceId("");
    }
  });

  return (
    <>
      <Button variant="soft" size="sm" onClick={() => setOpen(true)} icon={
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      }>
        Attach evidence
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Attach evidence" footer={null}>
        {error && <Notice tone="danger">{error}</Notice>}
        <div className="ax-form">
          {unlinked.length > 0 && (
            <Field label="Link from Evidence library" htmlFor="me-link">
              <div style={{ display: "flex", gap: 8 }}>
                <Select id="me-link" value={evidenceId} onChange={(e) => setEvidenceId(e.target.value)} style={{ flex: 1 }}>
                  <option value="">— Choose an item —</option>
                  {unlinked.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </Select>
                <Button variant="soft" size="sm" disabled={pending || !evidenceId} onClick={() => run(() => linkEvidence({ evidenceId, metricId: metric.id }))}>
                  Link
                </Button>
              </div>
            </Field>
          )}
          <Field label="New evidence title" htmlFor="me-ev-title">
            <Input id="me-ev-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Cohort 4 completion register" />
          </Field>
          <Field label="Type" htmlFor="me-ev-type">
            <Select id="me-ev-type" value={type} onChange={(e) => setType(e.target.value as EvidenceType)}>
              {Object.entries(EVIDENCE_TYPE_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          {/* File bytes pending Session B's storage bucket — metadata-only record today. */}
          <Button variant="primary" disabled={pending || title.trim().length < 3} onClick={() => run(() => uploadEvidence({ title: title.trim(), type, metricId: metric.id }))}>
            Register evidence
          </Button>
        </div>
      </Modal>
    </>
  );
}

/** Evidence list head action — upload (metadata-only until Session B storage). */
export function UploadEvidenceButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EvidenceType>("report");
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction(router, (e) => {
    setError(e);
    if (e === null) {
      setOpen(false);
      setTitle("");
    }
  });
  return (
    <>
      <Button
        variant="primary"
        onClick={() => setOpen(true)}
        icon={
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3v14M6 9l6-6 6 6M4 21h16" />
          </svg>
        }
      >
        Upload evidence
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Upload evidence" footer={null}>
        {error && <Notice tone="danger">{error}</Notice>}
        <div className="ax-form">
          <Field label="Evidence title" htmlFor="ev-title">
            <Input id="ev-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Impact report 2026 · signed PDF" />
          </Field>
          <Field label="Type" htmlFor="ev-type">
            <Select id="ev-type" value={type} onChange={(e) => setType(e.target.value as EvidenceType)}>
              {Object.entries(EVIDENCE_TYPE_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Button variant="primary" disabled={pending || title.trim().length < 3} onClick={() => run(() => uploadEvidence({ title: title.trim(), type, metricId: null }))}>
            Register evidence
          </Button>
        </div>
      </Modal>
    </>
  );
}

/** Evidence row actions — verify (awaiting_review) or supersede (append-only). */
export function EvidenceRowActions({ item }: { item: EvidenceItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [type, setType] = useState<EvidenceType>(item.type);
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction(router, (e) => {
    setError(e);
    if (e === null) setOpen(false);
  });
  return (
    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
      {item.status === "awaiting_review" && (
        <Button variant="soft" size="sm" disabled={pending} onClick={() => run(() => verifyEvidence({ id: item.id }))}>
          Verify
        </Button>
      )}
      {item.status !== "superseded" && (
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => setOpen(true)} title="Append a corrected record — the original stays on file">
          Supersede
        </Button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} tone="warn" title="Supersede evidence" footer={null}>
        {error && <Notice tone="danger">{error}</Notice>}
        <p className="ax-mute" style={{ fontSize: 12.5, margin: "0 0 12px" }}>
          Evidence is append-only — the original record stays on file and this new version replaces it for verification.
        </p>
        <div className="ax-form">
          <Field label="New evidence title" htmlFor="ev-s-title">
            <Input id="ev-s-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Type" htmlFor="ev-s-type">
            <Select id="ev-s-type" value={type} onChange={(e) => setType(e.target.value as EvidenceType)}>
              {Object.entries(EVIDENCE_TYPE_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Button variant="primary" disabled={pending || title.trim().length < 3} onClick={() => run(() => supersedeEvidence({ id: item.id, title: title.trim(), type }))}>
            Append superseding record
          </Button>
        </div>
      </Modal>
    </div>
  );
}

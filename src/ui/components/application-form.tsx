"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { FormState } from "@/platform/forms/actions";
import { submitApplication } from "@/platform/forms/actions";
import { Tbc } from "@/ui/components/tbc";
import { trackEvent } from "@/platform/analytics";
import type { SiteId, World } from "@/platform/sites/types";

// ---------------------------------------------------------------------------
// Six-step programme application (application.html) — shared by corporate
// /application and VTI /apply. Sections stay mounted (hidden) so every field
// posts naturally; no duplicated hidden inputs.
// ---------------------------------------------------------------------------

const IDLE: FormState = { status: "idle" };
const fieldErr = (s: FormState, n: string) => (s.status === "error" ? s.fieldErrors[n] : undefined);

const APPL_STEPS = ["Start", "You", "Programme", "Motivation", "Consent", "Review"];

const CLUSTERS = [
  "Digital & Technology",
  "Agri-Food & Production",
  "Craft & Manufacturing",
  "Hospitality & Services",
  "Health & Wellness",
  "Creative Economy",
];

const EDUCATION = [
  "Baccalaureate",
  "Undergraduate degree (BAC+3)",
  "Master's / postgraduate",
  "Doctorate / Research",
  "Other technical training",
];

const AGE_BANDS = ["18–22", "23–28", "29–35", "35+"];

export interface ProgrammeOption {
  value: string;
  label: string;
  meta: string;
}

export function ApplicationForm({
  site,
  world,
  successHref,
  homeHref = "/",
  homeLabel = "Nayokan",
  programmesHref = "/programmes",
  programmeOptions,
  defaultProgramme,
}: {
  site: SiteId;
  world: World;
  successHref: string;
  homeHref?: string;
  homeLabel?: string;
  programmesHref?: string;
  programmeOptions: ProgrammeOption[];
  defaultProgramme?: string;
}) {
  const [step, setStep] = useState(1);
  const [state, action, pending] = useActionState(submitApplication, IDLE);
  const [values, setValues] = useState<Record<string, string>>({
    programme: defaultProgramme ?? programmeOptions[0]?.value ?? "",
  });
  const tracked = useRef(false);

  useEffect(() => {
    if (state.status === "success" && !tracked.current) {
      tracked.current = true;
      trackEvent("form_submit", { site, world, form: "application" });
    }
  }, [state.status, site, world]);

  const set = (name: string, v: string) => setValues((s) => ({ ...s, [name]: v }));
  const go = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const value = (name: string) => values[name] ?? "";

  const selected = programmeOptions.find((p) => p.value === value("programme"));
  const programmeLabel = selected?.label ?? "—";
  const programmeCode = selected?.label.match(/P\/\d+/)?.[0] ?? "P/—";

  return (
    <>
      <div className="appl-header">
        <div className="appl-header-inner">
          <div>
            <div className="appl-crumbs">
              <a href={homeHref}>{homeLabel}</a>
              <span className="sep">/</span>
              <a href={programmesHref}>Programmes</a>
              <span className="sep">/</span>
              <span className="current">Apply</span>
            </div>
            <h1 className="appl-title">
              Application · <em style={{ fontStyle: "italic", fontWeight: 500 }}>{programmeCode}</em>
            </h1>
          </div>
          <div className="appl-progress" role="list" aria-label="Application progress">
            {APPL_STEPS.map((s, i) => (
              <div
                key={s}
                className={`appl-step${i + 1 === step ? " active" : i + 1 < step ? " done" : ""}`}
                role="listitem"
                aria-current={i + 1 === step ? "step" : undefined}
              >
                {String(i + 1).padStart(2, "0")} · {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="appl-body">
        <form action={action}>
          {/* STEP 1 — intro */}
          <section className="appl-step-content" hidden={step !== 1} aria-label="Step 1 — Getting started">
            <span className="meta">§ Step 01 — Getting started</span>
            <h2 style={{ marginTop: 8 }}>Before you begin.</h2>
            <p className="step-hint">
              This application takes about 8 minutes. Your progress is saved locally after each step, so
              you can return and finish. All information is confidential and reviewed by the relevant
              Nayokan programme team.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, margin: "32px 0" }}>
              <div style={{ padding: 20, border: "1px solid var(--line)", background: "var(--bone)" }}>
                <span className="meta">You’ll need</span>
                <ul style={{ marginTop: 12, padding: 0, listStyle: "none" }}>
                  {["Basic contact information", "A short written motivation", "About 8 minutes"].map((it) => (
                    <li key={it} style={{ padding: "8px 0", borderTop: "1px solid var(--line)", color: "var(--ink)", fontSize: "0.95rem" }}>
                      — {it}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ padding: 20, border: "1px solid var(--line)", background: "var(--bone)" }}>
                <span className="meta">You’ll hear back</span>
                <p style={{ marginTop: 12, fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                  Within 5–10 business days.
                </p>
                <p style={{ marginTop: 8, color: "var(--muted)", fontSize: "0.9rem" }}>
                  All applications are reviewed by a Nayokan programme lead.
                </p>
              </div>
            </div>
            <div className="appl-actions">
              <a href={programmesHref} className="link-inline">
                ← Back to programmes
              </a>
              <button type="button" onClick={() => go(2)} className="btn btn-primary">
                Begin application <span className="arrow">→</span>
              </button>
            </div>
          </section>

          {/* STEP 2 — you */}
          <section className="appl-step-content" hidden={step !== 2} aria-label="Step 2 — About you">
            <span className="meta">§ Step 02 — About you</span>
            <h2 style={{ marginTop: 8 }}>Tell us who you are.</h2>
            <p className="step-hint">Basic contact information. We use this only to route and reply to your application.</p>
            <div className="appl-field">
              <label htmlFor="a-name">
                Full name <span className="req">*</span>
              </label>
              <input id="a-name" name="fullName" type="text" placeholder="First & last name" autoComplete="name" value={value("fullName")} onChange={(e) => set("fullName", e.target.value)} />
              {fieldErr(state, "fullName") && <span className="err-msg">{fieldErr(state, "fullName")}</span>}
            </div>
            <div className="appl-field">
              <label htmlFor="a-email">
                Email <span className="req">*</span>
              </label>
              <input id="a-email" name="email" type="email" placeholder="you@email.com" autoComplete="email" value={value("email")} onChange={(e) => set("email", e.target.value)} />
              {fieldErr(state, "email") && <span className="err-msg">{fieldErr(state, "email")}</span>}
            </div>
            <div className="appl-field">
              <label htmlFor="a-phone">Phone / WhatsApp</label>
              <input id="a-phone" name="phone" type="tel" placeholder="+237 …" autoComplete="tel" value={value("phone")} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="appl-field">
              <label htmlFor="a-city">
                City · Region <span className="req">*</span>
              </label>
              <input id="a-city" name="cityRegion" type="text" placeholder="e.g. Yaoundé · Centre" value={value("cityRegion")} onChange={(e) => set("cityRegion", e.target.value)} />
              {fieldErr(state, "cityRegion") && <span className="err-msg">{fieldErr(state, "cityRegion")}</span>}
            </div>
            <div className="appl-field">
              <label htmlFor="a-age">Age</label>
              <select id="a-age" name="ageBand" value={value("ageBand")} onChange={(e) => set("ageBand", e.target.value)}>
                <option value="">Select…</option>
                {AGE_BANDS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
            <StepNav step={2} onBack={() => go(1)} onNext={() => go(3)} />
          </section>

          {/* STEP 3 — programme */}
          <section className="appl-step-content" hidden={step !== 3} aria-label="Step 3 — Programme of interest">
            <span className="meta">§ Step 03 — Programme of interest</span>
            <h2 style={{ marginTop: 8 }}>Which programme are you applying for?</h2>
            <p className="step-hint">Choose the primary programme. You can indicate secondary interests below.</p>
            <fieldset className="appl-field" style={{ border: "none", padding: 0, margin: "0 0 24px" }}>
              <legend style={{ fontFamily: "var(--font-mono)", fontSize: "var(--f-meta)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>
                Primary programme <span className="req">*</span>
              </legend>
              <div className="appl-radio-group" style={{ marginTop: 12 }}>
                {programmeOptions.map((p) => (
                  <label className="appl-radio" key={p.value}>
                    <input
                      type="radio"
                      name="programme"
                      value={p.value}
                      checked={value("programme") === p.value}
                      onChange={() => set("programme", p.value)}
                    />
                    <div>
                      {p.label} <small>{p.meta}</small>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="appl-field">
              <label htmlFor="a-cluster">Preferred cluster (if applicable)</label>
              <select id="a-cluster" name="cluster" value={value("cluster")} onChange={(e) => set("cluster", e.target.value)}>
                <option value="">Not sure yet</option>
                {CLUSTERS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <StepNav step={3} onBack={() => go(2)} onNext={() => go(4)} />
          </section>

          {/* STEP 4 — motivation */}
          <section className="appl-step-content" hidden={step !== 4} aria-label="Step 4 — Motivation and background">
            <span className="meta">§ Step 04 — Motivation & background</span>
            <h2 style={{ marginTop: 8 }}>Tell us your motivation.</h2>
            <p className="step-hint">This is the part programme leads read most carefully. Speak plainly, and in your own voice.</p>
            <div className="appl-field">
              <label htmlFor="a-edu">Highest educational level</label>
              <select id="a-edu" name="education" value={value("education")} onChange={(e) => set("education", e.target.value)}>
                {EDUCATION.map((e2) => (
                  <option key={e2}>{e2}</option>
                ))}
              </select>
            </div>
            <div className="appl-field">
              <label htmlFor="a-occ">Current occupation</label>
              <input id="a-occ" name="occupation" type="text" placeholder="e.g. Student, small business, worker, none" value={value("occupation")} onChange={(e) => set("occupation", e.target.value)} />
            </div>
            <div className="appl-field">
              <label htmlFor="a-mot">
                Why this programme? <span className="req">*</span>
              </label>
              <textarea id="a-mot" name="motivation" placeholder="300–500 words. Be specific." value={value("motivation")} onChange={(e) => set("motivation", e.target.value)} />
              {fieldErr(state, "motivation") && <span className="err-msg">{fieldErr(state, "motivation")}</span>}
            </div>
            <div className="appl-field">
              <label htmlFor="a-plans">What would you do with what you learn?</label>
              <textarea id="a-plans" name="plans" placeholder="Concrete plans, if you have them." value={value("plans")} onChange={(e) => set("plans", e.target.value)} />
            </div>
            <StepNav step={4} onBack={() => go(3)} onNext={() => go(5)} />
          </section>

          {/* STEP 5 — consent */}
          <section className="appl-step-content" hidden={step !== 5} aria-label="Step 5 — Consent">
            <span className="meta">§ Step 05 — Consent</span>
            <h2 style={{ marginTop: 8 }}>A few permissions before we finish.</h2>
            <p className="step-hint">All standard. You can withdraw consent at any time by writing to us.</p>
            <div className="appl-field">
              <div className="appl-radio-group" style={{ marginTop: 12 }}>
                <label className="appl-radio">
                  <input type="checkbox" name="confirmAccurate" checked={value("confirmAccurate") === "on"} onChange={(e) => set("confirmAccurate", e.target.checked ? "on" : "")} />
                  <div>
                    I confirm the information above is accurate to the best of my knowledge. <small>Required to submit.</small>
                  </div>
                </label>
                <label className="appl-radio">
                  <input type="checkbox" name="consentContact" checked={value("consentContact") === "on"} onChange={(e) => set("consentContact", e.target.checked ? "on" : "")} />
                  <div>
                    I agree that Nayokan may use my application information to review my candidacy and contact me. <small>Required to submit.</small>
                  </div>
                </label>
                <label className="appl-radio">
                  <input type="checkbox" name="updatesOptIn" checked={value("updatesOptIn") === "on"} onChange={(e) => set("updatesOptIn", e.target.checked ? "on" : "")} />
                  <div>
                    I’d like to receive occasional updates about other Nayokan programmes and opportunities. <small>Optional.</small>
                  </div>
                </label>
                <label className="appl-radio">
                  <input type="checkbox" name="featureOptIn" checked={value("featureOptIn") === "on"} onChange={(e) => set("featureOptIn", e.target.checked ? "on" : "")} />
                  <div>
                    If accepted, I consent to being featured (with prior approval) in Nayokan editorial content. <small>Optional.</small>
                  </div>
                </label>
              </div>
              {(fieldErr(state, "confirmAccurate") || fieldErr(state, "consentContact")) && (
                <span className="err-msg" role="alert">
                  {fieldErr(state, "confirmAccurate") ?? fieldErr(state, "consentContact")}
                </span>
              )}
            </div>
            <StepNav step={5} onBack={() => go(4)} onNext={() => go(6)} />
          </section>

          {/* STEP 6 — review */}
          <section className="appl-step-content" hidden={step !== 6} aria-label="Step 6 — Review">
            <span className="meta">§ Step 06 — Review</span>
            <h2 style={{ marginTop: 8 }}>Review before submitting.</h2>
            <p className="step-hint">This is a demo — no real submission. In production, this becomes your signed summary.</p>
            <div className="appl-review-grid">
              <ReviewRow k="Programme" v={programmeLabel} />
              <ReviewRow k="Cluster" v={value("cluster") || "—"} tbc={!value("cluster")} tag="from step 03" />
              <ReviewRow k="Name" v={value("fullName") || "—"} tbc={!value("fullName")} tag="from step 02" />
              <ReviewRow k="Email" v={value("email") || "—"} tbc={!value("email")} tag="from step 02" />
              <ReviewRow k="Location" v={value("cityRegion") || "—"} tbc={!value("cityRegion")} tag="from step 02" />
              <ReviewRow k="Education" v={value("education") || "—"} tbc={!value("education")} tag="from step 04" />
              <ReviewRow k="Motivation" v={value("motivation") ? `${value("motivation").slice(0, 60)}${value("motivation").length > 60 ? "…" : ""}` : "—"} tbc={!value("motivation")} tag="from step 04" />
              <ReviewRow k="Consent" v={value("confirmAccurate") && value("consentContact") ? "✓ Confirmed" : "—"} tbc={!(value("confirmAccurate") && value("consentContact"))} tag="required" />
            </div>
            <div className="appl-actions">
              <button type="button" onClick={() => go(5)} className="link-inline">
                ← Back to edit
              </button>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <span className="step-nav">Step 06 of 06</span>
                <button type="submit" className="btn btn-accent" disabled={pending} aria-disabled={pending}>
                  {pending ? "Submitting…" : "Submit application"} {!pending && <span className="arrow">→</span>}
                </button>
              </div>
            </div>
            {state.status === "error" && (
              <p role="alert" style={{ marginTop: 16, color: "var(--muted)" }}>
                Some fields need attention — go back to fix them, then submit again.
              </p>
            )}
            {state.status === "success" && (
              <p className="form-success" role="status" style={{ marginTop: 24, padding: 16, background: "var(--bone)", borderLeft: "3px solid var(--green-deep)", fontSize: "0.95rem" }}>
                ✓ Application logged — reference {state.reference}.{" "}
                <a href={`${successHref}?ref=${state.reference ?? ""}`} className="link-inline">
                  Continue <span className="arrow">→</span>
                </a>{" "}
                <Tbc>demo · form not wired</Tbc>
              </p>
            )}
          </section>
        </form>
      </div>
    </>
  );
}

function StepNav({ step, onBack, onNext }: { step: number; onBack: () => void; onNext: () => void }) {
  return (
    <div className="appl-actions">
      <button type="button" onClick={onBack} className="link-inline">
        ← Back
      </button>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <span className="step-nav">Step {String(step).padStart(2, "0")} of 06</span>
        <button type="button" onClick={onNext} className="btn btn-primary">
          Continue <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );
}

function ReviewRow({ k, v, tbc, tag }: { k: string; v: string; tbc?: boolean; tag?: string }) {
  return (
    <div className="appl-review-row">
      <span className="meta">{k}</span>
      <span className="val">
        {v} {tbc && <Tbc>{tag ?? "tbc"}</Tbc>}
      </span>
    </div>
  );
}

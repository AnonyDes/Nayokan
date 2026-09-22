"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { FormState } from "@/platform/forms/actions";
import { submitStartupApplication } from "@/platform/forms/actions";
import { Tbc } from "@/ui/components/tbc";
import { trackEvent } from "@/platform/analytics";

// Startup Centre innovator application (startup-apply.html) — six steps:
// Applicant / Institution / Innovation / Stage / Team & market / Consent.
// Sections stay mounted (hidden) so every field posts naturally. Uses the
// design's form-shell + fp-step progress + status-block states. The action
// is the shared stub: validates via Zod, returns a reference, persists
// nothing.

const IDLE: FormState = { status: "idle" };
const fieldErr = (s: FormState, n: string) => (s.status === "error" ? s.fieldErrors[n] : undefined);

const STEPS = ["Applicant", "Institution", "Innovation", "Stage", "Team & market", "Consent"];

const SECTORS = [
  "Agri-food",
  "Digital & Tech",
  "Health",
  "Energy",
  "Craft & Manufacturing",
  "Fintech",
  "Other",
];

const SOURCES = [
  "Original independent research",
  "University research programme",
  "Corporate spin-out",
  "Field-experience insight",
];

const STAGES = ["Idea", "Validation", "Product", "Market", "Revenue", "Scale"];

const DEMAND = ["No", "Pilot", "Letters of intent", "First customer", "Recurring revenue"];

const ROLES = ["Founder", "Researcher", "Team member"];

export function StartupApplicationForm() {
  const [step, setStep] = useState(1);
  const [state, action, pending] = useActionState(submitStartupApplication, IDLE);
  const [values, setValues] = useState<Record<string, string>>({});
  const tracked = useRef(false);

  useEffect(() => {
    if (state.status === "success" && !tracked.current) {
      tracked.current = true;
      trackEvent("form_submit", { site: "startup", world: "startup", form: "innovator-application" });
    }
  }, [state.status]);

  const set = (name: string, v: string) => setValues((s) => ({ ...s, [name]: v }));
  const value = (name: string) => values[name] ?? "";
  const go = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (pending) {
    return (
      <div className="form-shell">
        <div className="status-block">
          <div className="status-mark loading" aria-hidden="true" />
          <h1>Submitting your application…</h1>
          <p>
            Please keep this tab open. This usually takes a few seconds while we validate your
            submission against the Nayokan review framework.
          </p>
          <div className="status-ref">REF · APP/SC/2026/—</div>
        </div>
      </div>
    );
  }

  if (state.status === "success") {
    return (
      <div className="form-shell">
        <div className="status-block">
          <div className="status-mark ok">✓</div>
          <h1>Application received.</h1>
          <p>
            Thank you. Your submission has been logged with the Startup Centre selection panel. This
            is a demo — the application is validated but not yet persisted or emailed.
          </p>
          <div className="status-ref">REF · {state.reference}</div>
          <div className="status-actions">
            <a href="/" className="btn btn-primary">
              Back to Startup Centre <span className="arrow">→</span>
            </a>
            <a href="/opportunities" className="btn btn-ghost">
              Browse other opportunities
            </a>
            <a href={`/apply/success?ref=${state.reference ?? ""}`} className="btn btn-ghost">
              Confirmation page <span className="arrow">→</span>
            </a>
          </div>
          <p style={{ marginTop: 16 }}>
            <Tbc>demo · form not wired</Tbc>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-shell">
      <div className="form-progress" aria-label="Application progress">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`fp-step${i + 1 === step ? " on" : i + 1 < step ? " done" : ""}`}
            aria-current={i + 1 === step ? "step" : undefined}
          >
            <span className="num">{String(i + 1).padStart(2, "0")}</span>
            {s}
          </div>
        ))}
      </div>

      <form className="form-block" action={action}>
        {/* STEP 01 — Applicant */}
        <section hidden={step !== 1} aria-label="Step 1 — Applicant">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <div>
              <span className="meta">Step 01 · Applicant</span>
              <h2 style={{ marginTop: 8 }}>Tell us who you are.</h2>
            </div>
          </div>
          <p className="helper">Basic contact information. We use this only to route and reply to your application.</p>
          <div className="form-grid">
            <div className="ff">
              <label htmlFor="sa-name">Full name <span className="req">*</span></label>
              <input id="sa-name" name="fullName" type="text" placeholder="e.g. Aïcha Nkomo" autoComplete="name" value={value("fullName")} onChange={(e) => set("fullName", e.target.value)} />
              {fieldErr(state, "fullName") && <span className="err-msg">{fieldErr(state, "fullName")}</span>}
            </div>
            <div className="ff">
              <label htmlFor="sa-email">Email <span className="req">*</span></label>
              <input id="sa-email" name="email" type="email" placeholder="aicha@venture.cm" autoComplete="email" value={value("email")} onChange={(e) => set("email", e.target.value)} />
              {fieldErr(state, "email") && <span className="err-msg">{fieldErr(state, "email")}</span>}
            </div>
            <div className="ff">
              <label htmlFor="sa-phone">Phone / WhatsApp</label>
              <input id="sa-phone" name="phone" type="tel" placeholder="+237 …" autoComplete="tel" value={value("phone")} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="ff">
              <label htmlFor="sa-role">Role</label>
              <select id="sa-role" name="role" value={value("role")} onChange={(e) => set("role", e.target.value)}>
                <option value="">Select</option>
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <Nav step={1} onNext={() => go(2)} />
        </section>

        {/* STEP 02 — Institution */}
        <section hidden={step !== 2} aria-label="Step 2 — Institution">
          <span className="meta">Step 02 · Institution</span>
          <h2 style={{ marginTop: 8 }}>Your institutional context.</h2>
          <p className="helper">
            Are you formally affiliated with a university or institution? Any IP or supervisor
            considerations we should know about? Optional — independent innovators are welcome.
          </p>
          <div className="form-grid">
            <div className="ff">
              <label htmlFor="sa-univ">University or institution</label>
              <input id="sa-univ" name="university" type="text" placeholder="e.g. University of Yaoundé I" value={value("university")} onChange={(e) => set("university", e.target.value)} />
            </div>
            <div className="ff">
              <label htmlFor="sa-dept">Department / lab</label>
              <input id="sa-dept" name="department" type="text" placeholder="Optional" value={value("department")} onChange={(e) => set("department", e.target.value)} />
            </div>
            <div className="ff full">
              <label htmlFor="sa-affil">Institutional affiliation (context)</label>
              <textarea id="sa-affil" name="affiliation" placeholder="Are you formally affiliated? Any IP or supervisor considerations?" value={value("affiliation")} onChange={(e) => set("affiliation", e.target.value)} />
            </div>
          </div>
          <Nav step={2} onBack={() => go(1)} onNext={() => go(3)} />
        </section>

        {/* STEP 03 — Innovation */}
        <section hidden={step !== 3} aria-label="Step 3 — Innovation">
          <span className="meta">Step 03 · Innovation</span>
          <h2 style={{ marginTop: 8 }}>
            Tell us about your <em style={{ fontStyle: "italic", fontWeight: 500 }}>innovation</em>.
          </h2>
          <p className="helper">
            Describe the problem you are solving, your proposed solution, and where you are in the
            commercialization journey. Be specific and honest — we prioritise clarity over polish.
          </p>
          <div className="form-grid">
            <div className="ff full">
              <label htmlFor="sa-title">Working title of your innovation <span className="req">*</span></label>
              <input id="sa-title" name="ventureName" type="text" placeholder="e.g. Post-harvest cold-chain platform for smallholder cooperatives" value={value("ventureName")} onChange={(e) => set("ventureName", e.target.value)} />
              <span className="hint">A short, plain-English title. Not a slogan.</span>
              {fieldErr(state, "ventureName") && <span className="err-msg">{fieldErr(state, "ventureName")}</span>}
            </div>
            <div className="ff full">
              <label htmlFor="sa-problem">The problem — what is broken today? <span className="req">*</span></label>
              <textarea id="sa-problem" name="problem" placeholder="A concrete description of the problem. Who experiences it. How they cope today." value={value("problem")} onChange={(e) => set("problem", e.target.value)} />
              {fieldErr(state, "problem") && <span className="err-msg">{fieldErr(state, "problem")}</span>}
            </div>
            <div className="ff full">
              <label htmlFor="sa-solution">The solution — how your innovation addresses it <span className="req">*</span></label>
              <textarea id="sa-solution" name="solution" placeholder="What you have built or intend to build. What makes it different from the current approach." value={value("solution")} onChange={(e) => set("solution", e.target.value)} />
              {fieldErr(state, "solution") && <span className="err-msg">{fieldErr(state, "solution")}</span>}
            </div>
            <div className="ff">
              <label htmlFor="sa-sector">Sector <span className="req">*</span></label>
              <select id="sa-sector" name="sector" value={value("sector")} onChange={(e) => set("sector", e.target.value)}>
                <option value="">Select a sector</option>
                {SECTORS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              {fieldErr(state, "sector") && <span className="err-msg">{fieldErr(state, "sector")}</span>}
            </div>
            <div className="ff">
              <label htmlFor="sa-source">Innovation source</label>
              <select id="sa-source" name="source" value={value("source")} onChange={(e) => set("source", e.target.value)}>
                <option value="">Select</option>
                {SOURCES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <Nav step={3} onBack={() => go(2)} onNext={() => go(4)} />
        </section>

        {/* STEP 04 — Stage */}
        <section hidden={step !== 4} aria-label="Step 4 — Stage">
          <span className="meta">Step 04 · Stage</span>
          <h2 style={{ marginTop: 8 }}>Where are you today?</h2>
          <p className="helper">
            Position your venture on the commercialization pathway — and what evidence of demand
            you already hold.
          </p>
          <div className="form-grid">
            <div className="ff">
              <label htmlFor="sa-stage">Current stage <span className="req">*</span></label>
              <select id="sa-stage" name="stage" value={value("stage")} onChange={(e) => set("stage", e.target.value)}>
                <option value="">Select</option>
                {STAGES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              {fieldErr(state, "stage") && <span className="err-msg">{fieldErr(state, "stage")}</span>}
            </div>
            <div className="ff">
              <label htmlFor="sa-demand">First evidence of demand?</label>
              <select id="sa-demand" name="demand" value={value("demand")} onChange={(e) => set("demand", e.target.value)}>
                <option value="">Select</option>
                {DEMAND.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="ff full">
              <label htmlFor="sa-proof">What proof of demand do you have today?</label>
              <textarea id="sa-proof" name="demandProof" placeholder="Pilots, letters of intent, first customers, revenue, etc." value={value("demandProof")} onChange={(e) => set("demandProof", e.target.value)} />
            </div>
          </div>
          <Nav step={4} onBack={() => go(3)} onNext={() => go(5)} />
        </section>

        {/* STEP 05 — Team & market */}
        <section hidden={step !== 5} aria-label="Step 5 — Team and market">
          <span className="meta">Step 05 · Team & market</span>
          <h2 style={{ marginTop: 8 }}>Your team and your market.</h2>
          <p className="helper">Who is building this, where, and for whom.</p>
          <div className="form-grid">
            <div className="ff">
              <label htmlFor="sa-team">Team size</label>
              <input id="sa-team" name="teamSize" type="number" min={1} placeholder="e.g. 3" value={value("teamSize")} onChange={(e) => set("teamSize", e.target.value)} />
            </div>
            <div className="ff">
              <label htmlFor="sa-region">Country / region of operation</label>
              <input id="sa-region" name="region" type="text" placeholder="e.g. Central Region, Cameroon" value={value("region")} onChange={(e) => set("region", e.target.value)} />
            </div>
            <div className="ff full">
              <label htmlFor="sa-market">Target market — who buys, at what price, how often?</label>
              <textarea id="sa-market" name="market" placeholder="Customer profile, pricing hypothesis, purchase frequency." value={value("market")} onChange={(e) => set("market", e.target.value)} />
            </div>
            <div className="ff full">
              <label htmlFor="sa-links">Supporting material (links, deck, video — optional)</label>
              <input id="sa-links" name="links" type="text" placeholder="One or more URLs (Drive, Notion, YouTube …)" value={value("links")} onChange={(e) => set("links", e.target.value)} />
            </div>
          </div>
          <Nav step={5} onBack={() => go(4)} onNext={() => go(6)} />
        </section>

        {/* STEP 06 — Consent */}
        <section hidden={step !== 6} aria-label="Step 6 — Consent">
          <span className="meta">Step 06 · Consent</span>
          <h2 style={{ marginTop: 8 }}>Permissions before we finish.</h2>
          <p className="helper">All standard. You can withdraw consent at any time by writing to us.</p>
          <div className="check-row">
            <input type="checkbox" id="sa-review" name="consentReview" checked={value("consentReview") === "on"} onChange={(e) => set("consentReview", e.target.checked ? "on" : "")} />
            <label htmlFor="sa-review">
              I agree that Nayokan may review this submission with its selection panel.
              <small>Reviewed under Nayokan governance protocol; no external disclosure without your consent.</small>
            </label>
          </div>
          <div className="check-row">
            <input type="checkbox" id="sa-contact" name="consentContact" checked={value("consentContact") === "on"} onChange={(e) => set("consentContact", e.target.checked ? "on" : "")} />
            <label htmlFor="sa-contact">
              I agree that Nayokan may contact me about this application and related opportunities.
              <small>You can withdraw consent at any time by emailing innovators@nayokan.org.</small>
            </label>
          </div>
          <div className="check-row">
            <input type="checkbox" id="sa-truth" name="confirmAccurate" checked={value("confirmAccurate") === "on"} onChange={(e) => set("confirmAccurate", e.target.checked ? "on" : "")} />
            <label htmlFor="sa-truth">I confirm the information provided is accurate to the best of my knowledge.</label>
          </div>
          {(fieldErr(state, "consentReview") || fieldErr(state, "consentContact") || fieldErr(state, "confirmAccurate")) && (
            <span className="err-msg" role="alert">
              {fieldErr(state, "consentReview") ?? fieldErr(state, "consentContact") ?? fieldErr(state, "confirmAccurate")}
            </span>
          )}
          {state.status === "error" && !Object.keys(state.fieldErrors).length && (
            <p role="alert" style={{ marginTop: 16, color: "var(--muted)" }}>
              {state.message ?? "Something went wrong — please try again."}
            </p>
          )}
          <div className="form-actions">
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button type="button" className="btn btn-ghost" style={{ padding: "12px 18px" }} onClick={() => go(5)}>
                ← Previous step
              </button>
              <span className="save-note">
                Demo form — nothing is persisted <Tbc>demo</Tbc>
              </span>
            </div>
            <button type="submit" className="btn btn-primary" disabled={pending} aria-disabled={pending}>
              Submit application <span className="arrow">→</span>
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}

function Nav({ step, onBack, onNext }: { step: number; onBack?: () => void; onNext: () => void }) {
  return (
    <div className="form-actions">
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {onBack && (
          <button type="button" className="btn btn-ghost" style={{ padding: "12px 18px" }} onClick={onBack}>
            ← Previous step
          </button>
        )}
      </div>
      <button type="button" className="btn btn-primary" onClick={onNext}>
        Continue to Step {String(step + 1).padStart(2, "0")} <span className="arrow">→</span>
      </button>
    </div>
  );
}

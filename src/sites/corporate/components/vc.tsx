"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { FormState } from "@/platform/forms/actions";
import { submitVcEnquiry } from "@/platform/forms/actions";
import { Field } from "@/ui/components/form-field";
import { Tbc } from "@/ui/components/tbc";
import { trackEvent } from "@/platform/analytics";
import type { Venture } from "@/platform/content/types";

const IDLE: FormState = { status: "idle" };
const err = (s: FormState, n: string) => (s.status === "error" ? s.fieldErrors[n] : undefined);

// Compact IR enquiry on the VC world index (vc-enquiry-form in venture-capital.html).
export function VcEnquiryForm() {
  const [state, action, pending] = useActionState(submitVcEnquiry, IDLE);
  const tracked = useRef(false);
  useEffect(() => {
    if (state.status === "success" && !tracked.current) {
      tracked.current = true;
      trackEvent("form_submit", { site: "corporate", world: "venture_capital", form: "vc-enquiry" });
    }
  }, [state.status]);

  return (
    <form className="vc-enquiry-form" action={action}>
      <Field label="Organization" htmlFor="vn" error={err(state, "organization")}>
        <input id="vn" name="organization" type="text" placeholder="Your organization" autoComplete="organization" />
      </Field>
      <Field label="Enquiry type" htmlFor="vk" error={err(state, "category")}>
        <select id="vk" name="category">
          <option>Institutional investor</option>
          <option>Co-investment</option>
          <option>Development finance partnership</option>
          <option>Other</option>
        </select>
      </Field>
      <Field label="Contact email" htmlFor="ve" error={err(state, "email")}>
        <input id="ve" name="email" type="email" placeholder="you@organization.org" autoComplete="email" />
      </Field>
      <Field label="Message" htmlFor="vm" error={err(state, "message")}>
        <textarea id="vm" name="message" placeholder="Brief context on your interest." />
      </Field>
      <button type="submit" className="btn btn-accent" disabled={pending} aria-disabled={pending}>
        {pending ? "Sending…" : "Submit enquiry"} {!pending && <span className="arrow">→</span>}
      </button>
      {state.status === "success" && (
        <p className="form-success" role="status" style={{ marginTop: 20, color: "var(--green-glow)", fontSize: "0.9rem" }}>
          ✓ Enquiry received. IR will respond within 5 business days. <Tbc onDark>demo</Tbc>
        </p>
      )}
      {state.status === "error" && !Object.keys(state.fieldErrors).length && (
        <p role="alert" style={{ marginTop: 16, color: "var(--muted-invert)" }}>
          {state.message ?? "Something went wrong — please try again."}
        </p>
      )}
    </form>
  );
}

// Portfolio grid with sector filter chips (vc-portfolio.html).
export function VcPortfolioGrid({ ventures }: { ventures: Venture[] }) {
  const sectors = [...new Set(ventures.map((v) => v.sector).filter(Boolean))] as string[];
  const [sector, setSector] = useState<string | null>(null);
  const visible = sector ? ventures.filter((v) => v.sector === sector) : ventures;

  return (
    <>
      <div className="filter-bar" style={{ borderColor: "var(--line-invert)" }}>
        <span className="fb-label" style={{ color: "var(--muted-invert)" }}>
          Sector
        </span>
        <button
          className="chip on"
          style={
            !sector
              ? { background: "var(--paper)", color: "var(--ink)", borderColor: "var(--paper)" }
              : { background: "transparent", color: "var(--paper)", borderColor: "var(--line-invert-strong)" }
          }
          aria-pressed={!sector}
          onClick={() => setSector(null)}
        >
          All
        </button>
        {sectors.map((s) => (
          <button
            key={s}
            className="chip"
            style={
              sector === s
                ? { background: "var(--paper)", color: "var(--ink)", borderColor: "var(--paper)" }
                : { background: "transparent", color: "var(--paper)", borderColor: "var(--line-invert-strong)" }
            }
            aria-pressed={sector === s}
            onClick={() => setSector(sector === s ? null : s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="pf-grid" style={{ background: "var(--line-invert)", borderColor: "var(--line-invert)" }}>
        {visible.map((v) => (
          <article className="pf-card pf-card-dark" key={v.id}>
            <div className="pf-head">
              <div className="pf-logo">
                {v.code}
                <Tbc onDark />
              </div>
              <span className="pf-status">Active</span>
            </div>
            <h4>{v.name}</h4>
            <p>{v.description}</p>
            <div className="pf-meta">
              <div>
                <span className="meta on-dark">Sector</span>
                <span className="val">{v.sector}</span>
              </div>
              <div>
                <span className="meta on-dark">Stage</span>
                <span className="val">{v.stage}</span>
              </div>
              <div>
                <span className="meta on-dark">Region</span>
                <span className="val">{v.location}</span>
              </div>
              <div>
                <span className="meta on-dark">Ticket</span>
                <span className="val">
                  —<Tbc onDark />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p style={{ marginTop: 24, fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.14em", color: "var(--muted-invert)", textTransform: "uppercase" }}>
        Ticket sizes, ownership, performance and returns published only after formal LP + venture
        consent.
      </p>
    </>
  );
}

"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { FormState } from "@/platform/forms/actions";
import {
  submitBookingEnquiry,
  submitEnquiry,
  submitVcPartnerEnquiry,
} from "@/platform/forms/actions";
import { Field } from "@/ui/components/form-field";
import { Tbc } from "@/ui/components/tbc";
import { trackEvent } from "@/platform/analytics";

const IDLE: FormState = { status: "idle" };

function fieldErr(state: FormState, name: string): string | undefined {
  return state.status === "error" ? state.fieldErrors[name] : undefined;
}

function SubmitButton({
  pending,
  label,
  className = "btn btn-primary",
}: {
  pending: boolean;
  label: string;
  className?: string;
}) {
  return (
    <button type="submit" className={className} disabled={pending} aria-disabled={pending}>
      {pending ? "Sending…" : label} {!pending && <span className="arrow">→</span>}
    </button>
  );
}

// ---------------------------------------------------------------------------
// General enquiry (contact.html)
// ---------------------------------------------------------------------------

export function EnquiryForm() {
  const [state, action, pending] = useActionState(submitEnquiry, IDLE);
  const tracked = useRef(false);

  useEffect(() => {
    if (state.status === "success" && !tracked.current) {
      tracked.current = true;
      trackEvent("form_submit", { site: "corporate", world: "corporate", form: "enquiry" });
    }
  }, [state.status]);

  return (
    <form className="contact-form" action={action}>
      <Field label="Name" htmlFor="cn" required error={fieldErr(state, "name")}>
        <input id="cn" name="name" type="text" placeholder="Your name" autoComplete="name" />
      </Field>
      <Field label="Organization" htmlFor="co" optional error={fieldErr(state, "organization")}>
        <input id="co" name="organization" type="text" placeholder="Your organization" autoComplete="organization" />
      </Field>
      <Field label="Email" htmlFor="ce" required error={fieldErr(state, "email")}>
        <input id="ce" name="email" type="email" placeholder="you@email.com" autoComplete="email" />
      </Field>
      <Field label="Enquiry type" htmlFor="ct" required error={fieldErr(state, "enquiryType")}>
        <select id="ct" name="enquiryType" defaultValue="">
          <option value="" disabled>
            Select the closest match
          </option>
          <option>Programme application</option>
          <option>Institutional partnership</option>
          <option>Investor / IR</option>
          <option>Media / press</option>
          <option>Hospitality booking enquiry</option>
          <option>Other</option>
        </select>
      </Field>
      <Field label="Message" htmlFor="cm" required error={fieldErr(state, "message")}>
        <textarea id="cm" name="message" placeholder="Tell us briefly what you're getting in touch about." />
      </Field>
      <SubmitButton pending={pending} label="Send enquiry" />
      <p style={{ marginTop: 16, fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--muted)", letterSpacing: "0.02em" }}>
        By submitting, you agree to Nayokan’s{" "}
        <a href="/privacy" style={{ borderBottom: "1px solid var(--line-strong)" }}>
          privacy notice
        </a>
        . <Tbc>policy tbc</Tbc>
      </p>
      {state.status === "success" && (
        <p className="form-success" role="status" style={{ marginTop: 20, padding: 16, background: "var(--bone)", borderLeft: "3px solid var(--green-deep)", color: "var(--ink)", fontSize: "0.95rem" }}>
          ✓ Thank you. Your enquiry has been logged — reference {state.reference}. Expect a response
          within one business day. <Tbc>demo · form not wired</Tbc>
        </p>
      )}
      {state.status === "error" && !Object.keys(state.fieldErrors).length && (
        <p role="alert" style={{ marginTop: 16, color: "var(--muted)" }}>
          {state.message ?? "Something went wrong — please try again."}
        </p>
      )}
    </form>
  );
}

// ---------------------------------------------------------------------------
// VC partnership enquiry (vc-partner.html — light panel on navy)
// ---------------------------------------------------------------------------

const VC_CATEGORIES = [
  "Institutional investor",
  "Development partner",
  "Corporate partner",
  "University",
  "Entrepreneur",
  "Other",
];

export function VcPartnerForm() {
  const [state, action, pending] = useActionState(submitVcPartnerEnquiry, IDLE);
  const [category, setCategory] = useState(VC_CATEGORIES[0]);
  const tracked = useRef(false);

  useEffect(() => {
    if (state.status === "success" && !tracked.current) {
      tracked.current = true;
      trackEvent("form_submit", { site: "corporate", world: "venture_capital", form: "vc-partner" });
    }
  }, [state.status]);

  return (
    <form className="form-block" style={{ border: "none", padding: 0 }} action={action}>
      <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
        <span className="meta">Partnership category</span>
        <div className="filter-bar" style={{ padding: "8px 0 16px", marginBottom: 16 }}>
          {VC_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip${category === c ? " on" : ""}`}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <input type="hidden" name="category" value={category} />
      </fieldset>

      <div className="form-grid">
        <Field label="Organisation" htmlFor="vp-org" required error={fieldErr(state, "organization")} className="full">
          <input id="vp-org" name="organization" type="text" placeholder="Your organisation" autoComplete="organization" />
        </Field>
        <Field label="Contact name" htmlFor="vp-name" optional>
          <input id="vp-name" name="contactName" type="text" placeholder="Full name" autoComplete="name" />
        </Field>
        <Field label="Role" htmlFor="vp-role" optional>
          <input id="vp-role" name="role" type="text" placeholder="Role / title" autoComplete="organization-title" />
        </Field>
        <Field label="Email" htmlFor="vp-email" optional error={fieldErr(state, "email")}>
          <input id="vp-email" name="email" type="email" placeholder="you@organisation.org" autoComplete="email" />
        </Field>
        <Field label="Country" htmlFor="vp-country" optional>
          <input id="vp-country" name="country" type="text" placeholder="Country of headquarters" autoComplete="country-name" />
        </Field>
        <Field label="Message" htmlFor="vp-msg" optional className="full">
          <textarea
            id="vp-msg"
            name="message"
            placeholder="A short written brief on your interest, mandate and any relevant constraints."
          />
        </Field>
      </div>

      <div className={`check-row${fieldErr(state, "consent") ? " err" : ""}`} style={{ marginTop: 24 }}>
        <input type="checkbox" id="vp-consent" name="consent" />
        <label htmlFor="vp-consent">
          I agree that Nayokan may respond to this enquiry.
          <small>Response only. No further communication without consent.</small>
        </label>
      </div>
      {fieldErr(state, "consent") && (
        <span className="err-msg" role="alert">
          {fieldErr(state, "consent")}
        </span>
      )}

      <div className="form-actions" style={{ borderTop: "none", paddingTop: 16 }}>
        <span className="save-note">All fields optional but recommended.</span>
        <SubmitButton pending={pending} label="Send enquiry" />
      </div>

      {state.status === "success" && (
        <p className="form-success" role="status" style={{ marginTop: 24, padding: 16, background: "var(--bone)", borderLeft: "3px solid var(--green-deep)", color: "var(--ink)", fontSize: "0.95rem" }}>
          ✓ Thank you. Your enquiry has been logged with Investor Relations. Expect a response within
          5 business days. <Tbc>demo · form not wired</Tbc>
        </p>
      )}
    </form>
  );
}

// ---------------------------------------------------------------------------
// Hospitality booking enquiry (hospitality.html #booking)
// ---------------------------------------------------------------------------

export function BookingForm({ compact = false }: { compact?: boolean }) {
  const [state, action, pending] = useActionState(submitBookingEnquiry, IDLE);
  const tracked = useRef(false);

  useEffect(() => {
    if (state.status === "success" && !tracked.current) {
      tracked.current = true;
      trackEvent("form_submit", { site: "corporate", world: "hospitality", form: "booking" });
    }
  }, [state.status]);

  return (
    <form className="hosp-booking-card" action={action}>
      <div className="booking-row">
        <Field label="Property" htmlFor="bk-property" error={fieldErr(state, "property")}>
          <select name="property" id="bk-property">
            <option>Guesthouse — 001</option>
            <option>Long-stay Residence — 002</option>
            <option>Workspace — 003</option>
          </select>
        </Field>
        <Field label="Guests" htmlFor="bk-guests" error={fieldErr(state, "guests")}>
          <select name="guests" id="bk-guests">
            <option>1 Guest</option>
            <option>2 Guests</option>
            <option>3+ Guests</option>
          </select>
        </Field>
      </div>
      <div className="booking-row">
        <Field label="Arrival" htmlFor="bk-arrival" error={fieldErr(state, "arrival")}>
          <input name="arrival" id="bk-arrival" type="date" />
        </Field>
        <Field label="Departure" htmlFor="bk-departure" error={fieldErr(state, "departure")}>
          <input name="departure" id="bk-departure" type="date" />
        </Field>
      </div>
      <div className="booking-row" style={{ gridTemplateColumns: "1fr" }}>
        <Field label="Purpose (optional)" htmlFor="bk-purpose">
          <input name="purpose" id="bk-purpose" type="text" placeholder="Institutional visit, research, family, ..." />
        </Field>
      </div>
      <div className="booking-row" style={{ gridTemplateColumns: "1fr", borderBottom: "none" }}>
        <Field label="Contact email" htmlFor="bk-email" required error={fieldErr(state, "email")}>
          <input name="email" id="bk-email" type="email" placeholder="you@email.com" autoComplete="email" />
        </Field>
      </div>
      {!compact && (
        <div className="booking-actions">
          <SubmitButton pending={pending} label="Send enquiry" />
          <a href="mailto:hospitality@nayokan.org" className="btn btn-ghost">
            Email us directly
          </a>
        </div>
      )}
      {compact && <SubmitButton pending={pending} label="Send enquiry" />}
      {state.status === "success" && (
        <p className="form-success" role="status" style={{ marginTop: 20, color: "var(--green-deep)", fontSize: "0.9rem" }}>
          ✓ Enquiry received. Our hospitality team will respond within 24h. <Tbc>demo</Tbc>
        </p>
      )}
    </form>
  );
}

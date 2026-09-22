"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/platform/forms/actions";
import { submitEnquiry } from "@/platform/forms/actions";
import { Field } from "@/ui/components/form-field";
import { Tbc } from "@/ui/components/tbc";
import { trackEvent } from "@/platform/analytics";

const IDLE: FormState = { status: "idle" };
const err = (s: FormState, n: string) => (s.status === "error" ? s.fieldErrors[n] : undefined);

// VTI home "apply" strip enquiry (vti.html #apply) — routes via the shared
// enquiry action; programme interest goes in enquiryType, motivation in message.
export function VtiEnquiryForm({ programmes }: { programmes: string[] }) {
  const [state, action, pending] = useActionState(submitEnquiry, IDLE);
  const tracked = useRef(false);
  useEffect(() => {
    if (state.status === "success" && !tracked.current) {
      tracked.current = true;
      trackEvent("form_submit", { site: "vti", world: "vti", form: "vti-enquiry" });
    }
  }, [state.status]);

  return (
    <form className="apply-form" action={action}>
      <Field label="Full name" htmlFor="fn" required error={err(state, "name")}>
        <input id="fn" name="name" type="text" placeholder="Your name" autoComplete="name" />
      </Field>
      <Field label="Email" htmlFor="fe" required error={err(state, "email")}>
        <input id="fe" name="email" type="email" placeholder="you@email.com" autoComplete="email" />
      </Field>
      <Field label="Programme of interest" htmlFor="fp" required error={err(state, "enquiryType")}>
        <select id="fp" name="enquiryType" defaultValue="">
          <option value="" disabled>
            Select a programme
          </option>
          {programmes.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </Field>
      <Field label="Motivation (short)" htmlFor="fm" error={err(state, "message")}>
        <input id="fm" name="message" type="text" placeholder="Why VTI?" />
      </Field>
      <button type="submit" className="btn btn-accent" disabled={pending} aria-disabled={pending}>
        {pending ? "Sending…" : "Submit enquiry"} {!pending && <span className="arrow">→</span>}
      </button>
      {state.status === "success" && (
        <p className="form-success" role="status" style={{ marginTop: 20, color: "var(--green-glow)", fontSize: "0.9rem" }}>
          ✓ Enquiry received. A VTI programme lead will be in touch.{" "}
          <Tbc onDark>demo — form not wired</Tbc>
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

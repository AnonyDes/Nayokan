"use client";

import { useActionState, useEffect, useState } from "react";
import { startMfaEnrollAction, verifyMfaEnrollAction, type EnrollStartResult } from "@/platform/auth/actions";
import { Field, Input } from "@/admin/ui/Field";
import { buttonClassName } from "@/admin/ui/Button";

// Mandatory TOTP enrolment (readiness-report §10: "no exceptions"). Runs the
// moment a signed-in user without a verified factor reaches this route
// (src/platform/auth/session.ts redirects them here).
export function MfaEnrollForm() {
  const [start, setStart] = useState<EnrollStartResult | null>(null);
  const [state, action, pending] = useActionState(verifyMfaEnrollAction, undefined);

  useEffect(() => {
    let cancelled = false;
    startMfaEnrollAction().then((result) => {
      if (!cancelled) setStart(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!start) {
    return <div className="ax-skeleton ax-skeleton--block" style={{ marginTop: 20 }} />;
  }
  if ("error" in start) {
    return (
      <div className="ax-notice ax-notice--danger" role="alert" style={{ marginTop: 20 }}>
        <div>{start.error}</div>
      </div>
    );
  }

  return (
    <form className="login__form" action={action}>
      <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Supabase returns a data: URI SVG, not a static asset. */}
        <img src={start.qrCode} alt="Scan with your authenticator app" width={180} height={180} />
      </div>
      <div className="ax-field">
        <span className="ax-field__label">Can&apos;t scan? Enter this key manually</span>
        <code className="ax-mono" style={{ wordBreak: "break-all" }}>
          {start.secret}
        </code>
      </div>

      <input type="hidden" name="factorId" value={start.factorId} />

      {state?.error && (
        <div className="ax-notice ax-notice--danger" role="alert">
          <div>{state.error}</div>
        </div>
      )}

      <Field label="6-digit code" htmlFor="code" hint="Enter the code your authenticator app now shows.">
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          placeholder="000000"
          required
          autoFocus
        />
      </Field>

      <button type="submit" disabled={pending} className={buttonClassName("primary", "default", "login__submit")}>
        {pending ? "Confirming…" : "Confirm and finish set-up"}
      </button>
    </form>
  );
}

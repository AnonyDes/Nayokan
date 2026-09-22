"use client";

import { useActionState } from "react";
import { verifyMfaAction } from "@/platform/auth/actions";
import { Field, Input } from "@/admin/ui/Field";
import { buttonClassName } from "@/admin/ui/Button";

export function MfaVerifyForm() {
  const [state, action, pending] = useActionState(verifyMfaAction, undefined);

  return (
    <form className="login__form" action={action}>
      {state?.error && (
        <div className="ax-notice ax-notice--danger" role="alert">
          <div>{state.error}</div>
        </div>
      )}

      <Field label="6-digit code" htmlFor="code" hint="Open your authenticator app and enter the current code.">
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
        {pending ? "Verifying…" : "Verify and continue"}
      </button>
    </form>
  );
}

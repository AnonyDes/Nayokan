"use client";

import { useActionState } from "react";
import { verifyTotp, type AuthFormState } from "@/platform/auth/actions";

export function MfaForm({ factorId }: { factorId?: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(verifyTotp, {
    status: "idle",
  });

  return (
    <form className="login__form" action={formAction}>
      {state.status === "error" && (
        <div className="ax-notice ax-notice--danger" role="alert">
          <div className="ax-notice__body">{state.message}</div>
        </div>
      )}
      {factorId && <input type="hidden" name="factorId" value={factorId} />}
      <div className="login__row ax-field">
        <label className="ax-field__label" htmlFor="code">Authentication code</label>
        <input
          className="ax-input ax-input--mono"
          id="code"
          name="code"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="000000"
          required
          autoComplete="one-time-code"
          autoFocus
        />
      </div>
      <button type="submit" className="ax-btn ax-btn--primary login__submit" disabled={pending}>
        {pending ? "Verifying…" : "Verify and continue"}
      </button>
    </form>
  );
}

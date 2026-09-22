"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "@/platform/auth/actions";
import { Field, Input } from "@/admin/ui/Field";
import { buttonClassName } from "@/admin/ui/Button";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, undefined);

  return (
    <form className="login__form" action={action}>
      {state && "error" in state && (
        <div className="ax-notice ax-notice--danger" role="alert">
          <div>{state.error}</div>
        </div>
      )}
      {state && "submitted" in state ? (
        <div className="ax-notice ax-notice--success" role="status">
          <div>If that address has an account, a reset link is on its way.</div>
        </div>
      ) : (
        <>
          <Field label="Work email" htmlFor="email">
            <Input id="email" name="email" type="email" placeholder="you@nayokan.cm" required autoComplete="email" />
          </Field>
          <button type="submit" disabled={pending} className={buttonClassName("primary", "default", "login__submit")}>
            {pending ? "Sending…" : "Send reset link"}
          </button>
        </>
      )}
    </form>
  );
}

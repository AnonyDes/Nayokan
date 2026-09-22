"use client";

import { useActionState } from "react";
import { loginAction } from "@/platform/auth/actions";
import { Field, Input } from "@/admin/ui/Field";
import { buttonClassName } from "@/admin/ui/Button";

export function LoginForm({ expired }: { expired: boolean }) {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form className="login__form" action={action}>
      {expired && (
        <div className="ax-notice ax-notice--warn" role="status">
          <div>You were signed out for security after 60 minutes of inactivity. Sign in again.</div>
        </div>
      )}
      {state?.error && (
        <div className="ax-notice ax-notice--danger" role="alert">
          <div>{state.error}</div>
        </div>
      )}

      <Field label="Work email" htmlFor="email">
        <Input id="email" name="email" type="email" placeholder="you@nayokan.cm" required autoComplete="email" />
      </Field>

      <Field label="Password" htmlFor="pw">
        <Input id="pw" name="password" type="password" placeholder="••••••••••••" required autoComplete="current-password" />
      </Field>

      <button type="submit" disabled={pending} className={buttonClassName("primary", "default", "login__submit")}>
        {pending ? "Signing in…" : "Continue to two-factor"}
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>

      <div className="login__mfa">
        <svg viewBox="0 0 24 24">
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        <div>
          Two-factor authentication is <strong>required</strong> for all Nayokan admin accounts.
        </div>
      </div>
    </form>
  );
}

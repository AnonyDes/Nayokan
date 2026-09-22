"use client";

import { useActionState } from "react";
import { signIn, type AuthFormState } from "@/platform/auth/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signIn, {
    status: "idle",
  });

  return (
    <form className="login__form" action={formAction}>
      {state.status === "error" && (
        <div className="ax-notice ax-notice--danger" role="alert">
          <div className="ax-notice__body">{state.message}</div>
        </div>
      )}
      <div className="login__row ax-field">
        <label className="ax-field__label" htmlFor="email">Work email</label>
        <input className="ax-input" id="email" name="email" type="email" placeholder="you@nayokan.org" required autoComplete="email" />
      </div>

      <div className="login__row ax-field">
        <label className="ax-field__label" htmlFor="pw">Password</label>
        <input className="ax-input" id="pw" name="password" type="password" placeholder="••••••••••••" required autoComplete="current-password" />
      </div>

      <div className="login__opts">
        <label className="ax-toggle is-on">
          <span className="ax-toggle__track" />
          <span className="ax-toggle__label">Remember this device</span>
        </label>
        <a href="mailto:admin@nayokan.org">Reset access</a>
      </div>

      <button type="submit" className="ax-btn ax-btn--primary login__submit" disabled={pending}>
        {pending ? "Signing in…" : "Continue to two-factor"}
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </button>

      <div className="login__mfa">
        <svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
        <div>Two-factor authentication is <strong>required</strong> for all Nayokan admin accounts.</div>
      </div>
    </form>
  );
}

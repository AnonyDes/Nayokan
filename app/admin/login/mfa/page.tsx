import type { Metadata } from "next";
import "@/admin/styles/login.css";
import { MfaVerifyForm } from "@/admin/auth/MfaVerifyForm";

export const metadata: Metadata = { title: "Two-factor verification" };

export default function AdminMfaVerifyPage() {
  return (
    <div className="login-root">
      <div className="login">
        <aside className="login__left">
          <div className="login__brand">
            <div className="login__brand-col">
              <span className="login__brand-name">NAYOKAN</span>
              <span className="login__brand-sub">Admin · CMS</span>
            </div>
          </div>
          <div className="login__lede">
            <div className="login__eyebrow">Sign in · Step 2 of 2</div>
            <h1 className="login__title">
              Confirm it&apos;s <em>you.</em>
            </h1>
            <p className="login__note">Every Nayokan admin session requires a verified authenticator code. No exceptions.</p>
          </div>
        </aside>
        <main className="login__right">
          <div className="login__card">
            <div className="login__card-eyebrow">Two-factor authentication</div>
            <h2 className="login__card-title">Enter your verification code.</h2>
            <p className="login__card-sub">From the authenticator app you used to enrol this account.</p>
            <MfaVerifyForm />
          </div>
        </main>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import "@/admin/styles/login.css";
import { ResetPasswordForm } from "@/admin/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Reset access" };

export default function AdminResetPasswordPage() {
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
            <div className="login__eyebrow">Account recovery</div>
            <h1 className="login__title">
              Reset your <em>access.</em>
            </h1>
            <p className="login__note">We&apos;ll email a reset link to your work address if it has an admin account.</p>
          </div>
        </aside>
        <main className="login__right">
          <div className="login__card">
            <div className="login__card-eyebrow">Reset access</div>
            <h2 className="login__card-title">Enter your work email.</h2>
            <ResetPasswordForm />
          </div>
        </main>
      </div>
    </div>
  );
}

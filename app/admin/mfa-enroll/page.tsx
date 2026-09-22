import type { Metadata } from "next";
import "@/admin/styles/login.css";
import { MfaEnrollForm } from "@/admin/auth/MfaEnrollForm";

export const metadata: Metadata = { title: "Set up two-factor authentication" };

export default function AdminMfaEnrollPage() {
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
            <div className="login__eyebrow">Required before first use</div>
            <h1 className="login__title">
              Set up two-factor <em>authentication.</em>
            </h1>
            <p className="login__note">
              Every Nayokan admin account requires an authenticator app (Google Authenticator, 1Password, Authy, or
              similar). This is required once, then verified on every sign-in.
            </p>
          </div>
        </aside>
        <main className="login__right">
          <div className="login__card">
            <div className="login__card-eyebrow">Two-factor set-up</div>
            <h2 className="login__card-title">Scan the QR code.</h2>
            <p className="login__card-sub">Then enter the 6-digit code it generates to confirm.</p>
            <MfaEnrollForm />
          </div>
        </main>
      </div>
    </div>
  );
}

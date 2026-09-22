import type { Metadata } from "next";
import "@/admin/styles/login.css";
import { LoginForm } from "@/admin/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

// Ported from Designs/admin/login.html. SSO and "remember this device" are
// dropped: no SSO provider exists yet, and MFA is mandatory with no
// exceptions (readiness-report §10), so nothing may skip it.
export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const { expired } = await searchParams;

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
            <div className="login__eyebrow">Restricted institutional workspace</div>
            <h1 className="login__title">
              The system through which Nayokan runs its <em>digital ecosystem.</em>
            </h1>
            <p className="login__note">
              Sign in to manage articles, programmes, applications, opportunities, people, partners, impact metrics
              and everything published on the public Nayokan website.
            </p>

            <div className="login__meta">
              <div>
                Access
                <strong>Nayokan staff only</strong>
              </div>
              <div>
                Sessions
                <strong>Auto sign-out · 60&nbsp;min</strong>
              </div>
            </div>
          </div>

          <div className="login__foot">
            <span>© 2026 Nayokan</span>
            <span>Governance · Verified impact only</span>
          </div>
        </aside>

        <main className="login__right">
          <div className="login__card">
            <div className="login__card-eyebrow">Sign in · Step 1 of 2</div>
            <h2 className="login__card-title">Access Nayokan Admin.</h2>
            <p className="login__card-sub">Use your Nayokan work email. All sessions are audited.</p>

            <LoginForm expired={expired === "1"} />
          </div>
        </main>
      </div>
    </div>
  );
}

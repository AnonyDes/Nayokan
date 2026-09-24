import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="login">
      <aside className="login__left">
        <div className="login__brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-mark.svg" alt="" width={32} height={32} />
          <div className="login__brand-col">
            <span className="login__brand-name">NAYOKAN</span>
            <span className="login__brand-sub">Admin · CMS · v0.1</span>
          </div>
        </div>

        <div className="login__lede">
          <div className="login__eyebrow">Restricted institutional workspace</div>
          <h1 className="login__title">
            The system through which Nayokan runs its <em>digital ecosystem</em>.
          </h1>
          <p className="login__note">
            Sign in to manage articles, programmes, applications, opportunities, people,
            partners, impact metrics and everything published on the public Nayokan website.
          </p>
          <div className="login__meta">
            <div>Environment<strong>Production · nayokan.org</strong></div>
            <div>Region<strong>Yaoundé · Cameroon</strong></div>
            <div>Access<strong>Nayokan staff only</strong></div>
            <div>Sessions<strong>Auto sign-out · 60&nbsp;min</strong></div>
          </div>
        </div>

        <div className="login__foot">
          <span>© 2026 Nayokan</span>
          <span>Governance · Verified impact only</span>
        </div>

        <svg className="login__deco" viewBox="0 0 120 120" aria-hidden="true">
          <path fill="#12B82A" fillRule="evenodd" d="M42 108 L70 12 L88 12 L116 108 L96 108 L90 88 L68 88 L62 108 Z M72 72 L86 72 L79 46 Z" />
          <path fill="#ffffff" d="M6 108 L6 12 L22 12 L48 74 L48 12 L64 12 L64 108 L48 108 L22 46 L22 108 Z" />
        </svg>
      </aside>

      <main className="login__right">
        <div className="login__card">
          <div className="login__card-eyebrow">Sign in · Step 1 of 2</div>
          <h2 className="login__card-title">Access Nayokan Admin.</h2>
          <p className="login__card-sub">Use your Nayokan work email. All sessions are audited.</p>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}

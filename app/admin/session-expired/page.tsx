import type { Metadata } from "next";
import { buttonClassName } from "@/admin/ui/Button";

export const metadata: Metadata = { title: "Session expired" };

// Ported from Designs/admin/states.html § 47 "Session expired". proxy.ts
// (admin-session.ts) redirects here — via /admin/login?expired=1, which
// renders the same message inline — after 60 minutes of inactivity.
export default function AdminSessionExpiredPage() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--ws)" }}>
      <div className="ax-empty" style={{ maxWidth: 420 }}>
        <div className="ax-empty__icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>
        <div className="ax-empty__title">Session expired for security</div>
        <div className="ax-empty__lede">You have been signed out after 60 minutes of inactivity. Your work is autosaved.</div>
        <a href="/admin/login" className={buttonClassName("primary")} style={{ marginTop: 8 }}>
          Sign in again
        </a>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { buttonClassName } from "@/admin/ui/Button";

export const metadata: Metadata = { title: "Access denied" };

// Ported from Designs/admin/states.html § 47 "Permission denied". Reached
// when a session is valid but the caller's role/site scope doesn't grant the
// area (permissions.ts requirePermission), or their profile is missing/disabled.
export default function AdminDeniedPage() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--ws)" }}>
      <div className="ax-empty" style={{ maxWidth: 420 }}>
        <div className="ax-empty__icon" style={{ borderColor: "var(--warn)", color: "var(--warn-ink)" }}>
          <svg viewBox="0 0 24 24">
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <div className="ax-empty__title">You don&apos;t have access to this area</div>
        <div className="ax-empty__lede">
          Your role or site scope doesn&apos;t include this section. Speak to a Super Admin if you believe this is an
          error.
        </div>
        <a href="/admin" className={buttonClassName("soft")} style={{ marginTop: 8 }}>
          Return to dashboard
        </a>
      </div>
    </div>
  );
}

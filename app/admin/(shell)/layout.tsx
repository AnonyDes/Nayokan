import type { ReactNode } from "react";
import { AdminShell } from "@/admin/shell/AdminShell";

// Every route here is session-gated and can never be statically prerendered
// (AdminShell reads cookies + calls Supabase Auth on every request). Force
// it explicitly so `next build` doesn't try to prerender it — the Supabase
// project env this needs at runtime is a Phase 2 blocker (readiness-report
// §17), not something a build step should require.
export const dynamic = "force-dynamic";

// AdminShell calls requireAdminSession() itself, so every route under this
// group gets the auth + MFA + idle-expiry check for free. Breadcrumbs are
// derived from the pathname inside Topbar (src/admin/shell/crumbs.ts).
export default function AdminShellLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

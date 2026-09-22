import type { ReactNode } from "react";
import { requireStaff } from "@/platform/auth/guard";
import { createServerReadClient } from "@/platform/auth/server";
import { AdminSidebar } from "@/admin/components/sidebar";
import { AdminTopbar } from "@/admin/components/topbar";

// Authenticated admin shell — every page in this group passes requireStaff()
// (session + active staff profile + aal2). RLS still governs every query.
export default async function AdminShellLayout({ children }: { children: ReactNode }) {
  const session = await requireStaff();

  const supabase = await createServerReadClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", session.userId)
    .single();

  const name = profile?.display_name || session.email || "Staff";
  const role = session.roleKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="ax-app">
      <AdminSidebar userName={name} userRole={role} />
      <AdminTopbar />
      <main className="ax-workspace">{children}</main>
    </div>
  );
}

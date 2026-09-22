import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/admin/styles/admin.css";

// Admin is served only on ADMIN_ORIGIN (proxy.ts) and is never indexed.
export const metadata: Metadata = {
  title: { default: "Nayokan Admin", template: "%s · Nayokan Admin" },
  robots: { index: false, follow: false },
};

// `.admin-root` carries the admin design tokens (src/admin/styles/admin.css)
// so they never leak into the public sites' shared globals.css.
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="admin-root">{children}</div>;
}

import type { Metadata } from "next";
import type { ReactNode } from "react";

// Admin is served only on ADMIN_ORIGIN (proxy.ts) and is never indexed.
export const metadata: Metadata = {
  title: { default: "Nayokan Admin", template: "%s · Nayokan Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="admin-root">{children}</div>;
}

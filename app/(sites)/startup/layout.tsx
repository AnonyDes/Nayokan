import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildSiteMetadata } from "@/platform/seo/site-metadata";
import { SITES } from "@/platform/sites/registry";

const SITE = "startup" as const;

export const metadata: Metadata = buildSiteMetadata(SITE);

// startup site shell. Nav + footer are owned by the public-sites workstream
// (src/sites/startup/). Everything under this folder is served only on
// SITES.startup.origin via proxy.ts.
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className={SITES[SITE].themeClass} data-site={SITE}>
      <a className="skip-link" href="#main">Skip to content</a>
      <main id="main">{children}</main>
    </div>
  );
}

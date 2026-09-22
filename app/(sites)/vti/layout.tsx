import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildSiteMetadata } from "@/platform/seo/site-metadata";
import { SITES } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { SiteNav } from "@/ui/components/site-nav";
import { SiteFooter } from "@/ui/components/site-footer";

const SITE = "vti" as const;

export const metadata: Metadata = buildSiteMetadata(SITE);

// VTI site shell — nav + footer come from the content repository.
// Served only on SITES.vti.origin via proxy.ts.
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const repo = await getContentRepository();
  const [nav, settings] = await Promise.all([repo.getNavigation(SITE), repo.getSiteSettings(SITE)]);

  return (
    <div className={SITES[SITE].themeClass} data-site={SITE}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteNav items={nav.primary} cta={nav.cta} homeHref="/" homeLabel="NAYOKAN · VTI" />
      <main id="main">{children}</main>
      <SiteFooter nav={nav} settings={settings} />
    </div>
  );
}

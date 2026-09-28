import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { CorpHero } from "@/ui/components/heroes";
import { buildSiteMap } from "@/platform/sites/site-map";
import { SiteMapList } from "@/ui/components/site-map-list";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Every section of the Nayokan ecosystem — the corporate site, VTI and the Startup Centre.",
  alternates: canonical("/sitemap"),
};

// Human-facing sitemap: the section pages of all three sites, grouped for a
// reader (buildSiteMap). The XML sitemap for search engines stays at
// /sitemap.xml (app/(sites)/corporate/sitemap.ts) and enumerates every
// dynamic page; this page does not duplicate that list.
export default function SiteMapPage() {
  const groups = buildSiteMap();

  return (
    <>
      <CorpHero
        sec="§ Sitemap"
        crumbs={[{ label: "Nayokan", href: "/" }, { label: "Sitemap" }]}
        title={
          <>
            Every section.
            <br />
            <em>One index.</em>
          </>
        }
        lede="A full map of the Nayokan ecosystem: the corporate site, the Vocational Training Institute and the Startup Centre. Each programme, cluster, article, property and portfolio entry is reached from its own directory page below."
      />
      <section className="section sitemap-page">
        <div className="wrap">
          <SiteMapList groups={groups} />
          <p className="sitemap-xml-note">
            Looking for the machine-readable version?{" "}
            <a href={siteUrl("corporate", "/sitemap.xml")}>XML sitemap for search engines</a>.
          </p>
        </div>
      </section>
    </>
  );
}

import { siteUrl } from "./registry";
import type { SiteId } from "./types";

// The public sitemap page's structure: the section pages of all three sites,
// grouped for a human reader. This is deliberately curated, not generated —
// a sitemap page lists where the site's sections are, not every dynamic leaf
// (each programme, cluster, article, property or portfolio venture). Those
// are reached from their own directory pages, linked below.
//
// Kept separate from the XML sitemaps (app/**/sitemap.ts), which are for
// search engines and do enumerate every dynamic page.

export interface SiteMapLink {
  label: string;
  href: string;
  desc?: string;
}

export interface SiteMapGroup {
  heading: string;
  /** Cross-site links play the world-entry transition. */
  world?: Exclude<SiteId, "corporate">;
  links: SiteMapLink[];
}

export function buildSiteMap(): SiteMapGroup[] {
  return [
    {
      heading: "Nayokan",
      links: [
        { label: "Home", href: siteUrl("corporate", "/"), desc: "Hero, the Nayokan System, Four Worlds, impact" },
        { label: "What we do", href: siteUrl("corporate", "/what-we-do"), desc: "The ecosystem gateway: all four worlds explained" },
        { label: "About", href: siteUrl("corporate", "/about"), desc: "Story, values, timeline, leadership" },
        { label: "Impact", href: siteUrl("corporate", "/impact"), desc: "Verified figures, evidence and stories" },
        { label: "Insights", href: siteUrl("corporate", "/insights"), desc: "Editorial writing from across the ecosystem" },
        { label: "Programmes", href: siteUrl("corporate", "/programmes"), desc: "Every open programme, across all four worlds" },
        { label: "Partners", href: siteUrl("corporate", "/partners"), desc: "How Nayokan works with institutional partners" },
        { label: "Apply", href: siteUrl("corporate", "/application"), desc: "Ecosystem-wide application form" },
        { label: "Contact", href: siteUrl("corporate", "/contact"), desc: "Enquiry routing and the general contact form" },
        { label: "Privacy", href: siteUrl("corporate", "/privacy") },
        { label: "Terms", href: siteUrl("corporate", "/terms") },
      ],
    },
    {
      heading: "Venture Capital",
      links: [
        { label: "Overview", href: siteUrl("corporate", "/venture-capital"), desc: "Capital pathway and investment principles" },
        { label: "Investment approach", href: siteUrl("corporate", "/venture-capital/approach") },
        { label: "Venture pipeline", href: siteUrl("corporate", "/venture-capital/pipeline") },
        { label: "Portfolio", href: siteUrl("corporate", "/venture-capital/portfolio") },
        { label: "Partnership enquiry", href: siteUrl("corporate", "/venture-capital/partner") },
      ],
    },
    {
      heading: "Hospitality",
      links: [
        { label: "Overview", href: siteUrl("corporate", "/hospitality") },
        { label: "Properties", href: siteUrl("corporate", "/hospitality/properties") },
      ],
    },
    {
      heading: "Vocational Training Institute",
      world: "vti",
      links: [
        { label: "VTI home", href: siteUrl("vti", "/"), desc: "Practical skills, productive people" },
        { label: "Programmes", href: siteUrl("vti", "/programmes") },
        { label: "Clusters", href: siteUrl("vti", "/clusters") },
        { label: "Apply", href: siteUrl("vti", "/apply") },
        { label: "Privacy", href: siteUrl("vti", "/privacy") },
        { label: "Terms", href: siteUrl("vti", "/terms") },
      ],
    },
    {
      heading: "Startup Centre",
      world: "startup",
      links: [
        { label: "Startup Centre home", href: siteUrl("startup", "/"), desc: "Where research becomes enterprise" },
        { label: "Programme", href: siteUrl("startup", "/programme") },
        { label: "Commercialization pathway", href: siteUrl("startup", "/commercialization") },
        { label: "University partnerships", href: siteUrl("startup", "/university-partnerships") },
        { label: "Mentors", href: siteUrl("startup", "/mentors") },
        { label: "Opportunities", href: siteUrl("startup", "/opportunities") },
        { label: "Portfolio", href: siteUrl("startup", "/portfolio") },
        { label: "Apply", href: siteUrl("startup", "/apply") },
        { label: "Privacy", href: siteUrl("startup", "/privacy") },
        { label: "Terms", href: siteUrl("startup", "/terms") },
      ],
    },
  ];
}

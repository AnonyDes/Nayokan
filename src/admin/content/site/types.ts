// Admin-facing site-CMS models. These extend the public content contract
// (src/platform/content/types.ts) with workflow fields the CMS needs —
// status, visibility, audit stamps. The DB shape is Session B's
// (readiness-report §8-9); these interfaces are the seam the mock store
// implements today.
import type { ContentStatus, Provenance, Seo, SiteId, World } from "@/platform/content/types";

/** One fixed-layout section on a structured page or homepage. */
export interface AdminPageSection {
  /** Stable id for the mock store: `${pageId}:${key}` or `${site}:${key}` for home. */
  id: string;
  key: string;
  title: string;
  /** Mono descriptor under the title in the section rail (e.g. "3 selected · rotating"). */
  sub?: string;
  isLive: boolean;
  /** Editable copy fields for the selected section; empty = curated/fixed. */
  fields: Record<string, string>;
}

export interface AdminPage {
  id: string;
  site: SiteId;
  path: string;
  title: string;
  world: World | null;
  status: ContentStatus;
  /** Public visibility toggle — distinct from workflow status (pages.html). */
  isPublic: boolean;
  updatedBy: string;
  /** Relative display string; becomes a real timestamp column with Session B. */
  updatedAgo: string;
  sections: AdminPageSection[];
  seo: Seo;
  /** SEO-manager health fields (null = field missing). */
  seoTitleLen: number | null;
  seoDescLen: number | null;
  socialSet: boolean;
  provenance: Provenance;
}

export interface NavRow {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
}

export interface SiteNav {
  site: SiteId;
  primary: NavRow[];
  footerColumns: { heading: string; links: { label: string; href: string }[] }[];
  headerCta: { label: string; href: string };
  footerCta: { label: string; href: string };
  /** VTI/Startup navs are derived, not yet confirmed (SiteNavigation contract). */
  pendingConfirmation: boolean;
}

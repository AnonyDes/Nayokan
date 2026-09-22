// Public content contract. This is the boundary between the data layer and
// the three public sites: the sites render these shapes; the repositories
// (fixtures now, Supabase later) produce them. Changing a shape here is a
// cross-workstream change: update docs/architecture/content-contract.md too.
//
// These are PUBLIC read models: only published, public, verified data ever
// reaches them. Admin/editor models live with the admin workstream.

import type { SiteId, World } from "@/platform/sites/types";

export type { SiteId, World };

export const CONTENT_STATUSES = ["draft", "in_review", "changes_requested", "approved", "scheduled", "published", "archived"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const METRIC_STATUSES = ["draft", "needs_verification", "verified", "approved", "published"] as const;
export type MetricStatus = (typeof METRIC_STATUSES)[number];

export const APPLICATION_STATUSES = ["new", "under_review", "shortlisted", "accepted", "rejected", "withdrawn", "archived"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const ENQUIRY_STATUSES = ["new", "assigned", "in_progress", "resolved", "archived"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const ENQUIRY_CATEGORIES = ["general", "partnership", "university", "vc", "hospitality"] as const;
export type EnquiryCategory = (typeof ENQUIRY_CATEGORIES)[number];

/**
 * Marks content that is not yet confirmed by Nayokan. Sites MUST render a
 * visible placeholder tag (design: `.placeholder-tag` "tbc") for any field
 * listed here, and must never present it as fact.
 */
export interface Provenance {
  /** true when the record is demo/placeholder content ([DEMO] / CONTENT TO BE CONFIRMED). */
  isDemo: boolean;
  /** Field names whose values are unconfirmed and must show a "tbc" tag. */
  unconfirmedFields?: string[];
}

export interface MediaRef {
  id: string;
  /** Absolute or root-relative URL, already resolved for public use. */
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  credit?: string;
}

export interface Seo {
  title?: string;
  description?: string;
  /** Path on the owning site only; cross-site canonicals are rejected server-side. */
  canonicalPath?: string;
  ogImage?: MediaRef;
  noindex?: boolean;
}

export interface Cta {
  label: string;
  /** Root-relative path on the same site, or an absolute URL for cross-site/external links. */
  href: string;
  external?: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  /** Links to another Nayokan site or an external URL (renders ↗). */
  crossSite?: boolean;
  children?: NavItem[];
}

export interface SiteNavigation {
  site: SiteId;
  primary: NavItem[];
  cta?: Cta;
  footerColumns: { heading: string; links: NavItem[] }[];
  /** Nav still awaiting Nayokan confirmation (VTI/Startup navs are derived, not designed). */
  pendingConfirmation?: boolean;
}

export interface SiteSettings {
  site: SiteId;
  name: string;
  tagline?: string;
  contactEmail?: string;
  address?: string;
  social?: { label: string; href: string }[];
  defaultSeo: Seo;
  provenance: Provenance;
}

/** Verified impact figure. `value` is null unless verified + approved + public. */
export interface PublicMetric {
  id: string;
  label: string;
  /** null → render em-dash + "Figure to be confirmed". Never fabricate. */
  value: number | null;
  unit?: string;
  reportingPeriod?: string;
  world: World;
  /** Only true when the DB governance chain passed; gates count-up animation. */
  verified: boolean;
  sourceLabel?: string;
  /** Longer descriptive line under the figure (additive; impact page cells). */
  description?: string;
}

export interface Programme {
  id: string;
  /**
   * Site hosting the programme's public detail page. VC and Hospitality
   * programmes are listed by the corporate site (world-tagged) even though
   * their detail page may live on vti/startup — see ADR 003.
   * (Additive change: widened from Extract<SiteId,"vti"|"startup">.)
   */
  site: SiteId;
  world: World;
  slug: string;
  /** Design reference code, e.g. "P/001". */
  code?: string;
  name: string;
  summary: string;
  body?: RichBlock[];
  type?: string;
  status: "open" | "closing_soon" | "upcoming" | "closed" | "pilot" | "under_development";
  duration?: string;
  deliveryMode?: string;
  location?: string;
  certification?: string;
  applicationDeadline?: string; // ISO date
  applicationOpen: boolean;
  places?: number;
  heroImage?: MediaRef;
  seo?: Seo;
  provenance: Provenance;
}

export interface Cluster {
  id: string;
  slug: string;
  code?: string;
  name: string;
  sector: string;
  location?: string;
  summary: string;
  body?: RichBlock[];
  memberCount?: number;
  statusLabel?: string;
  programmeId?: string;
  heroImage?: MediaRef;
  seo?: Seo;
  provenance: Provenance;
}

export interface Opportunity {
  id: string;
  slug: string;
  code?: string;
  title: string;
  /** Additive widening: design categories challenge/partnership/call/funding/mentor. */
  category:
    | "residency"
    | "grant"
    | "programme"
    | "competition"
    | "challenge"
    | "partnership"
    | "call"
    | "funding"
    | "mentor"
    | "other";
  status: "open" | "closing_soon" | "upcoming" | "expired";
  deadline?: string;
  opensAt?: string;
  eligibility?: string;
  externalUrl?: string;
  provenance: Provenance;
}

export interface Mentor {
  id: string;
  name: string;
  initials: string;
  role?: string;
  expertise: string[];
  sector?: string;
  availability?: "open" | "limited" | "by_request";
  photo?: MediaRef;
  bio?: string;
  provenance: Provenance;
}

export interface Person {
  id: string;
  name: string;
  initials: string;
  position?: string;
  division?: string;
  bio?: string;
  photo?: MediaRef;
  provenance: Provenance;
}

export interface Partner {
  id: string;
  name: string;
  category: "university" | "corporate" | "development" | "government" | "investor" | "community";
  logo?: MediaRef;
  website?: string;
  relationship?: string;
  /** Optional sub-tag within a wall, e.g. university-wall "Applied" / "Research" / "Public". */
  tag?: string;
  /** Optional location line, e.g. "Yaoundé · Central". */
  location?: string;
  provenance: Provenance;
}

/** A venture as listed on a given site (startup portfolio or VC portfolio). No financial fields, ever. */
export interface Venture {
  id: string;
  slug: string;
  code?: string;
  name: string;
  description: string;
  body?: RichBlock[];
  sector?: string;
  stage?: string;
  location?: string;
  website?: string;
  listingStatus: "pipeline" | "active" | "alumni" | "exited";
  relatedProgrammeId?: string;
  logo?: MediaRef;
  /** Detail-page fact rows (Stage/Sector/Founded/…); tbc flags unverified values. */
  facts?: { label: string; value: string; tbc?: boolean }[];
  seo?: Seo;
  provenance: Provenance;
}

export interface Property {
  id: string;
  slug: string;
  code?: string;
  name: string;
  location?: string;
  type?: string;
  summary: string;
  body?: RichBlock[];
  amenities: string[];
  gallery: MediaRef[];
  /** External booking only; no reservations are stored. */
  externalBookingUrl?: string;
  seo?: Seo;
  provenance: Provenance;
}

export interface Article {
  id: string;
  site: SiteId;
  world: World;
  slug: string;
  title: string;
  excerpt: string;
  category?: string;
  authorName?: string;
  publishedAt: string;
  readingMinutes?: number;
  cover?: MediaRef;
  body: RichBlock[];
  seo?: Seo;
  provenance: Provenance;
}

export interface Story {
  id: string;
  site: SiteId;
  world: World;
  slug: string;
  title: string;
  excerpt: string;
  type: "beneficiary" | "enterprise" | "cohort";
  cover?: MediaRef;
  provenance: Provenance;
}

/** Structured body blocks (article editor). No raw HTML from the CMS reaches the page. */
export type RichBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "image"; media: MediaRef }
  | { type: "callout"; text: string; tone?: "info" | "warn" }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "cta"; cta: Cta };

/** Home page sections are fixed per site (no page builder). */
export interface HomeSection<T = Record<string, unknown>> {
  key: string;
  isLive: boolean;
  data: T;
}

export interface Page {
  site: SiteId;
  path: string;
  title: string;
  sections: HomeSection[];
  seo?: Seo;
  provenance: Provenance;
}

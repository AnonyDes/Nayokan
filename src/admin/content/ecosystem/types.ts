// Admin models for the ecosystem directory — people, mentors, partners,
// ventures, properties. Names are deliberately unconfirmed per the designs
// ("Person · to be confirmed") — never fabricate institutional identities.
// DB shape pending Session B (readiness-report §8).
import type { Provenance } from "@/platform/content/types";
import type { SiteId } from "@/platform/sites/types";

export type PersonDivision = "leadership" | "programme" | "advisor";

export interface AdminPerson {
  id: string;
  /** Owning site for scoping/permissions — the record itself is cross-site. */
  site: SiteId;
  /** Institutional record code, e.g. P-001. */
  code: string;
  name: string;
  initials: string;
  position: string;
  division: PersonDivision;
  hasPhoto: boolean;
  bioStatus: "complete" | "draft" | "missing";
  order: number;
  /** Publish consent recorded — required before the record can go public. */
  consentRecorded: boolean;
  isPublic: boolean;
  provenance: Provenance;
}

export type MentorStatus = "active" | "inactive" | "draft";
export type MentorAvailability = "open" | "limited" | "by_request";

export interface AdminMentor {
  id: string;
  site: SiteId;
  code: string;
  name: string;
  initials: string;
  expertise: string;
  sector: string;
  availability: MentorAvailability;
  cohortLabel: string;
  status: MentorStatus;
  isPublic: boolean;
  provenance: Provenance;
}

export type PartnerCategory = "university" | "corporate" | "development" | "government" | "investor" | "community";
export type PartnerStatus = "visible" | "missing_logo" | "draft";

export interface AdminPartner {
  id: string;
  site: SiteId;
  name: string;
  category: PartnerCategory;
  hasLogo: boolean;
  /** Written consent — the hard gate before public visibility. */
  consentRecorded: boolean;
  status: PartnerStatus;
  isPublic: boolean;
  provenance: Provenance;
}

/** Mirrors the contract's Venture.listingStatus; the design's "Invested" pill
 *  is contract "active". No financial fields, ever (contract rule). */
export type VentureListingStatus = "pipeline" | "active" | "alumni" | "exited";

export interface AdminVenture {
  id: string;
  site: SiteId;
  /** e.g. V-2026-001. */
  code: string;
  /** Placeholder label until confirmed, e.g. "Venture · Agri-processing". */
  name: string;
  slug: string;
  sector: string;
  stage: string;
  location: string;
  relatedProgramme: string;
  listingStatus: VentureListingStatus;
  isPublic: boolean;
  provenance: Provenance;
}

export type PropertyStatus = "published" | "draft";

export interface AdminProperty {
  id: string;
  site: SiteId;
  name: string;
  slug: string;
  location: string;
  region: string;
  /** e.g. "Guesthouse", "Short stay". */
  type: string;
  rooms: number | null;
  /** External booking URL only — no internal reservations, ever. */
  externalBookingUrl: string;
  galleryCount: number | null;
  amenitiesCount: number;
  enquiriesCount: number | null;
  status: PropertyStatus;
  isPublic: boolean;
  provenance: Provenance;
}

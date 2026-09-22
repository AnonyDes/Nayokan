// Admin programme/cluster/opportunity models — editorial side of the public
// Programme and Opportunity contracts, plus clusters (VTI peer groupings).
// DB shape pending Session B (readiness-report §8).
import type { Provenance } from "@/platform/content/types";
import type { SiteId, World } from "@/platform/sites/types";

// Application-window lifecycle, distinct from the editorial ContentStatus —
// a programme can be published and have applications "closed".
export type ProgrammeStatus = "open" | "closing" | "draft" | "upcoming" | "closed" | "archived";

export const PROGRAMME_TYPES = [
  "Entrepreneurial cluster",
  "Certification programme",
  "Cohort programme",
  "Rolling admission",
] as const;

export const DELIVERY_MODELS = ["In-person · workshop", "Hybrid", "Remote"] as const;
export const CERTIFICATIONS = ["Nayokan National Metalwork Standard", "Nayokan Certificate of Completion", "None"] as const;

export interface AdminProgramme {
  id: string;
  site: SiteId;
  /** Null for standalone opportunities listed under the Opportunities tab. */
  world: World | null;
  kind: "programme" | "opportunity";
  name: string;
  /** List subtitle, e.g. "Sept 2026 — Feb 2028 · Yaoundé". */
  sub: string;
  status: ProgrammeStatus;
  appsFilled: number | null;
  appsCapacity: number | null;
  deadline: string;
  isPublic: boolean;
  updatedAgo: string;
  // Editor fields (programme-editor.html)
  type: string;
  shortDesc: string;
  fullDesc: string;
  duration: string;
  startDate: string;
  endDate: string;
  location: string;
  delivery: string;
  certification: string;
  appsOpen: boolean;
  applyPath: string;
  provenance: Provenance;
}

export interface AdminCluster {
  id: string;
  site: SiteId;
  world: World;
  name: string;
  /** Sector line, e.g. "Textile · garments · Yaoundé". */
  sector: string;
  location: string;
  /** e.g. "Cohort 4 open", "Draft — details missing". */
  cohortLabel: string;
  memberCount: number;
  isPublic: boolean;
  provenance: Provenance;
}

export const OPPORTUNITY_CATEGORIES = ["Residency", "Grant", "Programme"] as const;
export type OpportunityCategory = (typeof OPPORTUNITY_CATEGORIES)[number];
export type OpportunityStatus = "open" | "closing" | "upcoming" | "expired" | "archived";

export interface AdminOpportunity {
  id: string;
  site: SiteId;
  world: World | null;
  title: string;
  slug: string;
  category: OpportunityCategory;
  /** Display label — "15 Oct 2026", "Rolling", "Opens 1 Nov". */
  deadlineLabel: string;
  status: OpportunityStatus;
  isPublic: boolean;
  provenance: Provenance;
}

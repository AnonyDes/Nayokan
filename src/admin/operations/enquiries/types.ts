// Admin enquiry records — mirrors Designs/admin/enquiries.html +
// enquiry-detail.html. Sender identity is withheld until the enquiry is
// assigned ("Sender withheld until enquiry is assigned"); emails use
// nayokan.demo. DB shape pending Session B.
import type { Provenance } from "@/platform/content/types";
import type { SiteId } from "@/platform/sites/types";

/** Workflow per the design: New → Assigned → In progress → Resolved → Archived.
 *  "assigned" is captured inside in_progress (assignment acknowledges it);
 *  spam is an out-of-band terminal flag, not a workflow step. */
export type EnquiryStatus = "new" | "in_progress" | "resolved" | "archived" | "spam";

export type EnquiryCategory = "university" | "partnership" | "hospitality" | "vc" | "general";

export interface EnquiryAssignee {
  id: string;
  name: string;
  initials: string;
  role: string;
}

export interface EnquiryNote {
  id: string;
  author: string;
  time: string;
  body: string;
}

export interface AdminEnquiry {
  id: string;
  site: SiteId;
  /** e.g. E-0342. */
  code: string;
  /** List label, e.g. "Enquiry #E-0342". */
  title: string;
  /** Withheld senders render as "— Withheld —" / consent copy. */
  senderLabel: string;
  email: string;
  orgLabel: string;
  category: EnquiryCategory;
  /** Page path on the owning site the form was submitted from. */
  sourcePage: string;
  referrer: string;
  receivedAt: string;
  receivedAgo: string;
  language: string;
  priority: "Normal" | "High" | "Low";
  /** Whether the sender consented to public use (e.g. testimonial). */
  publicConsent: "granted" | "not_granted" | "unknown";
  status: EnquiryStatus;
  assignee: EnquiryAssignee | null;
  /** Programme routing, e.g. "Startup Centre · Commercialisation Track". */
  routeLabel: string | null;
  bodyParagraphs: string[];
  notes: EnquiryNote[];
  provenance: Provenance;
}

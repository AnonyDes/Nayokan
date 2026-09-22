// Display maps shared by the enquiries list + detail routes.
import type { PillTone } from "@/admin/ui/Pill";
import type { EnquiryCategory, EnquiryStatus } from "./types";

export const CATEGORY_LABEL: Record<EnquiryCategory, string> = {
  university: "University",
  partnership: "Partnership",
  hospitality: "Hospitality",
  vc: "VC",
  general: "General",
};

export const ENQUIRY_PILL: Record<EnquiryStatus, { tone: PillTone; label: string }> = {
  new: { tone: "needs", label: "New" },
  in_progress: { tone: "in-progress", label: "In progress" },
  resolved: { tone: "verified", label: "Resolved" },
  archived: { tone: "archived", label: "Archived" },
  spam: { tone: "critical", label: "Spam" },
};

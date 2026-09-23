// Display maps shared by the impact routes.
import type { PillTone } from "@/admin/ui/Pill";
import type { EvidenceStatus, EvidenceType, MetricStatus, MetricWorld } from "./types";

export const METRIC_STATUS_PILL: Record<MetricStatus, { tone: PillTone; label: string }> = {
  draft: { tone: "draft", label: "Draft" },
  needs_verification: { tone: "needs", label: "Needs verification" },
  verified: { tone: "pending", label: "Awaiting approval" },
  approved: { tone: "approved", label: "Approved" },
};

export const EVIDENCE_TYPE_LABEL: Record<EvidenceType, string> = {
  report: "Report",
  programme_record: "Programme record",
  spreadsheet: "Spreadsheet",
  photo: "Photo",
};

export const EVIDENCE_STATUS_PILL: Record<EvidenceStatus, { tone: PillTone; label: string }> = {
  verified: { tone: "verified", label: "Verified" },
  awaiting_review: { tone: "pending", label: "Awaiting review" },
  superseded: { tone: "archived", label: "Superseded" },
};

export const WORLD_LABEL: Record<MetricWorld, string> = {
  vti: "VTI",
  startup: "Startup Centre",
  venture_capital: "Venture Capital",
  hospitality: "Hospitality",
  all: "All worlds",
};

export const EVIDENCE_ICON: Record<EvidenceType, string> = {
  report: "file",
  programme_record: "file",
  spreadsheet: "table",
  photo: "image",
};

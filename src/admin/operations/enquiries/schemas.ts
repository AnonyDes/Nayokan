// Zod schemas for enquiry writes — testable outside "use server".
import { z } from "zod";
import type { EnquiryStatus } from "./types";

export const EnquiryIdSchema = z.object({ id: z.string().min(1) });

export const EnquiryAssignSchema = z.object({
  id: z.string().min(1),
  assigneeId: z.string().min(1, "Choose a staff member."),
  routeLabel: z.string().max(160),
});

export const EnquiryNoteSchema = z.object({
  id: z.string().min(1),
  body: z.string().min(1, "Note cannot be empty.").max(2000),
});

export const EnquiryTransitionSchema = z.object({
  id: z.string().min(1),
  target: z.enum(["in_progress", "resolved", "archived", "spam"]),
});

/** Workflow per enquiry-detail.html's actions block. Assignment moves
 *  new → in_progress via the assignment action, not this map. */
export const ALLOWED_ENQUIRY_TRANSITIONS: Record<EnquiryStatus, EnquiryStatus[]> = {
  new: ["in_progress", "archived", "spam"],
  in_progress: ["resolved", "archived", "spam"],
  resolved: ["archived"],
  archived: [],
  spam: [],
};

export function canTransitionEnquiry(from: EnquiryStatus, to: string): to is EnquiryStatus {
  return (ALLOWED_ENQUIRY_TRANSITIONS[from] ?? []).includes(to as EnquiryStatus);
}

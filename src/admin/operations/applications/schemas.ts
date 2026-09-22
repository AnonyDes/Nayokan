// Zod schemas for application writes — testable outside "use server".
import { z } from "zod";
import type { ApplicationStatus } from "./types";

export const ApplicationIdSchema = z.object({ id: z.string().min(1) });

export const AssignReviewerSchema = z.object({
  id: z.string().min(1),
  reviewerId: z.string().min(1),
});

export const ApplicationNoteSchema = z.object({
  id: z.string().min(1),
  body: z.string().min(1, "Note cannot be empty.").max(2000),
});

/** Workflow transitions per applications.html's decision panel. Rejection
 *  requires a reason — the design states decisions notify the applicant. */
export const ApplicationTransitionSchema = z.object({
  id: z.string().min(1),
  target: z.enum(["under_review", "shortlisted", "accepted", "rejected", "archived"]),
  reason: z.string().max(1000).optional(),
});

/** Allowed forward moves. "Request more info" is a note, not a transition —
 *  the design keeps the record in its current column. */
export const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  new: ["under_review", "rejected", "archived"],
  under_review: ["shortlisted", "accepted", "rejected", "archived"],
  shortlisted: ["accepted", "rejected", "archived"],
  accepted: ["archived"],
  rejected: ["archived"],
  archived: [],
};

export function canTransition(from: ApplicationStatus, to: string): to is ApplicationStatus {
  return (ALLOWED_TRANSITIONS[from] ?? []).includes(to as ApplicationStatus);
}

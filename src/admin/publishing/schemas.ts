// Zod input contracts for the publishing workflow actions. Kept out of
// actions.ts ("use server" can only export async functions) and directly
// unit-testable.
import { z } from "zod";

export const ReviewDecisionSchema = z.object({
  id: z.string().min(1),
  comment: z.string().trim().max(2000).optional(),
});

export const ReviewChangesSchema = z.object({
  id: z.string().min(1),
  comment: z.string().trim().min(3, "A comment is required to request changes.").max(2000),
});

export const ReassignSchema = z.object({
  id: z.string().min(1),
  /** Reviewer display name, or null to return the item to leadership review. */
  assignee: z.string().trim().min(1).nullable(),
});

export const RestoreVersionSchema = z.object({
  contentId: z.string().min(1),
  version: z.number().int().positive(),
});

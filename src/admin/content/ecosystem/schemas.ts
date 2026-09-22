// Zod schemas for ecosystem writes — testable outside the "use server" file.
import { z } from "zod";

export const PersonPatchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(160),
  position: z.string().max(120),
  division: z.enum(["leadership", "programme", "advisor"]),
  order: z.number().int().min(0).max(999),
  consentRecorded: z.boolean(),
  isPublic: z.boolean(),
});

export const MentorPatchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(160),
  expertise: z.string().max(200),
  sector: z.string().max(80),
  availability: z.enum(["open", "limited", "by_request"]),
  cohortLabel: z.string().max(40),
  status: z.enum(["active", "inactive", "draft"]),
  isPublic: z.boolean(),
});

export const PartnerPatchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  category: z.enum(["university", "corporate", "development", "government", "investor", "community"]),
  consentRecorded: z.boolean(),
  isPublic: z.boolean(),
});

export const VenturePatchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  sector: z.string().max(80),
  stage: z.string().max(40),
  location: z.string().max(120),
  relatedProgramme: z.string().max(160),
  listingStatus: z.enum(["pipeline", "active", "alumni", "exited"]),
  isPublic: z.boolean(),
});

export const PropertyPatchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "Slug must be lowercase letters, numbers and hyphens."),
  location: z.string().max(120),
  region: z.string().max(120),
  type: z.string().max(60),
  rooms: z.number().int().min(0).max(1000).nullable(),
  externalBookingUrl: z.string().max(500),
  status: z.enum(["published", "draft"]),
  isPublic: z.boolean(),
});

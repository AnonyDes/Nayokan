// Zod schemas for programme/cluster/opportunity writes — kept out of
// actions.ts ("use server" files may only export async functions) so they're
// directly unit-testable.
import { z } from "zod";
import { WORLDS } from "@/platform/sites/types";
import { CERTIFICATIONS, DELIVERY_MODELS, OPPORTUNITY_CATEGORIES, PROGRAMME_TYPES } from "./types";

const WorldSchema = z.union([z.enum(WORLDS), z.null()]);

export const ProgrammePatchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  world: WorldSchema,
  type: z.string().max(80),
  shortDesc: z.string().max(1000),
  fullDesc: z.string().max(20000),
  duration: z.string().max(80),
  startDate: z.string().max(40),
  endDate: z.string().max(40),
  location: z.string().max(160),
  delivery: z.enum(DELIVERY_MODELS),
  certification: z.enum(CERTIFICATIONS),
  appsOpen: z.boolean(),
  applyPath: z.string().max(300),
  appsCapacity: z.number().int().min(0).max(100000).nullable(),
  isPublic: z.boolean(),
});

export const ClusterPatchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(160),
  sector: z.string().max(200),
  location: z.string().max(120),
  cohortLabel: z.string().max(120),
  memberCount: z.number().int().min(0).max(100000),
  isPublic: z.boolean(),
});

export const OpportunityPatchSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "Slug must be lowercase letters, numbers and hyphens."),
  category: z.enum(OPPORTUNITY_CATEGORIES),
  world: WorldSchema,
  deadlineLabel: z.string().max(80),
  isPublic: z.boolean(),
});

export { PROGRAMME_TYPES };

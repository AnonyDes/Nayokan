import { z } from "zod";

// Shared client-facing payload shapes for the public submission actions.
// `site` is NOT part of these schemas: it is derived from the route tree
// by the server action, never accepted from the browser (readiness §14).

const email = z.string().trim().toLowerCase().email().max(320);
const optionalText = (max: number) => z.string().trim().max(max).optional();

export const applicationInputSchema = z.object({
  programmeId: z.string().uuid().optional(),
  opportunityId: z.string().uuid().optional(),
  fullName: z.string().trim().min(1).max(200),
  email,
  phone: optionalText(40),
  cityRegion: optionalText(200),
  ageBand: z.enum(["18-22", "23-28", "29-35", "35+"]).optional(),
  educationLevel: optionalText(120),
  occupation: optionalText(200),
  motivation: z.string().trim().min(1).max(8000),
  plans: optionalText(8000),
  preferredClusterId: z.string().uuid().optional(),
  secondaryInterests: z.array(z.string().trim().max(200)).max(10).optional(),
  consents: z.object({
    accuracy: z.literal(true),
    contact: z.literal(true),
    marketing: z.boolean().optional(),
    editorial: z.boolean().optional(),
  }),
  // Attribution, recorded for the admin pipeline.
  sourceUrl: optionalText(2000),
  sourceHost: optionalText(253),
  // Honeypot: must stay empty. Bots fill it; the RPC fakes success.
  website: z.string().max(0).optional(),
});
export type ApplicationInput = z.infer<typeof applicationInputSchema>;

export const enquiryInputSchema = z.object({
  category: z.enum(["general", "partnership", "media", "careers", "property", "programme", "other"]),
  name: z.string().trim().min(1).max(200),
  email,
  organization: optionalText(200),
  message: z.string().trim().min(1).max(8000),
  propertyId: z.string().uuid().optional(),
  programmeId: z.string().uuid().optional(),
  sourcePage: optionalText(500),
  sourceUrl: optionalText(2000),
  sourceHost: optionalText(253),
  website: z.string().max(0).optional(),
});
export type EnquiryInput = z.infer<typeof enquiryInputSchema>;

export const APPLICATION_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const APPLICATION_UPLOAD_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const uploadRequestSchema = z.object({
  applicationId: z.string().uuid(),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.enum(APPLICATION_UPLOAD_MIME_TYPES),
  sizeBytes: z.number().int().positive().max(APPLICATION_UPLOAD_MAX_BYTES),
});
export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;

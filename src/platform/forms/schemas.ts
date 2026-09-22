import { z } from "zod";

// Public form schemas — shared by the stub actions now and the real
// server actions when the forms workstream lands. Keep field names stable.

export const enquirySchema = z.object({
  name: z.string().trim().min(1, "Your name is required."),
  organization: z.string().trim().optional(),
  email: z.string().trim().email("A valid email is required."),
  enquiryType: z.string().trim().min(1, "Choose the closest match."),
  message: z.string().trim().min(1, "Tell us briefly what this is about."),
});
export type EnquiryInput = z.infer<typeof enquirySchema>;

// HTML checkboxes submit "on" (or nothing); coerce before validation.
const checkbox = (msg: string) =>
  z.preprocess((v) => v === "on" || v === "true" || v === true, z.literal(true, { error: msg }));
const optionalCheckbox = z.preprocess(
  (v) => v === "on" || v === "true" || v === true,
  z.boolean(),
);

export const vcPartnerSchema = z.object({
  organization: z.string().trim().min(1, "Your organisation is required."),
  category: z.string().trim().min(1, "Choose a partnership category."),
  contactName: z.string().trim().optional(),
  role: z.string().trim().optional(),
  email: z.string().trim().email("A valid email is required.").or(z.literal("")),
  country: z.string().trim().optional(),
  message: z.string().trim().optional(),
  consent: checkbox("Consent is required to submit."),
});
export type VcPartnerInput = z.infer<typeof vcPartnerSchema>;

// Compact IR enquiry on /venture-capital (vc-enquiry-form in venture-capital.html).
export const vcEnquirySchema = z.object({
  organization: z.string().trim().min(1, "Your organisation is required."),
  category: z.string().trim().min(1, "Choose an enquiry type."),
  email: z.string().trim().email("A valid email is required."),
  message: z.string().trim().optional(),
});
export type VcEnquiryInput = z.infer<typeof vcEnquirySchema>;

export const bookingSchema = z.object({
  property: z.string().trim().min(1, "Choose a property."),
  guests: z.string().trim().min(1, "Choose the number of guests."),
  arrival: z.string().trim().min(1, "Choose an arrival date."),
  departure: z.string().trim().min(1, "Choose a departure date."),
  purpose: z.string().trim().optional(),
  email: z.string().trim().email("A valid email is required."),
});
export type BookingInput = z.infer<typeof bookingSchema>;

// Six-step programme application (corporate /application and VTI /apply).
export const applicationSchema = z.object({
  fullName: z.string().trim().min(1, "Your full name is required."),
  email: z.string().trim().email("A valid email is required."),
  phone: z.string().trim().optional(),
  cityRegion: z.string().trim().min(1, "Your city / region is required."),
  ageBand: z.string().trim().optional(),
  programme: z.string().trim().min(1, "Choose a primary programme."),
  cluster: z.string().trim().optional(),
  education: z.string().trim().optional(),
  occupation: z.string().trim().optional(),
  motivation: z.string().trim().min(1, "Tell us your motivation."),
  plans: z.string().trim().optional(),
  confirmAccurate: checkbox("Please confirm your information is accurate."),
  consentContact: checkbox("Consent to contact is required."),
  updatesOptIn: optionalCheckbox,
  featureOptIn: optionalCheckbox,
});
export type ApplicationInput = z.infer<typeof applicationSchema>;

// Startup Centre innovator application (startup-apply.html — six steps:
// Applicant / Institution / Innovation / Stage / Team & market / Consent).
export const startupApplicationSchema = z.object({
  // 01 · Applicant
  fullName: z.string().trim().min(1, "Your full name is required."),
  email: z.string().trim().email("A valid email is required."),
  phone: z.string().trim().optional(),
  role: z.string().trim().optional(),
  // 02 · Institution
  university: z.string().trim().optional(),
  department: z.string().trim().optional(),
  affiliation: z.string().trim().optional(),
  // 03 · Innovation
  ventureName: z.string().trim().min(1, "A working title for the innovation is required."),
  problem: z.string().trim().min(1, "Describe the problem you are solving."),
  solution: z.string().trim().min(1, "Describe your solution."),
  sector: z.string().trim().min(1, "Choose a sector."),
  source: z.string().trim().optional(),
  summary: z.string().trim().optional(),
  // 04 · Stage
  stage: z.string().trim().min(1, "Choose your current stage."),
  demand: z.string().trim().optional(),
  demandProof: z.string().trim().optional(),
  // 05 · Team & market
  teamSize: z.string().trim().optional(),
  region: z.string().trim().optional(),
  market: z.string().trim().optional(),
  links: z.string().trim().optional(),
  // 06 · Consent
  consentReview: checkbox("Please consent to panel review."),
  confirmAccurate: checkbox("Please confirm your information is accurate."),
  consentContact: checkbox("Consent to contact is required."),
});
export type StartupApplicationInput = z.infer<typeof startupApplicationSchema>;

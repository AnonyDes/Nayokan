"use server";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import {
  applicationSchema,
  bookingSchema,
  enquirySchema,
  startupApplicationSchema,
  vcEnquirySchema,
  vcPartnerSchema,
} from "./schemas";
import type { z } from "zod";

// Form submission states matching the designed form states: default / focus /
// filled / validation error / submitting / success / failure.
export type FormState =
  | { status: "idle" }
  | { status: "error"; fieldErrors: Record<string, string>; message?: string }
  | { status: "success"; reference?: string };

const fieldErrors = (error: z.ZodError): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
};

// Anonymous submissions go through the SECURITY DEFINER RPCs in supabase —
// they validate, rate-limit, honeypot-check and assign the site-scoped
// reference server-side. The anon key is correct here: the RPCs are granted
// to anon and are the only write path open to the public.
let rpcClient: SupabaseClient | undefined;

function db(): SupabaseClient {
  if (rpcClient) return rpcClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Form persistence requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  rpcClient = createClient(url, key, { auth: { persistSession: false } });
  return rpcClient;
}

type SubmissionResult = { reference: string; id: string };

async function rpc(name: "submit_enquiry" | "submit_application", args: Record<string, unknown>): Promise<FormState> {
  const { data, error } = await db().rpc(name, args);
  if (error) {
    // Rate limiting and honeypot rejections land here; keep the message vague.
    return { status: "error", fieldErrors: {}, message: "Submission failed. Please try again later." };
  }
  const row = (data as SubmissionResult[] | null)?.[0];
  return { status: "success", reference: row?.reference };
}

async function context() {
  const h = await headers();
  const site = h.get("x-nayokan-site");
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return { site, ip };
}

export async function submitEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = enquirySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  const { site, ip } = await context();
  return rpc("submit_enquiry", {
    p_site: site,
    p_category: parsed.data.enquiryType,
    p_name: parsed.data.name,
    p_email: parsed.data.email,
    p_organization: parsed.data.organization,
    p_message: parsed.data.message,
    p_source_page: "contact",
    p_ip: ip,
  });
}

export async function submitVcPartnerEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = vcPartnerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  const { site, ip } = await context();
  return rpc("submit_enquiry", {
    p_site: site,
    p_category: "vc",
    p_name: parsed.data.contactName || parsed.data.organization,
    p_email: parsed.data.email || "not-provided@invalid.local",
    p_organization: parsed.data.organization,
    p_message: [parsed.data.category, parsed.data.role, parsed.data.country, parsed.data.message]
      .filter(Boolean)
      .join(" · "),
    p_source_page: "venture-capital/partner",
    p_ip: ip,
  });
}

export async function submitVcEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = vcEnquirySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  const { site, ip } = await context();
  return rpc("submit_enquiry", {
    p_site: site,
    p_category: "vc",
    p_name: parsed.data.organization,
    p_email: parsed.data.email,
    p_organization: parsed.data.organization,
    p_message: [parsed.data.category, parsed.data.message].filter(Boolean).join(" · "),
    p_source_page: "venture-capital",
    p_ip: ip,
  });
}

export async function submitBookingEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = bookingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  const { site, ip } = await context();
  return rpc("submit_enquiry", {
    p_site: site,
    p_category: "hospitality",
    p_name: parsed.data.email,
    p_email: parsed.data.email,
    p_message: [
      `Property: ${parsed.data.property}`,
      `Guests: ${parsed.data.guests}`,
      `Dates: ${parsed.data.arrival} → ${parsed.data.departure}`,
      parsed.data.purpose,
    ]
      .filter(Boolean)
      .join(" · "),
    p_source_page: "hospitality",
    p_ip: ip,
  });
}

export async function submitApplication(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = applicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  const { site, ip } = await context();
  const programmeId = await resolveProgrammeId(site, parsed.data.programme);
  if (!programmeId) {
    return { status: "error", fieldErrors: { programme: "Applications are not open for this programme yet." } };
  }
  return rpc("submit_application", {
    p_site: site,
    p_programme_id: programmeId,
    p_full_name: parsed.data.fullName,
    p_email: parsed.data.email,
    p_phone: parsed.data.phone,
    p_city_region: parsed.data.cityRegion,
    p_age_band: parsed.data.ageBand,
    p_education_level: parsed.data.education,
    p_occupation: parsed.data.occupation,
    p_motivation: parsed.data.motivation,
    p_plans: [parsed.data.cluster && `Cluster: ${parsed.data.cluster}`, parsed.data.plans]
      .filter(Boolean)
      .join(" · "),
    p_consents: {
      accuracy: parsed.data.confirmAccurate,
      contact: parsed.data.consentContact,
      updates: parsed.data.updatesOptIn,
      feature: parsed.data.featureOptIn,
    },
    p_ip: ip,
  });
}

/** Programme select values are slugs; the RPC needs the row id. */
async function resolveProgrammeId(site: string | null, slugOrId: string | undefined): Promise<string | null> {
  if (!slugOrId || !site) return null;
  const { data } = await db()
    .from("programmes")
    .select("id")
    .eq("site", site)
    .eq("slug", slugOrId)
    .limit(1);
  return (data?.[0]?.id as string) ?? null;
}

export async function submitStartupApplication(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = startupApplicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  const { site, ip } = await context();
  const d = parsed.data;
  return rpc("submit_application", {
    p_site: site ?? "startup",
    p_programme_id: await resolveProgrammeId(site ?? "startup", "startup-programme"),
    p_full_name: d.fullName,
    p_email: d.email,
    p_phone: d.phone,
    p_city_region: d.region,
    p_occupation: [d.role, d.university, d.department, d.affiliation].filter(Boolean).join(" · "),
    p_motivation: [`Venture: ${d.ventureName}`, `Problem: ${d.problem}`, `Solution: ${d.solution}`, `Sector: ${d.sector}`, d.source && `Source: ${d.source}`, d.summary]
      .filter(Boolean)
      .join("\n"),
    p_plans: [`Stage: ${d.stage}`, d.demand && `Demand: ${d.demand}`, d.demandProof && `Proof: ${d.demandProof}`, d.teamSize && `Team: ${d.teamSize}`, d.market && `Market: ${d.market}`, d.links && `Links: ${d.links}`]
      .filter(Boolean)
      .join("\n"),
    p_consents: {
      review: d.consentReview,
      accurate: d.confirmAccurate,
      contact: d.consentContact,
    },
    p_ip: ip,
  });
}

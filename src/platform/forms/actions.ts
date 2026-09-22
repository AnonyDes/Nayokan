"use server";

import { headers } from "next/headers";
import { createPublicClient } from "@/platform/supabase/public";
import { createServiceClient } from "@/platform/supabase/service";
import { sendEmail } from "@/platform/email/send";
import { isSiteId, type SiteId } from "@/platform/sites/types";
import {
  applicationInputSchema,
  enquiryInputSchema,
  uploadRequestSchema,
} from "./schemas";

// Public submission server actions (readiness §14). `site` arrives from the
// route tree (the page that rendered the form), never from client input;
// the RPCs re-validate it anyway. The anon key is used for the RPC calls so
// the only write surface is exactly what the SECURITY DEFINER functions
// allow — the service client is used solely for signing upload URLs.

export type SubmissionResult =
  | { ok: true; reference: string; id: string | null }
  | { ok: false; error: string };

async function clientIp(): Promise<string | null> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip");
}

async function notifySite(site: SiteId, subject: string, html: string): Promise<void> {
  const db = createPublicClient();
  const { data } = await db.from("site_settings").select("contact_email").eq("site", site).maybeSingle();
  if (data?.contact_email) {
    await sendEmail({ to: data.contact_email, subject, html });
  }
}

export async function submitApplication(site: SiteId, raw: unknown): Promise<SubmissionResult> {
  if (!isSiteId(site)) return { ok: false, error: "Unknown site." };
  const parsed = applicationInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields." };
  const input = parsed.data;

  const db = createPublicClient();
  const { data, error } = await db.rpc("submit_application", {
    p_site: site,
    p_full_name: input.fullName,
    p_email: input.email,
    p_motivation: input.motivation,
    p_programme_id: input.programmeId ?? undefined,
    p_opportunity_id: input.opportunityId ?? undefined,
    p_phone: input.phone ?? undefined,
    p_city_region: input.cityRegion ?? undefined,
    p_age_band: input.ageBand ?? undefined,
    p_education_level: input.educationLevel ?? undefined,
    p_occupation: input.occupation ?? undefined,
    p_plans: input.plans ?? undefined,
    p_preferred_cluster_id: input.preferredClusterId ?? undefined,
    p_secondary_interests: input.secondaryInterests ?? undefined,
    p_consents: input.consents,
    p_source_url: input.sourceUrl ?? undefined,
    p_source_host: input.sourceHost ?? undefined,
    p_ip: (await clientIp()) ?? undefined,
    p_honeypot: input.website ?? undefined,
  });
  if (error) return { ok: false, error: error.message };

  const row = data?.[0];
  if (!row?.reference) return { ok: false, error: "Submission failed." };

  if (row.id) {
    await notifySite(
      site,
      `New application ${row.reference}`,
      `<p>Application <strong>${row.reference}</strong> from ${input.fullName} was submitted.</p>`,
    );
  }
  return { ok: true, reference: row.reference, id: row.id };
}

export async function submitEnquiry(site: SiteId, raw: unknown): Promise<SubmissionResult> {
  if (!isSiteId(site)) return { ok: false, error: "Unknown site." };
  const parsed = enquiryInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields." };
  const input = parsed.data;

  const db = createPublicClient();
  const { data, error } = await db.rpc("submit_enquiry", {
    p_site: site,
    p_category: input.category,
    p_name: input.name,
    p_email: input.email,
    p_message: input.message,
    p_organization: input.organization ?? undefined,
    p_property_id: input.propertyId ?? undefined,
    p_programme_id: input.programmeId ?? undefined,
    p_source_page: input.sourcePage ?? undefined,
    p_source_url: input.sourceUrl ?? undefined,
    p_source_host: input.sourceHost ?? undefined,
    p_ip: (await clientIp()) ?? undefined,
    p_honeypot: input.website ?? undefined,
  });
  if (error) return { ok: false, error: error.message };

  const row = data?.[0];
  if (!row?.reference) return { ok: false, error: "Submission failed." };

  if (row.id) {
    await notifySite(
      site,
      `New enquiry ${row.reference}`,
      `<p>Enquiry <strong>${row.reference}</strong> (${input.category}) from ${input.name} was submitted.</p>`,
    );
  }
  return { ok: true, reference: row.reference, id: row.id };
}

// Signed upload URL for one application document. The RPC enforces the
// MIME/size allowlist and the per-application cap; the service client only
// signs the exact path the RPC registered — it cannot be steered elsewhere.
export type UploadTicket =
  | { ok: true; documentId: string; path: string; signedUrl: string; token: string }
  | { ok: false; error: string };

export async function requestApplicationUpload(raw: unknown): Promise<UploadTicket> {
  const parsed = uploadRequestSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "File is not allowed." };
  const input = parsed.data;

  const db = createPublicClient();
  const { data, error } = await db.rpc("register_application_document", {
    p_application_id: input.applicationId,
    p_file_name: input.fileName,
    p_mime_type: input.mimeType,
    p_size_bytes: input.sizeBytes,
  });
  if (error) return { ok: false, error: error.message };

  const row = data?.[0];
  if (!row?.storage_path) return { ok: false, error: "Upload registration failed." };

  const service = createServiceClient();
  const { data: signed, error: signError } = await service.storage
    .from("private")
    .createSignedUploadUrl(row.storage_path);
  if (signError || !signed) return { ok: false, error: signError?.message ?? "Could not sign upload." };

  return { ok: true, documentId: row.document_id, path: row.storage_path, signedUrl: signed.signedUrl, token: signed.token };
}

export async function confirmApplicationDocument(documentId: string): Promise<{ ok: boolean }> {
  const parsed = uploadRequestSchema.shape.applicationId.safeParse(documentId);
  if (!parsed.success) return { ok: false };
  const db = createPublicClient();
  const { error } = await db.rpc("confirm_application_document", { p_document_id: documentId });
  return { ok: !error };
}

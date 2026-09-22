// Server Actions for the ecosystem directory. Zod → requirePermission on the
// record's owning site → mock seam. Governance gates that must also hold
// server-side once Session B's RPCs land:
//   - partner public=true requires consentRecorded (partners.html)
//   - person public=true requires consentRecorded (people.html)
// Ventures never carry financial fields (content contract).
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/platform/auth/permissions";
import * as data from "./data";
import { MentorPatchSchema, PartnerPatchSchema, PersonPatchSchema, PropertyPatchSchema, VenturePatchSchema } from "./schemas";

export type ActionResult = { ok: true } | { ok: false; error: string };
const ok: ActionResult = { ok: true };
const fail = (error: string): ActionResult => ({ ok: false, error });

// — people —

export async function savePerson(input: unknown): Promise<ActionResult> {
  const parsed = PersonPatchSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid person.");
  const { id, ...fields } = parsed.data;
  const record = data.getPerson(id);
  if (!record) return fail("Person not found.");
  // Governance: cannot publish without recorded consent (people.html).
  if (fields.isPublic && !fields.consentRecorded) return fail("Record the person's publish consent before making them public.");
  await requirePermission("people", "full", record.site);
  if (!data.savePerson(id, fields)) return fail("Person not found.");
  revalidatePath("/admin/ecosystem/people");
  return ok;
}

export async function createPerson(): Promise<ActionResult & { id?: string }> {
  await requirePermission("people", "full");
  const record = data.createPerson();
  revalidatePath("/admin/ecosystem/people");
  return { ok: true, id: record.id };
}

// — mentors —

export async function saveMentor(input: unknown): Promise<ActionResult> {
  const parsed = MentorPatchSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid mentor.");
  const { id, ...fields } = parsed.data;
  const record = data.getMentor(id);
  if (!record) return fail("Mentor not found.");
  await requirePermission("people", "full", record.site);
  if (!data.saveMentor(id, fields)) return fail("Mentor not found.");
  revalidatePath("/admin/ecosystem/mentors");
  return ok;
}

export async function createMentor(): Promise<ActionResult & { id?: string }> {
  await requirePermission("people", "full");
  const record = data.createMentor();
  revalidatePath("/admin/ecosystem/mentors");
  return { ok: true, id: record.id };
}

// — partners —

export async function savePartner(input: unknown): Promise<ActionResult> {
  const parsed = PartnerPatchSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid partner.");
  const { id, ...fields } = parsed.data;
  const record = data.getPartner(id);
  if (!record) return fail("Partner not found.");
  // Governance (partners.html): names/logos go public only after written consent.
  if (fields.isPublic && !fields.consentRecorded) return fail("Record written consent before making a partner public.");
  await requirePermission("partners", "full", record.site);
  if (!data.savePartner(id, { ...fields, status: fields.isPublic ? (record.hasLogo ? "visible" : "missing_logo") : record.status === "visible" ? "draft" : record.status })) {
    return fail("Partner not found.");
  }
  revalidatePath("/admin/ecosystem/partners");
  return ok;
}

export async function setPartnerPublic(input: { id: unknown; isPublic: unknown }): Promise<ActionResult> {
  const parsed = z.object({ id: z.string().min(1), isPublic: z.boolean() }).safeParse(input);
  if (!parsed.success) return fail("Invalid request.");
  const record = data.getPartner(parsed.data.id);
  if (!record) return fail("Partner not found.");
  if (parsed.data.isPublic && !record.consentRecorded) return fail("Written consent must be recorded before a partner can go public.");
  await requirePermission("partners", "full", record.site);
  data.savePartner(record.id, { isPublic: parsed.data.isPublic, status: parsed.data.isPublic ? (record.hasLogo ? "visible" : "missing_logo") : "draft" });
  revalidatePath("/admin/ecosystem/partners");
  return ok;
}

export async function createPartner(): Promise<ActionResult & { id?: string }> {
  await requirePermission("partners", "full");
  const record = data.createPartner();
  revalidatePath("/admin/ecosystem/partners");
  return { ok: true, id: record.id };
}

// — ventures —

export async function saveVenture(input: unknown): Promise<ActionResult> {
  const parsed = VenturePatchSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid venture.");
  const { id, ...fields } = parsed.data;
  const record = data.getVenture(id);
  if (!record) return fail("Venture not found.");
  await requirePermission("ventures", "full", record.site);
  if (!data.saveVenture(id, fields)) return fail("Venture not found.");
  revalidatePath("/admin/ecosystem/portfolio");
  return ok;
}

export async function setVenturePublic(input: { id: unknown; isPublic: unknown }): Promise<ActionResult> {
  const parsed = z.object({ id: z.string().min(1), isPublic: z.boolean() }).safeParse(input);
  if (!parsed.success) return fail("Invalid request.");
  const record = data.getVenture(parsed.data.id);
  if (!record) return fail("Venture not found.");
  await requirePermission("ventures", "full", record.site);
  data.saveVenture(record.id, { isPublic: parsed.data.isPublic });
  revalidatePath("/admin/ecosystem/portfolio");
  return ok;
}

export async function createVenture(): Promise<ActionResult & { id?: string }> {
  await requirePermission("ventures", "full");
  const record = data.createVenture();
  revalidatePath("/admin/ecosystem/portfolio");
  return { ok: true, id: record.id };
}

// — properties —

export async function saveProperty(input: unknown): Promise<ActionResult> {
  const parsed = PropertyPatchSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid property.");
  const { id, ...fields } = parsed.data;
  const record = data.getProperty(id);
  if (!record) return fail("Property not found.");
  // External booking only — reject anything that isn't an absolute URL.
  if (fields.externalBookingUrl && !/^https?:\/\//.test(fields.externalBookingUrl)) {
    return fail("Booking URL must be an external https:// link — bookings are never handled internally.");
  }
  await requirePermission("properties", "full", record.site);
  if (!data.saveProperty(id, fields)) return fail("Property not found.");
  revalidatePath("/admin/ecosystem/properties");
  return ok;
}

export async function setPropertyPublic(input: { id: unknown; isPublic: unknown }): Promise<ActionResult> {
  const parsed = z.object({ id: z.string().min(1), isPublic: z.boolean() }).safeParse(input);
  if (!parsed.success) return fail("Invalid request.");
  const record = data.getProperty(parsed.data.id);
  if (!record) return fail("Property not found.");
  await requirePermission("properties", "full", record.site);
  data.saveProperty(record.id, { isPublic: parsed.data.isPublic });
  revalidatePath("/admin/ecosystem/properties");
  return ok;
}

export async function createProperty(): Promise<ActionResult & { id?: string }> {
  await requirePermission("properties", "full");
  const record = data.createProperty();
  revalidatePath("/admin/ecosystem/properties");
  return { ok: true, id: record.id };
}

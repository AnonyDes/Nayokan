// Server Actions for programmes/clusters/opportunities. Zod →
// requirePermission("programmes", "full", row.site) → mock seam. The public
// toggle is a normal write here; the auto-close of expired opportunities is
// a scheduled job on the backend (pending Session B), not an admin action.
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/platform/auth/permissions";
import { isSiteId, isValidSiteWorld, type SiteId, type World } from "@/platform/sites/types";
import * as data from "./data";
import { ClusterPatchSchema, OpportunityPatchSchema, ProgrammePatchSchema } from "./schemas";

export type ActionResult = { ok: true } | { ok: false; error: string };
const ok: ActionResult = { ok: true };
const fail = (error: string): ActionResult => ({ ok: false, error });

export async function saveProgramme(input: unknown): Promise<ActionResult> {
  const parsed = ProgrammePatchSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid programme.");
  const { id, ...fields } = parsed.data;
  const prog = data.getProgramme(id);
  if (!prog) return fail("Programme not found.");
  if (fields.world && !isValidSiteWorld(prog.site, fields.world)) return fail("That world doesn't belong to this site.");
  await requirePermission("programmes", "full", prog.site);
  if (!data.saveProgramme(id, fields)) return fail("Programme not found.");
  revalidatePath("/admin/programmes");
  revalidatePath(`/admin/programmes/${id}`);
  return ok;
}

export async function setProgrammePublic(input: { id: unknown; isPublic: unknown }): Promise<ActionResult> {
  const parsed = z.object({ id: z.string().min(1), isPublic: z.boolean() }).safeParse(input);
  if (!parsed.success) return fail("Invalid request.");
  const prog = data.getProgramme(parsed.data.id);
  if (!prog) return fail("Programme not found.");
  await requirePermission("programmes", "full", prog.site);
  data.saveProgramme(prog.id, { isPublic: parsed.data.isPublic });
  revalidatePath("/admin/programmes");
  return ok;
}

export async function createProgramme(input: { site: unknown }): Promise<ActionResult & { id?: string }> {
  const parsed = z.object({ site: z.string().refine(isSiteId) }).safeParse(input);
  if (!parsed.success) return fail("Unknown site.");
  const site = parsed.data.site as SiteId;
  await requirePermission("programmes", "full", site);
  const prog = data.createProgramme(site, site === "corporate" ? null : (site as World));
  revalidatePath("/admin/programmes");
  return { ok: true, id: prog.id };
}

export async function saveCluster(input: unknown): Promise<ActionResult> {
  const parsed = ClusterPatchSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid cluster.");
  const { id, ...fields } = parsed.data;
  const cluster = data.getCluster(id);
  if (!cluster) return fail("Cluster not found.");
  await requirePermission("programmes", "full", cluster.site);
  if (!data.saveCluster(id, fields)) return fail("Cluster not found.");
  revalidatePath("/admin/programmes/clusters");
  return ok;
}

export async function setClusterPublic(input: { id: unknown; isPublic: unknown }): Promise<ActionResult> {
  const parsed = z.object({ id: z.string().min(1), isPublic: z.boolean() }).safeParse(input);
  if (!parsed.success) return fail("Invalid request.");
  const cluster = data.getCluster(parsed.data.id);
  if (!cluster) return fail("Cluster not found.");
  await requirePermission("programmes", "full", cluster.site);
  data.saveCluster(cluster.id, { isPublic: parsed.data.isPublic });
  revalidatePath("/admin/programmes/clusters");
  return ok;
}

export async function createCluster(input: { site: unknown }): Promise<ActionResult & { id?: string }> {
  const parsed = z.object({ site: z.string().refine(isSiteId) }).safeParse(input);
  if (!parsed.success) return fail("Unknown site.");
  const site = parsed.data.site as SiteId;
  await requirePermission("programmes", "full", site);
  const cluster = data.createCluster(site);
  revalidatePath("/admin/programmes/clusters");
  return { ok: true, id: cluster.id };
}

export async function saveOpportunity(input: unknown): Promise<ActionResult> {
  const parsed = OpportunityPatchSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid opportunity.");
  const { id, ...fields } = parsed.data;
  const opp = data.getOpportunity(id);
  if (!opp) return fail("Opportunity not found.");
  if (fields.world && !isValidSiteWorld(opp.site, fields.world)) return fail("That world doesn't belong to this site.");
  await requirePermission("programmes", "full", opp.site);
  if (!data.saveOpportunity(id, fields)) return fail("Opportunity not found.");
  revalidatePath("/admin/programmes/opportunities");
  return ok;
}

export async function setOpportunityPublic(input: { id: unknown; isPublic: unknown }): Promise<ActionResult> {
  const parsed = z.object({ id: z.string().min(1), isPublic: z.boolean() }).safeParse(input);
  if (!parsed.success) return fail("Invalid request.");
  const opp = data.getOpportunity(parsed.data.id);
  if (!opp) return fail("Opportunity not found.");
  await requirePermission("programmes", "full", opp.site);
  data.saveOpportunity(opp.id, { isPublic: parsed.data.isPublic });
  revalidatePath("/admin/programmes/opportunities");
  return ok;
}

export async function createOpportunity(input: { site: unknown }): Promise<ActionResult & { id?: string }> {
  const parsed = z.object({ site: z.string().refine(isSiteId) }).safeParse(input);
  if (!parsed.success) return fail("Unknown site.");
  const site = parsed.data.site as SiteId;
  await requirePermission("programmes", "full", site);
  const opp = data.createOpportunity(site, site === "corporate" ? null : (site as World));
  revalidatePath("/admin/programmes/opportunities");
  return { ok: true, id: opp.id };
}

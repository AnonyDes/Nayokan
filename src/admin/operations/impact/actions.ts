// Server Actions for impact governance. Zod → requirePermission on the
// metric's site (world → site map) → mock seam. Governance invariants are
// enforced server-side per readiness-report §8:
//   · public=true is rejected unless the metric is approved
//   · verification requires live evidence
//   · evidence is append-only — corrections supersede, never edit/delete
// Real RPCs (ContentGovernanceError) pending Session B's platform/workflow.
"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/platform/auth/permissions";
import type { SiteId } from "@/platform/sites/types";
import * as data from "./data";
import { canApproveMetric, canPublishMetric, canSubmitForVerification, canVerifyMetric, AssignVerifierSchema, EvidenceLinkSchema, EvidenceSupersedeSchema, EvidenceUploadSchema, MetricIdSchema, MetricPatchSchema, SetMetricPublicSchema } from "./schemas";

export type ActionResult = { ok: true } | { ok: false; error: string };
const ok: ActionResult = { ok: true };
const fail = (error: string): ActionResult => ({ ok: false, error });

const siteOf = (world: keyof typeof data.WORLD_SITE): SiteId | undefined => data.WORLD_SITE[world] ?? undefined;

const refresh = (id?: string) => {
  revalidatePath("/admin/impact/metrics");
  revalidatePath("/admin/impact/evidence");
  if (id) revalidatePath(`/admin/impact/metrics/${id}`);
};

/** Create returns the new record's id so the client can route to the editor. */
export async function createMetric(): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const session = await requirePermission("impact_metrics", "full");
  const m = data.insertMetric(session.fullName);
  revalidatePath("/admin/impact/metrics");
  return { ok: true, id: m.id };
}

export async function saveMetric(input: unknown): Promise<ActionResult> {
  const parsed = MetricPatchSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid metric.");
  const record = data.getMetric(parsed.data.id);
  if (!record) return fail("Metric not found.");
  const session = await requirePermission("impact_metrics", "full", siteOf(record.world));
  const { id, ...patch } = parsed.data;
  data.saveMetric(id, { ...patch, title: patch.name === record.name ? record.title : `${patch.name} · ${record.title.split("·").slice(1).join("·").trim() || record.periodLabel}` });
  data.appendMetricAudit(id, session.fullName, `Metric updated · ${patch.name}`);
  refresh(id);
  return ok;
}

export async function submitMetricForVerification(input: unknown): Promise<ActionResult> {
  const parsed = MetricIdSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid request.");
  const record = data.getMetric(parsed.data.id);
  if (!record) return fail("Metric not found.");
  if (!canSubmitForVerification(record)) return fail("Enter a value before submitting for verification.");
  const session = await requirePermission("impact_metrics", "full", siteOf(record.world));
  data.saveMetric(record.id, { status: "needs_verification" });
  data.appendMetricAudit(record.id, session.fullName, "Submitted for verification");
  refresh(record.id);
  return ok;
}

export async function assignVerifier(input: unknown): Promise<ActionResult> {
  const parsed = AssignVerifierSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid assignment.");
  const record = data.getMetric(parsed.data.id);
  if (!record) return fail("Metric not found.");
  const verifier = data.VERIFIERS.find((v) => v.id === parsed.data.verifierId);
  if (!verifier) return fail("Unknown verifier.");
  const session = await requirePermission("impact_metrics", "full", siteOf(record.world));
  data.saveMetric(record.id, { verifier });
  data.appendMetricAudit(record.id, session.fullName, `Verification requested · ${verifier.name}`);
  refresh(record.id);
  return ok;
}

export async function verifyMetric(input: unknown): Promise<ActionResult> {
  const parsed = MetricIdSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid request.");
  const record = data.getMetric(parsed.data.id);
  if (!record) return fail("Metric not found.");
  if (record.status !== "needs_verification") return fail("Only metrics awaiting verification can be verified.");
  if (!canVerifyMetric(record)) return fail("Verified evidence is required — link or verify an evidence item first.");
  const session = await requirePermission("impact_metrics", "review", siteOf(record.world));
  data.saveMetric(record.id, { status: "verified" });
  data.appendMetricAudit(record.id, session.fullName, "Marked verified against evidence");
  refresh(record.id);
  return ok;
}

export async function approveMetric(input: unknown): Promise<ActionResult> {
  const parsed = MetricIdSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid request.");
  const record = data.getMetric(parsed.data.id);
  if (!record) return fail("Metric not found.");
  if (!canApproveMetric(record)) return fail("Only verified metrics can be approved.");
  const session = await requirePermission("impact_metrics", "review", siteOf(record.world));
  data.saveMetric(record.id, { status: "approved" });
  data.appendMetricAudit(record.id, session.fullName, "Approved for publication");
  refresh(record.id);
  return ok;
}

/** Governance invariant — the toggle's server-side twin. isPublic=true is
 *  rejected unless status === "approved" (readiness §8); turning a public
 *  metric off is always allowed. */
export async function setMetricPublic(input: unknown): Promise<ActionResult> {
  const parsed = SetMetricPublicSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid request.");
  const record = data.getMetric(parsed.data.id);
  if (!record) return fail("Metric not found.");
  if (parsed.data.isPublic && !canPublishMetric(record)) return fail("Cannot publish — complete the verification chain first.");
  const session = await requirePermission("impact_metrics", "review", siteOf(record.world));
  data.saveMetric(record.id, { isPublic: parsed.data.isPublic });
  data.appendMetricAudit(record.id, session.fullName, parsed.data.isPublic ? "Published on website" : "Removed from website");
  refresh(record.id);
  return ok;
}

// — evidence (append-only: upload, link, verify, supersede — no delete) —

export async function uploadEvidence(input: unknown): Promise<ActionResult> {
  const parsed = EvidenceUploadSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid evidence.");
  const metric = parsed.data.metricId ? data.getMetric(parsed.data.metricId) : null;
  if (parsed.data.metricId && !metric) return fail("Metric not found.");
  const session = await requirePermission("evidence", "full", metric ? siteOf(metric.world) : undefined);
  data.insertEvidence({
    title: parsed.data.title,
    type: parsed.data.type,
    metricId: metric?.id ?? null,
    relatedLabel: metric?.title ?? "Unlinked",
    uploadedBy: session.fullName,
  });
  if (metric) data.refreshMetricEvidence(metric.id);
  refresh(metric?.id);
  return ok;
}

export async function linkEvidence(input: unknown): Promise<ActionResult> {
  const parsed = EvidenceLinkSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid link.");
  const item = data.getEvidence(parsed.data.evidenceId);
  const metric = data.getMetric(parsed.data.metricId);
  if (!item || !metric) return fail("Evidence or metric not found.");
  if (item.status === "superseded") return fail("Superseded evidence cannot be linked.");
  await requirePermission("evidence", "full", siteOf(metric.world));
  data.saveEvidence(item.id, { metricId: metric.id, relatedLabel: metric.title });
  data.refreshMetricEvidence(metric.id);
  refresh(metric.id);
  return ok;
}

export async function verifyEvidence(input: unknown): Promise<ActionResult> {
  const parsed = MetricIdSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid request.");
  const item = data.getEvidence(parsed.data.id);
  if (!item) return fail("Evidence not found.");
  if (item.status !== "awaiting_review") return fail("Only evidence awaiting review can be verified.");
  const metric = item.metricId ? data.getMetric(item.metricId) : null;
  await requirePermission("evidence", "review", metric ? siteOf(metric.world) : undefined);
  data.saveEvidence(item.id, { status: "verified" });
  if (metric) data.refreshMetricEvidence(metric.id);
  refresh(metric?.id);
  return ok;
}

/** Append-only correction: marks the old record superseded and appends the
 *  replacement — the audit trail keeps both rows. */
export async function supersedeEvidence(input: unknown): Promise<ActionResult> {
  const parsed = EvidenceSupersedeSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid record.");
  const item = data.getEvidence(parsed.data.id);
  if (!item) return fail("Evidence not found.");
  if (item.status === "superseded") return fail("Already superseded.");
  const metric = item.metricId ? data.getMetric(item.metricId) : null;
  const session = await requirePermission("evidence", "full", metric ? siteOf(metric.world) : undefined);
  data.saveEvidence(item.id, { status: "superseded" });
  data.insertEvidence({
    title: parsed.data.title,
    type: parsed.data.type,
    metricId: item.metricId,
    relatedLabel: item.relatedLabel,
    uploadedBy: session.fullName,
  });
  if (metric) data.refreshMetricEvidence(metric.id);
  refresh(metric?.id);
  return ok;
}

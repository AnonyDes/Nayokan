// Zod schemas + governance guards for impact writes — testable outside
// "use server". The publish invariant (public requires approved) lives here
// so the server action and tests share one rule.
import { z } from "zod";
import type { ImpactMetric, MetricStatus } from "./types";

export const METRIC_UNITS = ["people", "enterprises", "certificates", "%", "ventures", "partnerships", "members", "mentors", "universities", "apps", "guests"] as const;
export const METRIC_WORLDS = ["vti", "startup", "venture_capital", "hospitality", "all"] as const;

export const MetricPatchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, "Metric name is required.").max(160),
  value: z.number().finite().nonnegative().nullable(),
  unit: z.enum(METRIC_UNITS),
  description: z.string().max(2000),
  periodLabel: z.string().min(1).max(80),
  periodRangeLabel: z.string().max(80),
  geographicScope: z.string().min(1).max(160),
  world: z.enum(METRIC_WORLDS),
  programmeLabel: z.string().max(160),
});

export const MetricIdSchema = z.object({ id: z.string().min(1) });

export const AssignVerifierSchema = z.object({
  id: z.string().min(1),
  verifierId: z.string().min(1, "Choose a verifier."),
});

export const SetMetricPublicSchema = z.object({
  id: z.string().min(1),
  isPublic: z.boolean(),
});

export const EvidenceUploadSchema = z.object({
  title: z.string().min(3, "Evidence title is required.").max(200),
  type: z.enum(["report", "programme_record", "spreadsheet", "photo"]),
  metricId: z.string().nullable(),
});

export const EvidenceLinkSchema = z.object({
  evidenceId: z.string().min(1),
  metricId: z.string().min(1),
});

export const EvidenceSupersedeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3, "New evidence title is required.").max(200),
  type: z.enum(["report", "programme_record", "spreadsheet", "photo"]),
});

// — governance guards (mirrored by Session B's RPCs — readiness §8) —

/** public=true is rejected unless the metric is approved. */
export function canPublishMetric(m: Pick<ImpactMetric, "status">): boolean {
  return m.status === "approved";
}

/** Verification requires at least one live evidence link — modelled on the
 *  record's evidence ref state, kept in sync by the evidence actions. */
export function canVerifyMetric(m: Pick<ImpactMetric, "status" | "evidence">): boolean {
  return m.status === "needs_verification" && m.evidence.state === "verified";
}

export function canApproveMetric(m: Pick<ImpactMetric, "status">): boolean {
  return m.status === "verified";
}

/** Submission needs a value; evidence may still be outstanding. */
export function canSubmitForVerification(m: Pick<ImpactMetric, "status" | "value">): boolean {
  return (m.status === "draft" || m.status === "needs_verification") && m.value !== null;
}

/** Five-step chain for the editor's verification strip + progress bar. */
export function verificationChain(m: Pick<ImpactMetric, "value" | "evidence" | "status" | "isPublic">) {
  const steps = [
    { label: "Draft", done: m.value !== null },
    { label: "Evidence attached", done: m.evidence.state !== "none" },
    { label: "Verified", done: m.status === "verified" || m.status === "approved" },
    { label: "Approved", done: m.status === "approved" },
    { label: "Public toggle", done: m.isPublic },
  ];
  return { steps, pct: Math.round((steps.filter((s) => s.done).length / steps.length) * 100) };
}

export const METRIC_STATUS_ORDER: MetricStatus[] = ["draft", "needs_verification", "verified", "approved"];

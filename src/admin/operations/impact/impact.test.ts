import { describe, expect, it, vi } from "vitest";
import { EvidenceUploadSchema, MetricPatchSchema, SetMetricPublicSchema, canApproveMetric, canPublishMetric, canSubmitForVerification, canVerifyMetric, verificationChain } from "./schemas";
import { getEvidence, getMetric, listEvidence, listMetrics, metricEvidence, metricGovernanceStats, metricStatusCounts } from "./data";

// Actions are server-side; auth + cache are mocked so the tests exercise only
// the module's own logic (validation, governance guards, mock writes).
vi.mock("@/platform/auth/permissions", () => ({
  requirePermission: vi.fn(async () => ({ userId: "u1", email: "t@nayokan.cm", fullName: "Test User", role: "super_admin" })),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { approveMetric, createMetric, linkEvidence, saveMetric, setMetricPublic, submitMetricForVerification, supersedeEvidence, uploadEvidence, verifyEvidence, verifyMetric } from "./actions";

describe("metric schemas", () => {
  const base = {
    id: "met-1",
    name: "People trained",
    value: 240,
    unit: "people",
    description: "",
    periodLabel: "Full year · 2025",
    periodRangeLabel: "Jan – Dec 2025",
    geographicScope: "Cameroon · nationwide",
    world: "vti",
    programmeLabel: "All VTI programmes",
  };

  it("accepts a valid patch and a null value", () => {
    expect(MetricPatchSchema.safeParse(base).success).toBe(true);
    expect(MetricPatchSchema.safeParse({ ...base, value: null }).success).toBe(true);
  });

  it("rejects empty names and unknown worlds/units", () => {
    expect(MetricPatchSchema.safeParse({ ...base, name: "" }).success).toBe(false);
    expect(MetricPatchSchema.safeParse({ ...base, world: "space" }).success).toBe(false);
    expect(MetricPatchSchema.safeParse({ ...base, unit: "widgets" }).success).toBe(false);
  });

  it("SetMetricPublicSchema requires a boolean", () => {
    expect(SetMetricPublicSchema.safeParse({ id: "met-1", isPublic: true }).success).toBe(true);
    expect(SetMetricPublicSchema.safeParse({ id: "met-1", isPublic: "yes" }).success).toBe(false);
  });

  it("EvidenceUploadSchema validates type and title", () => {
    expect(EvidenceUploadSchema.safeParse({ title: "Register", type: "spreadsheet", metricId: null }).success).toBe(true);
    expect(EvidenceUploadSchema.safeParse({ title: "x", type: "video", metricId: null }).success).toBe(false);
  });
});

describe("governance guards", () => {
  it("public requires approved — nothing else", () => {
    expect(canPublishMetric({ status: "approved" })).toBe(true);
    expect(canPublishMetric({ status: "verified" })).toBe(false);
    expect(canPublishMetric({ status: "needs_verification" })).toBe(false);
    expect(canPublishMetric({ status: "draft" })).toBe(false);
  });

  it("verify requires needs_verification + verified evidence", () => {
    expect(canVerifyMetric({ status: "needs_verification", evidence: { state: "verified", label: "" } })).toBe(true);
    expect(canVerifyMetric({ status: "needs_verification", evidence: { state: "awaiting", label: "" } })).toBe(false);
    expect(canVerifyMetric({ status: "verified", evidence: { state: "verified", label: "" } })).toBe(false);
  });

  it("approve requires verified", () => {
    expect(canApproveMetric({ status: "verified" })).toBe(true);
    expect(canApproveMetric({ status: "approved" })).toBe(false);
  });

  it("submit requires a value on a draft/needs_verification record", () => {
    expect(canSubmitForVerification({ status: "draft", value: null })).toBe(false);
    expect(canSubmitForVerification({ status: "draft", value: 10 })).toBe(true);
    expect(canSubmitForVerification({ status: "approved", value: 10 })).toBe(false);
  });

  it("verificationChain reports honest progress", () => {
    const chain = verificationChain({ value: 240, evidence: { state: "none", label: "" }, status: "needs_verification", isPublic: false });
    expect(chain.steps[0].done).toBe(true);
    expect(chain.steps[1].done).toBe(false);
    expect(chain.pct).toBe(20);
    const done = verificationChain({ value: 9, evidence: { state: "verified", label: "" }, status: "approved", isPublic: true });
    expect(done.pct).toBe(100);
  });
});

describe("listMetrics", () => {
  it("returns all seeded metrics for the all-site filter", () => {
    expect(listMetrics("all", { page: 1 }).total).toBe(12);
  });

  it("narrows by site via the world → site map (display only)", () => {
    const vti = listMetrics("vti", {});
    // vti rows + cross-site "all worlds" rows (site null shows under every filter)
    expect(vti.rows.every((m) => m.world === "vti" || m.world === "all")).toBe(true);
    expect(listMetrics("corporate", {}).rows.every((m) => m.world === "venture_capital" || m.world === "hospitality" || m.world === "all")).toBe(true);
  });

  it("filters by status tab and world", () => {
    expect(listMetrics("all", { status: "approved" }).rows.every((m) => m.status === "approved")).toBe(true);
    expect(listMetrics("all", { world: "vti" }).rows.every((m) => m.world === "vti")).toBe(true);
  });

  it("status counts sum to the total; governance stats derive from rows", () => {
    const counts = metricStatusCounts("all");
    const sum = Object.entries(counts)
      .filter(([k]) => k !== "all")
      .reduce((n, [, v]) => n + v, 0);
    expect(sum).toBe(counts.all);
    const stats = metricGovernanceStats("all");
    expect(stats.publicLive).toBeGreaterThan(0);
    expect(stats.needsVerification).toBeGreaterThan(0);
  });
});

describe("impact actions — the governance chain end to end", () => {
  it("setMetricPublic rejects unapproved metrics (server-side invariant)", async () => {
    const res = await setMetricPublic({ id: "met-1", isPublic: true }); // needs_verification
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/verification chain/i);
    expect((await setMetricPublic({ id: "met-3", isPublic: true })).ok).toBe(false); // verified, not approved
  });

  it("verifyMetric rejects metrics whose evidence isn't verified", async () => {
    // met-1's linked evidence is awaiting_review at this point.
    const res = await verifyMetric({ id: "met-1" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/evidence/i);
  });

  it("evidence verify → metric verify → approve → publish walks the chain", async () => {
    expect((await verifyEvidence({ id: "ev-796" })).ok).toBe(true);
    expect((await verifyEvidence({ id: "ev-368" })).ok).toBe(true);
    expect(getMetric("met-1")?.evidence.state).toBe("verified");

    expect((await verifyMetric({ id: "met-1" })).ok).toBe(true);
    expect(getMetric("met-1")?.status).toBe("verified");

    expect((await approveMetric({ id: "met-1" })).ok).toBe(true);
    expect(getMetric("met-1")?.status).toBe("approved");

    expect((await setMetricPublic({ id: "met-1", isPublic: true })).ok).toBe(true);
    expect(getMetric("met-1")?.isPublic).toBe(true);
  });

  it("unpublishing is always allowed", async () => {
    expect((await setMetricPublic({ id: "met-2", isPublic: false })).ok).toBe(true);
    expect(getMetric("met-2")?.isPublic).toBe(false);
  });

  it("saveMetric patches fields and renames the title suffix", async () => {
    const res = await saveMetric({
      id: "met-6",
      name: "Guests hosted",
      value: 118,
      unit: "guests",
      description: "",
      periodLabel: "30d rolling",
      periodRangeLabel: "Rolling 30 days",
      geographicScope: "Cameroon · nationwide",
      world: "hospitality",
      programmeLabel: "All properties",
    });
    expect(res.ok).toBe(true);
    expect(getMetric("met-6")?.value).toBe(118);
  });

  it("submitMetricForVerification requires a value", async () => {
    // met-11 is a draft with no value.
    expect((await submitMetricForVerification({ id: "met-11" })).ok).toBe(false);
    // met-12 has a value.
    expect((await submitMetricForVerification({ id: "met-12" })).ok).toBe(true);
  });

  it("uploadEvidence appends a record and refreshes the metric's evidence state", async () => {
    const before = metricEvidence("met-8").length;
    const res = await uploadEvidence({ title: "Cohort survey · verified counts", type: "report", metricId: "met-8" });
    expect(res.ok).toBe(true);
    expect(metricEvidence("met-8").length).toBe(before + 1);
    expect(getMetric("met-8")?.evidence.state).toBe("awaiting");
  });

  it("linkEvidence attaches an unlinked record to a metric", async () => {
    const res = await linkEvidence({ evidenceId: "ev-522", metricId: "met-2" });
    expect(res.ok).toBe(true);
    expect(getEvidence("ev-522")?.metricId).toBe("met-2");
    expect(getMetric("met-2")?.evidence.state).toBe("verified"); // ev-522 is verified — refresh reflects it
  });

  it("supersedeEvidence keeps both rows — old superseded, new awaiting", async () => {
    const res = await supersedeEvidence({ id: "ev-854", title: "Textile cluster · production log v2", type: "spreadsheet" });
    expect(res.ok).toBe(true);
    expect(getEvidence("ev-854")?.status).toBe("superseded");
    const rows = listEvidence("all", {}).rows.filter((e) => e.relatedLabel === "Cluster members active");
    expect(rows.some((e) => e.title.includes("v2"))).toBe(true);
  });

  it("createMetric returns an id for the editor route", async () => {
    const res = await createMetric();
    expect(res.ok).toBe(true);
    if (res.ok) expect(getMetric(res.id)?.status).toBe("draft");
  });

  it("actions return errors for unknown ids", async () => {
    expect((await verifyMetric({ id: "nope" })).ok).toBe(false);
    expect((await setMetricPublic({ id: "nope", isPublic: true })).ok).toBe(false);
    expect((await verifyEvidence({ id: "nope" })).ok).toBe(false);
    expect(getMetric("nope")).toBeNull();
    expect(getEvidence("nope")).toBeNull();
  });
});

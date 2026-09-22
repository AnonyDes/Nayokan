// Phase 9 RLS + governance verification:
//   * anon sees only published+public metrics, never drafts/unverified;
//   * ContentGovernanceError fires when is_public is set without the
//     verification chain (approved/published + verified_by/at + evidence);
//   * the status chain is enforced (verified needs evidence+stamps,
//     approved needs verified, published needs approved);
//   * evidence and metric_evidence are append-only even for service role;
//   * staff writes are gated on the impact_metrics/evidence areas.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { setupFixtures, teardownFixtures, type Fixtures } from "./helpers/rls-fixtures";

let fx: Fixtures;
let metricId: string;
let verifiedMetricId: string;
let evidenceId: string;
const RUN_TAG = `rls-${Math.random().toString(36).slice(2, 8)}`;

beforeAll(async () => {
  fx = await setupFixtures();

  const { data: m, error } = await fx.service
    .from("impact_metrics")
    .insert({ slug: `${RUN_TAG}-draft`, name: `[${RUN_TAG}] Draft metric`, unit: "people" })
    .select("id")
    .single();
  if (error) throw error;
  metricId = m!.id;

  // A fully-verified metric to prove the happy path end to end.
  const { data: ev, error: eErr } = await fx.service
    .from("evidence")
    .insert({ title: `[${RUN_TAG}] Evidence`, type: "report", source: "Test suite" })
    .select("id")
    .single();
  if (eErr) throw eErr;
  evidenceId = ev!.id;

  const { data: vm, error: vErr } = await fx.service
    .from("impact_metrics")
    .insert({ slug: `${RUN_TAG}-verified`, name: `[${RUN_TAG}] Verified metric`, unit: "people" })
    .select("id")
    .single();
  if (vErr) throw vErr;
  verifiedMetricId = vm!.id;

  const { error: meErr } = await fx.service
    .from("metric_evidence")
    .insert({ metric_id: verifiedMetricId, evidence_id: evidenceId });
  if (meErr) throw meErr;

  const adminId = fx.userIds.superAdmin;
  const { error: updErr } = await fx.service
    .from("impact_metrics")
    .update({ verified_by: adminId, verified_at: new Date().toISOString(), status: "verified" })
    .eq("id", verifiedMetricId);
  if (updErr) throw updErr;
  const { error: apErr } = await fx.service
    .from("impact_metrics")
    .update({ status: "approved", approved_by: adminId, approved_at: new Date().toISOString() })
    .eq("id", verifiedMetricId);
  if (apErr) throw apErr;
});

afterAll(async () => {
  await fx.service.from("impact_metric_values").delete().eq("metric_id", metricId);
  await fx.service.from("impact_metrics").delete().in("id", [metricId, verifiedMetricId]);
  await fx.service.from("evidence").delete().eq("id", evidenceId);
  await teardownFixtures(fx);
});

describe("anon read model", () => {
  it("anon sees no metric that is not published+public", async () => {
    const { data } = await fx.clients.anonymous.from("impact_metrics").select("id");
    const ids = (data ?? []).map((r) => r.id);
    expect(ids).not.toContain(metricId);
    expect(ids).not.toContain(verifiedMetricId); // approved but not published
  });

  it("anon cannot read values, evidence, or links", async () => {
    for (const table of ["impact_metric_values", "evidence", "metric_evidence"]) {
      const { data } = await fx.clients.anonymous.from(table).select("*");
      expect(data, `anon ${table}`).toEqual([]);
    }
  });
});

describe("public gate", () => {
  it("rejects is_public on an unverified draft", async () => {
    const { error } = await fx.service
      .from("impact_metrics")
      .update({ is_public: true })
      .eq("id", metricId);
    expect(error?.message).toMatch(/ContentGovernanceError/);
  });

  it("rejects inserting a public metric outright", async () => {
    const { error } = await fx.service.from("impact_metrics").insert({
      slug: `${RUN_TAG}-bad`,
      name: `[${RUN_TAG}] Bad`,
      unit: "count",
      is_public: true,
    });
    expect(error?.message).toMatch(/ContentGovernanceError/);
  });

  it("allows is_public once approved with verification + evidence", async () => {
    const { error } = await fx.service
      .from("impact_metrics")
      .update({ status: "published", is_public: true })
      .eq("id", verifiedMetricId);
    expect(error).toBeNull();

    const { data } = await fx.clients.anonymous.from("impact_metrics").select("id").eq("id", verifiedMetricId);
    expect(data?.length).toBe(1);
  });
});

describe("verification chain", () => {
  it("cannot verify without evidence linked", async () => {
    const { error } = await fx.service
      .from("impact_metrics")
      .update({ status: "verified", verified_by: fx.userIds.superAdmin, verified_at: new Date().toISOString() })
      .eq("id", metricId);
    expect(error?.message).toMatch(/ContentGovernanceError.*evidence/i);
  });

  it("cannot approve an unverified metric", async () => {
    const { error } = await fx.service
      .from("impact_metrics")
      .update({ status: "approved" })
      .eq("id", metricId);
    expect(error?.message).toMatch(/ContentGovernanceError.*verified/i);
  });

  it("cannot publish an unapproved metric", async () => {
    const { data: m } = await fx.service
      .from("impact_metrics")
      .insert({ slug: `${RUN_TAG}-skip`, name: `[${RUN_TAG}] Skip`, unit: "count" })
      .select("id")
      .single();
    const { error } = await fx.service
      .from("impact_metrics")
      .update({ status: "published" })
      .eq("id", m!.id);
    expect(error?.message).toMatch(/ContentGovernanceError.*approved/i);
    await fx.service.from("impact_metrics").delete().eq("id", m!.id);
  });
});

describe("append-only", () => {
  it("evidence rejects update even for the service role", async () => {
    const { error } = await fx.service
      .from("evidence")
      .update({ title: "rewritten" })
      .eq("id", evidenceId);
    expect(error?.message).toMatch(/append-only/i);
  });

  it("evidence rejects delete even for the service role", async () => {
    const { error } = await fx.service.from("evidence").delete().eq("id", evidenceId);
    expect(error?.message).toMatch(/append-only/i);
  });

  it("metric_evidence rejects delete even for the service role", async () => {
    const { error } = await fx.service
      .from("metric_evidence")
      .delete()
      .eq("metric_id", verifiedMetricId);
    expect(error?.message).toMatch(/append-only/i);
  });
});

describe("staff scoping", () => {
  it("impact-unauthorized staff cannot create metrics", async () => {
    // reviewer role: check the matrix — reviewers can view impact_metrics
    // but not write them (review level on metrics is impact_manager's).
    const { data: can } = await fx.clients.reviewerStartup
      .from("impact_metrics")
      .select("id")
      .limit(1);
    expect(can).not.toBeNull(); // read allowed or empty, never an error
    const { error } = await fx.clients.reviewerStartup
      .from("impact_metrics")
      .insert({ slug: `${RUN_TAG}-unauth`, name: "x", unit: "count" });
    expect(error).not.toBeNull();
  });
});

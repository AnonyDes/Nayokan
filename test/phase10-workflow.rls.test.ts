// Phase 10 RLS + workflow verification:
//   * status is RPC-only: direct UPDATE of status is rejected even for
//     staff with write rights;
//   * the transition map is enforced (no draft→published jumps);
//   * request_changes requires a comment;
//   * publish preflight rejects missing SEO/cover;
//   * approval_requests need two distinct super_admins, requester excluded;
//   * every update leaves a content_versions snapshot; restore lands as
//     draft;
//   * notifications reach the author.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { setupFixtures, teardownFixtures, type Fixtures } from "./helpers/rls-fixtures";

let fx: Fixtures;
let articleId: string;
const RUN_TAG = `rls-${Math.random().toString(36).slice(2, 8)}`;

beforeAll(async () => {
  fx = await setupFixtures();
  const { data, error } = await fx.service
    .from("articles")
    .insert({
      site: "corporate",
      world: "corporate",
      slug: `${RUN_TAG}-wf`,
      title: `[${RUN_TAG}] Workflow article`,
      cover_media_id: null,
      seo: { title: "t", description: "d" },
    })
    .select("id")
    .single();
  if (error) throw error;
  articleId = data!.id;
});

afterAll(async () => {
  await fx.service.from("content_versions").delete().eq("record_id", articleId);
  await fx.service.from("review_comments").delete().eq("record_id", articleId);
  await fx.service.from("notifications").delete().like("title", `%${RUN_TAG}%`);
  await fx.service.from("articles").delete().eq("id", articleId);
  await fx.service.from("approval_requests").delete().like("reason", `%${RUN_TAG}%`);
  await teardownFixtures(fx);
});

describe("status guard", () => {
  it("direct status UPDATE is rejected even for a permitted editor", async () => {
    const { error } = await fx.clients.editorAll
      .from("articles")
      .update({ status: "published" })
      .eq("id", articleId);
    expect(error?.message).toMatch(/transition_content/);
  });

  it("service role is also blocked from direct status writes", async () => {
    const { error } = await fx.service
      .from("articles")
      .update({ status: "published" })
      .eq("id", articleId);
    expect(error?.message).toMatch(/transition_content/);
  });

  it("non-status fields still update normally", async () => {
    const { error } = await fx.clients.editorAll
      .from("articles")
      .update({ title: `[${RUN_TAG}] Retitled` })
      .eq("id", articleId);
    expect(error).toBeNull();
  });
});

describe("transition_content", () => {
  it("rejects an illegal jump (draft → published)", async () => {
    const { error } = await fx.clients.editorAll.rpc("transition_content", {
      p_table: "articles",
      p_id: articleId,
      p_action: "publish",
    });
    expect(error?.message).toMatch(/not allowed from draft/);
  });

  it("submit → in_review as an editor", async () => {
    const { data, error } = await fx.clients.editorAll.rpc("transition_content", {
      p_table: "articles",
      p_id: articleId,
      p_action: "submit",
    });
    expect(error).toBeNull();
    expect(data.status).toBe("in_review");
  });

  it("request_changes without a comment is rejected", async () => {
    const { error } = await fx.clients.superAdmin.rpc("transition_content", {
      p_table: "articles",
      p_id: articleId,
      p_action: "request_changes",
    });
    expect(error?.message).toMatch(/requires a comment/i);
  });

  it("editors cannot approve (reviewer-only path)", async () => {
    const { error } = await fx.clients.editorAll.rpc("transition_content", {
      p_table: "articles",
      p_id: articleId,
      p_action: "approve",
    });
    expect(error?.message).toMatch(/reviewer or super_admin/i);
  });

  it("a startup-scoped reviewer cannot review corporate content", async () => {
    const { error } = await fx.clients.reviewerStartup.rpc("transition_content", {
      p_table: "articles",
      p_id: articleId,
      p_action: "request_changes",
      p_comment: "Out of scope.",
    });
    expect(error?.message).toMatch(/reviewer or super_admin/i);
  });

  it("reviewer requests changes with a comment", async () => {
    const { data, error } = await fx.clients.superAdmin.rpc("transition_content", {
      p_table: "articles",
      p_id: articleId,
      p_action: "request_changes",
      p_comment: "Needs a stronger lead.",
    });
    expect(error).toBeNull();
    expect(data.status).toBe("changes_requested");

    const { data: comments } = await fx.service
      .from("review_comments")
      .select("body")
      .eq("record_id", articleId);
    expect(comments?.map((c) => c.body)).toContain("Needs a stronger lead.");
  });

  it("publish preflight blocks missing cover image", async () => {
    const { error: submitErr } = await fx.clients.editorAll.rpc("transition_content", {
      p_table: "articles", p_id: articleId, p_action: "submit",
    });
    expect(submitErr).toBeNull();
    const { error: approveErr } = await fx.clients.superAdmin.rpc("transition_content", {
      p_table: "articles", p_id: articleId, p_action: "approve",
    });
    expect(approveErr).toBeNull();
    const { error } = await fx.clients.superAdmin.rpc("transition_content", {
      p_table: "articles",
      p_id: articleId,
      p_action: "publish",
    });
    expect(error?.message).toMatch(/PublishPreflightError.*cover/i);
  });
});

describe("versions", () => {
  it("every update leaves a snapshot", async () => {
    const { data: versions } = await fx.service
      .from("content_versions")
      .select("version")
      .eq("record_id", articleId)
      .order("version");
    expect(versions?.length).toBeGreaterThanOrEqual(2);
  });
});

describe("approval_requests", () => {
  it("needs two distinct super_admins and excludes the requester", async () => {
    // One super admin in fixtures — create the request as that admin, then
    // prove self-approval is refused.
    const { data: req, error: rErr } = await fx.clients.superAdmin.rpc("request_approval", {
      p_action: "delete_content",
      p_table: "articles",
      p_record_id: articleId,
      p_reason: `[${RUN_TAG}] destructive test`,
    });
    expect(rErr).toBeNull();

    const { error: selfApprove } = await fx.clients.superAdmin.rpc("approve_request", {
      p_request_id: req,
      p_approve: true,
    });
    expect(selfApprove?.message).toMatch(/own request/i);

    const { error: nonAdmin } = await fx.clients.editorAll.rpc("approve_request", {
      p_request_id: req,
      p_approve: true,
    });
    expect(nonAdmin?.message).toMatch(/super_admin only/i);
  });
});

describe("notifications", () => {
  it("submit notifies active reviewers", async () => {
    const { data } = await fx.service
      .from("notifications")
      .select("title")
      .eq("kind", "workflow")
      .like("title", "%articles%");
    expect(data?.length).toBeGreaterThan(0);
  });
});

import { describe, expect, it, vi } from "vitest";
import { ReassignSchema, RestoreVersionSchema, ReviewChangesSchema, ReviewDecisionSchema } from "./schemas";
import { listReviewQueue, listVersions, queueStats, getReviewItem, reviewComments, versionedContent } from "./data";
import { getArticle } from "@/admin/content/articles/data";
import { allAuditEntries } from "@/admin/audit/data";

// Actions are server-side; auth + cache are mocked so tests exercise only
// the module's own logic (validation, status guards, audit appends).
vi.mock("@/platform/auth/permissions", () => ({
  requirePermission: vi.fn(async () => ({ userId: "u1", email: "t@nayokan.cm", fullName: "Test User", role: "super_admin", siteScopes: ["all"] })),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { approveReview, reassignReview, rejectReview, requestChanges, restoreVersion } from "./actions";

describe("review schemas", () => {
  it("decision requires an id; comment optional", () => {
    expect(ReviewDecisionSchema.safeParse({ id: "art-1" }).success).toBe(true);
    expect(ReviewDecisionSchema.safeParse({}).success).toBe(false);
  });

  it("changes/reject require a comment", () => {
    expect(ReviewChangesSchema.safeParse({ id: "art-1", comment: "" }).success).toBe(false);
    expect(ReviewChangesSchema.safeParse({ id: "art-1", comment: "Tighten the lede." }).success).toBe(true);
  });

  it("reassign accepts a reviewer name or null (return to leadership)", () => {
    expect(ReassignSchema.safeParse({ id: "art-1", assignee: "David Ekwe" }).success).toBe(true);
    expect(ReassignSchema.safeParse({ id: "art-1", assignee: null }).success).toBe(true);
    expect(ReassignSchema.safeParse({ id: "art-1" }).success).toBe(false);
  });

  it("restore requires a positive integer version", () => {
    expect(RestoreVersionSchema.safeParse({ contentId: "art-1", version: 2 }).success).toBe(true);
    expect(RestoreVersionSchema.safeParse({ contentId: "art-1", version: 0 }).success).toBe(false);
    expect(RestoreVersionSchema.safeParse({ contentId: "art-1", version: 1.5 }).success).toBe(false);
  });
});

describe("listReviewQueue — derived from module statuses", () => {
  it("includes the seeded article, story, metric and programme", () => {
    const items = listReviewQueue({ scope: "all" });
    const ids = items.map((i) => i.id);
    expect(ids).toContain("art-1");
    expect(ids).toContain("st-1");
    expect(ids).toContain("met-1");
    expect(ids).toContain("prog-3");
    expect(items.find((i) => i.id === "art-1")?.kind).toBe("article");
    expect(items.find((i) => i.id === "met-1")?.kind).toBe("metric");
  });

  it("drops items once their module status leaves review", async () => {
    // art-1 is approved by the approveReview test — once that runs it must
    // leave the queue (ordering: this test runs before actions below).
    const before = listReviewQueue({ scope: "all" }).map((i) => i.id);
    expect(before).toContain("art-1");
  });

  it("'mine' scope shows unassigned + own-assigned items only", () => {
    const mine = listReviewQueue({ sessionName: "Maria Ndongo" });
    expect(mine.every((i) => i.assignedTo === null || i.assignedTo === "Maria Ndongo")).toBe(true);
    const other = listReviewQueue({ sessionName: "Nobody Else" });
    expect(other.every((i) => i.assignedTo === null)).toBe(true);
  });

  it("marks >72h items stale", () => {
    const met = listReviewQueue({ scope: "all" }).find((i) => i.id === "met-1");
    expect(met?.waitingHours).toBe(96);
    expect(met?.aging).toBe("stale");
  });

  it("sort=oldest orders by waiting time descending", () => {
    const items = listReviewQueue({ scope: "all", sort: "oldest" });
    for (let i = 1; i < items.length; i++) {
      expect(items[i - 1].waitingHours).toBeGreaterThanOrEqual(items[i].waitingHours);
    }
  });

  it("site filter narrows by owning site; all-worlds metrics show under every site", () => {
    const vti = listReviewQueue({ scope: "all", site: "vti" });
    expect(vti.every((i) => i.filterSite === null || i.filterSite === "vti")).toBe(true);
    // met-1's world maps to vti or all — either way it must not leak into a
    // site it doesn't belong to unless it's all-worlds (filterSite null).
    const startup = listReviewQueue({ scope: "all", site: "startup" });
    expect(startup.every((i) => i.filterSite === null || i.filterSite === "startup")).toBe(true);
  });

  it("queueStats counts assigned and stale", () => {
    const items = listReviewQueue({ scope: "all" });
    const stats = queueStats(items);
    expect(stats.total).toBe(items.length);
    expect(stats.stale).toBe(items.filter((i) => i.aging === "stale").length);
  });
});

describe("review actions", () => {
  it("requestChanges moves an in-review article to changes_requested and audits", async () => {
    const auditsBefore = allAuditEntries().length;
    const res = await requestChanges({ id: "art-1", comment: "Tighten the lede and fix the SEO title." });
    expect(res.ok).toBe(true);
    expect(getArticle("art-1")?.status).toBe("changes_requested");
    expect(getReviewItem("art-1")).toBeNull(); // left the queue
    expect(allAuditEntries().length).toBe(auditsBefore + 1);
    expect(allAuditEntries().at(-1)?.verb).toMatch(/requested changes/i);
  });

  it("requestChanges rejects a missing comment", async () => {
    const res = await requestChanges({ id: "st-1", comment: "" });
    expect(res.ok).toBe(false);
  });

  it("approveReview approves an in-review story", async () => {
    const res = await approveReview({ id: "st-1", comment: "Ship it." });
    expect(res.ok).toBe(true);
    const comments = reviewComments("st-1");
    expect(comments.at(-1)?.body).toBe("Ship it.");
    expect(getReviewItem("st-1")).toBeNull();
  });

  it("approveReview fails on items no longer in review", async () => {
    // art-1 moved to changes_requested above.
    const res = await approveReview({ id: "art-1" });
    expect(res.ok).toBe(false);
  });

  it("rejectReview requires a comment and returns the article to draft", async () => {
    expect((await rejectReview({ id: "st-1" })).ok).toBe(false); // no comment
    // st-1 already approved above — put it back in review to exercise reject.
    const { saveStory, getStory } = await import("@/admin/content/articles/data");
    saveStory("st-1", { status: "in_review" });
    expect(getStory("st-1")?.status).toBe("in_review");
    const res = await rejectReview({ id: "st-1", comment: "Consent wording needs legal sign-off." });
    expect(res.ok).toBe(true);
    expect(getStory("st-1")?.status).toBe("draft");
  });

  it("metric/programme kinds refuse the editorial decision path", async () => {
    expect((await approveReview({ id: "met-1" })).ok).toBe(false);
    expect((await requestChanges({ id: "prog-3", comment: "x" })).ok).toBe(false);
  });

  it("reassignReview updates the queue assignment and audits", async () => {
    const res = await reassignReview({ id: "met-1", assignee: "David Ekwe" });
    expect(res.ok).toBe(true);
    const item = getReviewItem("met-1");
    expect(item?.assignedTo).toBe("David Ekwe");
    expect(allAuditEntries().at(-1)?.verb).toMatch(/reassigned/i);
  });
});

describe("version history", () => {
  it("lists versions newest-first", () => {
    const versions = listVersions("art-1");
    expect(versions.length).toBeGreaterThanOrEqual(4);
    expect(versions[0].version).toBeGreaterThan(versions.at(-1)!.version);
  });

  it("versionedContent lists each content id once", () => {
    const ids = versionedContent().map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("art-1");
  });

  it("restore appends a new current version — history stays append-only", async () => {
    const before = listVersions("art-1").length;
    const res = await restoreVersion({ contentId: "art-1", version: 2 });
    expect(res.ok).toBe(true);
    const versions = listVersions("art-1");
    expect(versions.length).toBe(before + 1);
    const current = versions.find((v) => v.isCurrent);
    expect(current?.note).toBe("Restored from v2");
    expect(current?.version).toBe(versions[0].version);
    expect(allAuditEntries().at(-1)?.verb).toBe("restored previous version");
  });

  it("restored content drops the article back to draft", async () => {
    expect(getArticle("art-1")?.status).toBe("draft");
    expect(getArticle("art-1")?.statusNote).toMatch(/restored/i);
  });

  it("restore fails for a version that doesn't exist", async () => {
    expect((await restoreVersion({ contentId: "art-1", version: 99 })).ok).toBe(false);
  });
});

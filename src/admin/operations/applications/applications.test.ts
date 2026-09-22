import { describe, expect, it, vi } from "vitest";
import { ApplicationNoteSchema, ApplicationTransitionSchema, AssignReviewerSchema, canTransition } from "./schemas";
import { applicationStatusCounts, getApplication, listApplications } from "./data";

// Actions are server-side; auth + cache are mocked so the tests exercise only
// the module's own logic (validation, decision guards, mock writes).
vi.mock("@/platform/auth/permissions", () => ({
  requirePermission: vi.fn(async () => ({ userId: "u1", email: "t@nayokan.cm", fullName: "Test User", role: "super_admin" })),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { assignReviewer, assignToMe, postApplicationNote, transitionApplication } from "./actions";

describe("application schemas", () => {
  it("assignReviewer requires a reviewer id", () => {
    expect(AssignReviewerSchema.safeParse({ id: "app-142", reviewerId: "" }).success).toBe(false);
    expect(AssignReviewerSchema.safeParse({ id: "app-142", reviewerId: "rev-sarah" }).success).toBe(true);
  });

  it("note requires a non-empty body", () => {
    expect(ApplicationNoteSchema.safeParse({ id: "app-142", body: "  " }).success).toBe(true); // min(1) — spaces pass, client trims
    expect(ApplicationNoteSchema.safeParse({ id: "app-142", body: "" }).success).toBe(false);
  });

  it("transition only accepts workflow targets", () => {
    expect(ApplicationTransitionSchema.safeParse({ id: "app-142", target: "under_review" }).success).toBe(true);
    expect(ApplicationTransitionSchema.safeParse({ id: "app-142", target: "published" }).success).toBe(false);
  });
});

describe("canTransition", () => {
  it("follows the decision pipeline", () => {
    expect(canTransition("new", "under_review")).toBe(true);
    expect(canTransition("under_review", "shortlisted")).toBe(true);
    expect(canTransition("shortlisted", "accepted")).toBe(true);
  });

  it("rejects backward and terminal-state moves", () => {
    expect(canTransition("shortlisted", "new")).toBe(false);
    expect(canTransition("archived", "under_review")).toBe(false);
    expect(canTransition("rejected", "accepted")).toBe(false);
  });
});

describe("listApplications", () => {
  it("returns all seeded applications for the all-site filter", () => {
    expect(listApplications("all", { page: 1 }).total).toBe(16);
  });

  it("narrows by site filter (display only, not authorization)", () => {
    const vti = listApplications("vti", {});
    expect(vti.rows.every((a) => a.site === "vti")).toBe(true);
    expect(vti.total).toBe(9);
    expect(listApplications("startup", {}).total).toBe(7);
  });

  it("filters by status tab", () => {
    const page = listApplications("all", { status: "shortlisted" });
    expect(page.rows.length).toBe(3);
    expect(page.rows.every((a) => a.status === "shortlisted")).toBe(true);
  });

  it("filters by world — null world means the opportunity pipeline", () => {
    const opp = listApplications("all", { world: "opportunity" });
    expect(opp.rows.every((a) => a.world === null)).toBe(true);
    expect(opp.rows.some((a) => a.id === "app-140")).toBe(true);
  });

  it("filters by programme", () => {
    const page = listApplications("all", { programme: "prog-welding" });
    expect(page.rows.every((a) => a.programmeId === "prog-welding")).toBe(true);
  });

  it("filters unassigned reviewers", () => {
    const page = listApplications("all", { reviewer: "unassigned" });
    expect(page.rows.every((a) => a.reviewer === null)).toBe(true);
  });

  it("filters by search across code and programme", () => {
    const byCode = listApplications("all", { q: "A-2026-0142" });
    expect(byCode.rows.some((a) => a.code === "A-2026-0142")).toBe(true);
    const byProg = listApplications("all", { q: "residency" });
    expect(byProg.rows.every((a) => a.programmeLabel.toLowerCase().includes("residency"))).toBe(true);
  });

  it("status counts sum to the total", () => {
    const counts = applicationStatusCounts("all");
    const sum = Object.entries(counts)
      .filter(([k]) => k !== "all")
      .reduce((n, [, v]) => n + v, 0);
    expect(sum).toBe(counts.all);
  });
});

describe("application actions", () => {
  it("assignReviewer sets the reviewer", async () => {
    const res = await assignReviewer({ id: "app-141", reviewerId: "rev-john" });
    expect(res.ok).toBe(true);
    expect(getApplication("app-141")?.reviewer?.id).toBe("rev-john");
  });

  it("assignReviewer rejects an unknown reviewer", async () => {
    expect((await assignReviewer({ id: "app-141", reviewerId: "nobody" })).ok).toBe(false);
  });

  it("assignToMe moves new → under_review under the session identity", async () => {
    const res = await assignToMe({ id: "app-142" });
    expect(res.ok).toBe(true);
    const a = getApplication("app-142");
    expect(a?.status).toBe("under_review");
    expect(a?.reviewer?.name).toBe("Test User");
  });

  it("rejection requires a reason — the applicant is notified", async () => {
    const res = await transitionApplication({ id: "app-139", target: "rejected" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/reason/i);
  });

  it("transitionApplication rejects an invalid move", async () => {
    // app-110 is seeded archived — terminal.
    const res = await transitionApplication({ id: "app-110", target: "under_review" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/cannot move/i);
  });

  it("transitionApplication moves new → under_review", async () => {
    const res = await transitionApplication({ id: "app-139", target: "under_review" });
    expect(res.ok).toBe(true);
    expect(getApplication("app-139")?.status).toBe("under_review");
  });

  it("rejection with a reason succeeds and marks the record notified", async () => {
    const res = await transitionApplication({ id: "app-131", target: "rejected", reason: "Cohort full · criteria not met." });
    expect(res.ok).toBe(true);
    const a = getApplication("app-131");
    expect(a?.status).toBe("rejected");
    expect(a?.stageLabel).toBe("Notified");
  });

  it("postApplicationNote appends under the session identity", async () => {
    const res = await postApplicationNote({ id: "app-138", body: "Reference check booked for Thursday." });
    expect(res.ok).toBe(true);
    const a = getApplication("app-138");
    expect(a?.notes.at(-1)?.body).toBe("Reference check booked for Thursday.");
    expect(a?.notes.at(-1)?.author).toBe("Test User");
  });

  it("actions return an error for unknown ids", async () => {
    expect((await assignToMe({ id: "nope" })).ok).toBe(false);
    expect((await transitionApplication({ id: "nope", target: "under_review" })).ok).toBe(false);
    expect((await postApplicationNote({ id: "nope", body: "x" })).ok).toBe(false);
    expect(getApplication("nope")).toBeNull();
  });
});

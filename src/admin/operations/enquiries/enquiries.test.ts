import { describe, expect, it, vi } from "vitest";
import { EnquiryAssignSchema, EnquiryNoteSchema, EnquiryTransitionSchema, canTransitionEnquiry } from "./schemas";
import { getEnquiry, listEnquiries, enquiryStatusCounts } from "./data";

// Actions are server-side; auth + cache are mocked so the tests exercise only
// the module's own logic (validation, workflow guards, mock writes).
vi.mock("@/platform/auth/permissions", () => ({
  requirePermission: vi.fn(async () => ({ userId: "u1", email: "t@nayokan.cm", fullName: "Test User", role: "super_admin" })),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { assignEnquiry, assignEnquiryToMe, postEnquiryNote, transitionEnquiry } from "./actions";

describe("enquiry schemas", () => {
  it("assign requires an assignee id", () => {
    expect(EnquiryAssignSchema.safeParse({ id: "enq-342", assigneeId: "", routeLabel: "" }).success).toBe(false);
    expect(EnquiryAssignSchema.safeParse({ id: "enq-342", assigneeId: "rev-sarah", routeLabel: "" }).success).toBe(true);
  });

  it("note requires a non-empty body", () => {
    expect(EnquiryNoteSchema.safeParse({ id: "enq-342", body: "" }).success).toBe(false);
    expect(EnquiryNoteSchema.safeParse({ id: "enq-342", body: "Call them back." }).success).toBe(true);
  });

  it("transition only accepts workflow targets", () => {
    expect(EnquiryTransitionSchema.safeParse({ id: "enq-342", target: "resolved" }).success).toBe(true);
    expect(EnquiryTransitionSchema.safeParse({ id: "enq-342", target: "published" }).success).toBe(false);
  });
});

describe("canTransitionEnquiry", () => {
  it("follows the design's forward-only workflow", () => {
    expect(canTransitionEnquiry("new", "in_progress")).toBe(true);
    expect(canTransitionEnquiry("in_progress", "resolved")).toBe(true);
    expect(canTransitionEnquiry("resolved", "archived")).toBe(true);
  });

  it("rejects backward and terminal-state transitions", () => {
    expect(canTransitionEnquiry("resolved", "in_progress")).toBe(false);
    expect(canTransitionEnquiry("archived", "in_progress")).toBe(false);
    expect(canTransitionEnquiry("spam", "new")).toBe(false);
  });
});

describe("listEnquiries", () => {
  it("returns all seeded enquiries for the all-site filter", () => {
    expect(listEnquiries("all", { page: 1 }).total).toBe(8);
  });

  it("narrows by site filter (display only, not authorization)", () => {
    const startup = listEnquiries("startup", {});
    expect(startup.rows.every((e) => e.site === "startup")).toBe(true);
    expect(startup.total).toBeLessThan(listEnquiries("all", {}).total);
  });

  it("filters by status tab", () => {
    const page = listEnquiries("all", { status: "resolved" });
    expect(page.rows.length).toBeGreaterThan(0);
    expect(page.rows.every((e) => e.status === "resolved")).toBe(true);
  });

  it("filters by category", () => {
    const page = listEnquiries("all", { category: "hospitality" });
    expect(page.rows.every((e) => e.category === "hospitality")).toBe(true);
  });

  it("filters unassigned", () => {
    const page = listEnquiries("all", { assigned: "unassigned" });
    expect(page.rows.every((e) => e.assignee === null)).toBe(true);
  });

  it("filters by search across code and source page", () => {
    const byCode = listEnquiries("all", { q: "E-0342" });
    expect(byCode.rows.some((e) => e.code === "E-0342")).toBe(true);
    const byPage = listEnquiries("all", { q: "hospitality-properties" });
    expect(byPage.rows.every((e) => e.sourcePage.includes("hospitality-properties"))).toBe(true);
  });

  it("status counts sum to the total", () => {
    const counts = enquiryStatusCounts("all");
    const sum = Object.entries(counts)
      .filter(([k]) => k !== "all")
      .reduce((n, [, v]) => n + v, 0);
    expect(sum).toBe(counts.all);
  });
});

describe("enquiry actions", () => {
  it("assignEnquiry moves new → in_progress and sets the assignee", async () => {
    const res = await assignEnquiry({ id: "enq-342", assigneeId: "rev-sarah", routeLabel: "General intake" });
    expect(res.ok).toBe(true);
    const e = getEnquiry("enq-342");
    expect(e?.status).toBe("in_progress");
    expect(e?.assignee?.id).toBe("rev-sarah");
    expect(e?.routeLabel).toBe("General intake");
  });

  it("assignEnquiry rejects an unknown assignee", async () => {
    const res = await assignEnquiry({ id: "enq-341", assigneeId: "nobody", routeLabel: "" });
    expect(res.ok).toBe(false);
  });

  it("assignEnquiryToMe acknowledges a new enquiry", async () => {
    const res = await assignEnquiryToMe({ id: "enq-341" });
    expect(res.ok).toBe(true);
    const e = getEnquiry("enq-341");
    expect(e?.status).toBe("in_progress");
    expect(e?.assignee?.name).toBe("Test User");
  });

  it("transitionEnquiry rejects an invalid move", async () => {
    // enq-335 is seeded archived — terminal.
    const res = await transitionEnquiry({ id: "enq-335", target: "in_progress" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/cannot move/i);
  });

  it("transitionEnquiry resolves an in-progress enquiry", async () => {
    const res = await transitionEnquiry({ id: "enq-340", target: "resolved" });
    expect(res.ok).toBe(true);
    expect(getEnquiry("enq-340")?.status).toBe("resolved");
  });

  it("postEnquiryNote appends a note under the session identity", async () => {
    const res = await postEnquiryNote({ id: "enq-338", body: "Called sender; awaiting documents." });
    expect(res.ok).toBe(true);
    const e = getEnquiry("enq-338");
    expect(e?.notes.at(-1)?.body).toBe("Called sender; awaiting documents.");
    expect(e?.notes.at(-1)?.author).toBe("Test User");
  });

  it("actions return an error for unknown ids", async () => {
    expect((await assignEnquiryToMe({ id: "nope" })).ok).toBe(false);
    expect((await transitionEnquiry({ id: "nope", target: "resolved" })).ok).toBe(false);
    expect((await postEnquiryNote({ id: "nope", body: "x" })).ok).toBe(false);
    expect(getEnquiry("nope")).toBeNull();
  });
});

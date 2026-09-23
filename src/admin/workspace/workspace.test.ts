import { describe, expect, it, vi } from "vitest";
import { globalSearch, listNotifications, notificationCounts, pushNotification } from "./data";
import type { AdminSession } from "@/platform/auth/types";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/platform/auth/session", () => ({
  requireAdminSession: vi.fn(async () => ({ userId: "u1", email: "t@nayokan.cm", fullName: "Test User", role: "super_admin", siteScopes: ["all"] })),
}));

import { markAllRead, markRead } from "./actions";

const superAdmin: AdminSession = { userId: "u1", email: "m@nayokan.cm", fullName: "Maria Ndongo", role: "super_admin", siteScopes: ["all"] };
const contentEditor: AdminSession = { userId: "u5", email: "a@nayokan.cm", fullName: "Aïssa Tchoumi", role: "content_editor", siteScopes: ["all"] };

describe("notifications data", () => {
  it("seeds the design's rows across every kind", () => {
    const all = listNotifications("all");
    expect(all.length).toBe(10);
    expect(all.some((n) => n.kind === "mention")).toBe(true);
    expect(all.some((n) => n.kind === "approval")).toBe(true);
    expect(all.some((n) => n.kind === "system")).toBe(true);
  });

  it("tabs filter unread / mention / approval / system", () => {
    expect(listNotifications("unread").every((n) => n.unread)).toBe(true);
    expect(listNotifications("mention").every((n) => n.kind === "mention")).toBe(true);
    expect(listNotifications("approval").every((n) => n.kind === "approval")).toBe(true);
    expect(listNotifications("system").every((n) => n.kind === "system")).toBe(true);
  });

  it("counts agree with the tabs", () => {
    const c = notificationCounts();
    expect(c.all).toBe(listNotifications("all").length);
    expect(c.unread).toBe(listNotifications("unread").length);
  });

  it("pushNotification inserts an unread demo row", () => {
    const n = pushNotification({ kind: "event", label: "Test event", message: "Something happened", ago: "now" });
    expect(n.unread).toBe(true);
    expect(listNotifications("all").some((x) => x.id === n.id)).toBe(true);
  });
});

describe("notification actions", () => {
  it("markRead clears the unread flag", async () => {
    const res = await markRead({ id: "nt-1" });
    expect(res.ok).toBe(true);
    expect(listNotifications("all").find((n) => n.id === "nt-1")?.unread).toBe(false);
  });

  it("markAllRead empties the unread tab", async () => {
    const res = await markAllRead();
    expect(res.ok).toBe(true);
    expect(listNotifications("unread").length).toBe(0);
  });
});

describe("globalSearch", () => {
  it("returns no rows for a blank query", () => {
    const { rows, total } = globalSearch("   ", superAdmin);
    expect(rows).toHaveLength(0);
    expect(total).toBe(0);
  });

  it("finds the seeded metric, article and programme for 'cohort'", () => {
    const { rows } = globalSearch("cohort", superAdmin);
    const kinds = new Set(rows.map((r) => r.kind));
    expect(kinds.size).toBeGreaterThanOrEqual(2);
    expect(rows.every((r) => r.href.startsWith("/admin/"))).toBe(true);
  });

  it("matches an article by title", () => {
    const { rows } = globalSearch("productive capability", superAdmin);
    expect(rows.some((r) => r.kind === "Article" && r.title.includes("productive capability"))).toBe(true);
  });

  it("kind filter narrows the result set but keeps counts", () => {
    const all = globalSearch("cohort", superAdmin);
    const filtered = globalSearch("cohort", superAdmin, "Metric");
    expect(filtered.rows.every((r) => r.kind === "Metric")).toBe(true);
    expect(filtered.total).toBe(all.total);
  });

  it("permission-aware: a content editor gets no application results", () => {
    const { rows } = globalSearch("cohort", contentEditor);
    expect(rows.every((r) => r.area !== "applications")).toBe(true);
  });

  it("permission-aware: a content editor gets no user/admin results", () => {
    const { rows } = globalSearch("settings", contentEditor);
    expect(rows.every((r) => !["users", "roles", "settings", "audit_log"].includes(r.area))).toBe(true);
  });

  it("results carry status pills and site metadata", () => {
    const { rows } = globalSearch("welding", superAdmin);
    const prog = rows.find((r) => r.kind === "Programme");
    expect(prog?.statusLabel).toBeTruthy();
    expect(prog?.sub).toContain("·");
  });
});

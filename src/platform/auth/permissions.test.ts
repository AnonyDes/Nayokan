import { describe, expect, it } from "vitest";
import { hasPermission } from "./permissions";
import type { AdminSession } from "./types";

function session(overrides: Partial<AdminSession> = {}): AdminSession {
  return {
    userId: "u1",
    email: "u1@nayokan.cm",
    fullName: "Test User",
    role: "reviewer",
    siteScopes: ["all"],
    ...overrides,
  };
}

describe("hasPermission", () => {
  it("super_admin has full access everywhere, any site", () => {
    const s = session({ role: "super_admin", siteScopes: ["all"] });
    expect(hasPermission(s, "users", "full")).toBe(true);
    expect(hasPermission(s, "impact_metrics", "full", "vti")).toBe(true);
  });

  it("reviewer can review content but not administer users", () => {
    const s = session({ role: "reviewer" });
    expect(hasPermission(s, "articles", "review")).toBe(true);
    expect(hasPermission(s, "articles", "full")).toBe(false);
    expect(hasPermission(s, "users", "view")).toBe(false);
  });

  it("programme_manager scoped to vti cannot act on startup", () => {
    const s = session({ role: "programme_manager", siteScopes: ["vti"] });
    expect(hasPermission(s, "applications", "full", "vti")).toBe(true);
    expect(hasPermission(s, "applications", "full", "startup")).toBe(false);
  });

  it("impact_manager has full impact access but none on enquiries or website", () => {
    const s = session({ role: "impact_manager" });
    expect(hasPermission(s, "impact_metrics", "full")).toBe(true);
    expect(hasPermission(s, "evidence", "full")).toBe(true);
    expect(hasPermission(s, "enquiries", "view")).toBe(false);
    expect(hasPermission(s, "website", "view")).toBe(false);
  });

  it("content_editor cannot touch applications or users", () => {
    const s = session({ role: "content_editor" });
    expect(hasPermission(s, "articles", "full")).toBe(true);
    expect(hasPermission(s, "applications", "view")).toBe(false);
    expect(hasPermission(s, "users", "view")).toBe(false);
  });

  it("omitting site skips the scope check for global areas (e.g. audit_log)", () => {
    const s = session({ role: "reviewer", siteScopes: ["vti"] });
    expect(hasPermission(s, "audit_log", "view")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import * as data from "./data";
import { auditToCsv, auditToJson } from "./export";

describe("audit data", () => {
  it("seeds the design's 14 entries", () => {
    expect(data.allAuditEntries().length).toBe(14);
  });

  it("is append-only — no update or delete helpers exist", () => {
    const surface = data as unknown as Record<string, unknown>;
    for (const key of Object.keys(surface)) {
      expect(key).not.toMatch(/update|delete|remove/i);
    }
  });

  it("appendAudit appends with generated id and now-ish timestamp", () => {
    const before = data.allAuditEntries().length;
    const entry = data.appendAudit({
      actor: "Test User",
      initials: "TU",
      verb: "did a test thing",
      object: "Test object",
      objectType: "Test",
      category: "system",
      pillLabel: "Test",
      pillTone: "info",
    });
    expect(entry.id).toMatch(/^au-/);
    expect(entry.at).toBe("Now");
    expect(entry.provenance.isDemo).toBe(true);
    expect(data.allAuditEntries().length).toBe(before + 1);
  });
});

describe("listAuditEntries", () => {
  it("filters by actor", () => {
    const page = data.listAuditEntries({ actor: "Maria Ndongo" });
    expect(page.rows.length).toBeGreaterThan(0);
    expect(page.rows.every((e) => e.actor === "Maria Ndongo")).toBe(true);
  });

  it("filters by object type", () => {
    const page = data.listAuditEntries({ object: "Impact metric" });
    expect(page.rows.every((e) => e.objectType === "Impact metric")).toBe(true);
  });

  it("filters by category", () => {
    const page = data.listAuditEntries({ category: "users" });
    expect(page.rows.every((e) => e.category === "users")).toBe(true);
  });

  it("searches across actor, verb and object", () => {
    const page = data.listAuditEntries({ q: "impact metric" });
    expect(page.rows.length).toBeGreaterThan(0);
    expect(
      page.rows.every((e) => [e.actor, e.verb, e.object, e.objectType].some((f) => f.toLowerCase().includes("impact metric"))),
    ).toBe(true);
  });

  it("paginates", () => {
    const page = data.listAuditEntries({ page: 1, pageSize: 5 });
    expect(page.rows.length).toBe(5);
    expect(page.total).toBeGreaterThan(5);
    expect(page.from).toBe(1);
    expect(page.to).toBe(5);
  });
});

describe("audit export", () => {
  it("CSV emits a header row plus one line per entry", () => {
    const entries = data.listAuditEntries({ pageSize: 3 }).rows;
    const csv = auditToCsv(entries);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("id,timestamp,actor,verb,object,object_type,category,action,detail_meta");
    expect(lines.length).toBe(entries.length + 1);
  });

  it("CSV quotes cells containing commas or quotes", () => {
    const entries = data.listAuditEntries({ pageSize: 1 }).rows;
    const withComma = { ...entries[0], object: 'Article, "with comma"' };
    const csv = auditToCsv([withComma]);
    expect(csv).toContain('"Article, ""with comma"""');
  });

  it("JSON serialises every field the screen shows", () => {
    const entries = data.listAuditEntries({ pageSize: 2 }).rows;
    const parsed = JSON.parse(auditToJson(entries));
    expect(parsed).toHaveLength(entries.length);
    expect(parsed[0]).toMatchObject({ actor: expect.any(String), verb: expect.any(String), category: expect.any(String), demo: true });
  });
});

import { describe, expect, it, vi } from "vitest";
import { MentorPatchSchema, PartnerPatchSchema, PersonPatchSchema, PropertyPatchSchema, VenturePatchSchema } from "./schemas";
import {
  listMentors,
  listPartners,
  listPeople,
  listProperties,
  listVentures,
  mentorStatusCounts,
  partnerCategoryCounts,
  peopleDivisionCounts,
  ventureStageCounts,
} from "./data";

// Actions are server-side; auth + cache are mocked so the tests exercise only
// the module's own logic (validation, consent gates, external-booking rule).
vi.mock("@/platform/auth/permissions", () => ({
  requirePermission: vi.fn(async () => ({ email: "t@nayokan.cm", fullName: "Test User", role: "super_admin" })),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { savePartner, savePerson, saveProperty, setPartnerPublic } from "./actions";

describe("PersonPatchSchema", () => {
  const base = { id: "person-1", name: "Person · to be confirmed", position: "", division: "leadership", order: 1, consentRecorded: false, isPublic: false };

  it("accepts a valid patch", () => {
    expect(PersonPatchSchema.safeParse(base).success).toBe(true);
  });

  it("rejects an unknown division", () => {
    expect(PersonPatchSchema.safeParse({ ...base, division: "board" }).success).toBe(false);
  });
});

describe("VenturePatchSchema — no financial fields", () => {
  const base = { id: "venture-1", name: "V", sector: "Agri", stage: "Seed", location: "", relatedProgramme: "", listingStatus: "pipeline", isPublic: false };

  it("accepts a valid patch", () => {
    expect(VenturePatchSchema.safeParse(base).success).toBe(true);
  });

  it("strips/never carries investment or valuation fields", () => {
    const res = VenturePatchSchema.safeParse({ ...base, investmentAmount: 500000, valuation: "1M", ownershipPct: 12 });
    // Zod strips unknown keys by default — the contract forbids these fields entirely.
    expect(res.success).toBe(true);
    if (res.success) {
      expect("investmentAmount" in res.data).toBe(false);
      expect("valuation" in res.data).toBe(false);
      expect("ownershipPct" in res.data).toBe(false);
    }
  });
});

describe("PropertyPatchSchema", () => {
  const base = { id: "prop-1", name: "P", slug: "prop-x", location: "", region: "", type: "Guesthouse", rooms: null, externalBookingUrl: "", status: "draft", isPublic: false };

  it("accepts null rooms and empty booking URL", () => {
    expect(PropertyPatchSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a bad slug", () => {
    expect(PropertyPatchSchema.safeParse({ ...base, slug: "Bad Slug!" }).success).toBe(false);
  });
});

describe("PartnerPatchSchema", () => {
  it("requires the consent boolean", () => {
    const { consentRecorded: _omit, ...rest } = {
      id: "ptn-1",
      name: "P",
      category: "university",
      consentRecorded: true,
      isPublic: false,
    };
    expect(PartnerPatchSchema.safeParse(rest).success).toBe(false);
  });
});

describe("MentorPatchSchema", () => {
  it("rejects an unknown availability", () => {
    const base = { id: "mentor-1", name: "M", expertise: "", sector: "Any", availability: "full_time", cohortLabel: "", status: "draft", isPublic: false };
    expect(MentorPatchSchema.safeParse(base).success).toBe(false);
  });
});

describe("list filters", () => {
  it("people division tabs filter and counts sum to total", () => {
    const all = listPeople("all", {});
    const counts = peopleDivisionCounts("all");
    expect(counts.all).toBe(all.total);
    expect(counts.leadership + counts.programme + counts.advisor).toBe(all.total);
    const leadership = listPeople("all", { division: "leadership" });
    expect(leadership.rows.every((p) => p.division === "leadership")).toBe(true);
  });

  it("people list is sorted by display order", () => {
    const page = listPeople("all", { pageSize: 50 });
    const orders = page.rows.map((p) => p.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it("mentors filter by status and sector", () => {
    const active = listMentors("all", { status: "active" });
    expect(active.rows.every((m) => m.status === "active")).toBe(true);
    const counts = mentorStatusCounts("all");
    expect(counts.active + counts.inactive + counts.draft).toBe(counts.all);
    const consumer = listMentors("all", { sector: "Consumer" });
    expect(consumer.rows.every((m) => m.sector === "Consumer")).toBe(true);
  });

  it("partners filter by category and counts sum to total", () => {
    const counts = partnerCategoryCounts("all");
    const sum = Object.entries(counts)
      .filter(([k]) => k !== "all")
      .reduce((n, [, v]) => n + v, 0);
    expect(sum).toBe(counts.all);
    const unis = listPartners("all", { category: "university" });
    expect(unis.every((p) => p.category === "university")).toBe(true);
  });

  it("ventures filter by listing status via the stage tab", () => {
    const counts = ventureStageCounts("all");
    expect(counts.pipeline + counts.active + counts.exited).toBeLessThanOrEqual(counts.all);
    const pipeline = listVentures("all", { stage: "pipeline" });
    expect(pipeline.rows.every((v) => v.listingStatus === "pipeline")).toBe(true);
  });

  it("site filter narrows mentors to the owning site", () => {
    const startup = listMentors("startup", {});
    expect(startup.rows.every((m) => m.site === "startup")).toBe(true);
    const vti = listMentors("vti", {});
    expect(vti.total).toBe(0);
  });

  it("properties list is site-scoped", () => {
    const all = listProperties("all");
    const corp = listProperties("corporate");
    expect(corp.length).toBe(all.length);
    expect(listProperties("vti").length).toBe(0);
  });
});

describe("governance gates", () => {
  it("setPartnerPublic rejects publishing without recorded consent", async () => {
    // ptn-6 is a seeded draft — consentRecorded is false.
    const res = await setPartnerPublic({ id: "ptn-6", isPublic: true });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/consent/i);
  });

  it("savePerson rejects public=true without consentRecorded", async () => {
    const res = await savePerson({ id: "person-5", name: "P", position: "", division: "leadership", order: 5, consentRecorded: false, isPublic: true });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/consent/i);
  });

  it("savePartner rejects public=true without consent in the patch", async () => {
    const res = await savePartner({ id: "ptn-13", name: "Ministry of Vocational Training", category: "government", consentRecorded: false, isPublic: true });
    expect(res.ok).toBe(false);
  });

  it("saveProperty rejects a non-external booking URL", async () => {
    const res = await saveProperty({ id: "prop-1", name: "P", slug: "prop-x", location: "", region: "", type: "Guesthouse", rooms: 6, externalBookingUrl: "ftp://internal", status: "published", isPublic: true });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/external/i);
  });

  it("saveProperty accepts an https booking URL", async () => {
    const res = await saveProperty({ id: "prop-1", name: "P", slug: "prop-x", location: "", region: "", type: "Guesthouse", rooms: 6, externalBookingUrl: "https://bookings.example.com/x", status: "published", isPublic: true });
    expect(res.ok).toBe(true);
  });
});

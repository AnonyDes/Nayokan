import { describe, expect, it, vi } from "vitest";
import { MediaPatchSchema, MediaUploadSchema } from "./schemas";
import { listMedia, mediaCounts } from "./data";

vi.mock("@/platform/auth/permissions", () => ({
  requirePermission: vi.fn(async () => ({ email: "t@nayokan.cm", fullName: "Test User", role: "super_admin" })),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { saveMediaAsset, uploadAsset } from "./actions";

describe("MediaPatchSchema — alt text is a hard requirement", () => {
  const base = { id: "med-1", alt: "Alt", caption: "", credit: "Nayokan", collection: "Homepage" };

  it("accepts a valid patch", () => {
    expect(MediaPatchSchema.safeParse(base).success).toBe(true);
  });

  it("rejects empty alt text", () => {
    expect(MediaPatchSchema.safeParse({ ...base, alt: "" }).success).toBe(false);
  });

  it("rejects empty credit", () => {
    expect(MediaPatchSchema.safeParse({ ...base, credit: "" }).success).toBe(false);
  });
});

describe("MediaUploadSchema", () => {
  it("requires alt text at registration", () => {
    const res = MediaUploadSchema.safeParse({ filename: "a.jpg", kind: "image", collection: "Homepage", alt: "", credit: "x" });
    expect(res.success).toBe(false);
  });
});

describe("listMedia", () => {
  it("filters by kind", () => {
    const videos = listMedia({ type: "video" });
    expect(videos.every((a) => a.kind === "video")).toBe(true);
  });

  it("filters by collection", () => {
    const rows = listMedia({ collection: "Homepage" });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((a) => a.collection === "Homepage")).toBe(true);
  });

  it("warning filter finds assets missing alt text", () => {
    const rows = listMedia({ warning: "missing_alt" });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((a) => a.alt.trim() === "")).toBe(true);
  });

  it("warning filter finds unused assets", () => {
    const rows = listMedia({ warning: "unused" });
    expect(rows.every((a) => a.usedIn === null)).toBe(true);
  });

  it("searches filename and alt text", () => {
    const rows = listMedia({ q: "guesthouse" });
    expect(rows.some((a) => a.filename.includes("guesthouse"))).toBe(true);
  });

  it("counts stay consistent with filters", () => {
    const counts = mediaCounts();
    expect(counts.types.image + counts.types.video + counts.types.document).toBe(counts.total);
    expect(counts.warnings.missing_alt).toBe(listMedia({ warning: "missing_alt" }).length);
  });
});

describe("media actions", () => {
  it("saveMediaAsset rejects empty alt text server-side", async () => {
    const res = await saveMediaAsset({ id: "med-2", alt: "", caption: "", credit: "x", collection: "Homepage" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/alt/i);
  });

  it("uploadAsset registers a metadata-only asset", async () => {
    const res = await uploadAsset({ filename: "new.jpg", kind: "image", collection: "Homepage", alt: "New asset", credit: "Nayokan" });
    expect(res.ok).toBe(true);
    if (res.ok && res.id) {
      const found = listMedia({ q: "new.jpg" });
      expect(found.some((a) => a.id === res.id)).toBe(true);
    }
  });

  it("uploadAsset without alt text is rejected", async () => {
    const res = await uploadAsset({ filename: "x.jpg", kind: "image", collection: "Homepage", alt: "", credit: "x" });
    expect(res.ok).toBe(false);
  });
});

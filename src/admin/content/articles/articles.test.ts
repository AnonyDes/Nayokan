import { describe, expect, it, vi } from "vitest";
import { ArticlePatchSchema, RichBlockSchema, StoryPatchSchema } from "./schemas";
import { articleStatusCounts, getArticle, getStory, listArticles, listStories } from "./data";

// Actions are server-side; auth + cache are mocked so the tests exercise only
// the module's own logic (validation, status guards, world/site checks).
vi.mock("@/platform/auth/permissions", () => ({
  requirePermission: vi.fn(async () => ({ email: "t@nayokan.cm", fullName: "Test User", role: "super_admin" })),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { saveArticle, submitArticleForReview, submitStoryForReview } from "./actions";

describe("RichBlockSchema", () => {
  it("accepts every contract block type", () => {
    const blocks = [
      { type: "paragraph", text: "Body copy." },
      { type: "heading", level: 2, text: "Section" },
      { type: "quote", text: "Quote.", attribution: "Attribution" },
      { type: "image", media: { id: "m1", src: "/x.png", alt: "Alt text" } },
      { type: "callout", text: "Note." },
      { type: "list", items: ["one", "two"] },
      { type: "cta", cta: { label: "Apply", href: "/apply" } },
    ];
    for (const b of blocks) expect(RichBlockSchema.safeParse(b).success, b.type).toBe(true);
  });

  it("rejects an unknown block type", () => {
    expect(RichBlockSchema.safeParse({ type: "html", html: "<p>x</p>" }).success).toBe(false);
    expect(RichBlockSchema.safeParse({ type: "video", src: "x" }).success).toBe(false);
  });

  it("requires alt text on image blocks", () => {
    const noAlt = RichBlockSchema.safeParse({ type: "image", media: { id: "m", src: "/x.png", alt: "" } });
    expect(noAlt.success).toBe(false);
  });

  it("rejects heading levels outside the contract", () => {
    expect(RichBlockSchema.safeParse({ type: "heading", level: 4, text: "x" }).success).toBe(false);
  });
});

describe("ArticlePatchSchema", () => {
  const base = {
    id: "art-1",
    title: "T",
    slug: "a-b",
    excerpt: "",
    world: "vti",
    category: "Field notes",
    tags: [],
    seoTitle: "",
    seoDesc: "",
    body: [],
  };

  it("accepts a valid patch", () => {
    expect(ArticlePatchSchema.safeParse(base).success).toBe(true);
  });

  it("rejects an empty title", () => {
    expect(ArticlePatchSchema.safeParse({ ...base, title: "" }).success).toBe(false);
  });

  it("rejects an invalid slug", () => {
    expect(ArticlePatchSchema.safeParse({ ...base, slug: "Bad Slug!" }).success).toBe(false);
  });

  it("rejects a world outside the contract", () => {
    expect(ArticlePatchSchema.safeParse({ ...base, world: "space" }).success).toBe(false);
  });
});

describe("StoryPatchSchema", () => {
  const base = {
    id: "st-1",
    title: "S",
    slug: "a-story",
    excerpt: "",
    type: "beneficiary",
    world: "vti",
    consentRecorded: true,
    evidenceAttached: true,
  };

  it("accepts a valid patch", () => {
    expect(StoryPatchSchema.safeParse(base).success).toBe(true);
  });

  it("requires the governance booleans", () => {
    const noConsent: Record<string, unknown> = { ...base };
    delete noConsent.consentRecorded;
    expect(StoryPatchSchema.safeParse(noConsent).success).toBe(false);
  });

  it("rejects an unknown story type", () => {
    expect(StoryPatchSchema.safeParse({ ...base, type: "profile" }).success).toBe(false);
  });
});

describe("listArticles", () => {
  it("returns all seeded articles for the all-site filter", () => {
    const page = listArticles("all", { page: 1 });
    expect(page.total).toBe(12);
  });

  it("filters by status tab", () => {
    const page = listArticles("all", { status: "published" });
    expect(page.total).toBeGreaterThan(0);
    expect(page.rows.every((a) => a.status === "published")).toBe(true);
  });

  it("filters by search query across title/slug/author", () => {
    const page = listArticles("all", { q: "vocational" });
    expect(page.rows.some((a) => a.title.toLowerCase().includes("vocational"))).toBe(true);
    const byAuthor = listArticles("all", { q: "bekolo" });
    expect(byAuthor.rows.every((a) => a.authorName.toLowerCase().includes("bekolo"))).toBe(true);
  });

  it("paginates", () => {
    const page = listArticles("all", { page: 2, pageSize: 5 });
    expect(page.rows.length).toBe(5);
    expect(page.from).toBe(6);
  });

  it("status counts sum to the total", () => {
    const counts = articleStatusCounts("all");
    const sum = Object.entries(counts)
      .filter(([k]) => k !== "all")
      .reduce((n, [, v]) => n + v, 0);
    expect(sum).toBe(counts.all);
  });
});

describe("listStories", () => {
  it("narrows by site filter (display only, not authorization)", () => {
    const vti = listStories("vti", {});
    expect(vti.rows.every((s) => s.site === "vti")).toBe(true);
    const all = listStories("all", {});
    expect(all.total).toBeGreaterThan(vti.total);
  });
});

describe("article workflow guards", () => {
  it("saveArticle rejects a world that doesn't belong to the article's site", async () => {
    // art-1 lives on corporate — 'startup' isn't a valid corporate world.
    const res = await saveArticle({
      id: "art-1",
      title: "T",
      slug: "a-b",
      excerpt: "",
      world: "startup",
      category: "Field notes",
      tags: [],
      seoTitle: "",
      seoDesc: "",
      body: [],
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/world/i);
  });

  it("submitArticleForReview rejects articles already in review", async () => {
    const res = await submitArticleForReview({ id: "art-1" }); // seeded in_review
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/draft|changes/i);
  });

  it("submitStoryForReview rejects stories already in review", async () => {
    const res = await submitStoryForReview({ id: "st-1" }); // seeded in_review
    expect(res.ok).toBe(false);
  });

  it("getArticle/getStory return null for unknown ids", () => {
    expect(getArticle("nope")).toBeNull();
    expect(getStory("nope")).toBeNull();
  });
});

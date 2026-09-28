import { describe, expect, test } from "vitest";
import { isSingleHostPreview, siteUrl } from "./registry";

// Cross-site links must reach the other site on real per-site hosts (local
// *.localhost subdomains or production domains), and fall back to path
// prefixes only on single-hostname previews.
describe("site hosts", () => {
  test("single-hostname previews use path prefixes", () => {
    expect(isSingleHostPreview("localhost")).toBe(true);
    expect(isSingleHostPreview("nayokan-git-main.vercel.app")).toBe(true);
    expect(isSingleHostPreview("something.localhost")).toBe(true);
  });

  test("configured per-site hosts are not single-host previews", () => {
    expect(isSingleHostPreview(new URL(siteUrl("corporate")).hostname)).toBe(false);
    expect(isSingleHostPreview(new URL(siteUrl("vti")).hostname)).toBe(false);
    expect(isSingleHostPreview(new URL(siteUrl("startup")).hostname)).toBe(false);
  });

  test("with local subdomain origins, cross-site links are absolute", () => {
    const url = new URL(siteUrl("vti", "/programmes"));
    expect(url.hostname.startsWith("vti.")).toBe(true);
    expect(url.pathname).toBe("/programmes");
  });
});

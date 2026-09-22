import { afterEach, describe, expect, it, vi } from "vitest";
import { previewHref, previewUrl, signPreviewToken, verifyPreviewToken } from "./token";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("preview tokens", () => {
  it("sign → verify round-trips site, path and expiry", () => {
    vi.stubEnv("PREVIEW_SECRET", "test-secret");
    const token = signPreviewToken("vti", "/programmes/x", 600);
    expect(token).not.toBeNull();
    const payload = verifyPreviewToken(token!);
    expect(payload?.site).toBe("vti");
    expect(payload?.path).toBe("/programmes/x");
    expect(payload!.exp).toBeGreaterThan(Date.now() / 1000);
  });

  it("rejects a tampered payload", () => {
    vi.stubEnv("PREVIEW_SECRET", "test-secret");
    const token = signPreviewToken("vti", "/a", 600)!;
    const [v, body, sig] = token.split(".");
    const tampered = `${v}.${Buffer.from(JSON.stringify({ site: "vti", path: "/evil", exp: 9999999999 })).toString("base64url")}.${sig}`;
    expect(verifyPreviewToken(tampered)).toBeNull();
    expect(verifyPreviewToken(`${v}.${body}.${sig.slice(0, -2)}aa`)).toBeNull();
  });

  it("rejects expired tokens", () => {
    vi.stubEnv("PREVIEW_SECRET", "test-secret");
    const token = signPreviewToken("vti", "/a", -10)!;
    expect(verifyPreviewToken(token)).toBeNull();
  });

  it("rejects wrong-version and malformed tokens", () => {
    vi.stubEnv("PREVIEW_SECRET", "test-secret");
    expect(verifyPreviewToken("v2.abc.def")).toBeNull();
    expect(verifyPreviewToken("not-a-token")).toBeNull();
  });

  it("returns null (degrades) when PREVIEW_SECRET is unset", () => {
    vi.stubEnv("PREVIEW_SECRET", "");
    expect(signPreviewToken("vti", "/a")).toBeNull();
    expect(previewUrl("vti", "/a")).toBeNull();
  });

  it("previewHref falls back to the live path when unsigned", () => {
    vi.stubEnv("PREVIEW_SECRET", "");
    const { href, signed } = previewHref("corporate", "/about");
    expect(signed).toBe(false);
    expect(href).toContain("/about");
  });

  it("previewHref produces a signed /__preview URL on the owning host", () => {
    vi.stubEnv("PREVIEW_SECRET", "test-secret");
    const { href, signed } = previewHref("startup", "/stories/x");
    expect(signed).toBe(true);
    expect(href).toContain("startup.nayokan.localhost:3000/__preview/");
    const token = href.split("/__preview/")[1];
    expect(verifyPreviewToken(token)?.path).toBe("/stories/x");
  });
});

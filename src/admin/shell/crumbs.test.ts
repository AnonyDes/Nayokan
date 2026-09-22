import { describe, it, expect } from "vitest";
import { crumbsForPath } from "./crumbs";

describe("crumbsForPath", () => {
  it("labels the dashboard root", () => {
    expect(crumbsForPath("/admin")).toEqual([{ label: "Dashboard" }]);
    expect(crumbsForPath("/admin/")).toEqual([{ label: "Dashboard" }]);
  });

  it("labels exact nav matches with group + item", () => {
    expect(crumbsForPath("/admin/content/articles")).toEqual([{ label: "Corporate" }, { label: "Insights" }]);
    expect(crumbsForPath("/admin/media")).toEqual([{ label: "Shared" }, { label: "Media" }]);
    expect(crumbsForPath("/admin/admin/users")).toEqual([{ label: "Administration" }, { label: "Users" }]);
  });

  it("labels site-editor routes with the site group", () => {
    expect(crumbsForPath("/admin/sites/vti/pages")).toEqual([{ label: "VTI" }, { label: "Pages" }]);
    expect(crumbsForPath("/admin/sites/startup/seo")).toEqual([{ label: "Startup Centre" }, { label: "SEO" }]);
  });

  it("disambiguates same-path nav items by ?site=", () => {
    expect(crumbsForPath("/admin/programmes", "startup")).toEqual([{ label: "Startup Centre" }, { label: "Programme" }]);
    expect(crumbsForPath("/admin/programmes", "vti")).toEqual([{ label: "VTI" }, { label: "Programmes" }]);
    // Without a site param the first matching item wins.
    expect(crumbsForPath("/admin/programmes")).toEqual([{ label: "VTI" }, { label: "Programmes" }]);
  });

  it("appends generic leaves under a matched nav item", () => {
    const crumbs = crumbsForPath("/admin/content/articles/abc123");
    expect(crumbs[0]).toEqual({ label: "Corporate" });
    expect(crumbs[1]).toEqual({ label: "Insights", href: "/admin/content/articles" });
    expect(crumbs[2]).toEqual({ label: "Details" });
  });

  it("labels /new leaves as New", () => {
    expect(crumbsForPath("/admin/sites/corporate/pages/new").at(-1)).toEqual({ label: "New" });
  });

  it("falls back gracefully for unknown routes", () => {
    expect(crumbsForPath("/admin/nowhere")).toEqual([{ label: "Admin" }]);
  });
});

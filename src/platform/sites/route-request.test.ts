import { describe, expect, test } from "vitest";
import { buildRoutingConfig, routeRequest } from "./route-request";

const prod = buildRoutingConfig({
  corporate: "https://nayokan.org",
  vti: "https://vti.nayokan.org",
  startup: "https://startup.nayokan.org",
  admin: "https://admin.nayokan.org",
  isProduction: true,
});
const dev = buildRoutingConfig({
  corporate: "http://nayokan.localhost:3000",
  vti: "http://vti.nayokan.localhost:3000",
  startup: "http://startup.nayokan.localhost:3000",
  admin: "http://admin.nayokan.localhost:3000",
  isProduction: false,
});

const route = (host: string, pathname: string, cfg = prod, siteOverride?: string) =>
  routeRequest({ host, pathname, search: "", cfg, siteOverride });

describe("routeRequest", () => {
  test("rewrites each public host into its own route tree", () => {
    expect(route("nayokan.org", "/")).toEqual({ action: "rewrite", site: "corporate", pathname: "/corporate" });
    expect(route("vti.nayokan.org", "/programmes/x")).toEqual({ action: "rewrite", site: "vti", pathname: "/vti/programmes/x" });
    expect(route("startup.nayokan.org", "/mentors")).toEqual({ action: "rewrite", site: "startup", pathname: "/startup/mentors" });
  });

  test("keeps venture capital and hospitality under the corporate host", () => {
    expect(route("nayokan.org", "/venture-capital/approach")).toMatchObject({ site: "corporate", pathname: "/corporate/venture-capital/approach" });
    expect(route("nayokan.org", "/hospitality/properties/a")).toMatchObject({ site: "corporate", pathname: "/corporate/hospitality/properties/a" });
  });

  test("robots.txt passes through un-prefixed (app-root handler resolves the site)", () => {
    expect(route("nayokan.org", "/robots.txt")).toEqual({ action: "rewrite", site: "corporate", pathname: "/robots.txt" });
    expect(route("vti.nayokan.org", "/robots.txt")).toEqual({ action: "rewrite", site: "vti", pathname: "/robots.txt" });
    expect(route("startup.nayokan.org", "/robots.txt")).toEqual({ action: "rewrite", site: "startup", pathname: "/robots.txt" });
  });

  test("internal prefixes are not directly addressable (double-prefixed, so 404)", () => {
    expect(route("vti.nayokan.org", "/vti/programmes")).toMatchObject({ pathname: "/vti/vti/programmes" });
    expect(route("nayokan.org", "/vti")).toMatchObject({ pathname: "/corporate/vti" });
  });

  test("redirects www to the apex, preserving the path", () => {
    expect(route("www.nayokan.org", "/about")).toEqual({ action: "redirect", location: "https://nayokan.org/about", status: 308 });
  });

  test("redirects legacy corporate paths to the canonical subdomains", () => {
    expect(route("nayokan.org", "/vocational-training/programmes")).toEqual({ action: "redirect", location: "https://vti.nayokan.org/programmes", status: 308 });
    expect(route("nayokan.org", "/startup-centre")).toEqual({ action: "redirect", location: "https://startup.nayokan.org", status: 308 });
  });

  test("admin is only served on the admin host", () => {
    expect(route("admin.nayokan.org", "/admin/users")).toEqual({ action: "admin" });
    expect(route("admin.nayokan.org", "/")).toEqual({ action: "redirect", location: "/admin", status: 308 });
    expect(route("nayokan.org", "/admin")).toEqual({ action: "notFound" });
    expect(route("vti.nayokan.org", "/admin/login")).toEqual({ action: "notFound" });
  });

  test("unknown hosts 404 in production and the site override is ignored", () => {
    expect(route("evil.example", "/", prod, "vti")).toEqual({ action: "notFound" });
  });

  test("non-production unknown hosts honour the site override (preview deployments)", () => {
    expect(route("x.vercel.app", "/programmes", dev, "vti")).toMatchObject({ site: "vti", pathname: "/vti/programmes" });
    expect(route("localhost:3000", "/", dev)).toMatchObject({ site: "corporate" });
    expect(route("localhost:3000", "/", dev, "bogus")).toMatchObject({ site: "corporate" });
    expect(route("x.vercel.app", "/admin", dev)).toEqual({ action: "admin" });
    expect(route("x.vercel.app", "/admin/users", dev, "admin")).toEqual({ action: "admin" });
  });

  test("dev hosts resolve", () => {
    expect(route("vti.nayokan.localhost:3000", "/", dev)).toMatchObject({ site: "vti", pathname: "/vti" });
    expect(route("admin.nayokan.localhost:3000", "/admin", dev)).toEqual({ action: "admin" });
  });
});

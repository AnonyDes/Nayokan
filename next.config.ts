import type { NextConfig } from "next";

// VTI programmes retired when the catalogue moved to its two source-backed
// offerings (docs/content/vti-programmes-source-matrix.md). Old URLs keep
// working: the agri-food page maps to the new agro-industrialization
// programme, the rest to the catalogue.
const RETIRED_VTI_SLUGS = [
  "professional-growth-engineering",
  "skills-for-industrialisation",
  "cluster-formation-programme",
  "industry-application-certification",
  "hospitality-operations",
];
const AGRO_SLUG = "agro-industrialization-export-systems-market-access";

// `/programmes/...` on the VTI host, `/vti/programmes/...` on single-host previews.
const vtiProgrammeRedirects = [
  { prefix: "/programmes", has: [{ type: "host" as const, value: "vti\\..*" }] },
  { prefix: "/vti/programmes", has: undefined },
].flatMap(({ prefix, has }) => [
  { source: `${prefix}/agri-food-post-harvest`, destination: `${prefix}/${AGRO_SLUG}`, permanent: true, has },
  { source: `${prefix}/:slug(${RETIRED_VTI_SLUGS.join("|")})`, destination: prefix, permanent: true, has },
]);

const nextConfig: NextConfig = {
  // Off so it doesn't appear in design-fidelity screenshots.
  devIndicators: false,
  // Dev hosts are *.nayokan.localhost (see src/platform/sites/registry.ts).
  allowedDevOrigins: ["*.nayokan.localhost", "nayokan.localhost"],
  async redirects() {
    return vtiProgrammeRedirects;
  },
};

export default nextConfig;

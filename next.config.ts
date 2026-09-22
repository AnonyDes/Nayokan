import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Off so it doesn't appear in design-fidelity screenshots.
  devIndicators: false,
  // Dev hosts are *.nayokan.localhost (see src/platform/sites/registry.ts).
  allowedDevOrigins: ["*.nayokan.localhost", "nayokan.localhost"],
};

export default nextConfig;

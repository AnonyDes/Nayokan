import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Site boundaries (ADR-001): a site may import src/platform and src/ui,
// never another site's folder. Keeps each site extractable later.
const siteBoundary = (site, others) => ({
  files: [`src/sites/${site}/**`, `app/(sites)/${site}/**`],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: others.map((o) => ({
          group: [`@/sites/${o}`, `@/sites/${o}/*`],
          message: `Site "${site}" must not import from site "${o}". Move shared code to src/ui or src/platform.`,
        })),
      },
    ],
  },
});

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  siteBoundary("corporate", ["vti", "startup"]),
  siteBoundary("vti", ["corporate", "startup"]),
  siteBoundary("startup", ["corporate", "vti"]),
  {
    // Shared layers must never depend on a specific site.
    files: ["src/platform/**", "src/ui/**"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["@/sites/*"], message: "Shared layers must not import site code." }] }],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "Designs/**", ".claude/**", "project (10)/**"]),
]);

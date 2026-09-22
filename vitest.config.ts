import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit tests only — pure logic, no network, no database.
// Supabase-backed RLS tests use vitest.rls.config.ts (added in the data-layer session).
export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["**/*.rls.test.ts", "node_modules/**", ".next/**", "Designs/**", ".claude/**", "e2e/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // "server-only" throws outside the Next build; stub it for Vitest.
      "server-only": path.resolve(__dirname, "test/helpers/server-only-stub.ts"),
    },
  },
});

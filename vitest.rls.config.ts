import { defineConfig } from "vitest/config";
import path from "node:path";

// RLS suite. Signs in as real seeded users through the anon key so policies
// actually execute — requires NEXT_PUBLIC_SUPABASE_URL,
// NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY (fixtures)
// pointed at the dev/test project. Never run this against production.
export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.rls.test.ts"],
    exclude: ["node_modules/**", ".next/**", "Designs/**"],
    setupFiles: ["./test/helpers/load-env.ts"],
    testTimeout: 20000,
    hookTimeout: 30000,
    fileParallelism: false, // shared fixtures — avoid cross-test interference
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});

// Vitest doesn't auto-load .env.local into process.env the way Next.js does.
// Setup file for the RLS suite so every *.rls.test.ts gets credentials.
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

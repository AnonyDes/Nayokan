// Server-only environment. Secrets live here and nowhere else.
import "server-only";
import { z } from "zod";

// A blank `KEY=` line sets "" rather than undefined; treat blank as unset.
const optionalNonEmpty = () => z.preprocess((v) => (v === "" ? undefined : v), z.string().min(1).optional());

const serverEnvSchema = z.object({
  CONTENT_SOURCE: z.preprocess((v) => (v === "" || v === undefined ? "fixtures" : v), z.enum(["fixtures", "supabase"]).default("fixtures")),
  SUPABASE_SERVICE_ROLE_KEY: optionalNonEmpty(),
  PREVIEW_SECRET: optionalNonEmpty(),
  RESEND_API_KEY: optionalNonEmpty(),
  RESEND_FROM_EMAIL: optionalNonEmpty(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse({
    CONTENT_SOURCE: process.env.CONTENT_SOURCE,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    PREVIEW_SECRET: process.env.PREVIEW_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  });
  if (!parsed.success) {
    throw new Error(`Invalid server environment:\n${parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`);
  }
  cached = parsed.data;
  return cached;
}

/** Throws when a required secret is missing, naming it. */
export function requireSecret<K extends keyof ServerEnv>(key: K): NonNullable<ServerEnv[K]> {
  const value = getServerEnv()[key];
  if (value === undefined || value === null) throw new Error(`Missing required server env var ${String(key)}`);
  return value as NonNullable<ServerEnv[K]>;
}

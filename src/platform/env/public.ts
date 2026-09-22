// Client-safe environment. Only NEXT_PUBLIC_* values belong here.
// Validated lazily so the public sites can render from fixtures before a
// Supabase project exists (CONTENT_SOURCE=fixtures). Anything that needs
// Supabase calls getSupabasePublicEnv(), which fails fast with a clear message.

import { z } from "zod";

const supabasePublicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export type SupabasePublicEnv = z.infer<typeof supabasePublicSchema>;

export function getSupabasePublicEnv(): SupabasePublicEnv {
  const parsed = supabasePublicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!parsed.success) {
    throw new Error(
      `Invalid Supabase public environment:\n${parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`,
    );
  }
  return parsed.data;
}

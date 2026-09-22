import "server-only";
import { getServerEnv } from "@/platform/env/server";
import type { PublicContentRepository } from "./repository";

export type { PublicContentRepository } from "./repository";
export * from "./types";

// Single entry point for public-site content. Pages call this, never a
// concrete implementation. Implementations are loaded lazily so the fixtures
// never ship in a production build that uses Supabase, and vice versa.
export async function getContentRepository(): Promise<PublicContentRepository> {
  const source = getServerEnv().CONTENT_SOURCE;
  if (source === "supabase") {
    const mod = await import("./supabase");
    return mod.supabaseRepository;
  }
  const mod = await import("./fixtures");
  return mod.fixturesRepository;
}

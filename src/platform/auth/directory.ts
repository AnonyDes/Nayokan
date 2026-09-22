// Staff directory lookup: auth.users.id -> profile + role + site scopes.
// Session B owns `profiles`, `user_site_scopes` in Supabase (readiness-report
// §9). Until that schema lands, CONTENT_SOURCE-style switch: AUTH_SOURCE
// picks the mock directory below (clearly marked, not real staff data) or a
// Supabase-backed one. Swap the branch in `resolveDirectory()` once B's
// tables exist — nothing else in src/platform/auth needs to change.
import "server-only";
import type { SiteScope, StaffProfile } from "./types";

export interface AuthUser {
  id: string;
  email: string;
}

export interface AdminDirectory {
  getProfile(user: AuthUser): Promise<StaffProfile | null>;
}

// MOCK DATA — not real Nayokan staff, and matched by EMAIL rather than
// Supabase's generated auth id (which this module can't predict). This lets
// a real invited account in a dev/test Supabase project resolve to a role
// today, before Session B's `profiles`/`user_site_scopes` tables exist:
// Supabase Auth itself is still required for sign-in (ADR-002) — this only
// substitutes the role/scope *lookup* that would otherwise read those
// tables. Never rendered as institutional fact.
const MOCK_PROFILES_BY_EMAIL: Record<string, Omit<StaffProfile, "userId">> = {
  "maria.ndongo@nayokan.cm": { email: "maria.ndongo@nayokan.cm", fullName: "Maria Ndongo", role: "super_admin", siteScopes: ["all"], mfaEnrolled: true, status: "active" },
  "john.bekolo@nayokan.cm": { email: "john.bekolo@nayokan.cm", fullName: "John Bekolo", role: "programme_manager", siteScopes: ["vti"], mfaEnrolled: true, status: "active" },
  "sarah.ndenge@nayokan.cm": { email: "sarah.ndenge@nayokan.cm", fullName: "Sarah Ndenge", role: "communications", siteScopes: ["all"], mfaEnrolled: true, status: "active" },
};

class MockDirectory implements AdminDirectory {
  async getProfile(user: AuthUser): Promise<StaffProfile | null> {
    const match = MOCK_PROFILES_BY_EMAIL[user.email.toLowerCase()];
    return match ? { ...match, userId: user.id } : null;
  }
}

class SupabaseDirectory implements AdminDirectory {
  async getProfile(user: AuthUser): Promise<StaffProfile | null> {
    const { createClient } = await import("@/platform/supabase/server");
    const supabase = await createClient();
    // Table names per Designs/admin/data-model.html and readiness-report §9.
    // `Database` is still `any` (placeholder) until Session B generates
    // types from its migration, so this compiles ahead of the real schema.
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, full_name, role_id, mfa_enrolled, status")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile) return null;

    const { data: scopeRows } = await supabase
      .from("user_site_scopes")
      .select("site")
      .eq("user_id", user.id);
    const siteScopes: SiteScope[] = (scopeRows ?? []).map((r: { site: SiteScope }) => r.site);

    return {
      userId: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role_id,
      siteScopes: siteScopes.length > 0 ? siteScopes : ["all"],
      mfaEnrolled: profile.mfa_enrolled,
      status: profile.status,
    };
  }
}

export function resolveDirectory(): AdminDirectory {
  return process.env.AUTH_SOURCE === "supabase" ? new SupabaseDirectory() : new MockDirectory();
}

// Staff directory lookup: auth.users.id -> profile + role + site scopes.
// Session B owns `profiles`, `user_site_scopes` in Supabase (readiness-report
// §9). Until that schema lands, CONTENT_SOURCE-style switch: AUTH_SOURCE
// picks the mock directory below (clearly marked, not real staff data) or a
// Supabase-backed one. Swap the branch in `resolveDirectory()` once B's
// tables exist — nothing else in src/platform/auth needs to change.
import "server-only";
import type { SiteId } from "@/platform/sites/types";
import type { StaffProfile } from "./types";

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
  "maria.ndongo@nayokan.cm": { email: "maria.ndongo@nayokan.cm", fullName: "Maria Ndongo", role: "super_admin", siteScopes: ["all"], status: "active" },
  "john.bekolo@nayokan.cm": { email: "john.bekolo@nayokan.cm", fullName: "John Bekolo", role: "programme_manager", siteScopes: ["vti"], status: "active" },
  "sarah.ndenge@nayokan.cm": { email: "sarah.ndenge@nayokan.cm", fullName: "Sarah Ndenge", role: "communications", siteScopes: ["all"], status: "active" },
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
    // Real schema (Session B, 20260922130002_rbac.sql): profiles.display_name,
    // role_key → roles.key, status ∈ invited|active|suspended. MFA is not a
    // profile column — session.ts derives it from the AAL claim.
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, display_name, role_key, status")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.role_key) return null;

    const { data: scopeRows } = await supabase
      .from("user_site_scopes")
      .select("site")
      .eq("user_id", user.id);
    const siteScopes = (scopeRows ?? [])
      .map((r) => r.site)
      .filter((s): s is SiteId => s === "corporate" || s === "vti" || s === "startup");

    return {
      userId: profile.id,
      email: profile.email,
      fullName: profile.display_name,
      role: profile.role_key as StaffProfile["role"],
      siteScopes: siteScopes.length > 0 ? siteScopes : ["all"],
      status: profile.status as StaffProfile["status"],
    };
  }
}

export function resolveDirectory(): AdminDirectory {
  return process.env.AUTH_SOURCE === "supabase" ? new SupabaseDirectory() : new MockDirectory();
}

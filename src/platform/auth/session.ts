// Data Access Layer for admin auth (Next 16 guide: app/guides/authentication
// #creating-a-data-access-layer-dal). proxy.ts (admin-session.ts) does an
// optimistic redirect only; this is the real check every Server Component,
// Server Action and route handler relies on. cache()-wrapped so the
// auth.getUser() + directory round trip runs once per request no matter how
// many places call it (ports the MEMEX requireMember() pattern).
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/platform/supabase/server";
import { requireSecret } from "@/platform/env/server";
import { resolveDirectory } from "./directory";
import { IDLE_COOKIE, IDLE_TIMEOUT_MS, verifyIdleTimestamp } from "./idle-token";
import type { AdminSession } from "./types";

type ResolvedAdminSession =
  | { kind: "no_user" }
  | { kind: "idle_expired" }
  | { kind: "no_profile" }
  | { kind: "disabled" }
  | { kind: "needs_mfa_enroll" }
  | { kind: "needs_mfa_verify" }
  | { kind: "ok"; session: AdminSession };

const resolve = cache(async (): Promise<ResolvedAdminSession> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { kind: "no_user" };

  // Re-verify the signed idle cookie here too, not just in proxy.ts
  // (admin-session.ts) — Next's own guidance is that Proxy is an optimistic
  // pre-check, never the sole line of defense, and a future matcher change
  // could skip a route without anyone noticing. No cookie at all is treated
  // as "first request this session" (proxy hasn't round-tripped it to the
  // browser yet on this exact request) rather than expired.
  try {
    const signingSecret = requireSecret("SESSION_SIGNING_SECRET");
    const cookieValue = (await cookies()).get(IDLE_COOKIE)?.value;
    if (cookieValue !== undefined) {
      const lastSeen = verifyIdleTimestamp(cookieValue, signingSecret);
      if (lastSeen === null || Date.now() - lastSeen > IDLE_TIMEOUT_MS) return { kind: "idle_expired" };
    }
  } catch {
    return { kind: "no_user" }; // signing secret unset — can't trust anything; fail closed
  }

  // Mandatory MFA (readiness-report §10): every admin route requires aal2,
  // no exceptions. nextLevel "aal1" means no factor is enrolled yet;
  // currentLevel !== nextLevel means a factor exists but this session
  // hasn't completed the challenge.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel === "aal1") return { kind: "needs_mfa_enroll" };
  if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") return { kind: "needs_mfa_verify" };

  const profile = await resolveDirectory().getProfile({ id: user.id, email: user.email ?? "" });
  if (!profile) return { kind: "no_profile" };
  if (profile.status === "disabled") return { kind: "disabled" };

  return {
    kind: "ok",
    session: {
      userId: profile.userId,
      email: profile.email,
      fullName: profile.fullName,
      role: profile.role,
      siteScopes: profile.siteScopes,
    },
  };
});

/** Returns the session, or null for any non-"ok" outcome. Never redirects. */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const resolved = await resolve();
  return resolved.kind === "ok" ? resolved.session : null;
});

/**
 * The session, or redirects to the right step. Call this at the top of every
 * admin Server Component and Server Action — proxy.ts only does an
 * optimistic pre-check (Next 16 guide: Proxy "should not be your only line
 * of defense").
 */
export const requireAdminSession = cache(async (): Promise<AdminSession> => {
  const resolved = await resolve();
  switch (resolved.kind) {
    case "ok":
      return resolved.session;
    case "no_user":
      redirect("/admin/login");
    case "idle_expired":
      redirect("/admin/login?expired=1");
    case "needs_mfa_enroll":
      redirect("/admin/mfa-enroll");
    case "needs_mfa_verify":
      redirect("/admin/login/mfa");
    case "disabled":
    case "no_profile":
      redirect("/admin/denied");
  }
});

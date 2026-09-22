import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/platform/env/public";

// Optimistic session refresh + redirect for proxy.ts's "admin" branch. This
// is deliberately thin (Next 16 auth guide: "Proxy should not be your only
// line of defense") — it only reads the Supabase session from cookies and
// redirects unauthenticated/idle callers. The real checks (MFA level, role,
// site scope) live in src/platform/auth/session.ts + permissions.ts and run
// again on every Server Component and Server Action.

const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes (readiness-report §10)
const IDLE_COOKIE = "nayokan_admin_seen";

// Reachable without a completed session: the sign-in flow itself, the
// mandatory-MFA enrolment/verification steps (a signed-in-but-not-yet-aal2
// user must reach these), password reset, and the two terminal state pages.
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/mfa-enroll", "/admin/reset-password", "/admin/session-expired", "/admin/denied"];

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function withCookiesFrom(source: NextResponse, target: NextResponse): NextResponse {
  for (const cookie of source.cookies.getAll()) target.cookies.set(cookie);
  return target;
}

export async function refreshAdminSession(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // No Supabase project configured yet (readiness-report §17: a Phase 2
  // blocker, not a Phase 0/1 one). Treat that exactly like "no session" —
  // nobody can be authenticated without it anyway — rather than surfacing a
  // raw env-parsing stack trace to the browser. The real, detailed error
  // still prints to the server console for whoever is setting it up.
  let env;
  try {
    env = getSupabasePublicEnv();
  } catch (error) {
    if (isPublicAdminPath(pathname)) return NextResponse.next();
    console.error("[admin-session] Supabase is not configured; redirecting to login.", error);
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isPublicAdminPath(pathname)) return response;
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return withCookiesFrom(response, NextResponse.redirect(loginUrl));
  }

  // 60-minute idle expiry, stamped on every request so it applies before any
  // page render — a signed session with an old cookie is force-signed-out.
  const now = Date.now();
  const lastSeen = Number(request.cookies.get(IDLE_COOKIE)?.value ?? now);
  if (now - lastSeen > IDLE_TIMEOUT_MS) {
    await supabase.auth.signOut();
    const expiredUrl = new URL("/admin/login", request.url);
    expiredUrl.searchParams.set("expired", "1");
    return withCookiesFrom(response, NextResponse.redirect(expiredUrl));
  }
  response.cookies.set(IDLE_COOKIE, String(now), { path: "/admin", sameSite: "lax", httpOnly: true });

  if (pathname === "/admin/login") {
    return withCookiesFrom(response, NextResponse.redirect(new URL("/admin", request.url)));
  }

  return response;
}

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/platform/env/public";
import { requireSecret } from "@/platform/env/server";
import { IDLE_COOKIE, IDLE_TIMEOUT_MS, signIdleTimestamp, verifyIdleTimestamp } from "./idle-token";

// Optimistic session refresh + redirect for proxy.ts's "admin" branch. This
// is deliberately thin (Next 16 auth guide: "Proxy should not be your only
// line of defense") — it only reads the Supabase session from cookies and
// redirects unauthenticated/idle callers. The real checks (MFA level, role,
// site scope, AND idle expiry again) live in src/platform/auth/session.ts +
// permissions.ts and run again on every Server Component and Server Action —
// this file is the fast, optimistic pre-check, not the authority.

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
  // blocker, not a Phase 0/1 one), or SESSION_SIGNING_SECRET isn't set.
  // Treat either exactly like "no session" — nobody can be authenticated
  // without Supabase anyway, and without a signing secret the idle cookie
  // can't be trusted — rather than surfacing a raw stack trace to the
  // browser. The real, detailed error still prints to the server console.
  let env;
  let signingSecret: string;
  try {
    env = getSupabasePublicEnv();
    signingSecret = requireSecret("SESSION_SIGNING_SECRET");
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
  // page render. The cookie is HMAC-signed (idle-token.ts): no cookie at all
  // means "first request after login," which passes; a cookie that's
  // present but fails verification means tampering, which fails closed
  // (treated as expired) rather than being coerced/trusted like a raw
  // client-supplied timestamp would be.
  const now = Date.now();
  const cookieValue = request.cookies.get(IDLE_COOKIE)?.value;
  const lastSeen = cookieValue === undefined ? now : verifyIdleTimestamp(cookieValue, signingSecret);
  const expired = lastSeen === null || now - lastSeen > IDLE_TIMEOUT_MS;
  if (expired) {
    await supabase.auth.signOut();
    const expiredUrl = new URL("/admin/login", request.url);
    expiredUrl.searchParams.set("expired", "1");
    return withCookiesFrom(response, NextResponse.redirect(expiredUrl));
  }
  response.cookies.set(IDLE_COOKIE, signIdleTimestamp(now, signingSecret), { path: "/admin", sameSite: "lax", httpOnly: true });

  if (pathname === "/admin/login") {
    return withCookiesFrom(response, NextResponse.redirect(new URL("/admin", request.url)));
  }

  return response;
}

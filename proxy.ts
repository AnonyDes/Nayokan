import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_ORIGIN, SITES } from "@/platform/sites/registry";
import {
  PREVIEW_SITE_COOKIE,
  PREVIEW_SITE_PARAM,
  buildRoutingConfig,
  routeRequest,
} from "@/platform/sites/route-request";

// Hostname → site resolution (ADR-001). The hostname only selects which
// experience renders; it is never an authorization input. Admin auth is
// enforced by server-side guards + RLS, not here.

const isProduction = process.env.VERCEL_ENV === "production" || (process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV);

const routingConfig = buildRoutingConfig({
  corporate: SITES.corporate.origin,
  vti: SITES.vti.origin,
  startup: SITES.startup.origin,
  admin: ADMIN_ORIGIN,
  isProduction,
});

export async function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  const overrideParam = isProduction ? null : searchParams.get(PREVIEW_SITE_PARAM);
  const siteOverride = overrideParam ?? (isProduction ? null : request.cookies.get(PREVIEW_SITE_COOKIE)?.value);

  const decision = routeRequest({ host, pathname, search, siteOverride, cfg: routingConfig });

  switch (decision.action) {
    case "redirect":
      return NextResponse.redirect(new URL(decision.location, request.url), decision.status);

    case "notFound":
      // Rewrite to a path no route owns, so Next renders app/not-found.tsx with a 404.
      return NextResponse.rewrite(new URL("/__not-found", request.url));

    case "admin": {
      // Refresh the Supabase session cookie and bounce unauthenticated users
      // to /admin/login. Authorization itself is server-side + RLS — the host
      // check only decides where the login screen lives.
      const { createServerClient } = await import("@supabase/ssr");
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const isAuthRoute = pathname === "/admin/login" || pathname.startsWith("/admin/login/");
      if (!url || !key) {
        return isAuthRoute ? NextResponse.next() : NextResponse.redirect(new URL("/admin/login", request.url));
      }
      let response = NextResponse.next({ request });
      const supabase = createServerClient(url, key, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (list) => {
            for (const { name, value } of list) request.cookies.set(name, value);
            response = NextResponse.next({ request });
            for (const { name, value, options } of list) response.cookies.set(name, value, options);
          },
        },
      });
      const { data } = await supabase.auth.getClaims();
      if (!data?.claims && !isAuthRoute) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      return response;
    }

    case "rewrite": {
      const headers = new Headers(request.headers);
      headers.set("x-nayokan-site", decision.site);
      const response = NextResponse.rewrite(new URL(`${decision.pathname}${search}`, request.url), {
        request: { headers },
      });
      if (overrideParam) response.cookies.set(PREVIEW_SITE_COOKIE, decision.site, { path: "/", sameSite: "lax" });
      return response;
    }
  }
}

export const config = {
  matcher: [
    // Everything except Next internals and static files with an extension.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|woff2?|css|js|map)$).*)",
  ],
};

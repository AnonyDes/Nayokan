"use client";

import { useEffect, type MouseEvent } from "react";

/**
 * On single-hostname preview deployments (*.vercel.app or localhost without
 * subdomains), resolves the proper preview target path so cross-site and
 * site-relative navigation works seamlessly without 404s.
 */
export function resolvePreviewUrl(href: string, currentPath: string): string | null {
  try {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const u = new URL(href, origin);

    // 1. Cross-site absolute URLs (e.g. https://vti.nayokan.org or http://vti.nayokan.localhost:3000)
    if (u.hostname.startsWith("vti.") || u.hostname === "vti.nayokan.org") {
      return `/vti${u.pathname === "/" ? "" : u.pathname}${u.search}`;
    }
    if (u.hostname.startsWith("startup.") || u.hostname === "startup.nayokan.org") {
      return `/startup${u.pathname === "/" ? "" : u.pathname}${u.search}`;
    }
    if (u.hostname.startsWith("admin.") || u.hostname === "admin.nayokan.org") {
      return `/admin${u.pathname === "/" ? "" : u.pathname}${u.search}`;
    }
    if (u.hostname === "nayokan.org" || u.hostname === "nayokan.localhost") {
      return `${u.pathname}${u.search}`;
    }

    // 2. Relative URLs when currently browsing inside /vti on a preview host
    if (currentPath.startsWith("/vti")) {
      // Don't re-prefix if already prefixed with /vti, /startup, /admin
      if (u.pathname.startsWith("/vti") || u.pathname.startsWith("/startup") || u.pathname.startsWith("/admin")) {
        return null;
      }
      // If clicking root "/" while in VTI, stay in VTI
      if (u.pathname === "/") {
        return `/vti${u.search}`;
      }
      // Internal VTI pages
      return `/vti${u.pathname}${u.search}`;
    }

    // 3. Relative URLs when currently browsing inside /startup on a preview host
    if (currentPath.startsWith("/startup")) {
      if (u.pathname.startsWith("/startup") || u.pathname.startsWith("/vti") || u.pathname.startsWith("/admin")) {
        return null;
      }
      if (u.pathname === "/") {
        return `/startup${u.search}`;
      }
      return `/startup${u.pathname}${u.search}`;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Click handler for anchor elements in interactive components.
 */
export function handlePreviewClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
  if (typeof window === "undefined") return;
  const host = window.location.hostname;
  if (host.endsWith(".vercel.app") || host.includes("localhost")) {
    const target = resolvePreviewUrl(href, window.location.pathname);
    if (target && target !== window.location.pathname) {
      e.preventDefault();
      window.location.href = target;
    }
  }
}

/**
 * Global click interceptor mounted in RootLayout to catch all cross-site
 * and site-relative anchors across any server component or page on preview hosts.
 */
export function PreviewLinkInterceptor() {
  useEffect(() => {
    const onClick = (e: globalThis.MouseEvent) => {
      // Don't intercept if ctrl/cmd/shift/alt is pressed (open in new tab)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const a = (e.target as HTMLElement)?.closest?.("a");
      if (!a || !a.href) return;

      // Ignore hash-only anchor jumps on the same page
      const rawHref = a.getAttribute("href") ?? "";
      if (rawHref.startsWith("#")) return;

      const host = window.location.hostname;
      if (host.endsWith(".vercel.app") || host.includes("localhost")) {
        const target = resolvePreviewUrl(a.href, window.location.pathname);
        if (target && target !== `${window.location.pathname}${window.location.search}`) {
          e.preventDefault();
          window.location.href = target;
        }
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}

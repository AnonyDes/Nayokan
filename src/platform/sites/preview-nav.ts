"use client";

import type { MouseEvent } from "react";

/**
 * On single-hostname preview deployments (*.vercel.app or localhost without
 * subdomains), intercepts cross-site clicks to inactive production domains
 * (e.g. vti.nayokan.org) and seamlessly routes to the preview path (/vti, /startup, /admin).
 */
export function handlePreviewClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
  if (typeof window === "undefined") return;
  const host = window.location.hostname;
  if (host.endsWith(".vercel.app") || host.includes("localhost")) {
    try {
      const u = new URL(href, window.location.origin);
      if (u.hostname.startsWith("vti.") || u.hostname === "vti.nayokan.org") {
        e.preventDefault();
        window.location.href = `/vti${u.pathname === "/" ? "" : u.pathname}${u.search}`;
      } else if (u.hostname.startsWith("startup.") || u.hostname === "startup.nayokan.org") {
        e.preventDefault();
        window.location.href = `/startup${u.pathname === "/" ? "" : u.pathname}${u.search}`;
      } else if (u.hostname.startsWith("admin.") || u.hostname === "admin.nayokan.org") {
        e.preventDefault();
        window.location.href = `/admin${u.pathname === "/" ? "" : u.pathname}${u.search}`;
      } else if (u.hostname === "nayokan.org" || u.hostname === "nayokan.localhost") {
        e.preventDefault();
        window.location.href = `${u.pathname}${u.search}`;
      }
    } catch {
      // Fallback to normal browser link navigation
    }
  }
}

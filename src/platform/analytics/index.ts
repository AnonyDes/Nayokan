import type { SiteId, World } from "@/platform/sites/types";

// Public analytics adapter. Every event carries site + world. The real
// transport (PostHog/Plausible — see ADR) lands later; for now events go to
// window.dataLayer if present and console.debug in development.
export interface AnalyticsEvent {
  site: SiteId;
  world: World;
  [key: string]: unknown;
}

export function trackEvent(name: string, props: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  const payload = { event: name, ...props };
  const w = window as Window & { dataLayer?: unknown[] };
  if (Array.isArray(w.dataLayer)) w.dataLayer.push(payload);
  if (process.env.NODE_ENV === "development") console.debug("[analytics]", payload);
}

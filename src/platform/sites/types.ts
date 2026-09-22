// Site = which public website owns/serves something (hostname-level).
// World = classification of the institutional division (content-level).
// See docs/architecture/adr/003-site-vs-world.md.

export const SITE_IDS = ["corporate", "vti", "startup"] as const;
export type SiteId = (typeof SITE_IDS)[number];

export const WORLDS = ["corporate", "vti", "startup", "venture_capital", "hospitality"] as const;
export type World = (typeof WORLDS)[number];

/** Valid (site, world) pairs — mirrored by a CHECK constraint in the database. */
export const SITE_WORLDS: Record<SiteId, readonly World[]> = {
  corporate: ["corporate", "venture_capital", "hospitality"],
  vti: ["vti"],
  startup: ["startup"],
};

export function isSiteId(value: unknown): value is SiteId {
  return typeof value === "string" && (SITE_IDS as readonly string[]).includes(value);
}

export function isValidSiteWorld(site: SiteId, world: World): boolean {
  return SITE_WORLDS[site].includes(world);
}

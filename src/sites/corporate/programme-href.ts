import type { Programme } from "@/platform/content/types";
import { siteUrl } from "@/platform/sites/registry";

// Programme detail pages live on the owning site: VTI/Startup programmes link
// cross-site; corporate-world programmes link to their world page.
export function programmeHref(p: Programme): string {
  if (p.site === "vti") return siteUrl("vti", `/programmes/${p.slug}`);
  if (p.site === "startup") return siteUrl("startup", "/programme");
  return p.world === "hospitality" ? "/hospitality" : "/venture-capital";
}

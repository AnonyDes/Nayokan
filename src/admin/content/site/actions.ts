// Server Actions for the site CMS. Every mutation: Zod-validate input,
// requirePermission (server-side — the UI's hiding is advisory only,
// ADR-004), then the mock-store seam. When Session B's tables land, only
// the data.ts calls change; the authZ and validation stay.
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/platform/auth/permissions";
import { isSiteId } from "@/platform/sites/types";
import * as data from "./data";

export type ActionResult = { ok: true } | { ok: false; error: string };
const ok: ActionResult = { ok: true };
const fail = (error: string): ActionResult => ({ ok: false, error });

const SiteSchema = z.string().refine(isSiteId, { message: "Unknown site." });
const IdSchema = z.string().min(1).max(200);
/** Section field values are plain copy — bounded, no HTML trust. */
const FieldMapSchema = z.record(z.string().max(64), z.string().max(4000));

export async function setPagePublic(input: { site: unknown; pageId: unknown; isPublic: unknown }): Promise<ActionResult> {
  const parsed = z.object({ site: SiteSchema, pageId: IdSchema, isPublic: z.boolean() }).safeParse(input);
  if (!parsed.success) return fail("Invalid visibility request.");
  await requirePermission("pages", "full", parsed.data.site);
  if (!data.updatePagePublic(parsed.data.site, parsed.data.pageId, parsed.data.isPublic)) return fail("Page not found.");
  revalidatePath(`/admin/sites/${parsed.data.site}/pages`);
  return ok;
}

export async function saveSectionFields(input: {
  site: unknown;
  pageId: unknown; // page id, or "home" for the homepage
  sectionKey: unknown;
  fields: unknown;
}): Promise<ActionResult> {
  const parsed = z
    .object({ site: SiteSchema, pageId: z.union([IdSchema, z.literal("home")]), sectionKey: IdSchema, fields: FieldMapSchema })
    .safeParse(input);
  if (!parsed.success) return fail("Invalid section payload.");
  const { site, pageId, sectionKey, fields } = parsed.data;
  // Homepage/site structure is site_config; page sections are pages.
  await requirePermission(pageId === "home" ? "site_config" : "pages", "full", site);
  if (!data.updateSectionFields(site, pageId, sectionKey, fields)) return fail("Section not found.");
  revalidatePath(pageId === "home" ? `/admin/sites/${site}/homepage` : `/admin/sites/${site}/pages/${pageId}`);
  return ok;
}

export async function setSectionLive(input: { site: unknown; pageId: unknown; sectionKey: unknown; isLive: unknown }): Promise<ActionResult> {
  const parsed = z.object({ site: SiteSchema, pageId: z.union([IdSchema, z.literal("home")]), sectionKey: IdSchema, isLive: z.boolean() }).safeParse(input);
  if (!parsed.success) return fail("Invalid section request.");
  const { site, pageId, sectionKey, isLive } = parsed.data;
  await requirePermission(pageId === "home" ? "site_config" : "pages", "full", site);
  if (!data.updateSectionLive(site, pageId, sectionKey, isLive)) return fail("Section not found.");
  revalidatePath(pageId === "home" ? `/admin/sites/${site}/homepage` : `/admin/sites/${site}/pages/${pageId}`);
  return ok;
}

export async function setNavItemEnabled(input: { site: unknown; rowId: unknown; enabled: unknown }): Promise<ActionResult> {
  const parsed = z.object({ site: SiteSchema, rowId: IdSchema, enabled: z.boolean() }).safeParse(input);
  if (!parsed.success) return fail("Invalid navigation request.");
  await requirePermission("site_config", "full", parsed.data.site);
  if (!data.updateNavRowEnabled(parsed.data.site, parsed.data.rowId, parsed.data.enabled)) return fail("Navigation item not found.");
  revalidatePath(`/admin/sites/${parsed.data.site}/navigation`);
  return ok;
}

const CtaSchema = z.object({ label: z.string().min(1).max(80), href: z.string().min(1).max(500) });

export async function saveNavCtas(input: { site: unknown; headerCta: unknown; footerCta: unknown }): Promise<ActionResult> {
  const parsed = z.object({ site: SiteSchema, headerCta: CtaSchema, footerCta: CtaSchema }).safeParse(input);
  if (!parsed.success) return fail("Invalid CTA values.");
  await requirePermission("site_config", "full", parsed.data.site);
  if (!data.updateNavCtas(parsed.data.site, parsed.data.headerCta, parsed.data.footerCta)) return fail("Navigation not found.");
  revalidatePath(`/admin/sites/${parsed.data.site}/navigation`);
  return ok;
}

export async function createPage(input: { site: unknown; title: unknown; path: unknown }): Promise<ActionResult & { pageId?: string }> {
  const parsed = z
    .object({
      site: SiteSchema,
      title: z.string().min(1).max(160),
      path: z.string().regex(/^\/[a-z0-9\-/]*$/, "Path must be root-relative, lowercase, hyphenated."),
    })
    .safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid page.");
  const { site, title, path } = parsed.data;
  await requirePermission("pages", "full", site);
  const page = data.createPage(site, title, path);
  revalidatePath(`/admin/sites/${site}/pages`);
  return { ok: true, pageId: page.id };
}

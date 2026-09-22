import "server-only";
import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicClient } from "@/platform/supabase/public";
import type { Database } from "@/platform/supabase/types";
import type { PublicContentRepository } from "../repository";
import type { HomeSection, MediaRef, SiteId, SiteNavigation, World } from "../types";
import { REVALIDATE_SECONDS, tags } from "./tags";
import { MEDIA_SELECT, toMediaRef } from "./media";
import {
  toArticle,
  toCluster,
  toMentor,
  toNavItem,
  toOpportunity,
  toPartner,
  toPerson,
  toProgramme,
  toProperty,
  toSeo,
  toStory,
  toVenture,
} from "./mappers";

// Supabase repository: RLS-scoped anon reads of published + public rows,
// wrapped in unstable_cache with per-site tags. Publish/unpublish calls
// revalidateTag(tag, "max") with these tags (see src/platform/workflow).
//
// The anon client + RLS are the security boundary: even if a caller asks
// this repository for something unpublished, Postgres simply returns no row.

type Db = SupabaseClient<Database>;
type MediaRow = Database["public"]["Tables"]["media"]["Row"];

function db(): Db {
  return createPublicClient();
}

// Fetch a batch of media rows (public bucket metadata only — RLS enforces).
async function mediaByIds(client: Db, ids: (string | null | undefined)[]): Promise<Map<string, MediaRef>> {
  const unique = [...new Set(ids.filter((id): id is string => !!id))];
  if (unique.length === 0) return new Map();
  const { data, error } = await client.from("media").select(MEDIA_SELECT).in("id", unique);
  if (error) throw new Error(`media lookup failed: ${error.message}`);
  return new Map((data ?? []).map((row) => [row.id, toMediaRef(row as MediaRow)!]));
}

// unstable_cache tags are static per cached function instance, so build one
// instance per tag set and memoize the factory.
function cached<A extends unknown[], R>(keyParts: string[], tagList: string[], fn: (...args: A) => Promise<R>) {
  return unstable_cache(fn, keyParts, { tags: tagList, revalidate: REVALIDATE_SECONDS });
}

const siteSettingsCache = new Map<SiteId, () => Promise<Database["public"]["Tables"]["site_settings"]["Row"]>>();

async function loadSiteSettings(site: SiteId) {
  const { data, error } = await db().from("site_settings").select("*").eq("site", site).maybeSingle();
  if (error) throw new Error(`site_settings: ${error.message}`);
  if (!data) throw new Error(`site_settings missing for ${site}`);
  return data;
}

function cachedSiteSettings(site: SiteId) {
  let fn = siteSettingsCache.get(site);
  if (!fn) {
    fn = cached(["site_settings", site], [tags.site(site), tags.settings(site)], () => loadSiteSettings(site));
    siteSettingsCache.set(site, fn);
  }
  return fn();
}

async function loadNavigation(site: SiteId) {
  const { data, error } = await db()
    .from("navigation_items")
    .select("*")
    .eq("site", site)
    .eq("is_live", true)
    .order("area")
    .order("sort_order");
  if (error) throw new Error(`navigation_items: ${error.message}`);
  return data ?? [];
}

const navigationCache = new Map<SiteId, () => Promise<SiteNavigation>>();
function cachedNavigation(site: SiteId) {
  let fn = navigationCache.get(site);
  if (!fn) {
    fn = cached(["navigation", site], [tags.site(site), tags.navigation(site), tags.settings(site)], async () => {
      const [rows, settings] = await Promise.all([loadNavigation(site), loadSiteSettings(site)]);
      const primaryRows = rows.filter((r) => r.area === "primary" && !r.parent_id);
      const childrenOf = (id: string): import("../types").NavItem[] => rows.filter((r) => r.parent_id === id).map((r) => toNavItem(r, childrenOf(r.id)));
      const ctaRow = rows.find((r) => r.area === "cta");
      const footerCols = new Map<number, { heading: string; links: ReturnType<typeof toNavItem>[] }>();
      for (const r of rows.filter((r) => r.area === "footer")) {
        const col = r.footer_column ?? 0;
        if (!footerCols.has(col)) footerCols.set(col, { heading: r.footer_heading ?? "", links: [] });
        footerCols.get(col)!.links.push(toNavItem(r));
      }
      return {
        site,
        primary: primaryRows.map((r) => toNavItem(r, childrenOf(r.id))),
        cta: ctaRow ? { label: ctaRow.label, href: ctaRow.href, external: ctaRow.cross_site || undefined } : undefined,
        footerColumns: [...footerCols.entries()]
          .sort(([a], [b]) => a - b)
          .map(([, v]) => v),
        pendingConfirmation: settings.navigation_pending_confirmation || undefined,
      } satisfies SiteNavigation;
    });
    navigationCache.set(site, fn);
  }
  return fn();
}

async function loadHomeSections(site: SiteId): Promise<HomeSection[]> {
  const { data, error } = await db()
    .from("site_home_sections")
    .select("key, sort_order, is_live, data")
    .eq("site", site)
    .eq("is_live", true)
    .order("sort_order");
  if (error) throw new Error(`site_home_sections: ${error.message}`);
  return (data ?? []).map((r) => ({ key: r.key, isLive: r.is_live, data: r.data as Record<string, unknown> }));
}

const homeCache = new Map<SiteId, () => Promise<HomeSection[]>>();
function cachedHome(site: SiteId) {
  let fn = homeCache.get(site);
  if (!fn) {
    fn = cached(["home_sections", site], [tags.site(site), tags.home(site)], () => loadHomeSections(site));
    homeCache.set(site, fn);
  }
  return fn();
}

async function loadPage(site: SiteId, path: string) {
  const { data, error } = await db()
    .from("pages")
    .select("*")
    .eq("site", site)
    .eq("path", path)
    .maybeSingle();
  if (error) throw new Error(`pages: ${error.message}`);
  return data;
}

const pageCache = new Map<string, () => Promise<unknown>>();
function cachedPage(site: SiteId, path: string) {
  const key = `${site}:${path}`;
  let fn = pageCache.get(key);
  if (!fn) {
    fn = cached(["page", key], [tags.site(site), tags.page(site, path)], async () => {
      const row = await loadPage(site, path);
      if (!row) return null;
      return {
        site: row.site,
        path: row.path,
        title: row.title,
        sections: Array.isArray(row.sections) ? (row.sections as unknown as HomeSection[]) : [],
        seo: toSeo(row.seo),
        provenance: { isDemo: (row.provenance as { isDemo?: boolean })?.isDemo === true },
      };
    });
    pageCache.set(key, fn);
  }
  return fn() as Promise<import("../types").Page | null>;
}

const PROGRAMME_COLS = "*";

async function listProgrammeRows(filter: { site?: SiteId; world?: World }) {
  let q = db().from("programmes").select(PROGRAMME_COLS).order("published_at", { ascending: false });
  if (filter.site) q = q.eq("site", filter.site);
  if (filter.world) q = q.eq("world", filter.world);
  const { data, error } = await q;
  if (error) throw new Error(`programmes: ${error.message}`);
  const media = await mediaByIds(db(), (data ?? []).map((r) => r.hero_media_id));
  return (data ?? []).map((r) => toProgramme(r, r.hero_media_id ? media.get(r.hero_media_id) : undefined));
}

const programmesCache = new Map<string, () => Promise<Awaited<ReturnType<typeof listProgrammeRows>>>>();
function cachedProgrammes(site: SiteId | undefined, world: World | undefined) {
  const key = `programmes:${site ?? "all"}:${world ?? "all"}`;
  let fn = programmesCache.get(key);
  if (!fn) {
    const tagList = site ? [tags.site(site), tags.programmes(site)] : ["site:corporate:programmes", "site:vti:programmes", "site:startup:programmes"];
    fn = cached([key], tagList, () => listProgrammeRows({ site, world }));
    programmesCache.set(key, fn);
  }
  return fn();
}

async function loadProgramme(site: SiteId, slug: string) {
  const { data, error } = await db()
    .from("programmes")
    .select(PROGRAMME_COLS)
    .eq("site", site)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`programmes: ${error.message}`);
  if (!data) return null;
  const media = await mediaByIds(db(), [data.hero_media_id]);
  return toProgramme(data, data.hero_media_id ? media.get(data.hero_media_id) : undefined);
}

const programmeCache = new Map<string, () => Promise<unknown>>();
function cachedProgramme(site: SiteId, slug: string) {
  const key = `${site}:${slug}`;
  let fn = programmeCache.get(key);
  if (!fn) {
    fn = cached(["programme", key], [tags.site(site), tags.programmes(site), tags.programme(site, slug)], () =>
      loadProgramme(site, slug),
    );
    programmeCache.set(key, fn);
  }
  return fn() as Promise<ReturnType<typeof toProgramme> | null>;
}

const CLUSTER_COLS = "*";

async function loadClusters() {
  const { data, error } = await db().from("clusters").select(CLUSTER_COLS).order("name");
  if (error) throw new Error(`clusters: ${error.message}`);
  const media = await mediaByIds(db(), (data ?? []).map((r) => r.hero_media_id));
  return (data ?? []).map((r) => toCluster(r, r.hero_media_id ? media.get(r.hero_media_id) : undefined));
}

const cachedClusters = cached(["clusters"], [tags.clusters("vti")], loadClusters);

async function loadCluster(slug: string) {
  const { data, error } = await db().from("clusters").select(CLUSTER_COLS).eq("slug", slug).maybeSingle();
  if (error) throw new Error(`clusters: ${error.message}`);
  if (!data) return null;
  const media = await mediaByIds(db(), [data.hero_media_id]);
  return toCluster(data, data.hero_media_id ? media.get(data.hero_media_id) : undefined);
}

const clusterCache = new Map<string, () => Promise<unknown>>();
function cachedCluster(slug: string) {
  let fn = clusterCache.get(slug);
  if (!fn) {
    fn = cached(["cluster", slug], [tags.clusters("vti"), tags.cluster("vti", slug)], () => loadCluster(slug));
    clusterCache.set(slug, fn);
  }
  return fn() as Promise<ReturnType<typeof toCluster> | null>;
}

const OPPORTUNITY_COLS = "*";
const MENTOR_COLS = "*";

const cachedOpportunities = cached(["opportunities"], [tags.opportunities("startup")], async () => {
  const { data, error } = await db().from("opportunities").select(OPPORTUNITY_COLS).order("deadline");
  if (error) throw new Error(`opportunities: ${error.message}`);
  return (data ?? []).map(toOpportunity);
});

const cachedMentors = cached(["mentors"], [tags.mentors("startup")], async () => {
  const { data, error } = await db().from("mentors").select(MENTOR_COLS).order("name");
  if (error) throw new Error(`mentors: ${error.message}`);
  const media = await mediaByIds(db(), (data ?? []).map((r) => r.photo_media_id));
  return (data ?? []).map((r) => toMentor(r, r.photo_media_id ? media.get(r.photo_media_id) : undefined));
});

const VENTURE_COLS = "*";

async function listVentureRows(site: SiteId, world?: World) {
  let q = db()
    .from("venture_placements")
    .select(`listing_status, sort_order, world, venture:ventures(${VENTURE_COLS})`)
    .eq("site", site)
    .order("sort_order");
  if (world) q = q.eq("world", world);
  const { data, error } = await q;
  if (error) throw new Error(`venture_placements: ${error.message}`);
  const joined = (data ?? []).filter((r) => r.venture != null);
  const media = await mediaByIds(db(), joined.map((r) => (r.venture as { logo_media_id: string | null }).logo_media_id));
  return joined.map((r) => {
    const v = r.venture as unknown as Parameters<typeof toVenture>[0];
    return toVenture(v, r.listing_status, v.logo_media_id ? media.get(v.logo_media_id) : undefined);
  });
}

const venturesCache = new Map<string, () => Promise<unknown>>();
function cachedVentures(site: SiteId, world?: World) {
  const key = `${site}:${world ?? "all"}`;
  let fn = venturesCache.get(key);
  if (!fn) {
    fn = cached(["ventures", key], [tags.site(site), tags.ventures(site)], () => listVentureRows(site, world));
    venturesCache.set(key, fn);
  }
  return fn() as Promise<Awaited<ReturnType<typeof listVentureRows>>>;
}

async function loadVenture(site: SiteId, slug: string) {
  const { data, error } = await db()
    .from("venture_placements")
    .select(`listing_status, venture:ventures!inner(${VENTURE_COLS})`)
    .eq("site", site)
    .eq("venture.slug", slug)
    .maybeSingle();
  if (error) throw new Error(`venture: ${error.message}`);
  if (!data?.venture) return null;
  const v = data.venture as unknown as Parameters<typeof toVenture>[0];
  const media = await mediaByIds(db(), [v.logo_media_id]);
  return toVenture(v, data.listing_status, v.logo_media_id ? media.get(v.logo_media_id) : undefined);
}

const ventureCache = new Map<string, () => Promise<unknown>>();
function cachedVenture(site: SiteId, slug: string) {
  const key = `${site}:${slug}`;
  let fn = ventureCache.get(key);
  if (!fn) {
    fn = cached(["venture", key], [tags.site(site), tags.ventures(site), tags.venture(site, slug)], () =>
      loadVenture(site, slug),
    );
    ventureCache.set(key, fn);
  }
  return fn() as Promise<Awaited<ReturnType<typeof loadVenture>>>;
}

const PROPERTY_COLS = "*";

async function propertyToContract(row: Record<string, unknown>) {
  const { data: galleryRows, error } = await db()
    .from("property_media")
    .select(`position, media:media(${MEDIA_SELECT})`)
    .eq("property_id", row.id as string)
    .order("position");
  if (error) throw new Error(`property_media: ${error.message}`);
  const gallery = (galleryRows ?? [])
    .map((r) => toMediaRef(r.media as unknown as MediaRow | null))
    .filter((m): m is MediaRef => !!m);
  return toProperty(row as never, gallery);
}

async function listPropertyRows() {
  const { data, error } = await db().from("properties").select(PROPERTY_COLS).order("name");
  if (error) throw new Error(`properties: ${error.message}`);
  return Promise.all((data ?? []).map((r) => propertyToContract(r)));
}

const cachedProperties = cached(["properties"], [tags.properties("corporate")], listPropertyRows);

async function loadProperty(slug: string) {
  const { data, error } = await db().from("properties").select(PROPERTY_COLS).eq("slug", slug).maybeSingle();
  if (error) throw new Error(`properties: ${error.message}`);
  if (!data) return null;
  return propertyToContract(data);
}

const propertyCache = new Map<string, () => Promise<unknown>>();
function cachedProperty(slug: string) {
  let fn = propertyCache.get(slug);
  if (!fn) {
    fn = cached(["property", slug], [tags.properties("corporate"), tags.property("corporate", slug)], () => loadProperty(slug));
    propertyCache.set(slug, fn);
  }
  return fn() as Promise<Awaited<ReturnType<typeof loadProperty>>>;
}

const ARTICLE_COLS = "*";

async function listArticleRows(filter: { site: SiteId; category?: string; limit?: number }) {
  let q = db()
    .from("articles")
    .select(ARTICLE_COLS)
    .eq("site", filter.site)
    .order("published_at", { ascending: false });
  if (filter.category) q = q.eq("category", filter.category);
  if (filter.limit) q = q.limit(filter.limit);
  const { data, error } = await q;
  if (error) throw new Error(`articles: ${error.message}`);
  const media = await mediaByIds(db(), (data ?? []).map((r) => r.cover_media_id));
  return (data ?? []).map((r) => toArticle(r, r.cover_media_id ? media.get(r.cover_media_id) : undefined));
}

const articlesCache = new Map<string, () => Promise<unknown>>();
function cachedArticles(filter: { site: SiteId; category?: string; limit?: number }) {
  const key = `${filter.site}:${filter.category ?? "all"}:${filter.limit ?? "all"}`;
  let fn = articlesCache.get(key);
  if (!fn) {
    fn = cached(["articles", key], [tags.site(filter.site), tags.articles(filter.site)], () => listArticleRows(filter));
    articlesCache.set(key, fn);
  }
  return fn() as Promise<Awaited<ReturnType<typeof listArticleRows>>>;
}

async function loadArticle(site: SiteId, slug: string) {
  const { data, error } = await db()
    .from("articles")
    .select(ARTICLE_COLS)
    .eq("site", site)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`articles: ${error.message}`);
  if (!data) return null;
  const media = await mediaByIds(db(), [data.cover_media_id]);
  return toArticle(data, data.cover_media_id ? media.get(data.cover_media_id) : undefined);
}

const articleCache = new Map<string, () => Promise<unknown>>();
function cachedArticle(site: SiteId, slug: string) {
  const key = `${site}:${slug}`;
  let fn = articleCache.get(key);
  if (!fn) {
    fn = cached(["article", key], [tags.site(site), tags.articles(site), tags.article(site, slug)], () =>
      loadArticle(site, slug),
    );
    articleCache.set(key, fn);
  }
  return fn() as Promise<Awaited<ReturnType<typeof loadArticle>>>;
}

const STORY_COLS = "*";

async function listStoryRows(filter: { site: SiteId; world?: World; limit?: number }) {
  let q = db()
    .from("stories")
    .select(STORY_COLS)
    .eq("site", filter.site)
    .order("published_at", { ascending: false });
  if (filter.world) q = q.eq("world", filter.world);
  if (filter.limit) q = q.limit(filter.limit);
  const { data, error } = await q;
  if (error) throw new Error(`stories: ${error.message}`);
  const media = await mediaByIds(db(), (data ?? []).map((r) => r.cover_media_id));
  return (data ?? []).map((r) => toStory(r, r.cover_media_id ? media.get(r.cover_media_id) : undefined));
}

const storiesCache = new Map<string, () => Promise<unknown>>();
function cachedStories(filter: { site: SiteId; world?: World; limit?: number }) {
  const key = `${filter.site}:${filter.world ?? "all"}:${filter.limit ?? "all"}`;
  let fn = storiesCache.get(key);
  if (!fn) {
    fn = cached(["stories", key], [tags.site(filter.site), tags.stories(filter.site)], () => listStoryRows(filter));
    storiesCache.set(key, fn);
  }
  return fn() as Promise<Awaited<ReturnType<typeof listStoryRows>>>;
}

const PARTNER_COLS = "*";
const PERSON_COLS = "*";

async function listPartnerRows(site: SiteId, context: string) {
  const { data, error } = await db()
    .from("partner_placements")
    .select(`sort_order, partner:partners(${PARTNER_COLS})`)
    .eq("site", site)
    .eq("context", context)
    .order("sort_order");
  if (error) throw new Error(`partner_placements: ${error.message}`);
  const joined = (data ?? []).filter((r) => r.partner != null);
  const media = await mediaByIds(db(), joined.map((r) => (r.partner as { logo_media_id: string | null }).logo_media_id));
  return joined.map((r) => {
    const p = r.partner as unknown as Parameters<typeof toPartner>[0];
    return toPartner(p, p.logo_media_id ? media.get(p.logo_media_id) : undefined);
  });
}

const partnersCache = new Map<string, () => Promise<unknown>>();
function cachedPartners(site: SiteId, context: string) {
  const key = `${site}:${context}`;
  let fn = partnersCache.get(key);
  if (!fn) {
    fn = cached(["partners", key], [tags.site(site), tags.partners(site)], () => listPartnerRows(site, context));
    partnersCache.set(key, fn);
  }
  return fn() as Promise<Awaited<ReturnType<typeof listPartnerRows>>>;
}

async function listPersonRows(site: SiteId, context: string) {
  const { data, error } = await db()
    .from("person_placements")
    .select(`sort_order, person:people(${PERSON_COLS})`)
    .eq("site", site)
    .eq("context", context)
    .order("sort_order");
  if (error) throw new Error(`person_placements: ${error.message}`);
  const joined = (data ?? []).filter((r) => r.person != null);
  const media = await mediaByIds(db(), joined.map((r) => (r.person as { photo_media_id: string | null }).photo_media_id));
  return joined.map((r) => {
    const p = r.person as unknown as Parameters<typeof toPerson>[0];
    return toPerson(p, p.photo_media_id ? media.get(p.photo_media_id) : undefined);
  });
}

const peopleCache = new Map<string, () => Promise<unknown>>();
function cachedPeople(site: SiteId, context: string) {
  const key = `${site}:${context}`;
  let fn = peopleCache.get(key);
  if (!fn) {
    fn = cached(["people", key], [tags.site(site), tags.people(site)], () => listPersonRows(site, context));
    peopleCache.set(key, fn);
  }
  return fn() as Promise<Awaited<ReturnType<typeof listPersonRows>>>;
}

export const supabaseRepository: PublicContentRepository = {
  async getSiteSettings(site) {
    const row = await cachedSiteSettings(site);
    return {
      site: row.site,
      name: row.name,
      tagline: row.tagline ?? undefined,
      contactEmail: row.contact_email ?? undefined,
      address: row.address ?? undefined,
      social: Array.isArray(row.social) ? (row.social as { label: string; href: string }[]) : [],
      defaultSeo: toSeo(row.default_seo) ?? {},
      provenance: { isDemo: (row.provenance as { isDemo?: boolean })?.isDemo === true },
    };
  },
  getNavigation: (site) => cachedNavigation(site),
  getHomeSections: (site) => cachedHome(site),
  getPage: (site, path) => cachedPage(site, path),
  listProgrammes: (filter) => cachedProgrammes(filter.site, filter.world),
  getProgramme: (site, slug) => cachedProgramme(site, slug),
  listClusters: () => cachedClusters(),
  getCluster: (slug) => cachedCluster(slug),
  listOpportunities: () => cachedOpportunities(),
  listMentors: () => cachedMentors(),
  listVentures: (site, world) => cachedVentures(site, world),
  getVenture: (site, slug) => cachedVenture(site, slug),
  listProperties: () => cachedProperties(),
  getProperty: (slug) => cachedProperty(slug),
  listArticles: (filter) => cachedArticles(filter),
  getArticle: (site, slug) => cachedArticle(site, slug),
  listStories: (filter) => cachedStories(filter),
  listPartners: (site, context) => cachedPartners(site, context),
  listPeople: (site, context) => cachedPeople(site, context),
  // Impact metrics ship in phase 9 (impact_metrics + governance chain).
  // Until then the public sites render the em-dash state from an empty list,
  // which is also what an unverified metric resolves to.
  async listMetrics() {
    return [];
  },
};

// Re-exported for the publish/revalidation path (src/platform/workflow,
// phase 10) and for tests.
export { tags as contentCacheTags, REVALIDATE_SECONDS };

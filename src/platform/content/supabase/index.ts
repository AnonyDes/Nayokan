import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { PublicContentRepository } from "../repository";
import type {
  Article,
  Cluster,
  HomeSection,
  MediaRef,
  Mentor,
  NavItem,
  Opportunity,
  Page,
  Partner,
  Person,
  Programme,
  Property,
  Provenance,
  PublicMetric,
  RichBlock,
  Seo,
  SiteId,
  SiteNavigation,
  SiteSettings,
  Story,
  Venture,
} from "../types";

// Supabase repository: RLS-scoped anon reads. Row-level security already
// filters to published + public rows (see supabase/migrations), so queries
// here select columns but never re-implement authorization.
// Owned by the data-layer workstream (workstreams.md: src/platform/content/supabase/**).

type Row = Record<string, unknown>;

let client: SupabaseClient | undefined;

function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("CONTENT_SOURCE=supabase requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

async function run<T>(query: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await query;
  if (error) throw new Error(`supabase: ${error.message}`);
  return (data ?? []) as T;
}

const provenance = (row: Row): Provenance => {
  const p = (row.provenance ?? {}) as Partial<Provenance>;
  return { isDemo: p.isDemo === true, unconfirmedFields: p.unconfirmedFields };
};

const seo = (row: Row): Seo | undefined => {
  const s = row.seo as Seo | null | undefined;
  return s && Object.keys(s).length ? s : undefined;
};

const body = (row: Row): RichBlock[] | undefined => {
  const b = row.body;
  return Array.isArray(b) && b.length ? (b as RichBlock[]) : undefined;
};

/** Collect media ids from rows under the given column names, resolve in one query. */
async function mediaMap(rows: Row[], columns: string[]): Promise<Map<string, MediaRef>> {
  const ids = new Set<string>();
  for (const row of rows) {
    for (const col of columns) {
      const v = row[col];
      if (typeof v === "string") ids.add(v);
    }
  }
  const map = new Map<string, MediaRef>();
  if (!ids.size) return map;
  const media = await run<Row[]>(db().from("media").select("id,bucket,path,alt_text,caption,source_credit,width,height").in("id", [...ids]));
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  for (const m of media) {
    map.set(m.id as string, {
      id: m.id as string,
      src: `${base}/storage/v1/object/public/${m.bucket}/${m.path}`,
      alt: (m.alt_text as string) ?? "",
      width: (m.width as number) ?? undefined,
      height: (m.height as number) ?? undefined,
      caption: (m.caption as string) ?? undefined,
      credit: (m.source_credit as string) ?? undefined,
    });
  }
  return map;
}

const ref = (map: Map<string, MediaRef>, id: unknown): MediaRef | undefined =>
  typeof id === "string" ? map.get(id) : undefined;

const OPPORTUNITY_CATEGORIES = new Set([
  "residency", "grant", "programme", "competition", "challenge", "partnership", "call", "funding", "mentor",
]);

const mapProgramme = (r: Row, media: Map<string, MediaRef>): Programme => ({
  id: r.id as string,
  site: r.site as SiteId,
  world: r.world as Programme["world"],
  slug: r.slug as string,
  code: (r.code as string) ?? undefined,
  name: r.name as string,
  summary: (r.summary as string) ?? "",
  body: body(r),
  type: (r.type as string) ?? undefined,
  status: r.status as Programme["status"],
  duration: (r.duration as string) ?? undefined,
  deliveryMode: (r.delivery_mode as string) ?? undefined,
  location: (r.location as string) ?? undefined,
  certification: (r.certification as string) ?? undefined,
  applicationDeadline: (r.application_deadline as string) ?? undefined,
  applicationOpen: r.application_open === true,
  places: (r.places as number) ?? undefined,
  heroImage: ref(media, r.hero_media_id),
  seo: seo(r),
  provenance: provenance(r),
});

const mapCluster = (r: Row, media: Map<string, MediaRef>): Cluster => ({
  id: r.id as string,
  slug: r.slug as string,
  code: (r.code as string) ?? undefined,
  name: r.name as string,
  sector: (r.sector as string) ?? "",
  location: (r.location as string) ?? undefined,
  summary: (r.summary as string) ?? "",
  body: body(r),
  memberCount: (r.member_count as number) ?? undefined,
  statusLabel: (r.status_label as string) ?? undefined,
  programmeId: (r.programme_id as string) ?? undefined,
  heroImage: ref(media, r.hero_media_id),
  seo: seo(r),
  provenance: provenance(r),
});

const mapOpportunity = (r: Row): Opportunity => ({
  id: r.id as string,
  slug: r.slug as string,
  code: (r.code as string) ?? undefined,
  title: r.title as string,
  category: OPPORTUNITY_CATEGORIES.has(r.category as string)
    ? (r.category as Opportunity["category"])
    : "other",
  status: r.status as Opportunity["status"],
  deadline: (r.deadline as string) ?? undefined,
  opensAt: (r.opens_at as string) ?? undefined,
  eligibility: (r.eligibility as string) ?? undefined,
  externalUrl: (r.external_url as string) ?? undefined,
  provenance: provenance(r),
});

const mapMentor = (r: Row, media: Map<string, MediaRef>): Mentor => ({
  id: r.id as string,
  name: r.name as string,
  initials: (r.initials as string) ?? "",
  role: (r.role as string) ?? undefined,
  expertise: Array.isArray(r.expertise) ? (r.expertise as string[]) : [],
  sector: (r.sector as string) ?? undefined,
  availability: (r.availability as Mentor["availability"]) ?? undefined,
  photo: ref(media, r.photo_media_id),
  bio: (r.bio as string) ?? undefined,
  provenance: provenance(r),
});

const mapVenture = (r: Row, placement: Row | undefined, media: Map<string, MediaRef>): Venture => ({
  id: r.id as string,
  slug: r.slug as string,
  code: (r.code as string) ?? undefined,
  name: r.name as string,
  description: (r.description as string) ?? "",
  body: body(r),
  sector: (r.sector as string) ?? undefined,
  stage: (r.stage as string) ?? undefined,
  location: (r.location as string) ?? undefined,
  website: (r.website as string) ?? undefined,
  listingStatus: (placement?.listing_status as Venture["listingStatus"]) ?? "pipeline",
  relatedProgrammeId: (r.related_programme_id as string) ?? undefined,
  logo: ref(media, r.logo_media_id),
  seo: seo(r),
  provenance: provenance(r),
});

const mapArticle = (r: Row, media: Map<string, MediaRef>): Article => ({
  id: r.id as string,
  site: r.site as SiteId,
  world: r.world as Article["world"],
  slug: r.slug as string,
  title: r.title as string,
  excerpt: (r.excerpt as string) ?? "",
  category: (r.category as string) ?? undefined,
  authorName: (r.author_name as string) ?? undefined,
  publishedAt: ((r.published_display_at as string) ?? (r.published_at as string) ?? "") as string,
  readingMinutes: (r.reading_minutes as number) ?? undefined,
  cover: ref(media, r.cover_media_id),
  body: (Array.isArray(r.body) ? r.body : []) as RichBlock[],
  seo: seo(r),
  provenance: provenance(r),
});

const mapStory = (r: Row, media: Map<string, MediaRef>): Story => ({
  id: r.id as string,
  site: r.site as SiteId,
  world: r.world as Story["world"],
  slug: r.slug as string,
  title: r.title as string,
  excerpt: (r.excerpt as string) ?? "",
  type: r.type as Story["type"],
  cover: ref(media, r.cover_media_id),
  provenance: provenance(r),
});

const mapPartner = (r: Row, media: Map<string, MediaRef>): Partner => ({
  id: r.id as string,
  name: r.name as string,
  category: r.category as Partner["category"],
  logo: ref(media, r.logo_media_id),
  website: (r.website as string) ?? undefined,
  relationship: (r.relationship as string) ?? undefined,
  provenance: provenance(r),
});

const mapPerson = (r: Row, media: Map<string, MediaRef>): Person => ({
  id: r.id as string,
  name: r.name as string,
  initials: (r.initials as string) ?? "",
  position: (r.position as string) ?? undefined,
  division: (r.division as string) ?? undefined,
  bio: (r.bio as string) ?? undefined,
  photo: ref(media, r.photo_media_id),
  provenance: provenance(r),
});

export const supabaseRepository: PublicContentRepository = {
  async getSiteSettings(site) {
    const rows = await run<Row[]>(db().from("site_settings").select("*").eq("site", site).limit(1));
    const r = rows[0];
    if (!r) throw new Error(`supabase: no site_settings row for site "${site}"`);
    const settings: SiteSettings = {
      site,
      name: r.name as string,
      tagline: (r.tagline as string) ?? undefined,
      contactEmail: (r.contact_email as string) ?? undefined,
      address: (r.address as string) ?? undefined,
      social: Array.isArray(r.social) ? (r.social as SiteSettings["social"]) : [],
      defaultSeo: (r.default_seo as Seo) ?? {},
      provenance: provenance(r),
    };
    return settings;
  },

  async getNavigation(site) {
    const [items, settings] = await Promise.all([
      run<Row[]>(
        db().from("navigation_items").select("*").eq("site", site).order("sort_order"),
      ),
      supabaseRepository.getSiteSettings(site),
    ]);
    const primary = items.filter((i) => i.area === "primary");
    const ctaRow = items.find((i) => i.area === "cta");
    const footer = items.filter((i) => i.area === "footer");

    const toNavItem = (r: Row): NavItem => ({
      id: r.id as string,
      label: r.label as string,
      href: r.href as string,
      crossSite: r.cross_site === true,
      children: [],
    });

    // Children hang off parent rows in sort order.
    const roots = primary.filter((i) => !i.parent_id);
    const byParent = new Map<string, NavItem[]>();
    for (const child of primary.filter((i) => i.parent_id)) {
      const list = byParent.get(child.parent_id as string) ?? [];
      list.push(toNavItem(child));
      byParent.set(child.parent_id as string, list);
    }
    const primaryItems = roots.map((r) => ({ ...toNavItem(r), children: byParent.get(r.id as string) }));

    const footerColumns = new Map<number, { heading: string; links: NavItem[] }>();
    for (const f of footer) {
      const col = (f.footer_column as number) ?? 0;
      const entry = footerColumns.get(col) ?? { heading: (f.footer_heading as string) ?? "", links: [] };
      entry.links.push(toNavItem(f));
      footerColumns.set(col, entry);
    }

    const nav: SiteNavigation = {
      site,
      primary: primaryItems,
      cta: ctaRow ? { label: ctaRow.label as string, href: ctaRow.href as string, external: ctaRow.cross_site === true } : undefined,
      footerColumns: [...footerColumns.entries()].sort(([a], [b]) => a - b).map(([, v]) => v),
      pendingConfirmation: settings.provenance.isDemo || undefined,
    };
    return nav;
  },

  async getHomeSections(site) {
    const rows = await run<Row[]>(
      db().from("site_home_sections").select("key,sort_order,data").eq("site", site).order("sort_order"),
    );
    const sections: HomeSection[] = rows.map((r) => ({
      key: r.key as string,
      isLive: true,
      data: (r.data as Record<string, unknown>) ?? {},
    }));
    return sections;
  },

  async getPage(site, path) {
    const rows = await run<Row[]>(
      db().from("pages").select("*").eq("site", site).eq("path", path).limit(1),
    );
    const r = rows[0];
    if (!r) return null;
    const page: Page = {
      site,
      path: r.path as string,
      title: r.title as string,
      sections: (Array.isArray(r.sections) ? r.sections : []) as HomeSection[],
      seo: seo(r),
      provenance: provenance(r),
    };
    return page;
  },

  async listProgrammes(filter) {
    let q = db().from("programmes").select("*").order("name");
    if (filter.site) q = q.eq("site", filter.site);
    if (filter.world) q = q.eq("world", filter.world);
    const rows = await run<Row[]>(q);
    const media = await mediaMap(rows, ["hero_media_id"]);
    return rows.map((r) => mapProgramme(r, media));
  },
  async getProgramme(site, slug) {
    const rows = await run<Row[]>(
      db().from("programmes").select("*").eq("site", site).eq("slug", slug).limit(1),
    );
    if (!rows[0]) return null;
    const media = await mediaMap(rows, ["hero_media_id"]);
    return mapProgramme(rows[0], media);
  },

  async listClusters() {
    const rows = await run<Row[]>(db().from("clusters").select("*").order("name"));
    const media = await mediaMap(rows, ["hero_media_id"]);
    return rows.map((r) => mapCluster(r, media));
  },
  async getCluster(slug) {
    const rows = await run<Row[]>(db().from("clusters").select("*").eq("slug", slug).limit(1));
    if (!rows[0]) return null;
    const media = await mediaMap(rows, ["hero_media_id"]);
    return mapCluster(rows[0], media);
  },

  async listOpportunities() {
    const rows = await run<Row[]>(db().from("opportunities").select("*").order("deadline"));
    return rows.map(mapOpportunity);
  },
  async listMentors() {
    const rows = await run<Row[]>(db().from("mentors").select("*").order("name"));
    const media = await mediaMap(rows, ["photo_media_id"]);
    return rows.map((r) => mapMentor(r, media));
  },

  async listVentures(site, world) {
    let q = db()
      .from("venture_placements")
      .select("site,world,listing_status,sort_order,ventures(*)")
      .eq("site", site)
      .order("sort_order");
    if (world) q = q.eq("world", world);
    const placements = await run<Row[]>(q);
    const rows = placements.map((p) => p.ventures as Row).filter(Boolean);
    const media = await mediaMap(rows, ["logo_media_id"]);
    return placements.map((p) => mapVenture(p.ventures as Row, p, media));
  },
  async getVenture(site, slug) {
    const placements = await run<Row[]>(
      db()
        .from("venture_placements")
        .select("site,world,listing_status,sort_order,ventures!inner(*)")
        .eq("site", site)
        .eq("ventures.slug", slug)
        .limit(1),
    );
    const p = placements[0];
    if (!p) return null;
    const media = await mediaMap([p.ventures as Row], ["logo_media_id"]);
    return mapVenture(p.ventures as Row, p, media);
  },

  async listProperties() {
    const rows = await run<Row[]>(db().from("properties").select("*").order("name"));
    // Gallery lives in property_media; resolve in one extra round trip.
    const ids = rows.map((r) => r.id as string);
    const galleryRows = ids.length
      ? await run<Row[]>(db().from("property_media").select("property_id,media_id,position").in("property_id", ids).order("position"))
      : [];
    const media = await mediaMap(galleryRows.map((g) => ({ media: g.media_id })), ["media"]);
    const gallery = new Map<string, MediaRef[]>();
    for (const g of galleryRows) {
      const m = media.get(g.media_id as string);
      if (!m) continue;
      const list = gallery.get(g.property_id as string) ?? [];
      list.push(m);
      gallery.set(g.property_id as string, list);
    }
    return rows.map((r): Property => ({
      id: r.id as string,
      slug: r.slug as string,
      code: (r.code as string) ?? undefined,
      name: r.name as string,
      location: (r.location as string) ?? undefined,
      type: (r.type as string) ?? undefined,
      summary: (r.summary as string) ?? "",
      body: body(r),
      amenities: Array.isArray(r.amenities) ? (r.amenities as string[]) : [],
      gallery: gallery.get(r.id as string) ?? [],
      externalBookingUrl: (r.external_booking_url as string) ?? undefined,
      seo: seo(r),
      provenance: provenance(r),
    }));
  },
  async getProperty(slug) {
    const rows = await run<Row[]>(db().from("properties").select("*").eq("slug", slug).limit(1));
    if (!rows[0]) return null;
    const all = await supabaseRepository.listProperties();
    return all.find((p) => p.slug === slug) ?? null;
  },

  async listArticles(filter) {
    let q = db().from("articles").select("*").eq("site", filter.site).order("published_at", { ascending: false });
    if (filter.category) q = q.eq("category", filter.category);
    if (filter.limit) q = q.limit(filter.limit);
    const rows = await run<Row[]>(q);
    const media = await mediaMap(rows, ["cover_media_id"]);
    return rows.map((r) => mapArticle(r, media));
  },
  async getArticle(site, slug) {
    const rows = await run<Row[]>(
      db().from("articles").select("*").eq("site", site).eq("slug", slug).limit(1),
    );
    if (!rows[0]) return null;
    const media = await mediaMap(rows, ["cover_media_id"]);
    return mapArticle(rows[0], media);
  },

  async listStories(filter) {
    let q = db().from("stories").select("*").eq("site", filter.site).order("published_at", { ascending: false });
    if (filter.world) q = q.eq("world", filter.world);
    if (filter.limit) q = q.limit(filter.limit);
    const rows = await run<Row[]>(q);
    const media = await mediaMap(rows, ["cover_media_id"]);
    return rows.map((r) => mapStory(r, media));
  },

  async listPartners(site, context) {
    const placements = await run<Row[]>(
      db()
        .from("partner_placements")
        .select("context,featured,sort_order,partners(*)")
        .eq("site", site)
        .eq("context", context)
        .order("sort_order"),
    );
    const rows = placements.map((p) => p.partners as Row).filter(Boolean);
    const media = await mediaMap(rows, ["logo_media_id"]);
    return placements.map((p) => mapPartner(p.partners as Row, media));
  },
  async listPeople(site, context) {
    const placements = await run<Row[]>(
      db()
        .from("person_placements")
        .select("context,sort_order,people(*)")
        .eq("site", site)
        .eq("context", context)
        .order("sort_order"),
    );
    const rows = placements.map((p) => p.people as Row).filter(Boolean);
    const media = await mediaMap(rows, ["photo_media_id"]);
    return placements.map((p) => mapPerson(p.people as Row, media));
  },

  async listMetrics(filter) {
    let q = db().from("impact_metrics").select("*");
    if (filter.world) q = q.eq("world", filter.world);
    if (filter.keys?.length) q = q.in("slug", filter.keys);
    const rows = await run<Row[]>(q);
    // Public value: none yet. Metric values are staff-gated until the
    // governance chain publishes them; value: null renders the em-dash.
    return rows.map((r): PublicMetric => ({
      id: r.slug as string,
      label: r.name as string,
      value: null,
      unit: (r.unit as string) ?? undefined,
      world: r.world as PublicMetric["world"],
      verified: r.verified_at != null,
      description: (r.description as string) ?? undefined,
      sourceLabel: undefined,
    }));
  },
};

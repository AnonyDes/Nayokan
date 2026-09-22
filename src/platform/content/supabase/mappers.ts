import "server-only";
import type { Database } from "@/platform/supabase/types";
import type {
  Article,
  Cluster,
  Mentor,
  NavItem,
  Opportunity,
  Partner,
  Person,
  Programme,
  Property,
  Provenance,
  RichBlock,
  SiteId,
  Story,
  Venture,
} from "../types";
import type { MediaRef, Seo } from "../types";

type Row<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];

export function toProvenance(raw: unknown): Provenance {
  const p = (raw ?? {}) as { isDemo?: boolean; unconfirmedFields?: string[] };
  return { isDemo: p.isDemo === true, unconfirmedFields: p.unconfirmedFields };
}

export function toSeo(raw: unknown, ogImage?: MediaRef): Seo | undefined {
  const s = (raw ?? {}) as Record<string, unknown>;
  const seo: Seo = {};
  if (typeof s.title === "string") seo.title = s.title;
  if (typeof s.description === "string") seo.description = s.description;
  if (typeof s.canonical_override === "string") seo.canonicalPath = s.canonical_override;
  if (s.noindex === true) seo.noindex = true;
  if (ogImage) seo.ogImage = ogImage;
  return Object.keys(seo).length > 0 ? seo : undefined;
}

export function toBlocks(raw: unknown): RichBlock[] {
  return Array.isArray(raw) ? (raw as RichBlock[]) : [];
}

function isOpenForApplications(row: Row<"programmes">): boolean {
  if (!row.application_open) return false;
  if (row.status !== "open" && row.status !== "closing_soon") return false;
  if (!row.application_deadline) return true;
  return row.application_deadline >= new Date().toISOString().slice(0, 10);
}

export function toProgramme(row: Row<"programmes">, hero?: MediaRef): Programme {
  return {
    id: row.id,
    site: row.site as Extract<SiteId, "vti" | "startup">,
    world: row.world,
    slug: row.slug,
    code: row.code ?? undefined,
    name: row.name,
    summary: row.summary,
    body: toBlocks(row.body),
    type: row.type ?? undefined,
    status: row.status,
    duration: row.duration ?? undefined,
    deliveryMode: row.delivery_mode ?? undefined,
    location: row.location ?? undefined,
    certification: row.certification ?? undefined,
    applicationDeadline: row.application_deadline ?? undefined,
    applicationOpen: isOpenForApplications(row),
    places: row.places ?? undefined,
    heroImage: hero,
    seo: toSeo(row.seo),
    provenance: toProvenance(row.provenance),
  };
}

export function toCluster(row: Row<"clusters">, hero?: MediaRef): Cluster {
  return {
    id: row.id,
    slug: row.slug,
    code: row.code ?? undefined,
    name: row.name,
    sector: row.sector,
    location: row.location ?? undefined,
    summary: row.summary,
    body: toBlocks(row.body),
    memberCount: row.member_count ?? undefined,
    statusLabel: row.status_label ?? undefined,
    programmeId: row.programme_id ?? undefined,
    heroImage: hero,
    seo: toSeo(row.seo),
    provenance: toProvenance(row.provenance),
  };
}

export function toOpportunity(row: Row<"opportunities">): Opportunity {
  return {
    id: row.id,
    slug: row.slug,
    code: row.code ?? undefined,
    title: row.title,
    category: row.category,
    status: row.status,
    deadline: row.deadline ?? undefined,
    opensAt: row.opens_at ?? undefined,
    eligibility: row.eligibility ?? undefined,
    externalUrl: row.external_url ?? undefined,
    provenance: toProvenance(row.provenance),
  };
}

export function toMentor(row: Row<"mentors">, photo?: MediaRef): Mentor {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    role: row.role ?? undefined,
    expertise: row.expertise,
    sector: row.sector ?? undefined,
    availability: row.availability ?? undefined,
    photo,
    bio: row.bio ?? undefined,
    provenance: toProvenance(row.provenance),
  };
}

export function toPartner(row: Row<"partners">, logo?: MediaRef): Partner {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    logo,
    website: row.website ?? undefined,
    relationship: row.relationship ?? undefined,
    provenance: toProvenance(row.provenance),
  };
}

export function toPerson(row: Row<"people">, photo?: MediaRef): Person {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    position: row.position ?? undefined,
    division: row.division ?? undefined,
    bio: row.bio ?? undefined,
    photo,
    provenance: toProvenance(row.provenance),
  };
}

export function toVenture(
  row: Row<"ventures">,
  listingStatus: Venture["listingStatus"],
  logo?: MediaRef,
): Venture {
  return {
    id: row.id,
    slug: row.slug,
    code: row.code ?? undefined,
    name: row.name,
    description: row.description,
    body: toBlocks(row.body),
    sector: row.sector ?? undefined,
    stage: row.stage ?? undefined,
    location: row.location ?? undefined,
    website: row.website ?? undefined,
    listingStatus,
    relatedProgrammeId: row.related_programme_id ?? undefined,
    logo,
    seo: toSeo(row.seo),
    provenance: toProvenance(row.provenance),
  };
}

export function toProperty(
  row: Row<"properties">,
  gallery: MediaRef[],
): Property {
  return {
    id: row.id,
    slug: row.slug,
    code: row.code ?? undefined,
    name: row.name,
    location: row.location ?? undefined,
    type: row.type ?? undefined,
    summary: row.summary,
    body: toBlocks(row.body),
    amenities: row.amenities,
    gallery,
    externalBookingUrl: row.external_booking_url ?? undefined,
    seo: toSeo(row.seo),
    provenance: toProvenance(row.provenance),
  };
}

export function toArticle(row: Row<"articles">, cover?: MediaRef): Article {
  return {
    id: row.id,
    site: row.site,
    world: row.world,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category ?? undefined,
    authorName: row.author_name ?? undefined,
    publishedAt: row.published_display_at ?? row.published_at ?? "",
    readingMinutes: row.reading_minutes ?? undefined,
    cover,
    body: toBlocks(row.body),
    seo: toSeo(row.seo, cover),
    provenance: toProvenance(row.provenance),
  };
}

export function toStory(row: Row<"stories">, cover?: MediaRef): Story {
  return {
    id: row.id,
    site: row.site,
    world: row.world,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    type: row.type,
    cover,
    provenance: toProvenance(row.provenance),
  };
}

export function toNavItem(row: Row<"navigation_items">, children: NavItem[] = []): NavItem {
  return {
    id: row.id,
    label: row.label,
    href: row.href,
    crossSite: row.cross_site || undefined,
    children: children.length > 0 ? children : undefined,
  };
}

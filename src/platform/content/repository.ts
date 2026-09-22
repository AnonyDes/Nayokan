import type {
  Article,
  Cluster,
  HomeSection,
  Mentor,
  Opportunity,
  Page,
  Partner,
  Person,
  Programme,
  Property,
  PublicMetric,
  SiteId,
  SiteNavigation,
  SiteSettings,
  Story,
  Venture,
  World,
} from "./types";

// Read-only repository for the public sites. Every method returns only
// published + public data for the given site. Two implementations:
//   - fixtures (src/platform/content/fixtures): demo/placeholder data, used
//     until Supabase is connected and as deterministic test data
//   - supabase (src/platform/content/supabase): RLS-scoped anon reads
// Selected by CONTENT_SOURCE in getContentRepository().

export interface PublicContentRepository {
  getSiteSettings(site: SiteId): Promise<SiteSettings>;
  getNavigation(site: SiteId): Promise<SiteNavigation>;
  getHomeSections(site: SiteId): Promise<HomeSection[]>;
  getPage(site: SiteId, path: string): Promise<Page | null>;

  listProgrammes(filter: { site?: SiteId; world?: World }): Promise<Programme[]>;
  getProgramme(site: SiteId, slug: string): Promise<Programme | null>;

  listClusters(): Promise<Cluster[]>;
  getCluster(slug: string): Promise<Cluster | null>;

  listOpportunities(): Promise<Opportunity[]>;
  listMentors(): Promise<Mentor[]>;

  listVentures(site: SiteId, world?: World): Promise<Venture[]>;
  getVenture(site: SiteId, slug: string): Promise<Venture | null>;

  listProperties(): Promise<Property[]>;
  getProperty(slug: string): Promise<Property | null>;

  listArticles(filter: { site: SiteId; category?: string; limit?: number }): Promise<Article[]>;
  getArticle(site: SiteId, slug: string): Promise<Article | null>;

  listStories(filter: { site: SiteId; world?: World; limit?: number }): Promise<Story[]>;

  /** Partners placed on a given site context, e.g. ("corporate","partners-wall"), ("startup","university-wall"). */
  listPartners(site: SiteId, context: string): Promise<Partner[]>;
  listPeople(site: SiteId, context: string): Promise<Person[]>;

  /** Metrics for display. Unverified metrics come back with value: null. */
  listMetrics(filter: { world?: World; keys?: string[] }): Promise<PublicMetric[]>;
}

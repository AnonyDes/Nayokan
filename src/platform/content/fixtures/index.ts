import "server-only";
import type { PublicContentRepository } from "../repository";
import {
  articles,
  clusters,
  mentors,
  metrics,
  navigation,
  opportunities,
  partners,
  people,
  programmes,
  properties,
  siteSettings,
  stories,
  universityPartners,
  venturesBySite,
} from "./data";

// Fixtures repository: demo/placeholder content for the public sites until
// Supabase is connected. Owned by the public-sites workstream.
// Every record carries provenance.isDemo = true; unconfirmed fields render
// "tbc" tags. Metrics always return value: null until verified.
export const fixturesRepository: PublicContentRepository = {
  async getSiteSettings(site) {
    return siteSettings[site];
  },
  async getNavigation(site) {
    return navigation[site];
  },
  async getHomeSections() {
    // Home sections are fixed per site and composed in the route components.
    return [];
  },
  async getPage() {
    return null;
  },

  async listProgrammes(filter) {
    return programmes.filter(
      (p) => (!filter.site || p.site === filter.site) && (!filter.world || p.world === filter.world),
    );
  },
  async getProgramme(site, slug) {
    return programmes.find((p) => p.site === site && p.slug === slug) ?? null;
  },

  async listClusters() {
    return clusters;
  },
  async getCluster(slug) {
    return clusters.find((c) => c.slug === slug) ?? null;
  },

  async listOpportunities() {
    return opportunities;
  },
  async listMentors() {
    return mentors;
  },

  async listVentures(site, world) {
    // world is currently a no-op filter: each site has a single portfolio.
    void world;
    return venturesBySite[site] ?? [];
  },
  async getVenture(site, slug) {
    const list = await fixturesRepository.listVentures(site);
    return list.find((v) => v.slug === slug) ?? null;
  },

  async listProperties() {
    return properties;
  },
  async getProperty(slug) {
    return properties.find((p) => p.slug === slug) ?? null;
  },

  async listArticles(filter) {
    const list = articles.filter(
      (a) => a.site === filter.site && (!filter.category || a.category === filter.category),
    );
    return typeof filter.limit === "number" ? list.slice(0, filter.limit) : list;
  },
  async getArticle(site, slug) {
    return articles.find((a) => a.site === site && a.slug === slug) ?? null;
  },

  async listStories(filter) {
    const list = stories.filter(
      (s) => s.site === filter.site && (!filter.world || s.world === filter.world),
    );
    return typeof filter.limit === "number" ? list.slice(0, filter.limit) : list;
  },

  async listPartners(site, context) {
    if (site === "corporate" && context === "partners-wall") return partners;
    if (site === "startup" && context === "university-wall") return universityPartners;
    return [];
  },
  async listPeople(site, context) {
    if (site === "corporate" && context === "leadership") return people;
    return [];
  },

  async listMetrics(filter) {
    return metrics.filter(
      (m) =>
        (!filter.world || m.world === filter.world) &&
        (!filter.keys || filter.keys.includes(m.id)),
    );
  },
};

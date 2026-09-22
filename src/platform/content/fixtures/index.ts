import "server-only";
import type { PublicContentRepository } from "../repository";

// Fixtures repository: demo/placeholder content for the public sites until
// Supabase is connected. Owned by the public-sites workstream.
// Every record MUST carry provenance.isDemo = true and list unconfirmed
// fields; the sites render them with "tbc" tags. Never invent facts that are
// not in the design package or the Copy doc, and never give an impact metric
// a value (value: null, verified: false).
export const fixturesRepository: PublicContentRepository = {
  async getSiteSettings(site) {
    return { site, name: site, defaultSeo: {}, provenance: { isDemo: true } };
  },
  async getNavigation(site) {
    return { site, primary: [], footerColumns: [], pendingConfirmation: site !== "corporate" };
  },
  async getHomeSections() {
    return [];
  },
  async getPage() {
    return null;
  },
  async listProgrammes() {
    return [];
  },
  async getProgramme() {
    return null;
  },
  async listClusters() {
    return [];
  },
  async getCluster() {
    return null;
  },
  async listOpportunities() {
    return [];
  },
  async listMentors() {
    return [];
  },
  async listVentures() {
    return [];
  },
  async getVenture() {
    return null;
  },
  async listProperties() {
    return [];
  },
  async getProperty() {
    return null;
  },
  async listArticles() {
    return [];
  },
  async getArticle() {
    return null;
  },
  async listStories() {
    return [];
  },
  async listPartners() {
    return [];
  },
  async listPeople() {
    return [];
  },
  async listMetrics() {
    return [];
  },
};

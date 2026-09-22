import "server-only";
import type { PublicContentRepository } from "../repository";

// Supabase repository: RLS-scoped anon reads of published + public rows.
// Owned by the data-layer workstream. Until implemented, every method throws
// so a misconfigured CONTENT_SOURCE=supabase fails loudly instead of
// rendering empty pages.
const notImplemented = (method: string) => () => {
  throw new Error(`supabaseRepository.${method} is not implemented yet`);
};

export const supabaseRepository: PublicContentRepository = {
  getSiteSettings: notImplemented("getSiteSettings"),
  getNavigation: notImplemented("getNavigation"),
  getHomeSections: notImplemented("getHomeSections"),
  getPage: notImplemented("getPage"),
  listProgrammes: notImplemented("listProgrammes"),
  getProgramme: notImplemented("getProgramme"),
  listClusters: notImplemented("listClusters"),
  getCluster: notImplemented("getCluster"),
  listOpportunities: notImplemented("listOpportunities"),
  listMentors: notImplemented("listMentors"),
  listVentures: notImplemented("listVentures"),
  getVenture: notImplemented("getVenture"),
  listProperties: notImplemented("listProperties"),
  getProperty: notImplemented("getProperty"),
  listArticles: notImplemented("listArticles"),
  getArticle: notImplemented("getArticle"),
  listStories: notImplemented("listStories"),
  listPartners: notImplemented("listPartners"),
  listPeople: notImplemented("listPeople"),
  listMetrics: notImplemented("listMetrics"),
};

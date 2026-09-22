// Per-site cache tags (workstreams contract: site:<site>:<entity>[:slug]).
// Publish/unpublish revalidates only the owning site's tags; time-based
// fallback is 60s.
export const REVALIDATE_SECONDS = 60;

export const tags = {
  site: (site: string) => `site:${site}`,
  settings: (site: string) => `site:${site}:settings`,
  navigation: (site: string) => `site:${site}:navigation`,
  home: (site: string) => `site:${site}:home`,
  page: (site: string, path: string) => `site:${site}:page:${path}`,
  programmes: (site: string) => `site:${site}:programmes`,
  programme: (site: string, slug: string) => `site:${site}:programme:${slug}`,
  clusters: (site: string) => `site:${site}:clusters`,
  cluster: (site: string, slug: string) => `site:${site}:cluster:${slug}`,
  opportunities: (site: string) => `site:${site}:opportunities`,
  mentors: (site: string) => `site:${site}:mentors`,
  ventures: (site: string) => `site:${site}:ventures`,
  venture: (site: string, slug: string) => `site:${site}:venture:${slug}`,
  properties: (site: string) => `site:${site}:properties`,
  property: (site: string, slug: string) => `site:${site}:property:${slug}`,
  articles: (site: string) => `site:${site}:articles`,
  article: (site: string, slug: string) => `site:${site}:article:${slug}`,
  stories: (site: string) => `site:${site}:stories`,
  partners: (site: string) => `site:${site}:partners`,
  people: (site: string) => `site:${site}:people`,
  metrics: (world: string) => `metrics:${world}`,
};

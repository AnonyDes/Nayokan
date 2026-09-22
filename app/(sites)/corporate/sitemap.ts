import type { MetadataRoute } from "next";
import { getContentRepository } from "@/platform/content";
import { siteUrl } from "@/platform/sites/registry";

// Corporate sitemap — static routes plus published articles and properties.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repo = await getContentRepository();
  const [articles, properties] = await Promise.all([
    repo.listArticles({ site: "corporate" }),
    repo.listProperties(),
  ]);

  const statics = [
    "/",
    "/what-we-do",
    "/about",
    "/impact",
    "/partners",
    "/insights",
    "/programmes",
    "/contact",
    "/application",
    "/venture-capital",
    "/venture-capital/approach",
    "/venture-capital/pipeline",
    "/venture-capital/portfolio",
    "/venture-capital/partner",
    "/hospitality",
    "/hospitality/properties",
    "/privacy",
    "/terms",
  ].map((path) => ({ url: siteUrl("corporate", path) }));

  const dynamic = [
    ...articles.map((a) => ({
      url: siteUrl("corporate", `/insights/${a.slug}`),
      lastModified: new Date(a.publishedAt),
    })),
    ...properties.map((p) => ({ url: siteUrl("corporate", `/hospitality/properties/${p.slug}`) })),
  ];

  return [...statics, ...dynamic];
}

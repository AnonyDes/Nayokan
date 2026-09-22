import type { MetadataRoute } from "next";
import { getContentRepository } from "@/platform/content";
import { siteUrl } from "@/platform/sites/registry";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repo = await getContentRepository();
  const ventures = await repo.listVentures("startup");

  return [
    ...[
      "/",
      "/programme",
      "/commercialization",
      "/university-partnerships",
      "/mentors",
      "/opportunities",
      "/portfolio",
      "/apply",
      "/privacy",
      "/terms",
    ].map((p) => ({ url: siteUrl("startup", p) })),
    ...ventures.map((v) => ({ url: siteUrl("startup", `/portfolio/${v.slug}`) })),
  ];
}

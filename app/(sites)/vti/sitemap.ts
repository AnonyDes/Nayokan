import type { MetadataRoute } from "next";
import { getContentRepository } from "@/platform/content";
import { siteUrl } from "@/platform/sites/registry";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repo = await getContentRepository();
  const [programmes, clusters] = await Promise.all([
    repo.listProgrammes({ site: "vti" }),
    repo.listClusters(),
  ]);

  return [
    ...["/", "/programmes", "/clusters", "/apply", "/privacy", "/terms"].map((p) => ({
      url: siteUrl("vti", p),
    })),
    ...programmes.map((p) => ({ url: siteUrl("vti", `/programmes/${p.slug}`) })),
    ...clusters.map((c) => ({ url: siteUrl("vti", `/clusters/${c.slug}`) })),
  ];
}

import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import { CorpHero } from "@/ui/components/heroes";
import { ArticleGrid } from "@/sites/corporate/components/article-grid";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Nayokan Insights — editorial writing on innovation, entrepreneurship, skills, capital and productive systems in Cameroon.",
  alternates: canonical("/insights"),
};

export default async function Insights() {
  const repo = await getContentRepository();
  const articles = await repo.listArticles({ site: "corporate" });

  return (
    <>
      <CorpHero
        sec="§ Editorial insights"
        crumbs={[{ label: "Nayokan", href: "/" }, { label: "Insights" }]}
        title={
          <>
            Writing from
            <br />
            inside the <em>ecosystem.</em>
          </>
        }
        lede="Working notes, briefings, case studies and editorial pieces on the making of productive capacity in Cameroon. Written by Nayokan and its partners."
      />
      <ArticleGrid articles={articles} />
      <div style={{ display: "flex", justifyContent: "center", paddingBottom: 96 }}>
        <a href="#" className="btn btn-ghost" aria-disabled="true">
          Load more insights <span className="arrow">→</span>
        </a>
      </div>
    </>
  );
}

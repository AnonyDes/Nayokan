import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import { CorpHero } from "@/ui/components/heroes";
import { ArticleGrid } from "@/sites/corporate/components/article-grid";
import { CtaBand } from "@/ui/components/strips";

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
      <CtaBand
        sec="§ Insights · Contribute"
        title={
          <>
            Write with
            <br />
            <em>Nayokan.</em>
          </>
        }
        lede="Researchers, founders, partners and practitioners are welcome to propose case studies and briefings on productive systems in Cameroon."
        primary={{ label: "Propose a piece", href: "/contact" }}
        secondary={{ label: "See what we do", href: "/what-we-do" }}
      />
    </>
  );
}

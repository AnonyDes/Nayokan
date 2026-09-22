import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { SubHero } from "@/ui/components/heroes";
import { OpportunityTable } from "@/sites/startup/components/filters";

export const metadata: Metadata = {
  title: "Opportunities",
  description:
    "A single index of the open programmes, funding opportunities, challenges, partnership calls and mentor applications across the Startup Centre.",
  alternates: canonical("/opportunities"),
};

export default async function Opportunities() {
  const repo = await getContentRepository();
  const opportunities = await repo.listOpportunities();

  return (
    <>
      <SubHero
        sec="§ Startup Centre · Opportunities"
        refPath="/startup-centre/opportunities"
        crumbs={[
          { label: "Nayokan", href: siteUrl("corporate", "/") },
          { label: "Startup Centre", href: "/" },
          { label: "Opportunities" },
        ]}
        title={
          <>
            Programmes, challenges, <em>calls</em>.
          </>
        }
        lede="A single index of the open programmes, funding opportunities, challenges, partnership calls and mentor applications across the Startup Centre. Filterable, dated, honest about status."
      />

      <section className="section">
        <div className="wrap">
          <OpportunityTable opportunities={opportunities} />
        </div>
      </section>
    </>
  );
}

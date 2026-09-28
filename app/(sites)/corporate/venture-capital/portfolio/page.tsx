import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import { SubHero } from "@/ui/components/heroes";
import { VcPortfolioGrid } from "@/sites/corporate/components/vc";
import { onlyConfirmed } from "@/platform/content/governance";
import { PublishingNote } from "@/ui/components/publishing-note";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "A curated view of the Nayokan VC portfolio — names and figures published only after portfolio-company consent.",
  alternates: canonical("/venture-capital/portfolio"),
};

export default async function VcPortfolio() {
  const repo = await getContentRepository();
  const ventures = onlyConfirmed(await repo.listVentures("corporate", "venture_capital"), "name");

  return (
    <>
      <SubHero
        sec="§ Venture Capital · Portfolio"
        crumbs={[
          { label: "Nayokan", href: "/" },
          { label: "Venture Capital", href: "/venture-capital" },
          { label: "Portfolio" },
        ]}
        title={
          <>
            Ventures we <em>back</em>.
          </>
        }
        lede="A curated view of the Nayokan VC portfolio."
      />
      <section className="section" style={{ background: "var(--navy)", color: "var(--paper)" }}>
        <div className="wrap">
          {ventures.length > 0 ? (
            <VcPortfolioGrid ventures={ventures} />
          ) : (
            <PublishingNote
              onDark
              title="Portfolio coming soon."
              actions={
                <>
                  <a href="/venture-capital/approach" className="btn btn-accent">
                    Investment approach <span className="arrow">→</span>
                  </a>
                  <a href="/venture-capital/partner" className="btn btn-ghost on-dark">
                    Partnership enquiry
                  </a>
                </>
              }
            >
              <p>
                Nayokan VC backs enterprises that build lasting productive capacity, most of them
                sourced from the VTI clusters and the Startup Centre.
              </p>
            </PublishingNote>
          )}
        </div>
      </section>
    </>
  );
}

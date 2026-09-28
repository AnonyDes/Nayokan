import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { SubHero } from "@/ui/components/heroes";
import { onlyConfirmed } from "@/platform/content/governance";
import { PublishingNote } from "@/ui/components/publishing-note";
import { PortfolioDirectory } from "@/sites/startup/components/filters";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "A curated view of ventures currently working with the Startup Centre. Names, logos and financials are published only after venture consent.",
  alternates: canonical("/portfolio"),
};

// What a venture in the portfolio receives, stage by stage. Process, not claims.
const SUPPORT = [
  { num: "01", title: "Model", desc: "Business-model design and venture architecture with Nayokan mentors." },
  { num: "02", title: "Validate", desc: "Pilot customers, technical feasibility and first-revenue evidence." },
  { num: "03", title: "Commercialize", desc: "A structured go-to-market with distribution and adoption partners." },
  { num: "04", title: "Scale", desc: "Referral into Nayokan Venture Capital or strategic partnerships." },
];

export default async function Portfolio() {
  const repo = await getContentRepository();
  // Ventures are listed only with their consent.
  const ventures = onlyConfirmed(await repo.listVentures("startup"), "name");

  return (
    <>
      <SubHero
        sec="§ Startup Centre · Portfolio"
        crumbs={[
          { label: "Nayokan", href: siteUrl("corporate", "/") },
          { label: "Startup Centre", href: "/" },
          { label: "Portfolio" },
        ]}
        title={
          <>
            Ventures in the <em>ecosystem</em>.
          </>
        }
        lede="A curated view of ventures currently working with the Startup Centre."
      />

      <section className="section">
        <div className="wrap">
          {ventures.length > 0 ? (
            <PortfolioDirectory ventures={ventures} />
          ) : (
            <>
              <PublishingNote
                title="Portfolio coming soon."
                actions={
                  <>
                    <a href="/apply" className="btn btn-primary">
                      Apply as an innovator <span className="arrow">→</span>
                    </a>
                    <a href="/commercialization" className="btn btn-ghost">
                      The commercialization framework
                    </a>
                  </>
                }
              >
                <p>
                  The Startup Centre works with ventures from university research, independent
                  innovators and VTI clusters, at every stage from model to scale.
                </p>
              </PublishingNote>
              <ol className="sc-support">
                {SUPPORT.map((s) => (
                  <li key={s.num}>
                    <span>{s.num}</span>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </section>
    </>
  );
}

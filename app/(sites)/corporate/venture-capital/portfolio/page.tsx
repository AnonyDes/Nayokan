import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import { SubHero } from "@/ui/components/heroes";
import { VcPortfolioGrid } from "@/sites/corporate/components/vc";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "A curated view of the Nayokan VC portfolio — names and figures published only after portfolio-company consent.",
  alternates: canonical("/venture-capital/portfolio"),
};

export default async function VcPortfolio() {
  const repo = await getContentRepository();
  const ventures = await repo.listVentures("corporate", "venture_capital");

  return (
    <>
      <SubHero
        sec="§ Venture Capital · Portfolio"
        refPath="/venture-capital/portfolio"
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
        lede="A curated view of the Nayokan VC portfolio. Company names, financial figures and ownership percentages are published only after portfolio-company consent."
      />
      <section className="section" style={{ background: "var(--navy)", color: "var(--paper)" }}>
        <div className="wrap">
          <VcPortfolioGrid ventures={ventures} />
        </div>
      </section>
    </>
  );
}

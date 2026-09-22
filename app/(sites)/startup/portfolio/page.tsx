import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { SubHero } from "@/ui/components/heroes";
import { Tbc } from "@/ui/components/tbc";
import { PortfolioDirectory } from "@/sites/startup/components/filters";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "A curated view of ventures currently working with the Startup Centre. Names, logos and financials are published only after venture consent.",
  alternates: canonical("/portfolio"),
};

const overviewCell = {
  background: "var(--paper)",
  padding: "24px 20px",
} as const;

const overviewNum = {
  fontFamily: "var(--font-heading)",
  fontWeight: 800,
  fontSize: "1.6rem",
  letterSpacing: "-0.03em",
  marginTop: 6,
} as const;

const overviewSub = { color: "var(--muted)", fontSize: "0.82rem" } as const;

export default async function Portfolio() {
  const repo = await getContentRepository();
  const ventures = await repo.listVentures("startup");
  const sectors = new Set(ventures.map((v) => v.sector?.split("·")[0].trim()).filter(Boolean));

  return (
    <>
      <SubHero
        sec="§ Startup Centre · Portfolio"
        refPath="/startup-centre/portfolio"
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
        lede="A curated view of ventures currently working with the Startup Centre. Names, logos and financials are published only after venture consent — placeholders remain until then."
      />

      <section className="section">
        <div className="wrap">
          {/* Overview strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 1,
              background: "var(--line)",
              border: "1px solid var(--line)",
              marginBottom: 40,
            }}
          >
            <div style={overviewCell}>
              <span className="meta">In the pathway</span>
              <div style={overviewNum}>
                —
                <Tbc>tbc</Tbc>
              </div>
              <small style={overviewSub}>Count updated per cohort</small>
            </div>
            <div style={overviewCell}>
              <span className="meta">Sectors</span>
              <div style={overviewNum}>{sectors.size}</div>
              <small style={overviewSub}>Across productive economy</small>
            </div>
            <div style={overviewCell}>
              <span className="meta">Handed to VC</span>
              <div style={overviewNum}>
                —
                <Tbc>tbc</Tbc>
              </div>
              <small style={overviewSub}>Ventures graduated into VC</small>
            </div>
            <div style={overviewCell}>
              <span className="meta">Alumni</span>
              <div style={overviewNum}>
                —
                <Tbc>tbc</Tbc>
              </div>
              <small style={overviewSub}>Post-programme cohort</small>
            </div>
          </div>

          <PortfolioDirectory ventures={ventures} />
        </div>
      </section>
    </>
  );
}

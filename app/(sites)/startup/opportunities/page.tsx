import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { EditorialHero } from "@/ui/components/editorial-hero";
import { OpportunityTable } from "@/sites/startup/components/filters";

export const metadata: Metadata = {
  title: "Opportunities",
  description:
    "A single index of the open programmes, funding opportunities, challenges, partnership calls and mentor applications across the Startup Centre.",
  alternates: canonical("/opportunities"),
};

const HOW_TO_APPLY = [
  { title: "Read the call", body: "Each opportunity states who it is for, what it offers and its deadline status." },
  { title: "Check eligibility", body: "Eligibility is set per call; rolling programmes review applications as they arrive." },
  { title: "Apply through the listed route", body: "Startup Centre programmes use the application on this site; partner calls link to the partner's own page." },
  { title: "Hear back", body: "The Startup Centre team confirms receipt and next steps for every application." },
];

export default async function Opportunities() {
  const repo = await getContentRepository();
  const opportunities = await repo.listOpportunities();

  return (
    <>
      <EditorialHero
        crumbs={[
          { label: "Nayokan", href: siteUrl("corporate", "/") },
          { label: "Startup Centre", href: "/" },
          { label: "Opportunities" },
        ]}
        eyebrow="§ Startup Centre · Opportunities"
        title={
          <>
            Programmes, challenges, <em>calls</em>.
          </>
        }
        lede="One index of the open programmes, funding opportunities, challenges, partnership calls and mentor applications across the Startup Centre. Filterable, dated and honest about status."
        slot="startup-opportunities-hero"
      />

      <section className="section ed-directory" aria-labelledby="opp-title">
        <div className="wrap">
          <header className="section-header">
            <div>
              <span className="meta-num">§ 01 — Index</span>
              <h2 id="opp-title">Every open door, in one list.</h2>
            </div>
            <p className="lead">Filter by type or search by name. Status and deadlines are updated as each call changes.</p>
          </header>
          <OpportunityTable opportunities={opportunities} />
        </div>
      </section>

      <section className="ed-band">
        <div className="wrap">
          <div className="ed-band-inner">
            <div>
              <span className="meta-num">§ 02 — How to apply</span>
              <h2>From call to conversation.</h2>
            </div>
            <ol className="ed-steps">
              {HOW_TO_APPLY.map((s) => (
                <li key={s.title}>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { WorldHero, WorldLocator } from "@/ui/components/heroes";
import { SectionHeader } from "@/ui/components/section-header";
import { onlyConfirmed } from "@/platform/content/governance";
import { MediaSlot } from "@/ui/components/media-slot";
import { RelatedStrip } from "@/ui/components/strips";
import { VcEnquiryForm } from "@/sites/corporate/components/vc";

export const metadata: Metadata = {
  title: "Venture Capital",
  description:
    "Nayokan Venture Capital — capital pathways, investment readiness and venture growth for enterprises with productive potential in Cameroon.",
  alternates: canonical("/venture-capital"),
};

const PILLARS = [
  {
    num: "01",
    title: "Productive capacity, not extraction.",
    desc: "Capital deployed into enterprises that build lasting productive capacity — not into speculation or extraction.",
    detail: ["Focus", "Long-term"],
  },
  {
    num: "02",
    title: "Ecosystem alignment.",
    desc: "Priority given to ventures graduating from Nayokan VTI and Startup Centre, or to enterprises operating within our clusters.",
    detail: ["Sourcing", "Ecosystem"],
  },
  {
    num: "03",
    title: "Patient, structured capital.",
    desc: "Structured instruments matched to the venture stage — revenue-based, convertible, equity — designed for productive-sector growth cycles.",
    detail: ["Instruments", "Flexible"],
  },
];

// How capital moves through the Nayokan system. Structure, not fund terms:
// ticket sizes, fund size and portfolio counts are published only once final.
const PATHWAY = [
  { num: "01", label: "Sourcing", desc: "VTI clusters, Startup Centre ventures and selected partners" },
  { num: "02", label: "Readiness", desc: "Investment readiness with Nayokan mentors" },
  { num: "03", label: "Instruments", desc: "Revenue-based · Convertible · Equity" },
  { num: "04", label: "Support", desc: "Training, market access and productive assets" },
];

// The review path every venture follows. Process only; no named ventures.
const REVIEW = [
  { num: "01", title: "Referral or enquiry", desc: "Ventures arrive from the Startup Centre, VTI clusters or a direct enquiry from a founder or co-investor." },
  { num: "02", title: "Screening", desc: "Fit with the productive-capacity thesis: what the enterprise builds, who it employs, which market it serves." },
  { num: "03", title: "Readiness review", desc: "Business model, unit economics and governance, reviewed with the venture and its mentors." },
  { num: "04", title: "Structuring", desc: "An instrument matched to the venture's stage and growth cycle, agreed with any co-investors." },
  { num: "05", title: "Portfolio support", desc: "Continued access to training, mentorship, markets and hospitality assets across the ecosystem." },
];

export default async function VentureCapital() {
  const repo = await getContentRepository();
  // Only ventures that have consented to being named are ever listed.
  const ventures = onlyConfirmed(await repo.listVentures("corporate", "venture_capital"), "name");

  return (
    <>
      <WorldHero
        num="03"
        world="Venture Capital"
        crumbs={[
          { label: "Nayokan", href: "/" },
          { label: "Four worlds", href: "/#worlds" },
          { label: "Venture Capital" },
        ]}
        title={
          <>
            Capital for
            <br />
            <em>productive</em> enterprises.
          </>
        }
        lede="Nayokan Venture Capital provides structured capital pathways for Cameroonian enterprises with productive potential, sourced from within our ecosystem and from selected institutional partnerships."
        actions={
          <>
            <a href="#approach" className="btn btn-ghost">
              Investment approach <span className="arrow">→</span>
            </a>
            <a href="#enquiry" className="btn btn-accent">
              Partnership enquiry
            </a>
          </>
        }
        figure={
          <div className="vc-hero-panel">
            <div className="vc-hero-panel-head">
              <span>Capital pathway</span>
              <span>Fig. 03</span>
            </div>
            <ol className="vc-pathway">
              {PATHWAY.map((step) => (
                <li key={step.num}>
                  <span className="vc-pathway-num">{step.num}</span>
                  <span className="vc-pathway-label">{step.label}</span>
                  <span className="vc-pathway-desc">{step.desc}</span>
                </li>
              ))}
            </ol>
            <div className="vc-hero-photo">
              <MediaSlot slot="vc-hero" ratio="16:9" tone="navy" variant="compact" />
            </div>
          </div>
        }
      />

      <WorldLocator on={[5, 6]} />

      <section className="vc-approach" id="approach">
        <div className="wrap">
          <SectionHeader
            num="§ 01 — Investment Approach"
            title={
              <>
                Three principles.
                <br />
                Long-term capital.
              </>
            }
            lead="Nayokan VC does not invest in isolation. Capital is deployed alongside training, mentorship, market access and productive-asset development from the wider ecosystem."
            
          />
          <div className="vc-pillars">
            {PILLARS.map((p) => (
              <article className="vc-pillar" key={p.num}>
                <span className="num">Principle {p.num}</span>
                <h4>{p.title}</h4>
                <p>{p.desc}</p>
                <div className="vc-pillar-detail">
                  <span>{p.detail[0]}</span>
                  <span>{p.detail[1]}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="vc-pipeline">
        <div className="wrap">
          <SectionHeader
            num="§ 02 — How we invest"
            title={
              <>
                From referral
                <br />
                to portfolio.
              </>
            }
            lead="Every venture follows the same review path."
          />
          <ol className="vc-review">
            {REVIEW.map((r) => (
              <li key={r.num}>
                <span className="vc-review-num">{r.num}</span>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
              </li>
            ))}
          </ol>
          {ventures.length > 0 && (
            <div className="vc-table vc-table--compact" style={{ marginTop: 56 }}>
              <div className="vc-thead">
                <span>Ref.</span>
                <span>Venture</span>
                <span>Sector</span>
                <span>Stage</span>
              </div>
              {ventures.map((v) => (
                <div className="vc-trow" key={v.id}>
                  <span className="vid">{v.code}</span>
                  <div className="vname">
                    {v.name}
                    <small>{v.description}</small>
                  </div>
                  <span className="vcol">{v.sector}</span>
                  <span className={`vstage ${v.stage === "Growth" ? "growth" : "seed"}`}>{v.stage}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="vc-enquiry" id="enquiry">
        <div className="wrap">
          <div className="vc-enquiry-grid">
            <div className="vc-enquiry-body">
              <h2 style={{ marginTop: 16 }}>
                Deploy capital
                <br />
                into <em>productive</em>
                <br />
                Cameroon.
              </h2>
              <p className="lead on-dark" style={{ color: "var(--muted-invert)", marginTop: 24 }}>
                Nayokan VC works with institutional investors, development finance partners and
                co-investors aligned with productive-sector development in Central Africa.
              </p>
              <div className="cta-contact">
                <div>
                  <span className="meta on-dark">Investor relations</span>
                  <span>Use the enquiry form</span>
                </div>
                <div>
                  <span className="meta on-dark">Yaoundé</span>
                  <span>Cameroon · Central Region</span>
                </div>
              </div>
            </div>
            <VcEnquiryForm />
          </div>
        </div>
      </section>

      <RelatedStrip
        title="Continue through the ecosystem"
        items={[
          { meta: "World 01", label: "Vocational Training Institute", href: siteUrl("vti", "/") },
          { meta: "World 02", label: "Startup Centre", href: siteUrl("startup", "/") },
          { meta: "World 04", label: "Hospitality", href: "/hospitality" },
        ]}
      />
    </>
  );
}

import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { WorldHero, WorldLocator } from "@/ui/components/heroes";
import { SectionHeader } from "@/ui/components/section-header";
import { Tbc } from "@/ui/components/tbc";
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

export default async function VentureCapital() {
  const repo = await getContentRepository();
  const ventures = await repo.listVentures("corporate", "venture_capital");

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
        lede="Nayokan Venture Capital deploys structured capital into Cameroonian enterprises with productive potential — sourced from within our ecosystem and from selected institutional partnerships."
        actions={
          <>
            <a href="#approach" className="btn btn-ghost on-dark">
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
              <span>Fund overview · v1.0</span>
              <span className="live">Live</span>
            </div>
            {[
              ["Stage focus", "Seed · Growth", false],
              ["Geographic", "Cameroon · CEMAC", false],
              ["Ticket range", "— — —", true],
              ["Sectors", "Agri · Tech · Prod.", false],
              ["Portfolio", "— — —", true],
            ].map(([label, val, tbc]) => (
              <div className="vc-hero-metric" key={label as string}>
                <span className="vc-hero-metric-label">{label}</span>
                <span className="vc-hero-metric-val">
                  {val}
                  {tbc && <Tbc onDark />}
                </span>
              </div>
            ))}
            <div className="vc-hero-chart" aria-hidden="true">
              {[22, 34, 48, 62, 78, 92, 71, 58].map((h, i) => (
                <div
                  key={i}
                  className={`bar${i < 2 ? " faded" : i === 4 || i === 5 ? " accent" : ""}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        }
      />

      <WorldLocator on={[5, 6]} />

      <section className="vc-approach" id="approach">
        <div className="wrap">
          <SectionHeader
            num="§ 01 — Investment Approach"
            onDark
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
            num="§ 02 — Venture Pipeline"
            onDark
            title={
              <>
                Current pipeline
                <br />
                and portfolio.
              </>
            }
            lead="A working view of ventures in review or portfolio. Full financial detail is published only after venture and investor consent."
            
          />
          <div className="vc-table">
            <div className="vc-thead">
              <span>Ref.</span>
              <span>Venture</span>
              <span>Sector</span>
              <span>Stage</span>
              <span>Ticket</span>
              <span>Status</span>
            </div>
            {ventures.map((v, i) => (
              <div className="vc-trow" key={v.id}>
                <span className="vid">{v.code}</span>
                <div className="vname">
                  {v.name}
                  <small>{v.description}</small>
                </div>
                <span className="vcol">{v.sector}</span>
                <span className={`vstage ${v.stage === "Growth" ? "growth" : "seed"}`}>{v.stage}</span>
                <span className="vcol">
                  — — —<Tbc onDark />
                </span>
                <span className="vcol">{["In review", "In portfolio", "In pipeline"][i % 3]}</span>
              </div>
            ))}
          </div>
          <p className="meta on-dark" style={{ color: "var(--muted-invert)", marginTop: 24 }}>
            All pipeline entries subject to editorial and legal review before public disclosure.
          </p>
        </div>
      </section>

      <section className="vc-enquiry" id="enquiry">
        <div className="wrap">
          <div className="vc-enquiry-grid">
            <div className="vc-enquiry-body">
              <span className="meta on-dark">§ 03 — Partnership Enquiry</span>
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
                  <span>
                    ir@nayokan.org <Tbc onDark />
                  </span>
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

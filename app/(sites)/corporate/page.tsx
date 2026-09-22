import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import { siteUrl } from "@/platform/sites/registry";
import { Tbc } from "@/ui/components/tbc";
import { SectionHeader } from "@/ui/components/section-header";
import { SystemSection } from "@/sites/corporate/components/system-section";
import { ImpactCell } from "@/sites/corporate/components/metrics";
import { CtaBand } from "@/ui/components/strips";

export const metadata: Metadata = {
  title: "Nayokan — Building people, enterprises and productive systems for Cameroon.",
  description:
    "Nayokan is a Cameroonian development institution building people, enterprises and productive systems — through vocational training, a startup centre, venture capital and productive hospitality assets.",
  alternates: canonical("/"),
};

const MARQUEE = ["Capability", "Production", "Markets", "Innovation", "Capital", "Productive Assets"];

export default async function Home() {
  const repo = await getContentRepository();
  const [metrics, stories, partners] = await Promise.all([
    repo.listMetrics({ keys: ["m-people-trained", "m-programmes", "m-enterprises", "m-partners"] }),
    repo.listStories({ site: "corporate", limit: 3 }),
    repo.listPartners("corporate", "partners-wall"),
  ]);

  const homePartners = ["MINEFOP", "MINPMEESA", "i-DREAMS", "SCINO 360", "University of Yaoundé I", "MINRESI", "Conception X", "Enovation"]
    .map((name) => partners.find((p) => p.name === name))
    .filter((p) => p !== undefined);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-meta reveal">
              <span className="eyebrow eyebrow-dot">A Cameroonian Development Institution</span>
              <span className="hero-year">
                Yaoundé · Cameroon <Tbc>est. date tbc</Tbc>
              </span>
            </div>
            <h1 className="hero-title reveal d1">
              Building <em>people</em>, enterprises&nbsp;and productive systems for{" "}
              <span className="hero-underline">Cameroon.</span>
            </h1>
            <p className="hero-lede reveal d2">
              Nayokan is an ecosystem of vocational training, entrepreneurship, innovation and capital
              — connecting human capability to productive enterprise across four institutional worlds.
            </p>
            <div className="hero-actions reveal d3">
              <a href="#what-we-do" className="btn btn-primary">
                Explore what we do
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </a>
              <a href="#cta" className="btn btn-ghost">
                Partner with Nayokan
              </a>
            </div>
            <div className="hero-worlds reveal d4">
              <span className="meta">Four worlds ·</span>
              <ol>
                <li>
                  <span>01</span> VTI
                </li>
                <li>
                  <span>02</span> Startup Centre
                </li>
                <li>
                  <span>03</span> Venture Capital
                </li>
                <li>
                  <span>04</span> Hospitality
                </li>
              </ol>
            </div>
          </div>
          <div className="hero-right">
            <figure className="hero-figure reveal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/photos/nayokan-06.jpg"
                alt="Nayokan Association members at the Vocational Training Institute inauguration, Yaoundé."
              />
              <figcaption>
                <span className="meta">Fig. 001 —</span>
                Nayokan Vocational Training Institute · Inauguration · Yaoundé.
              </figcaption>
            </figure>
            <div className="hero-mark" aria-hidden="true">
              <span className="meta">N/A</span>
              <span className="hero-mark-num">01 / 04</span>
            </div>
          </div>
        </div>
        <div className="hero-marquee hero-marquee--wrap" aria-hidden="true">
          <div className="marquee-track">
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <span key={i}>
                {m}
                <span aria-hidden="true"> · </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* THE IDEA */}
      <section className="idea section">
        <div className="wrap">
          <div className="idea-grid">
            <div className="idea-left">
              <span className="meta">§ 01 — The Idea</span>
            </div>
            <div className="idea-right">
              <p className="idea-statement reveal">
                <span className="idea-quote">“</span>
                Skills alone are not enough. Isolated programmes are not enough. Lasting economic value
                is created when capability, production, markets, innovation, capital and productive
                assets are connected into <em>one working system.</em>
              </p>
              <div className="idea-attrib reveal d1">
                <span className="rule" style={{ width: 48 }} />
                <span className="meta">Nayokan · Working Foundation, 2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE NAYOKAN SYSTEM — sticky scroll */}
      <SystemSection />

      {/* FOUR WORLDS */}
      <section className="worlds section" id="worlds">
        <div className="wrap">
          <SectionHeader
            num="§ 03 — Four Worlds"
            title={
              <>
                One institution.
                <br />
                Four distinct worlds.
              </>
            }
            lead="Each Nayokan division carries its own personality and focus, but shares the same institutional standards and connects into the same productive system."
          />
          <div className="worlds-grid">
            <a href={siteUrl("vti")} className="world world-vti">
              <div className="world-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/photos/nayokan-08.jpg"
                  alt="Trainees at the Nayokan Vocational Training Institute computer lab."
                />
              </div>
              <div className="world-content">
                <div className="world-index">
                  <span className="meta">World 01</span>
                  <span className="meta world-personality">Practical · Human · Energetic</span>
                </div>
                <h3 className="world-title">Vocational Training Institute</h3>
                <p className="world-desc">
                  Practical skills, certification and entrepreneurial clusters — the foundation of
                  productive capability.
                </p>
                <span className="link-inline">
                  Enter VTI <span className="arrow">→</span>
                </span>
              </div>
            </a>

            <a href={siteUrl("startup")} className="world world-startup">
              <div className="world-media">
                <div className="world-diagram" aria-hidden="true">
                  <svg viewBox="0 0 400 280" width="100%" height="100%">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(10,10,10,0.06)" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="400" height="280" fill="url(#grid)" />
                    <g stroke="#0A0A0A" strokeWidth="1.4" fill="none">
                      <circle cx="60" cy="80" r="8" fill="#12B82A" />
                      <circle cx="180" cy="60" r="6" />
                      <circle cx="180" cy="150" r="6" />
                      <circle cx="300" cy="100" r="6" />
                      <circle cx="300" cy="200" r="6" />
                      <circle cx="360" cy="150" r="12" fill="#0A0A0A" />
                      <line x1="68" y1="80" x2="174" y2="60" />
                      <line x1="68" y1="80" x2="174" y2="150" />
                      <line x1="186" y1="60" x2="294" y2="100" />
                      <line x1="186" y1="150" x2="294" y2="100" />
                      <line x1="186" y1="150" x2="294" y2="200" />
                      <line x1="306" y1="100" x2="348" y2="150" />
                      <line x1="306" y1="200" x2="348" y2="150" />
                    </g>
                    <text x="20" y="270" fontFamily="IBM Plex Mono" fontSize="10" fill="rgba(10,10,10,0.5)" letterSpacing="2">
                      IDEA → VALIDATION → COMMERCIALIZATION
                    </text>
                  </svg>
                </div>
              </div>
              <div className="world-content">
                <div className="world-index">
                  <span className="meta">World 02</span>
                  <span className="meta world-personality">Innovative · Experimental</span>
                </div>
                <h3 className="world-title">Startup Centre</h3>
                <p className="world-desc">
                  University innovation, commercialization and venture creation. Where research becomes
                  enterprise.
                </p>
                <span className="link-inline">
                  Enter Startup Centre <span className="arrow">→</span>
                </span>
              </div>
            </a>

            <a href="/venture-capital" className="world world-vc">
              <div className="world-media">
                <div className="vc-panel" aria-hidden="true">
                  <div className="vc-panel-row">
                    <span>Ticket size</span>
                    <span className="mono">
                      — — —<Tbc onDark />
                    </span>
                  </div>
                  <div className="vc-panel-row">
                    <span>Stage focus</span>
                    <span className="mono">Seed · Growth</span>
                  </div>
                  <div className="vc-panel-row">
                    <span>Sectors</span>
                    <span className="mono">Agri · Tech · Prod.</span>
                  </div>
                  <div className="vc-panel-row">
                    <span>Portfolio</span>
                    <span className="mono">
                      — — —<Tbc onDark />
                    </span>
                  </div>
                  <div className="vc-panel-row">
                    <span>Geographic</span>
                    <span className="mono">Cameroon · Region</span>
                  </div>
                  <div className="vc-panel-viz">
                    {[24, 38, 52, 72, 88, 64].map((h, i) => (
                      <div key={i} className="vc-bar" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="world-content">
                <div className="world-index">
                  <span className="meta on-dark">World 03</span>
                  <span className="meta on-dark world-personality">Analytical · Institutional</span>
                </div>
                <h3 className="world-title on-dark">Venture Capital</h3>
                <p className="world-desc on-dark" style={{ color: "var(--muted-invert)" }}>
                  Capital pathways, investment readiness and venture growth for enterprises with
                  productive potential.
                </p>
                <span className="link-inline on-dark">
                  Enter Venture Capital <span className="arrow">→</span>
                </span>
              </div>
            </a>

            <a href="/hospitality" className="world world-hospitality">
              <div className="world-media">
                <div className="hosp-illust" aria-hidden="true">
                  <div className="hosp-swatch" />
                  <div className="hosp-detail">
                    <span className="meta">Property 001</span>
                    <div className="hosp-detail-title">
                      Guesthouse
                      <br />
                      Yaoundé
                    </div>
                    <div className="hosp-detail-tag">Productive Asset · Hospitality</div>
                  </div>
                </div>
              </div>
              <div className="world-content">
                <div className="world-index">
                  <span className="meta">World 04</span>
                  <span className="meta world-personality">Refined · Calm · Premium</span>
                </div>
                <h3 className="world-title">Hospitality</h3>
                <p className="world-desc">
                  Refined properties, guesthouses and long-term productive assets — hospitality as
                  economic infrastructure.
                </p>
                <span className="link-inline">
                  Enter Hospitality <span className="arrow">→</span>
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* FLAGSHIP PROGRAMMES */}
      <section className="programmes section bg-bone">
        <div className="wrap">
          <SectionHeader
            num="§ 04 — Flagship Programmes"
            title="Programmes currently in motion."
            lead="A selection of programmes across the Nayokan ecosystem. Full details, dates and application windows are managed inside each division."
          />
          <div className="prog-grid">
            <article className="prog-card reveal">
              <div className="prog-tag">
                <span className="meta">VTI · Vocational</span>
                <span className="prog-status open">● Open</span>
              </div>
              <h3 className="prog-title">Professional Growth Engineering Programme</h3>
              <p className="prog-desc">
                Practical skills training for young Cameroonians combined with an entrepreneurial
                cluster model — ensuring graduates are not only knowledgeable but capable of creating
                impactful job solutions and opportunities. <Tbc>source: Nayokan brief</Tbc>
              </p>
              <div className="prog-meta">
                <div>
                  <span className="meta">Duration</span>
                  <span>
                    — — —<Tbc />
                  </span>
                </div>
                <div>
                  <span className="meta">Location</span>
                  <span>Yaoundé · Cameroon</span>
                </div>
              </div>
              <a href={siteUrl("vti")} className="link-inline">
                Programme details <span className="arrow">→</span>
              </a>
            </article>

            <article className="prog-card reveal d1 prog-card-featured">
              <div className="prog-tag">
                <span className="meta on-dark">Startup Centre</span>
                <span className="prog-status on-dark open">● Open</span>
              </div>
              <h3 className="prog-title on-dark">Innovation Commercialization — Industry Application Focus</h3>
              <p className="prog-desc on-dark" style={{ color: "var(--muted-invert)" }}>
                An industry-application-focused programme helping ventures and innovations move from
                research to validated commercial product, with mentorship and market access.{" "}
                <Tbc onDark>source: Nayokan brief</Tbc>
              </p>
              <div className="prog-meta on-dark">
                <div>
                  <span className="meta on-dark">Duration</span>
                  <span>
                    — — —<Tbc onDark />
                  </span>
                </div>
                <div>
                  <span className="meta on-dark">Partners</span>
                  <span>Universities · Industry</span>
                </div>
              </div>
              <a href={siteUrl("startup")} className="link-inline on-dark">
                Programme details <span className="arrow">→</span>
              </a>
            </article>

            <article className="prog-card reveal d2">
              <div className="prog-tag">
                <span className="meta">VTI · Enterprise</span>
                <span className="prog-status upcoming">○ Upcoming</span>
              </div>
              <h3 className="prog-title">Entrepreneurial Clusters</h3>
              <p className="prog-desc">
                Structured groups where graduates and enterprises collaborate around a common
                productive activity — sharing tools, market access and support.{" "}
                <Tbc>source: Nayokan brief</Tbc>
              </p>
              <div className="prog-meta">
                <div>
                  <span className="meta">Cohort</span>
                  <span>
                    — — —<Tbc />
                  </span>
                </div>
                <div>
                  <span className="meta">Format</span>
                  <span>In-person + Mentoring</span>
                </div>
              </div>
              <a href={siteUrl("vti")} className="link-inline">
                Cluster details <span className="arrow">→</span>
              </a>
            </article>
          </div>
          <div className="prog-footer">
            <a href="/programmes" className="link-inline">
              View the full programme directory <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="impact section" id="impact">
        <div className="wrap">
          <SectionHeader
            num="§ 05 — Impact"
            title="Evidence over exaggeration."
            lead="We only publish verified figures. Where a metric is being reconciled with our divisions, we mark it as such rather than overstating."
          />
          <div className="impact-grid">
            {metrics.map((m, i) => (
              <ImpactCell key={m.id} metric={m} index={i} />
            ))}
          </div>
          <div className="impact-footer">
            <p className="meta">
              All figures subject to editorial review · Content governance: draft → review → approved →
              published.
            </p>
          </div>
        </div>
      </section>

      {/* STORIES */}
      <section className="stories section bg-bone">
        <div className="wrap">
          <SectionHeader
            num="§ 06 — Stories"
            title="Ideas becoming enterprises."
            lead="The Nayokan ecosystem in practice — the people, ventures and moments that connect capability to production."
          />
          <div className="stories-grid">
            {stories[0] && (
              <a href={`/insights/${stories[0].slug}`} className="story story-featured reveal">
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stories[0].cover?.src ?? "/assets/photos/nayokan-01.jpg"} alt={stories[0].cover?.alt ?? ""} />
                  <figcaption>
                    <span className="meta">Story 001 · Nayokan Association</span>
                    <h3>{stories[0].title}</h3>
                    <p className="story-lede">{stories[0].excerpt}</p>
                    <span className="link-inline on-dark">
                      Read the story <span className="arrow">→</span>
                    </span>
                  </figcaption>
                </figure>
              </a>
            )}
            <div className="stories-side">
              {stories.slice(1).map((s, i) => (
                <a key={s.id} href={`/insights/${s.slug}`} className={`story story-small reveal d${i + 1}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.cover?.src ?? "/assets/photos/nayokan-04.jpg"} alt={s.cover?.alt ?? ""} />
                  <div className="story-small-body">
                    <span className="meta">Story {String(i + 2).padStart(3, "0")}</span>
                    <h4>{s.title}</h4>
                    <span className="story-cat">{s.world === "vti" ? "VTI · Note" : "Startup · Feature"}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="partners section-tight">
        <div className="wrap">
          <div className="partners-inner">
            <div className="partners-head">
              <span className="meta-num">§ 07 — Partners</span>
              <h2>Institutional partners across the ecosystem.</h2>
              <p className="lead">
                Universities, ministries, development organizations and private sector — approved
                partners only.
              </p>
            </div>
            <div className="partners-grid" aria-label="Partner wordmarks">
              {homePartners.map((p) => (
                <div className="partner-cell" key={p.id}>
                  {p.name === "University of Yaoundé I" ? "Univ. Yaoundé I" : p.name} <Tbc />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <CtaBand
        sec="§ 08 — Build with us"
        title={
          <>
            Build the next
            <br />
            productive system
            <br />
            <em>with us.</em>
          </>
        }
        lede="Universities, development partners, corporates, funders and government — Nayokan is designed for long-term institutional partnership."
        primary={{ label: "Partner with Nayokan", href: "/partners" }}
        secondary={{ label: "Explore opportunities", href: "/programmes" }}
        contact={
          <>
            <div>
              <span className="meta on-dark">Enquiries</span>
              <span>
                partners@nayokan.org <Tbc onDark />
              </span>
            </div>
            <div>
              <span className="meta on-dark">Yaoundé</span>
              <span>Cameroon · Central Region</span>
            </div>
          </>
        }
      />
    </>
  );
}

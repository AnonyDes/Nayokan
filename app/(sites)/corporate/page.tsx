import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import { siteUrl } from "@/platform/sites/registry";
import { Tbc } from "@/ui/components/tbc";
import { SectionHeader } from "@/ui/components/section-header";
import { SystemSection } from "@/sites/corporate/components/system-section";
import { ImpactCell } from "@/sites/corporate/components/metrics";
import { CtaBand } from "@/ui/components/strips";
import { MediaSlot } from "@/ui/components/media-slot";
import { FourWorlds } from "@/ui/components/four-worlds";

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
              <a href="/what-we-do" className="btn btn-primary">
                Explore what we do
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </a>
              <a href="/partners" className="btn btn-ghost">
                Partner with Nayokan
              </a>
            </div>
            <nav className="hero-worlds reveal d4" aria-label="The four worlds">
              <span className="meta">Four worlds</span>
              <ol>
                <li>
                  <a href={siteUrl("vti")} data-world-transition="vti">
                    <span>01</span> VTI ↗
                  </a>
                </li>
                <li>
                  <a href={siteUrl("startup")} data-world-transition="startup">
                    <span>02</span> Startup Centre ↗
                  </a>
                </li>
                <li>
                  <a href="/venture-capital">
                    <span>03</span> Venture Capital
                  </a>
                </li>
                <li>
                  <a href="/hospitality">
                    <span>04</span> Hospitality
                  </a>
                </li>
              </ol>
            </nav>
          </div>
          <div className="hero-right">
            <div className="hero-figure reveal">
              <MediaSlot slot="home-hero" fill eager tone="dark" />
              <div className="hero-figure-cap">
                <span className="meta">Fig. 001 —</span>
                Nayokan VTI computer lab · Yaoundé
              </div>
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

      {/* WHAT NAYOKAN IS */}
      <section className="about-intro section">
        <div className="wrap">
          <div className="about-intro-grid">
            <div className="about-intro-copy">
              <span className="meta-num">§ 01 — What Nayokan is</span>
              <h2 className="about-intro-title reveal">
                A Cameroonian development institution building the whole chain, not one link.
              </h2>
              <p className="about-intro-lede reveal d1">
                Nayokan brings vocational training, a startup centre, venture capital and productive
                hospitality assets under one institution, so that people, enterprises and capital
                grow together rather than in isolated programmes.
              </p>
              <dl className="about-intro-facts reveal d2">
                <div>
                  <dt>Institution</dt>
                  <dd>One</dd>
                </div>
                <div>
                  <dt>Worlds</dt>
                  <dd>Four</dd>
                </div>
                <div>
                  <dt>System stages</dt>
                  <dd>Six</dd>
                </div>
              </dl>
              <a href="/about" className="link-inline reveal d3">
                About Nayokan <span className="arrow">→</span>
              </a>
            </div>
            <div className="about-intro-media reveal d1">
              <MediaSlot slot="home-about" ratio="4:3" caption />
            </div>
          </div>
        </div>
      </section>

      {/* WHY SYSTEMS MATTER */}
      <section className="idea section">
        <div className="wrap">
          <div className="idea-grid">
            <div className="idea-left">
              <span className="meta">§ 02 — Why systems matter</span>
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

      {/* FOUR WORLDS: the ecosystem's visual anchor */}
      <section className="worlds-anchor" id="worlds">
        <div className="wrap">
          <SectionHeader
            num="§ 04 — Four Worlds"
            title={
              <>
                One institution.
                <br />
                Four distinct worlds.
              </>
            }
            lead="Each world has its own character and its own front door, and all four share the same institutional standards and the same productive system."
          />
          <FourWorlds variant="home" />
          <div className="worlds-anchor-foot">
            <span>VTI and Startup Centre open as dedicated Nayokan sites</span>
            <a href="/what-we-do">The full ecosystem map →</a>
          </div>
        </div>
      </section>

      {/* FLAGSHIP PROGRAMMES */}
      <section className="programmes section bg-bone">
        <div className="wrap">
          <SectionHeader
            num="§ 05 — Flagship Programmes"
            title="Programmes currently in motion."
            lead="A selection of programmes across the Nayokan ecosystem. Full details, dates and application windows are managed inside each division."
          />
          <div className="prog-grid">
            <article className="prog-card reveal">
              <MediaSlot slot="programme-vti" ratio="3:2" variant="compact" className="prog-media" />
              <div className="prog-tag">
                <span className="meta">VTI · Vocational</span>
                <span className="prog-status open">● Open</span>
              </div>
              <h3 className="prog-title">Professional Growth Engineering Programme</h3>
              <p className="prog-desc">
                Practical skills training for young Cameroonians combined with an entrepreneurial
                cluster model — ensuring graduates are not only knowledgeable but capable of creating
                impactful job solutions and opportunities.
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
              <MediaSlot slot="programme-startup" ratio="3:2" variant="compact" tone="dark" className="prog-media" />
              <div className="prog-tag">
                <span className="meta on-dark">Startup Centre</span>
                <span className="prog-status on-dark open">● Open</span>
              </div>
              <h3 className="prog-title on-dark">Innovation Commercialization — Industry Application Focus</h3>
              <p className="prog-desc on-dark" style={{ color: "var(--muted-invert)" }}>
                An industry-application-focused programme helping ventures and innovations move from
                research to validated commercial product, with mentorship and market access.
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
                  <span>
                    Universities · Industry <Tbc onDark />
                  </span>
                </div>
              </div>
              <a href={siteUrl("startup")} className="link-inline on-dark">
                Programme details <span className="arrow">→</span>
              </a>
            </article>

            <article className="prog-card reveal d2">
              <MediaSlot slot="vti-clusters-hero" ratio="3:2" variant="compact" className="prog-media" />
              <div className="prog-tag">
                <span className="meta">VTI · Enterprise</span>
                <span className="prog-status upcoming">○ Upcoming</span>
              </div>
              <h3 className="prog-title">Entrepreneurial Clusters</h3>
              <p className="prog-desc">
                Structured groups where graduates and enterprises collaborate around a common
                productive activity — sharing tools, market access and support.
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
                  <span>
                    In-person + mentoring <Tbc />
                  </span>
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
            num="§ 06 — Impact"
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
            num="§ 07 — Stories"
            title="Ideas becoming enterprises."
            lead="The Nayokan ecosystem in practice — the people, ventures and moments that connect capability to production."
          />
          <div className="stories-grid">
            {stories[0] && (
              <a href={`/insights/${stories[0].slug}`} className="story story-featured reveal">
                <div className="story-featured-frame">
                  <MediaSlot slot="story-startup" media={stories[0].cover} fill tone="dark" variant="compact" />
                  <div className="story-featured-cap">
                    <span className="meta">Story 001 · Nayokan Association</span>
                    <h3>{stories[0].title}</h3>
                    <p className="story-lede">{stories[0].excerpt}</p>
                    <span className="link-inline on-dark">
                      Read the story <span className="arrow">→</span>
                    </span>
                  </div>
                </div>
              </a>
            )}
            <div className="stories-side">
              {stories.slice(1).map((s, i) => (
                <a key={s.id} href={`/insights/${s.slug}`} className={`story story-small reveal d${i + 1}`}>
                  <div className="story-small-media">
                    <MediaSlot slot="story-startup" media={s.cover} fill variant="compact" />
                  </div>
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
              <span className="meta-num">§ 08 — Partners</span>
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
        sec="§ 09 — Build with us"
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

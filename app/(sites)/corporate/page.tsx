import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import { onlyConfirmed } from "@/platform/content/governance";
import type { Partner } from "@/platform/content/types";
import { SectionHeader } from "@/ui/components/section-header";
import { SystemSection } from "@/sites/corporate/components/system-section";
import { ImpactCell } from "@/sites/corporate/components/metrics";
import { CtaBand } from "@/ui/components/strips";
import { MediaSlot } from "@/ui/components/media-slot";
import { FourWorlds } from "@/ui/components/four-worlds";
import { ProgrammeCard, programmeSlot, programmeStatus, PROGRAMME_WORLD_LABEL } from "@/ui/components/programme-card";
import { programmeHref } from "@/sites/corporate/programme-href";
import { getNamedIllustrative } from "@/ui/media/image-briefs";

export const metadata: Metadata = {
  title: "Nayokan — Building people, enterprises and productive systems for Cameroon.",
  description:
    "Nayokan is a Cameroonian development institution building people, enterprises and productive systems — through vocational training, a startup centre, venture capital and productive hospitality assets.",
  alternates: canonical("/"),
};

const MARQUEE = ["Capability", "Production", "Markets", "Innovation", "Capital", "Productive Assets"];

// Flagship programmes, in display order: the first leads, the rest support it.
const FLAGSHIP = ["professional-growth-engineering", "innovation-commercialization", "cluster-formation-programme"];

// How Nayokan works with each kind of partner. Named partners appear only
// once a partnership is confirmed (governance.ts); until then this section
// describes the relationships Nayokan builds, never who it has them with.
const PARTNER_KINDS: { category: Partner["category"]; label: string; desc: string }[] = [
  { category: "university", label: "Universities & research", desc: "Research commercialization, student innovation and shared frameworks for IP." },
  { category: "government", label: "Ministries & public sector", desc: "Vocational standards, enterprise policy and national skills priorities." },
  { category: "development", label: "Development partners", desc: "Programme co-design, funding and evidence of impact." },
  { category: "corporate", label: "Corporate & private sector", desc: "Industry placements, market access and co-investment." },
];

export default async function Home() {
  const repo = await getContentRepository();
  const [metrics, stories, partners, programmes] = await Promise.all([
    repo.listMetrics({ keys: ["m-people-trained", "m-programmes", "m-enterprises", "m-partners"] }),
    repo.listStories({ site: "corporate", limit: 3 }),
    repo.listPartners("corporate", "partners-wall"),
    repo.listProgrammes({}),
  ]);

  const confirmedPartners = onlyConfirmed(partners, "name").slice(0, 8);
  const [lead, ...supporting] = FLAGSHIP.map((slug) => programmes.find((p) => p.slug === slug)).filter(
    (p) => p !== undefined,
  );

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-left">
            <h1 className="hero-title reveal">
              Building <em>people</em>, enterprises&nbsp;and productive systems for{" "}
              <span className="hero-underline">Cameroon.</span>
            </h1>
            <p className="hero-lede reveal d1">
              Nayokan is an ecosystem of vocational training, entrepreneurship, innovation and capital
              — connecting human capability to productive enterprise across four institutional worlds.
            </p>
            <div className="hero-actions reveal d2">
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
                <span className="meta">Nayokan · Founding principle</span>
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
          <FourWorlds />
          <div className="worlds-anchor-foot">
            <span>VTI and the Startup Centre each have a dedicated Nayokan site</span>
            <a href="/what-we-do">How the four worlds connect →</a>
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
          {lead && (
            <a href={programmeHref(lead)} className="flagship-lead reveal">
              <div className="flagship-lead-media">
                <MediaSlot
                  slot={programmeSlot(lead)}
                  media={lead.heroImage}
                  illustrative={getNamedIllustrative(`programme-${lead.slug}`, `Illustrative image for ${lead.name}.`)}
                  fill
                  variant="compact"
                  tone="dark"
                  sizes="(max-width: 899px) 100vw, 60vw"
                />
              </div>
              <div className="flagship-lead-body">
                <span className="meta on-dark">
                  Flagship · {PROGRAMME_WORLD_LABEL[lead.world]} · {programmeStatus(lead).label}
                </span>
                <h3>{lead.name}</h3>
                <p>{lead.summary}</p>
                <span className="link-inline on-dark">
                  Programme details <span className="arrow">→</span>
                </span>
              </div>
            </a>
          )}
          <div className="flagship-support">
            {supporting.map((p) => (
              <ProgrammeCard key={p.id} programme={p} href={programmeHref(p)} showWorld />
            ))}
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
            lead="We publish a figure only once it has been verified. Until then, the measure is named and left empty rather than estimated."
          />
          <div className="impact-grid">
            {metrics.map((m, i) => (
              <ImpactCell key={m.id} metric={m} index={i} />
            ))}
          </div>
          <div className="impact-footer">
            <a href="/impact" className="link-inline">
              Our approach to evidence <span className="arrow">→</span>
            </a>
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
              <h2>Institutional partners across the ecosystem.</h2>
              <p className="lead">
                Universities, ministries, development organisations and the private sector: long-term
                institutional partnership is how the system scales.
              </p>
            </div>
            <div className="partners-body">
            {confirmedPartners.length > 0 ? (
              <div className="partners-grid" aria-label="Partner wordmarks">
                {confirmedPartners.map((p) => (
                  <div className="partner-cell" key={p.id}>
                    {p.name}
                  </div>
                ))}
              </div>
            ) : (
              <ul className="partner-kinds" aria-label="How Nayokan works with partners">
                {PARTNER_KINDS.map((k) => (
                  <li key={k.category}>
                    <h3>{k.label}</h3>
                    <p>{k.desc}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="partners-foot">
              <a href="/partners" className="link-inline">
                Partner with Nayokan <span className="arrow">→</span>
              </a>
            </div>
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
              <a href="/contact">Contact the partnerships team →</a>
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

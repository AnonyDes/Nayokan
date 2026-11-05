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
  title: "Nayokan — Training and business support in Cameroon",
  description:
    "Find practical training, support for your business idea, and ways to partner with Nayokan in Cameroon.",
  alternates: canonical("/"),
};

const TOPICS = ["Skills", "Production", "Markets", "Innovation", "Funding", "Hospitality"];

// Flagship programmes, in display order: the first leads, the rest support it.
const FLAGSHIP = [
  "agro-industrialization-export-systems-market-access",
  "local-manufacturing-sustainable-construction",
  "innovation-commercialization",
];

// How Nayokan works with each kind of partner. Named partners appear only
// once a partnership is confirmed (governance.ts); until then this section
// describes the relationships Nayokan builds, never who it has them with.
const PARTNER_KINDS: { category: Partner["category"]; label: string; desc: string }[] = [
  { category: "university", label: "Universities & research", desc: "Help students and researchers turn ideas into products." },
  { category: "government", label: "Ministries & public sector", desc: "Align training with national skills priorities." },
  { category: "development", label: "Development partners", desc: "Design, fund and evaluate programmes together." },
  { category: "corporate", label: "Businesses", desc: "Offer work placements, help businesses reach customers and invest together." },
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
              Helping people turn <em>skills</em> into jobs and businesses in{" "}
              <span className="hero-underline">Cameroon.</span>
            </h1>
            <p className="hero-lede reveal d1">
              Nayokan offers hands-on training and helps people develop business ideas. We welcome
              universities, employers and investors who want to support that work.
            </p>
            <div className="hero-actions reveal d2">
              <a href="/what-we-do#training" className="btn btn-primary">
                Find training
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </a>
              <a href="/what-we-do#startup-support" className="btn btn-ghost">
                Get startup support
              </a>
              <a href="/partners" className="btn btn-ghost">
                Partner with us
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
        <div className="hero-topics" aria-hidden="true">
          {TOPICS.map((topic) => <span key={topic}>{topic}</span>)}
        </div>
      </section>

      {/* WHAT NAYOKAN IS */}
      <section className="about-intro section">
        <div className="wrap">
          <div className="about-intro-grid">
            <div className="about-intro-copy">
              <h2 className="about-intro-title reveal">
                From learning a skill to growing a business.
              </h2>
              <p className="about-intro-lede reveal d1">
                Learn a practical skill at the Vocational Training Institute or test a business idea
                at the Startup Centre. Venture Capital helps businesses prepare for investment, and
                Hospitality welcomes visitors and partners.
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
                Practical skills can lead to work and new businesses. Training, business advice and
                access to customers and funding help people <em>take the next step.</em>
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
            lead="Meet the four parts of Nayokan and see how each one can help."
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
            title="Training and startup programmes."
            lead="See what each programme covers and whether you can apply."
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
            title="People and stories from Nayokan."
            lead="See inside the training centre and learn more about the work behind our programmes."
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
              <h2>Work with Nayokan.</h2>
              <p className="lead">
                Universities, government, development organisations and businesses can partner with us.
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

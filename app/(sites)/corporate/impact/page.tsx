import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import type { PublicMetric } from "@/platform/content/types";
import { WorldHero, WorldLocator } from "@/ui/components/heroes";
import { SectionHeader } from "@/ui/components/section-header";
import { MediaSlot } from "@/ui/components/media-slot";
import { BigMetric } from "@/sites/corporate/components/metrics";
import { PublishingNote } from "@/ui/components/publishing-note";
import { siteUrl } from "@/platform/sites/registry";

export const metadata: Metadata = {
  title: "Impact",
  description:
    "Nayokan impact: verified figures only, broken down by world, with the stories and the evidence process behind the numbers.",
  alternates: canonical("/impact"),
};

const IMPACT_DIMENSIONS = [
  {
    num: "01",
    title: "Capability & Skills",
    desc: "Vocational competence, technological literacy, and workplace readiness formed through rigorous cohort training.",
    tag: "01 · Human Capital",
  },
  {
    num: "02",
    title: "Enterprise & Production",
    desc: "Commercial viability, operational disciplines, and productive output from clusters and early-stage ventures.",
    tag: "02 · Productive Capacity",
  },
  {
    num: "03",
    title: "Patient Capital",
    desc: "Ecosystem-aligned investment instruments deployed to sustain long-term economic development in Cameroon.",
    tag: "03 · Capital Formation",
  },
  {
    num: "04",
    title: "Productive Assets",
    desc: "Physical infrastructure, hospitality properties, and enduring hubs that anchor economic activity.",
    tag: "04 · Tangible Infrastructure",
  },
];

const ECOSYSTEM_DIVISIONS = [
  {
    num: "01",
    name: "Vocational Training Institute",
    badge: "Division 01 · Capability",
    slot: "world-vti" as const,
    title: "Practical Vocational Excellence",
    desc: "Developing market-ready vocational and technical capabilities across software, trades, and business operations.",
    status: "Yaoundé Campus · Ongoing Cohorts",
    href: siteUrl("vti", "/"),
    linkText: "Explore VTI",
  },
  {
    num: "02",
    name: "Startup Centre",
    badge: "Division 02 · Innovation",
    slot: "world-startup" as const,
    title: "Venture Incubation & Prototyping",
    desc: "Transforming applied ideas and university research into viable commercial enterprises with defensible market traction.",
    status: "Incubation Track · Active Pipelines",
    href: siteUrl("startup", "/"),
    linkText: "Explore Startup Centre",
  },
  {
    num: "03",
    name: "Venture Capital",
    badge: "Division 03 · Capital",
    slot: "world-vc" as const,
    title: "Structured Patient Investment",
    desc: "Deploying revenue-based, convertible, and equity instruments matched to real industrial and service growth cycles.",
    status: "Ecosystem Sourcing · Capital Pathway",
    href: "/venture-capital",
    linkText: "Explore Venture Capital",
  },
  {
    num: "04",
    name: "Hospitality",
    badge: "Division 04 · Productive Assets",
    slot: "world-hospitality" as const,
    title: "World-Class Operating Assets",
    desc: "Building and operating premium hospitality properties that host international partners, delegations, and conferences.",
    status: "Operating Assets · High Quality Standards",
    href: "/hospitality",
    linkText: "Explore Hospitality",
  },
];

// How a figure reaches this page. Process, not claims.
const EVIDENCE_STEPS = [
  { num: "01", title: "Recorded", desc: "Each division records its own activity: cohorts, ventures, investments and stays." },
  { num: "02", title: "Reconciled", desc: "Figures are checked against source records, such as registers, agreements and accounts." },
  { num: "03", title: "Reviewed", desc: "An editorial and governance review confirms the figure and how it is described." },
  { num: "04", title: "Published", desc: "Only then does the number appear here, with the division that reports it." },
];

export default async function Impact() {
  const repo = await getContentRepository();
  const [coreMetrics, stories] = await Promise.all([
    repo.listMetrics({ keys: ["m-people-trained", "m-programmes", "m-enterprises", "m-partners"] }),
    repo.listStories({ site: "corporate", limit: 3 }),
  ]);

  return (
    <>
      <WorldHero
        crumbs={[{ label: "Nayokan", href: "/" }, { label: "Impact" }]}
        title={
          <>
            Evidence over
            <br />
            <em>exaggeration.</em>
          </>
        }
        lede="We measure ourselves by the productive capability created in Cameroon. Every figure published here is verified before it is recorded, and backed by the human stories of our trainees, founders and partners."
        actions={
          <>
            <a href="#dimensions" className="btn btn-primary on-dark">
              Core dimensions <span className="arrow">↓</span>
            </a>
            <a href="#divisions" className="btn btn-ghost on-dark">
              Ecosystem divisions <span className="arrow">→</span>
            </a>
          </>
        }
        figure={
          <div className="vc-hero-photo-wrap">
            <MediaSlot slot="impact-evidence" ratio="4:5" tone="green" variant="compact" eager caption />
          </div>
        }
      />
      <WorldLocator on={[1, 2, 3, 4, 5, 6]} />

      {/* § 01 — CORE DIMENSIONS (HIGH CONTRAST DARK BAND) */}
      <section id="dimensions" className="impact-dim-section">
        <div className="wrap">
          <SectionHeader
            num="§ 01 — Core dimensions"
            onDark
            title={
              <>
                Four pillars of
                <br />
                real economic value.
              </>
            }
            lead="How Nayokan evaluates productive capacity across the ecosystem."
          />
          <ul className="impact-dim-grid">
            {IMPACT_DIMENSIONS.map((dim) => (
              <li key={dim.num} className="impact-dim-card">
                <span className="dim-num">{dim.num}</span>
                <h3>{dim.title}</h3>
                <p>{dim.desc}</p>
                <span className="dim-tag">{dim.tag}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* § 02 — ECOSYSTEM DIVISIONS WITH AUTHENTIC PHOTOGRAPHY */}
      <section id="divisions" className="impact-divisions-section">
        <div className="wrap">
          <SectionHeader
            num="§ 02 — Ecosystem divisions"
            title={
              <>
                How each world
                <br />
                contributes.
              </>
            }
            lead="Direct operational accountability from vocational formation to tangible operating assets."
          />
          <div className="impact-divisions-grid">
            {ECOSYSTEM_DIVISIONS.map((div) => (
              <article key={div.num} className="impact-div-card">
                <div className="impact-div-media">
                  <MediaSlot slot={div.slot} fill />
                </div>
                <div className="impact-div-body">
                  <span className="impact-div-badge">{div.badge}</span>
                  <h3 className="impact-div-title">{div.title}</h3>
                  <p className="impact-div-desc">{div.desc}</p>
                  <div className="impact-div-status">
                    <span>{div.status}</span>
                    <a href={div.href}>
                      {div.linkText} <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* § 03 — VERIFIED REPORTING STANDARDS */}
      <section className="big-metrics">
        <div className="wrap">
          <SectionHeader
            num="§ 03 — Public reporting standards"
            title={
              <>
                What we will
                <br />
                report on.
              </>
            }
            lead="Four core measures across the ecosystem. Empty until verified — never estimated."
          />
          <div className="big-metrics-grid">
            {coreMetrics.map((m, i) => (
              <BigMetric
                key={m.id}
                metric={m}
                index={i}
                sub={["Vocational training", "Programmes", "Enterprises", "Partnerships"][i]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* § 04 — STORIES OF IMPACT */}
      <section className="section bg-bone">
        <div className="wrap">
          <SectionHeader
            num="§ 04 — Stories of impact"
            title="Behind the numbers."
            lead="Impact expressed as stories: the people, cohorts, ventures and partnerships that make up the measures."
          />
          <div className="impact-stories">
            {stories[0] && (
              <a href={`/insights/${stories[0].slug}`} className="story-featured impact-story-lead">
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stories[0].cover?.src} alt={stories[0].cover?.alt ?? ""} loading="lazy" />
                  <figcaption>
                    <span className="meta">Story 001 · VTI</span>
                    <h3>{stories[0].title}</h3>
                    <p>{stories[0].excerpt}</p>
                    <span className="link-inline on-dark">
                      Read the story <span className="arrow">→</span>
                    </span>
                  </figcaption>
                </figure>
              </a>
            )}
            <div className="impact-stories-side">
              {stories.slice(1).map((s, i) => (
                <a key={s.id} href={`/insights/${s.slug}`} className="story-small">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.cover?.src} alt={s.cover?.alt ?? ""} loading="lazy" />
                  <div className="story-small-body">
                    <span className="meta">
                      Story {String(i + 2).padStart(3, "0")} · {s.world === "vti" ? "VTI" : "Startup Centre"}
                    </span>
                    <h4>{s.title}</h4>
                    <span className="story-cat">{s.world === "vti" ? "VTI · Note" : "Startup · Feature"}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* § 05 — EVIDENCE PROCESS + REPORTS */}
      <section className="section bg-ink impact-process">
        <div className="wrap">
          <SectionHeader
            num="§ 05 — Verification framework"
            onDark
            title={
              <>
                Four steps
                <br />
                before a number.
              </>
            }
            lead="The same standard applies to every figure on every Nayokan site, from a cohort count to capital deployed."
          />
          <ol className="impact-steps">
            {EVIDENCE_STEPS.map((step) => (
              <li key={step.num}>
                <span>{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </li>
            ))}
          </ol>
          <PublishingNote
            onDark
            eyebrow="Reports"
            title="Annual reports and evaluations."
            actions={
              <a href="/contact" className="btn btn-ghost on-dark">
                Request information <span className="arrow">→</span>
              </a>
            }
          />
        </div>
      </section>
    </>
  );
}

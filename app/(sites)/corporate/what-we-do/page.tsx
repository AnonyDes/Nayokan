import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { SectionHeader } from "@/ui/components/section-header";
import { CtaBand } from "@/ui/components/strips";
import { MediaSlot } from "@/ui/components/media-slot";
import { WORLDS_DIRECTORY, worldHref, type WorldEntry } from "@/platform/content/worlds";
import type { ImageSlotId } from "@/ui/media/image-briefs";

export const metadata: Metadata = {
  title: "What we do",
  description:
    "The Nayokan ecosystem: the Vocational Training Institute, the Startup Centre, Venture Capital and Hospitality, and the six-stage system that connects them.",
  alternates: canonical("/what-we-do"),
};

// What We Do is the ecosystem gateway. The corporate navigation never links
// to VTI or the Startup Centre directly: visitors meet each world here first,
// understand what it is, then choose to enter its dedicated site.

const STAGES = [
  { num: "01", title: "Capability", desc: "Practical skills, entrepreneurial capacity and applied knowledge: the base of any productive economy.", who: "VTI" },
  { num: "02", title: "Production", desc: "Clusters and small enterprises that turn capability into organised, productive activity.", who: "VTI · Startup Centre" },
  { num: "03", title: "Markets", desc: "Access to customers, distribution and demand, locally and beyond, including hosting visitors and partners.", who: "Startup Centre · Hospitality" },
  { num: "04", title: "Innovation", desc: "Ideas and research moved through validation into commercial products with real market traction.", who: "Startup Centre" },
  { num: "05", title: "Capital", desc: "Patient, ecosystem-aligned capital for ventures with productive potential.", who: "Venture Capital" },
  { num: "06", title: "Productive Assets", desc: "Long-term physical and operational assets, such as hospitality, that generate lasting value.", who: "Hospitality" },
];

// Main image per world, plus a documentary inset where genuine photography exists.
const WORLD_MEDIA: Record<WorldEntry["world"], { main: ImageSlotId; inset?: ImageSlotId }> = {
  vti: { main: "programme-vti", inset: "world-vti" },
  startup: { main: "world-startup" },
  venture_capital: { main: "world-vc" },
  hospitality: { main: "world-hospitality" },
};

// Audience routes: who should go where. Destinations only; no claims.
const ROUTES = [
  { who: "Young people and workers seeking practical skills", where: "Vocational Training Institute", href: siteUrl("vti", "/programmes"), world: "vti" as const },
  { who: "University researchers, students and innovators", where: "Startup Centre", href: siteUrl("startup", "/programme"), world: "startup" as const },
  { who: "Founders building productive enterprises", where: "Venture Capital", href: "/venture-capital/partner" },
  { who: "Institutions, funders and corporate partners", where: "Partner with Nayokan", href: "/partners" },
  { who: "Guests, visiting partners and delegations", where: "Hospitality", href: "/hospitality/properties" },
];

export default function WhatWeDo() {
  return (
    <>
      {/* HERO */}
      <section className="wwd-hero">
        <div className="wwd-hero-inner">
          <div>
            <div className="ed-hero-crumbs">
              <a href="/">Nayokan</a>
              <span aria-hidden="true">/</span>
              <span className="current">What we do</span>
            </div>
            <h1 className="ed-hero-title">
              Four worlds.
              <br />
              <em>One productive</em> ecosystem.
            </h1>
            <p className="ed-hero-lede">
              Nayokan is one institution working across the whole chain: it builds skills, turns them
              into production, connects enterprises to markets and innovation, mobilises capital and
              builds lasting productive assets. Four worlds carry that work, and each one hands on
              to the next.
            </p>
          </div>
          <nav className="wwd-index" aria-label="The four worlds on this page">
            <span className="wwd-index-label">On this page</span>
            <ol>
              {WORLDS_DIRECTORY.map((w) => (
                <li key={w.world}>
                  <a href={`#${w.anchor}`}>
                    <span className="wwd-index-num">{w.num}</span>
                    <span className="wwd-index-name">{w.name}</span>
                    <span className="wwd-index-dest">{w.positioning}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      {/* THE NAYOKAN SYSTEM */}
      <section className="wwd-system" aria-labelledby="wwd-system-title">
        <div className="wrap">
          <header className="wwd-system-head">
            <h2 id="wwd-system-title">
              Capability <span aria-hidden="true">→</span> Production <span aria-hidden="true">→</span> Markets{" "}
              <span aria-hidden="true">→</span> Innovation <span aria-hidden="true">→</span> Capital{" "}
              <span aria-hidden="true">→</span> <em>Productive Assets.</em>
            </h2>
            <p>
              The pathway is linear on paper and cyclical in practice. Each stage feeds the next, and
              productive assets close the loop by resourcing further capability. Every world works at
              one or more of these stages.
            </p>
          </header>
          <ol className="wwd-stages">
            {STAGES.map((s) => (
              <li key={s.num} className="wwd-stage">
                <span className="wwd-stage-num">{s.num}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="wwd-stage-who">{s.who}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* THE FOUR WORLDS */}
      <section className="wwd-worlds-intro" aria-labelledby="wwd-worlds-title">
        <div className="wrap">
          <SectionHeader
            num="§ 02 — The four worlds"
            title={<span id="wwd-worlds-title">What each world is, and where it leads.</span>}
            lead="VTI and the Startup Centre each have their own dedicated Nayokan site. Venture Capital and Hospitality are part of nayokan.org. All four share one institution and one system."
          />
        </div>
      </section>
      {WORLDS_DIRECTORY.map((w, i) => (
        <WorldSection key={w.world} world={w} flip={i % 2 === 1} />
      ))}

      {/* AUDIENCE ROUTES */}
      <section className="ed-band">
        <div className="wrap">
          <div className="ed-band-inner">
            <div>
              <h2>Find the part of Nayokan that is for you.</h2>
            </div>
            <ul className="wwd-routes">
              {ROUTES.map((r) => (
                <li key={r.where}>
                  <a href={r.href} data-world-transition={r.world}>
                    <span className="wwd-routes-who">{r.who}</span>
                    <span className="wwd-routes-where">
                      {r.where} <span aria-hidden="true">{r.world ? "↗" : "→"}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBand
        sec="§ 04 — Enter the system"
        title={
          <>
            One institution.
            <br />
            <em>Many ways in.</em>
          </>
        }
        lede="Students, innovators, entrepreneurs, investors, universities and partners: every audience has a route into the ecosystem."
        primary={{ label: "Explore programmes", href: "/programmes" }}
        secondary={{ label: "Contact us", href: "/contact" }}
      />
    </>
  );
}

function WorldSection({ world: w, flip }: { world: WorldEntry; flip: boolean }) {
  const media = WORLD_MEDIA[w.world];
  const titleId = `wwd-${w.anchor}-title`;
  return (
    <section id={w.anchor} className={`wwd-world wwd-world--${w.tone}${flip ? " is-flipped" : ""}`} aria-labelledby={titleId}>
      <div className="wrap wwd-world-grid">
        <div className="wwd-world-media reveal">
          <div className="wwd-world-frame">
            <MediaSlot slot={media.main} fill variant="compact" tone={w.tone === "green" ? "green" : "dark"} sizes="(max-width: 899px) 100vw, 55vw" />
            <span className="wwd-world-num" aria-hidden="true">
              {w.num}
            </span>
          </div>
          {media.inset && (
            <div className="wwd-world-inset">
              <MediaSlot slot={media.inset} ratio="4:3" variant="compact" caption sizes="(max-width: 899px) 60vw, 22vw" />
            </div>
          )}
        </div>

        <div className="wwd-world-body">
          <span className="wwd-world-eyebrow">
            {w.num} — {w.name}
          </span>
          <h3 id={titleId} className="wwd-world-title">
            {w.positioning}
          </h3>
          <p className="wwd-world-lede">{w.whatItIs}</p>

          <dl className="wwd-world-facts">
            <div>
              <dt>Why it exists</dt>
              <dd>{w.why}</dd>
            </div>
            <div>
              <dt>Who it serves</dt>
              <dd>{w.audience}</dd>
            </div>
            <div>
              <dt>In the Nayokan System</dt>
              <dd>
                {w.systemFit}
                <span className="wwd-world-stages">{w.stages}</span>
              </dd>
            </div>
          </dl>

          <div className="wwd-world-offers">
            <span className="wwd-world-offers-label">What it offers</span>
            <ul>
              {w.offers.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>

          <div className="wwd-world-cta">
            <a
              href={worldHref(w)}
              className="btn btn-primary"
              data-world-transition={w.crossSite ? w.destination.site : undefined}
            >
              {w.cta}
              <span className="arrow" aria-hidden="true">
                {w.crossSite ? "↗" : "→"}
              </span>
            </a>
            <span className="wwd-world-dest">
              {w.crossSite ? `Opens the dedicated ${w.shortName} site · ${w.destination.label}` : `Continue on ${w.destination.label}`}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

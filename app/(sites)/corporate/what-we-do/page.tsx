import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { SectionHeader } from "@/ui/components/section-header";
import { CtaBand } from "@/ui/components/strips";
import { FourWorlds } from "@/ui/components/four-worlds";
import { WORLDS_DIRECTORY } from "@/platform/content/worlds";

export const metadata: Metadata = {
  title: "What we do",
  description:
    "Four worlds, one productive ecosystem: the Nayokan Vocational Training Institute, Startup Centre, Venture Capital and Hospitality, and the six-stage system that connects them.",
  alternates: canonical("/what-we-do"),
};

const STAGES = [
  { num: "01", title: "Build Capability", desc: "Practical skills, entrepreneurial capacity, applied knowledge. The base of any productive economy.", who: "VTI" },
  { num: "02", title: "Organize Production", desc: "Cluster formation, small-enterprise structuring, productive routines that convert capability into activity.", who: "VTI · Startup" },
  { num: "03", title: "Create Demand", desc: "Access to markets, customers, distribution — locally and beyond. Also: hosting visitors and partners.", who: "Startup · Hospitality" },
  { num: "04", title: "Commercialize Innovation", desc: "Move ideas, research and innovation through validation into commercial products with real market traction.", who: "Startup Centre" },
  { num: "05", title: "Mobilize Capital", desc: "Structured capital deployment into ventures with productive potential — via patient, ecosystem-aligned instruments.", who: "Venture Capital" },
  { num: "06", title: "Build Productive Assets", desc: "Long-term physical and operational assets — hospitality, infrastructure — that generate lasting economic value.", who: "Hospitality" },
];

// Audience routes: who should go where. Destinations only; no claims.
const ROUTES = [
  { who: "Young people and workers seeking practical skills", where: "Vocational Training Institute", href: siteUrl("vti", "/programmes"), crossSite: true },
  { who: "University researchers, students and innovators", where: "Startup Centre", href: siteUrl("startup", "/programme"), crossSite: true },
  { who: "Founders building productive enterprises", where: "Venture Capital", href: "/venture-capital/partner", crossSite: false },
  { who: "Institutions, funders and corporate partners", where: "Partner with Nayokan", href: "/partners", crossSite: false },
  { who: "Guests, visiting partners and delegations", where: "Hospitality", href: "/hospitality/properties", crossSite: false },
];

export default function WhatWeDo() {
  return (
    <>
      {/* HERO: the ecosystem directory opens here */}
      <section className="wwd-hero">
        <div className="wwd-hero-inner">
          <div>
            <div className="ed-hero-crumbs">
              <a href="/">Nayokan</a>
              <span aria-hidden="true">/</span>
              <span className="current">What we do</span>
            </div>
            <span className="ed-hero-eyebrow">§ What we do · Ecosystem directory</span>
            <h1 className="ed-hero-title">
              Four worlds.
              <br />
              <em>One productive</em> ecosystem.
            </h1>
            <p className="ed-hero-lede">
              Nayokan operates a connected productive system, from human capability to commercialized
              enterprise to productive assets. Each world has its own front door and operates at one or
              more stages along that system.
            </p>
          </div>
          <nav className="wwd-index" aria-label="Ecosystem index">
            <span className="wwd-index-label">Ecosystem index</span>
            <ol>
              {WORLDS_DIRECTORY.map((w) => (
                <li key={w.world}>
                  <a
                    href={w.crossSite ? siteUrl(w.destination.site, w.destination.path) : w.destination.path}
                    data-world-transition={w.crossSite ? w.destination.site : undefined}
                  >
                    <span className="wwd-index-num">{w.num}</span>
                    <span className="wwd-index-name">{w.name}</span>
                    <span className="wwd-index-dest">
                      {w.destination.label}
                      {w.crossSite ? " ↗" : ""}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      {/* THE FOUR WORLDS */}
      <section className="worlds-anchor wwd-worlds" aria-labelledby="wwd-worlds-title">
        <div className="wrap">
          <header className="section-header">
            <div>
              <span className="meta-num">§ 01 — The four worlds</span>
              <h2 id="wwd-worlds-title">Where each world begins, and where it leads.</h2>
            </div>
            <p className="lead">
              VTI and the Startup Centre are dedicated Nayokan sites. Venture Capital and Hospitality
              live here on nayokan.org. All four share one institution and one system.
            </p>
          </header>
          <FourWorlds variant="directory" />
        </div>
      </section>

      {/* ECO MAP */}
      <section className="eco-map">
        <div className="wrap">
          <SectionHeader
            num="§ 02 — The system"
            title="Capability → Production → Markets → Innovation → Capital → Assets."
            lead="The Nayokan pathway is deliberately linear on paper and cyclical in practice — each stage feeds the next, and productive assets close the loop by resourcing further capability."
          />
          <div className="eco-flow">
            {STAGES.map((s) => (
              <div className="eco-stage" key={s.num}>
                <span className="num">{s.num}</span>
                <h4>{s.title}</h4>
                <small>{s.who}</small>
              </div>
            ))}
          </div>
          <p className="meta" style={{ textAlign: "center", marginTop: 24 }}>
            Fig. 001 — the Nayokan productive system, working schematic
          </p>
        </div>
      </section>

      {/* STAGE DETAIL */}
      <section className="two-col bg-bone">
        <div className="two-col-inner">
          <aside className="two-col-side">
            <span className="meta">§ 03 — Reading the system</span>
            <h3>How the stages actually connect.</h3>
            <p>
              Every Nayokan programme is designed to feed forward. Below is a working reading of each
              stage and the division(s) that operate there.
            </p>
          </aside>
          <div className="two-col-body">
            <div className="feature-list" style={{ marginTop: 0 }}>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {STAGES.map((s, i) => (
                  <li
                    key={s.num}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px 1fr 140px",
                      gap: 20,
                      padding: "24px 0",
                      borderTop: "1px solid var(--line)",
                      borderBottom: i === STAGES.length - 1 ? "1px solid var(--line)" : undefined,
                      alignItems: "start",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.6rem", color: "var(--green-deep)", letterSpacing: "-0.03em" }}>
                      {s.num}
                    </span>
                    <div>
                      <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1.2rem", letterSpacing: "-0.015em", marginBottom: 6 }}>
                        {s.title}
                      </h4>
                      <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>{s.desc}</p>
                    </div>
                    <span className="meta" style={{ alignSelf: "center", textAlign: "right" }}>
                      {s.who}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AUDIENCE ROUTES */}
      <section className="ed-band">
        <div className="wrap">
          <div className="ed-band-inner">
            <div>
              <span className="meta-num">§ 04 — Routes in</span>
              <h2>Find the part of Nayokan that is for you.</h2>
            </div>
            <ul className="wwd-routes">
              {ROUTES.map((r) => (
                <li key={r.where}>
                  <a href={r.href} data-world-transition={r.crossSite ? (r.where.startsWith("Vocational") ? "vti" : "startup") : undefined}>
                    <span className="wwd-routes-who">{r.who}</span>
                    <span className="wwd-routes-where">
                      {r.where} <span aria-hidden="true">{r.crossSite ? "↗" : "→"}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBand
        sec="§ 05 — Enter the system"
        title={
          <>
            Find the part
            <br />
            relevant
            <br />
            <em>to you.</em>
          </>
        }
        lede="Students · innovators · entrepreneurs · investors · universities · partners. Every audience has a route into the ecosystem."
        primary={{ label: "Explore programmes", href: "/programmes" }}
        secondary={{ label: "Contact us", href: "/contact" }}
      />
    </>
  );
}

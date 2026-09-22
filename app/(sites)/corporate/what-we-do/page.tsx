import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { CorpHero } from "@/ui/components/heroes";
import { SectionHeader } from "@/ui/components/section-header";
import { CtaBand } from "@/ui/components/strips";

export const metadata: Metadata = {
  title: "What we do",
  description:
    "What Nayokan does — the six-stage productive system and the four divisions that operate along it.",
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

const DIVISIONS = [
  { num: "01", name: "Vocational Training Institute", desc: "Practical skills, certification, entrepreneurial clusters.", stages: "Stages 01–02", href: siteUrl("vti") },
  { num: "02", name: "Startup Centre", desc: "University innovation, commercialization, venture creation.", stages: "Stages 02–04", href: siteUrl("startup") },
  { num: "03", name: "Venture Capital", desc: "Structured capital for productive-sector ventures.", stages: "Stages 05–06", href: "/venture-capital" },
  { num: "04", name: "Hospitality", desc: "Guesthouses & productive assets — hospitality as infrastructure.", stages: "Stages 03 · 06", href: "/hospitality" },
];

export default function WhatWeDo() {
  return (
    <>
      <CorpHero
        sec="§ Ecosystem overview"
        crumbs={[{ label: "Nayokan", href: "/" }, { label: "What we do" }]}
        title={
          <>
            One system. <em>Six stages.</em>
            <br />
            Four operating worlds.
          </>
        }
        lede="Nayokan operates a connected productive system — from human capability to commercialized enterprise to productive assets. Each division operates at one or more stages along this system."
      />

      {/* ECO MAP */}
      <section className="eco-map">
        <div className="wrap">
          <SectionHeader
            num="§ 01 — The system"
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
            <span className="meta">§ 02 — Reading the system</span>
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

      {/* DIVISIONS MAP */}
      <section className="section" style={{ padding: "clamp(64px,10vw,128px) 0" }}>
        <div className="wrap">
          <SectionHeader
            num="§ 03 — The four worlds"
            title="Divisions that carry the system."
            lead="Each world has its own character but shares Nayokan's institutional standards. Click through to enter any division."
          />
          <div className="division-map">
            {DIVISIONS.map((d) => (
              <a key={d.num} href={d.href} className="division-cell">
                <span className="meta">World {d.num}</span>
                <h4>{d.name}</h4>
                <p>{d.desc}</p>
                <span className="division-stages">{d.stages}</span>
                <span className="arrow">→</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        sec="§ 04 — Enter the system"
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

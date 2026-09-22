import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { SubHero } from "@/ui/components/heroes";
import { Tbc } from "@/ui/components/tbc";

export const metadata: Metadata = {
  title: "Investment Approach",
  description:
    "Nayokan Venture Capital investment philosophy, sectors, stage focus and support model.",
  alternates: canonical("/venture-capital/approach"),
};

const PRINCIPLES = [
  {
    num: "01",
    title: "Productive capacity, not extraction.",
    desc: "Capital deployed into enterprises that build lasting productive capacity — not into speculation or extractive activity.",
  },
  {
    num: "02",
    title: "Ecosystem alignment.",
    desc: "Priority given to ventures graduating from Nayokan VTI and Startup Centre, or operating within our clusters.",
  },
  {
    num: "03",
    title: "Patient, structured capital.",
    desc: "Structured instruments matched to venture stage — revenue-based, convertible, equity — designed for productive-sector growth cycles.",
  },
];

const SECTORS = [
  "Agri-food & post-harvest",
  "Digital services & fintech",
  "Manufacturing & industrial",
  "Health & wellness",
  "Renewable energy",
  "Productive hospitality",
];

const SUPPORT = [
  { title: "Operating support", desc: "Access to Nayokan operators, tooling, and back-office capacity where useful." },
  { title: "Cluster + market access", desc: "Introductions across VTI clusters and Startup Centre partner networks." },
  { title: "Governance", desc: "Structured board and reporting cadence appropriate to venture stage." },
  { title: "Follow-on capital", desc: "Co-investor introductions and follow-on capital preparation on a rolling basis." },
];

const MONO = { fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--green-glow)", letterSpacing: "0.14em" } as const;
const H4 = { fontFamily: "var(--font-heading)", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--paper)" } as const;

export default function VcApproach() {
  return (
    <>
      <SubHero
        sec="§ Venture Capital · Investment Approach"
        refPath="/venture-capital/approach"
        crumbs={[
          { label: "Nayokan", href: "/" },
          { label: "Venture Capital", href: "/venture-capital" },
          { label: "Investment Approach" },
        ]}
        title={
          <>
            Long-term capital
            <br />
            for <em>productive</em> Cameroon.
          </>
        }
        lede="Nayokan Venture Capital deploys structured capital into enterprises with productive potential — sourced from within our ecosystem, aligned with development partners, and structured for the reality of African markets."
      />

      <section className="section" style={{ background: "var(--navy)", color: "var(--paper)" }}>
        <div className="wrap">
          <div className="spec-grid" style={{ alignItems: "start", marginBottom: 64 }}>
            <div className="spec-head">
              <span style={{ color: "var(--muted-invert)" }}>§ 01 — Investment philosophy</span>
              <h3 style={{ color: "var(--paper)" }}>
                Three principles.
                <br />
                Long horizons.
              </h3>
            </div>
            <div>
              <div style={{ borderTop: "1px solid var(--line-invert)" }}>
                {PRINCIPLES.map((p, i) => (
                  <div key={p.num} style={{ padding: "24px 0", borderBottom: i < PRINCIPLES.length - 1 ? "1px solid var(--line-invert)" : undefined }}>
                    <div style={MONO}>PRINCIPLE {p.num}</div>
                    <h4 style={{ ...H4, fontSize: "1.4rem", margin: "8px 0" }}>{p.title}</h4>
                    <p style={{ color: "var(--muted-invert)", fontSize: "1rem" }}>{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="spec-grid" style={{ alignItems: "start", marginBottom: 64 }}>
            <div className="spec-head">
              <span style={{ color: "var(--muted-invert)" }}>§ 02 — Sectors</span>
              <h3 style={{ color: "var(--paper)" }}>
                Where we
                <br />
                deploy capital.
              </h3>
            </div>
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--line-invert)", border: "1px solid var(--line-invert)" }}>
                {SECTORS.map((s, i) => (
                  <div key={s} style={{ background: "var(--navy-2)", padding: "32px 24px" }}>
                    <div style={{ ...MONO, fontSize: "0.7rem" }}>SECTOR {String(i + 1).padStart(2, "0")}</div>
                    <h4 style={{ ...H4, fontSize: "1.15rem", marginTop: 8 }}>{s}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="spec-grid" style={{ alignItems: "start", marginBottom: 64 }}>
            <div className="spec-head">
              <span style={{ color: "var(--muted-invert)" }}>§ 03 — Stage focus</span>
              <h3 style={{ color: "var(--paper)" }}>Seed to growth.</h3>
            </div>
            <div>
              <div style={{ border: "1px solid var(--line-invert)", background: "var(--navy-2)", padding: 32 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
                  {[
                    ["Stage focus", "Seed · Growth"],
                    ["Ticket range", "—"],
                    ["Instrument", "Flexible"],
                    ["Geography", "Cameroon · CEMAC"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <span className="meta" style={{ color: "var(--muted-invert)" }}>{k}</span>
                      <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.03em", color: "var(--paper)", marginTop: 6 }}>
                        {v}
                        {k === "Ticket range" && <Tbc onDark />}
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: 24, color: "var(--muted-invert)", fontSize: "0.92rem", lineHeight: 1.55, maxWidth: "64ch" }}>
                  Precise ticket ranges and instrument terms are agreed at term-sheet stage and vary
                  by venture. Published financial figures require partner and venture consent.
                </p>
              </div>
            </div>
          </div>

          <div className="spec-grid" style={{ alignItems: "start" }}>
            <div className="spec-head">
              <span style={{ color: "var(--muted-invert)" }}>§ 04 — Support model</span>
              <h3 style={{ color: "var(--paper)" }}>
                Capital
                <br />
                plus the ecosystem.
              </h3>
            </div>
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 24 }}>
                {SUPPORT.map((s, i) => (
                  <div key={s.title} style={{ padding: 24, border: "1px solid var(--line-invert)", background: "var(--navy-2)" }}>
                    <span className="meta" style={{ color: "var(--green-glow)" }}>Support {String(i + 1).padStart(2, "0")}</span>
                    <h4 style={{ ...H4, fontSize: "1.1rem", marginTop: 6 }}>{s.title}</h4>
                    <p style={{ color: "var(--muted-invert)", fontSize: "0.92rem" }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--ink)", color: "var(--paper)", padding: "56px 0" }}>
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <span className="meta on-dark">Related</span>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "2rem", letterSpacing: "-0.04em", lineHeight: 1, color: "var(--paper)", marginTop: 16 }}>
              Continue exploring
              <br />
              Nayokan VC.
            </h3>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/venture-capital/pipeline" className="btn btn-ghost on-dark">
              Pipeline <span className="arrow">→</span>
            </a>
            <a href="/venture-capital/portfolio" className="btn btn-ghost on-dark">
              Portfolio <span className="arrow">→</span>
            </a>
            <a href="/venture-capital/partner" className="btn btn-accent">
              Partnership enquiry <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

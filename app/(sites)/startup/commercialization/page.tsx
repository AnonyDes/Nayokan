import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { SubHero } from "@/ui/components/heroes";

export const metadata: Metadata = {
  title: "Commercialization Pathway",
  description:
    "How the Startup Centre moves an idea from validation through revenue and into scale — connected end-to-end to the Nayokan System.",
  alternates: canonical("/commercialization"),
};

const STAGES = [
  { num: "STAGE 01", title: "Idea", desc: "Original insight or research output — from universities, innovators or corporate spinouts." },
  { num: "STAGE 02", title: "Validation", desc: "Market and technical validation. Pilot customers. First evidence of demand." },
  { num: "STAGE 03", title: "Product", desc: "Buildable product designed against pilot feedback. Working operational unit." },
  { num: "STAGE 04", title: "Market", desc: "Structured go-to-market. Distribution partners. First recurring customers." },
  { num: "STAGE 05", title: "Revenue", desc: "Sustainable revenue. Unit economics validated. Ready for capital." },
  { num: "STAGE 06", title: "Scale", desc: "Growth capital deployed. Handover to Nayokan VC or strategic partners." },
];

const SYSTEM_LINKS = [
  { num: "01 · Capability", desc: "VTI graduates enter the pathway as founders, hires or co-founders." },
  { num: "02 · Production", desc: "Clusters serve as operational partners and early customers." },
  { num: "03 · Markets", desc: "Startup Centre coordinates pilot markets with pre-vetted institutional partners." },
  { num: "04 · Innovation", desc: "The core function — de-risking research and turning it into ventures." },
  { num: "05 · Capital", desc: "Investment-ready ventures graduate into Nayokan VC or co-investor introductions." },
  { num: "06 · Assets", desc: "Hospitality assets host residencies, cohorts and long-stay founder support." },
];

const stageCell = (first: boolean, last: boolean) =>
  ({
    flex: 1,
    minWidth: 160,
    padding: "24px 20px",
    background: first ? "var(--paper)" : "transparent",
    position: "relative",
    borderRight: last ? undefined : "1px dashed rgba(10,10,10,0.2)",
  }) as const;

const stageNum = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.7rem",
  color: "var(--green-deep)",
  letterSpacing: "0.16em",
} as const;

const stageTitle = {
  fontFamily: "var(--font-heading)",
  fontWeight: 800,
  fontSize: "1.6rem",
  letterSpacing: "-0.03em",
  lineHeight: 1,
  marginTop: 12,
} as const;

const stageDesc = {
  color: "var(--muted)",
  fontSize: "0.82rem",
  marginTop: 12,
  lineHeight: 1.45,
} as const;

export default function Commercialization() {
  return (
    <>
      <SubHero
        sec="§ Startup Centre · Commercialization"
        refPath="/startup-centre/commercialization"
        crumbs={[
          { label: "Nayokan", href: siteUrl("corporate", "/") },
          { label: "Startup Centre", href: "/" },
          { label: "Commercialization Pathway" },
        ]}
        title={
          <>
            Idea to <em>revenue</em>.<br />A working pathway.
          </>
        }
        lede="The commercialization pathway describes how the Startup Centre moves an idea from validation through revenue and into scale — connected end-to-end to the Nayokan System."
      />

      <section className="section">
        <div className="wrap">
          {/* Framework strip */}
          <div
            style={{
              padding: "56px 40px",
              border: "1px solid var(--line)",
              background: "var(--bone)",
              marginBottom: 64,
            }}
          >
            <div style={{ display: "flex", gap: 0, alignItems: "stretch", overflowX: "auto", paddingBottom: 8 }}>
              {STAGES.map((s, i) => (
                <div key={s.num} style={stageCell(i === 0, i === STAGES.length - 1)}>
                  <div style={stageNum}>{s.num}</div>
                  <h3 style={stageTitle}>{s.title}</h3>
                  <p style={stageDesc}>{s.desc}</p>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 24,
                paddingTop: 24,
                borderTop: "1px solid var(--line)",
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              <span>Nayokan Commercialization Framework · v1.0</span>
              <span>Time horizon · 12–36 months · venture-dependent</span>
            </div>
          </div>

          {/* System connections */}
          <div className="spec-grid" style={{ alignItems: "start", marginBottom: 64 }}>
            <div className="spec-head">
              <span>§ 01 — Connected to the Nayokan System</span>
              <h3>
                Where the pathway
                <br />
                meets each of the
                <br />
                six stages.
              </h3>
            </div>
            <div>
              {SYSTEM_LINKS.map((s) => (
                <div
                  key={s.num}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "200px 1fr",
                    gap: 32,
                    padding: "20px 0",
                    borderTop: "1px solid var(--line)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      letterSpacing: "0.14em",
                      color: "var(--green-deep)",
                      textTransform: "uppercase",
                    }}
                  >
                    {s.num}
                  </span>
                  <p style={{ color: "var(--muted)", fontSize: "0.98rem", lineHeight: 1.55 }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Enter CTA */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
              padding: "32px 0",
              borderTop: "1px solid var(--line)",
            }}
          >
            <div>
              <span className="meta">Have a venture?</span>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  fontSize: "1.35rem",
                  letterSpacing: "-0.02em",
                  marginTop: 8,
                }}
              >
                Enter the pathway.
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/apply" className="btn btn-primary">
                Apply as innovator <span className="arrow">→</span>
              </a>
              <a href="/programme" className="btn btn-ghost">
                Programme details
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

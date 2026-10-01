import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { SubHero } from "@/ui/components/heroes";

export const metadata: Metadata = {
  title: "Venture Pipeline",
  description:
    "How Nayokan VC moves ventures from ecosystem sourcing to portfolio support — six stages, honest gates.",
  alternates: canonical("/venture-capital/pipeline"),
};

const STAGES = [
  { title: "Sourcing", desc: "Ecosystem sourcing from Nayokan VTI, Startup Centre and partner networks. Some external inbound.", tag: "Filter: alignment" },
  { title: "Screening", desc: "Structured initial screen against Nayokan investment principles.", tag: "Filter: alignment + team + market" },
  { title: "Validation", desc: "Deep-dive validation of market, technology and unit economics.", tag: "Filter: evidence of demand" },
  { title: "Investment Readiness", desc: "Financials, cap table, governance and legal preparation with venture team.", tag: "Filter: institutional-grade readiness" },
  { title: "Capital", desc: "Term sheet, due diligence, close, capital deployed.", tag: "Filter: term-sheet fit" },
  { title: "Portfolio Support", desc: "Board seat where appropriate. Follow-on capital preparation. Ecosystem support.", tag: "Ongoing" },
];

// What the public pipeline discloses, and when. Governance, not figures.
const DISCLOSURE = [
  ["Venture names", "With each venture's consent"],
  ["Stage and sector", "Once a venture is named"],
  ["Ticket sizes", "At close, with investor and venture consent"],
  ["Pipeline figures", "Once verified"],
];

export default function VcPipeline() {
  return (
    <>
      <SubHero
        sec="§ Venture Capital · Pipeline"
        crumbs={[
          { label: "Nayokan", href: "/" },
          { label: "Venture Capital", href: "/venture-capital" },
          { label: "Venture Pipeline" },
        ]}
        title={
          <>
            A working <em>pipeline</em>. No fake numbers.
          </>
        }
        lede="How Nayokan VC moves ventures from ecosystem sourcing to portfolio support — six stages, honest gates."
      />

      <section className="section">
        <div className="wrap">
          <div style={{ marginBottom: 48 }}>
            <div className="stage-rail">
              {STAGES.map((s, i) => (
                <div className="rail-step" key={s.title}>
                  <span className="rs-num">STAGE {String(i + 1).padStart(2, "0")}</span>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                  <span className="rs-tag">{s.tag}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sub-2col-grid-responsive" style={{ paddingTop: 32, borderTop: "1px solid var(--line)" }}>
            <div>
              <span className="meta">Governance</span>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.4rem", letterSpacing: "-0.02em", lineHeight: 1.1, marginTop: 12 }}>
                Pipeline is a{" "}
                <em style={{ fontStyle: "italic", fontWeight: 500, color: "var(--green-deep)" }}>
                  working view
                </em>
                , not a public deal board.
              </h3>
              <p style={{ color: "var(--muted)", marginTop: 12, fontSize: "0.95rem", lineHeight: 1.55 }}>
                Only ventures that have consented to disclosure appear publicly by name. Others are
                represented by an internal reference only. Financial detail is never published
                pre-close.
              </p>
            </div>
            <div>
              <div style={{ background: "var(--bone)", padding: "clamp(20px, 4vw, 32px)", border: "1px solid var(--line)" }}>
                <span className="meta">What we publish, and when</span>
                <dl className="vc-disclosure">
                  {DISCLOSURE.map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--ink)", color: "var(--paper)", padding: "56px 0" }}>
        <div className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div>
            <span className="meta on-dark">Continue</span>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.8rem", letterSpacing: "-0.03em", lineHeight: 1, color: "var(--paper)", marginTop: 12 }}>
              Portfolio or partnership enquiry.
            </h3>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/venture-capital/portfolio" className="btn btn-ghost on-dark">
              Portfolio <span className="arrow">→</span>
            </a>
            <a href="/venture-capital/partner" className="btn btn-accent">
              Partner with VC <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

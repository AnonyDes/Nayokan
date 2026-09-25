import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { SubHero } from "@/ui/components/heroes";
import { Tbc } from "@/ui/components/tbc";

export const metadata: Metadata = {
  title: "Programme",
  description:
    "The Startup Centre programme takes validated ideas and research through a six-month, six-milestone commercialization pathway — mentored, milestone-driven, market-tested.",
  alternates: canonical("/programme"),
};

const COHORTS = [
  { tag: "Cohort A", title: "Research-stage teams", desc: "University research groups with a validated technical concept ready to move toward a commercial product." },
  { tag: "Cohort B", title: "Early-stage ventures", desc: "Existing ventures with a working prototype and initial customer traction, seeking structured commercialization." },
  { tag: "Cohort C", title: "Corporate innovators", desc: "Innovation teams inside Cameroonian corporates commercialising internal projects into standalone ventures." },
  { tag: "Cohort D", title: "Independent innovators", desc: "Solo founders or small teams outside university and corporate structures with productive-sector ideas." },
];

const MILESTONES = [
  { num: "M1 · Week 1", title: "Onboarding", desc: "Venture mapped onto the Nayokan commercialization framework. Milestones agreed.", tag: "Mentor pairing" },
  { num: "M2 · Week 4", title: "Model & economics", desc: "Business model designed, unit economics validated, venture architecture defined.", tag: "Model design" },
  { num: "M3 · Week 10", title: "Market pilots", desc: "First customer pilots or letters of intent secured. Technical feasibility confirmed.", tag: "Pilots" },
  { num: "M4 · Week 16", title: "Product & distribution", desc: "Product build against pilot feedback. Distribution partners engaged.", tag: "Product" },
  { num: "M5 · Week 22", title: "Investment readiness", desc: "Financials, cap table, governance and data room prepared for capital conversations.", tag: "Readiness" },
  { num: "M6 · Week 26", title: "Handover", desc: "Venture moves into Nayokan VC pipeline or continues as Startup Centre alumni.", tag: "→ VC · Alumni" },
];

const SUPPORT = [
  { num: "01", title: "Mentorship", desc: "Weekly 1:1 with a paired mentor. Group critique sessions with cohort peers." },
  { num: "02", title: "Framework & tooling", desc: "Access to the Nayokan commercialization framework, templates, and back-office tooling." },
  { num: "03", title: "Market validation", desc: "Structured pilot programme with pre-vetted enterprise and public-sector customers." },
  { num: "04", title: "Legal & governance", desc: "Corporate structuring support, IP framework, and governance templates." },
  { num: "05", title: "Capital pathway", desc: "Priority access to Nayokan VC and co-investor introductions on programme completion." },
  { num: "06", title: "Ecosystem access", desc: "Introductions across VTI clusters, hospitality assets and institutional partners." },
];

const INTAKE_FACTS = [
  { label: "Cohort size", value: "10–12 ventures" },
  { label: "Duration", value: "26 weeks" },
  { label: "Format", value: "Hybrid · Yaoundé" },
];

const specCell = {
  background: "var(--paper)",
  padding: "28px 24px",
} as const;

const specNum = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.72rem",
  color: "var(--green-deep)",
  letterSpacing: "0.14em",
} as const;

const specTitle = {
  fontFamily: "var(--font-heading)",
  fontWeight: 700,
  fontSize: "1.05rem",
  letterSpacing: "-0.015em",
  margin: "8px 0",
} as const;

const specDesc = { color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.55 } as const;

export default function StartupProgramme() {
  return (
    <>
      <SubHero
        sec="§ Startup Centre · Programme"
        refPath="/startup-centre/programme"
        crumbs={[
          { label: "Nayokan", href: siteUrl("corporate", "/") },
          { label: "Startup Centre", href: "/" },
          { label: "Programme" },
        ]}
        title={
          <>
            A structured <em>commercialization</em> programme.
          </>
        }
        lede="The Startup Centre programme takes validated ideas and research through a six-month, six-milestone commercialization pathway — mentored, milestone-driven, market-tested."
      />

      <section className="section">
        <div className="wrap">
          {/* Who */}
          <div className="spec-grid" style={{ alignItems: "start", marginBottom: 64 }}>
            <div className="spec-head">
              <span>§ 01 — Who it is for</span>
              <h3>
                Ventures, researchers,
                <br />
                university teams.
              </h3>
            </div>
            <div className="sub-2col-grid">
              {COHORTS.map((c) => (
                <div className="deliver-card" key={c.tag}>
                  <span className="meta">{c.tag}</span>
                  <h4>{c.title}</h4>
                  <p style={{ color: "var(--muted)", fontSize: "0.92rem" }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="spec-grid" style={{ alignItems: "start", marginBottom: 64 }}>
            <div className="spec-head">
              <span>§ 02 — Programme stages</span>
              <h3>
                Six months.
                <br />
                Six milestones.
              </h3>
              <p>
                Each cohort progresses through six milestone reviews. Ventures that meet the
                milestone continue; ventures that do not are held back or exited with a clear
                improvement plan.
              </p>
            </div>
            <div>
              <div className="stage-rail">
                {MILESTONES.map((m) => (
                  <div className="rail-step" key={m.num}>
                    <span className="rs-num">{m.num}</span>
                    <h4>{m.title}</h4>
                    <p>{m.desc}</p>
                    <span className="rs-tag">{m.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="spec-grid" style={{ alignItems: "start", marginBottom: 64 }}>
            <div className="spec-head">
              <span>§ 03 — Support provided</span>
              <h3>
                What the
                <br />
                Startup Centre provides.
              </h3>
            </div>
            <div
              className="sub-2col-grid"
              style={{
                gap: 1,
                background: "var(--line)",
                border: "1px solid var(--line)",
              }}
            >
              {SUPPORT.map((s) => (
                <div style={specCell} key={s.num}>
                  <div style={specNum}>{s.num}</div>
                  <h4 style={specTitle}>{s.title}</h4>
                  <p style={specDesc}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Next intake CTA */}
          <div
            className="sub-split-card"
            style={{
              background: "var(--ink)",
              color: "var(--paper)",
              alignItems: "center",
            }}
          >
            <div>
              <span className="meta on-dark">§ 04 — Next intake</span>
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: "clamp(2rem,3.4vw,3rem)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  color: "var(--paper)",
                  marginTop: 16,
                }}
              >
                Apply for the next
                <br />
                <em style={{ fontStyle: "italic", fontWeight: 500, color: "var(--green)" }}>
                  cohort
                </em>
                .
              </h2>
            </div>
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px 32px",
                  paddingBottom: 24,
                  borderBottom: "1px solid var(--line-invert)",
                  marginBottom: 24,
                }}
              >
                {INTAKE_FACTS.map((f) => (
                  <div key={f.label}>
                    <span className="meta on-dark">{f.label}</span>
                    <div
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 700,
                        fontSize: "1.4rem",
                        letterSpacing: "-0.02em",
                        marginTop: 6,
                        color: "var(--paper)",
                      }}
                    >
                      {f.value}
                    </div>
                  </div>
                ))}
                <div>
                  <span className="meta on-dark">Next intake</span>
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: "1.4rem",
                      letterSpacing: "-0.02em",
                      marginTop: 6,
                      color: "var(--paper)",
                    }}
                  >
                    —<Tbc onDark>date tbc</Tbc>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="/apply" className="btn btn-accent">
                  Apply as innovator <span className="arrow">→</span>
                </a>
                <a href="/commercialization" className="btn btn-ghost on-dark">
                  See the pathway
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

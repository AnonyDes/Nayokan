import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { EditorialHero } from "@/ui/components/editorial-hero";
import { MediaSlot } from "@/ui/components/media-slot";

export const metadata: Metadata = {
  title: "Programme",
  description:
    "The Startup Centre programme takes validated ideas and research through a six-month, six-milestone commercialization pathway — mentored, milestone-driven, market-tested.",
  alternates: canonical("/programme"),
};

const COHORTS = [
  {
    letter: "A",
    tag: "Cohort A",
    track: "Academic R&D",
    lead: "Research-stage",
    sub: "teams",
    desc: "University research groups with a validated technical concept or patent, moving from proof-of-concept toward an engineered, commercial product.",
    pills: ["TRL 4–6", "IP Framework", "Lab Prototypes"],
    status: "Open for Proposals",
  },
  {
    letter: "B",
    tag: "Cohort B",
    track: "Pilot Startups",
    lead: "Early-stage",
    sub: "ventures",
    desc: "Existing ventures with a working prototype and initial customer traction, seeking structured commercialization, unit economics and scale.",
    pills: ["MVP Built", "First Revenue", "Commercial Pathway"],
    status: "Rolling Selection",
  },
  {
    letter: "C",
    tag: "Cohort C",
    track: "Corporate R&D",
    lead: "Corporate",
    sub: "innovators",
    desc: "Innovation teams inside Cameroonian corporates and institutions commercialising internal R&D projects into standalone, agile ventures.",
    pills: ["Industry Backed", "Spin-Off Model", "Market Channel"],
    status: "Partner Review",
  },
  {
    letter: "D",
    tag: "Cohort D",
    track: "Field Inventors",
    lead: "Independent",
    sub: "innovators",
    desc: "Solo founders and technical builders outside university and corporate structures developing high-impact productive solutions for Cameroon.",
    pills: ["Field Proven", "Local Market Fit", "Direct Mentorship"],
    status: "Open Intake",
  },
];

const MILESTONES = [
  {
    num: "M01",
    month: "Month 01",
    track: "Mentor Pairing",
    lead: "Onboarding",
    sub: "& Commercial Charter",
    desc: "Venture mapped onto the Nayokan commercialization framework. Operating budget, KPIs, and dedicated mentor pairings established. Intellectual property protocol and capitalization charter formalized.",
    deliverables: [
      "Commercialization Roadmap & KPI Architecture",
      "Lead Mentor & Industry Advisor Pairing",
      "IP & Governance Baseline Protocol",
    ],
    review: "Director & Lead Mentor Sign-Off",
    unlock: "Unlocks Sprint 02 Capital & Lab Access",
    isFinal: false,
  },
  {
    num: "M02",
    month: "Month 02",
    track: "Model Design",
    lead: "Model",
    sub: "& Unit Economics",
    desc: "Business model design, pricing architecture, and cost waterfall validated. Unit economics (CAC, LTV, gross margin) tested against Cameroonian and CEMAC market realities.",
    deliverables: [
      "Dynamic 3-Year Financial & Unit Economics Model",
      "Pricing Thesis & Target Margin Structure",
      "Operational Venture Architecture",
    ],
    review: "Financial & Unit Economics Gate",
    unlock: "Unlocks Pilot Budget & Testing Facilities",
    isFinal: false,
  },
  {
    num: "M03",
    month: "Month 03",
    track: "Field Validation",
    lead: "Market Pilots",
    sub: "& Commercial LoIs",
    desc: "First customer pilots and binding letters of intent secured. Technical prototypes tested in live field environments with corporate, agricultural, or industrial partners.",
    deliverables: [
      "Minimum 2 Live Operational Pilots",
      "Binding Commercial Letters of Intent (LoI)",
      "Field Feasibility & Usage Telemetry",
    ],
    review: "Partner & Customer Validation Review",
    unlock: "Unlocks Production Engineering Allocation",
    isFinal: false,
  },
  {
    num: "M04",
    month: "Month 04",
    track: "Product Engine",
    lead: "Product Build",
    sub: "& Distribution Channels",
    desc: "Engineering build iterated against real-world pilot telemetry. Supply chain, local manufacturing, and strategic distribution channel partnerships engaged.",
    deliverables: [
      "Commercial-Grade v1.0 Production Architecture",
      "Distribution & Supply Chain Partner MOUs",
      "Regulatory & Compliance Clearances",
    ],
    review: "Engineering & GTM Readiness Review",
    unlock: "Unlocks Investment Structuring Sprint",
    isFinal: false,
  },
  {
    num: "M05",
    month: "Month 05",
    track: "Due Diligence",
    lead: "Investment",
    sub: "Readiness & Data Room",
    desc: "Audited financial statements, cap table model, corporate structuring, and institutional data room prepared for rigorous venture capital due diligence.",
    deliverables: [
      "Fully Populated Institutional Data Room",
      "Clean Cap Table & Equity Allocation Model",
      "Board Governance Charter & Legal Structuring",
    ],
    review: "Nayokan Investment Committee Pre-Screen",
    unlock: "Fast-Tracks to Term Sheet Review",
    isFinal: false,
  },
  {
    num: "M06",
    month: "Month 06",
    track: "→ VC Fund",
    lead: "Handover",
    sub: "to Nayokan VC Fund",
    desc: "Venture completes commercialization and transitions directly into the Nayokan VC pipeline for term sheet evaluation, or graduates into the active Nayokan Alumni Syndicate.",
    deliverables: [
      "Direct Term Sheet & Investment Committee Presentation",
      "Syndicated Co-Investor Introductions",
      "Ongoing Portfolio Operations & Advisory Support",
    ],
    review: "Final Investment Committee Handover",
    unlock: "Direct Venture Capital Equity Financing",
    isFinal: true,
  },
];

function PillarIcon({ name }: { name: string }) {
  if (name === "mentorship") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (name === "framework") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    );
  }
  if (name === "validation") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="22" y1="12" x2="18" y2="12" />
        <line x1="6" y1="12" x2="2" y2="12" />
        <line x1="12" y1="6" x2="12" y2="2" />
        <line x1="12" y1="22" x2="12" y2="18" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  if (name === "governance") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    );
  }
  if (name === "capital") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="8" height="8" rx="1" />
      <rect x="14" y="2" width="8" height="8" rx="1" />
      <rect x="14" y="14" width="8" height="8" rx="1" />
      <rect x="2" y="14" width="8" height="8" rx="1" />
      <path d="M6 10v4" />
      <path d="M18 10v4" />
      <path d="M10 6h4" />
      <path d="M10 18h4" />
    </svg>
  );
}

const SUPPORT_PILLARS = [
  {
    num: "01",
    tag: "Advisory & Operators",
    lead: "Mentorship",
    sub: "& Domain Leadership",
    badge: "1:1 Weekly Cadence",
    desc: "Paired with senior venture operators, industrial veterans, and scientific mentors. Bi-weekly structured cohort critique, milestone retrospectives, and technical advisory sessions.",
    pills: ["Dedicated Lead Mentor", "Milestone Retrospectives", "Technical Advisory Pool"],
    icon: "mentorship",
    highlight: false,
  },
  {
    num: "02",
    tag: "Proprietary Stack",
    lead: "Commercialization",
    sub: "Stack & Tooling",
    badge: "Operating Stack v2.4",
    desc: "Direct access to Nayokan's proprietary venture architecture suite, unit economics workbenches, pricing calculators, cap table modelers, and automated back-office frameworks.",
    pills: ["Unit Economics Engine", "Cap Table Modeler", "Sprint Operating Stack"],
    icon: "framework",
    highlight: false,
  },
  {
    num: "03",
    tag: "Field Validation",
    lead: "Market Validation",
    sub: "& Enterprise Pilots",
    badge: "Commercial LoI Pipeline",
    desc: "Facilitated customer discovery and field testing with enterprise partners, agro-industrial groups, and public institutions to secure binding letters of intent and live paid pilots.",
    pills: ["Enterprise Introductions", "Live Pilot Testbeds", "Commercial LoIs"],
    icon: "validation",
    highlight: false,
  },
  {
    num: "04",
    tag: "Institutional Shield",
    lead: "Corporate Governance",
    sub: "& IP Shield",
    badge: "OAPI & Entity Formation",
    desc: "Full institutional corporate structuring, founder capitalization charters, OAPI patent filing advisory, and institutional board governance templates ready for venture capital.",
    pills: ["OAPI Patent Advisory", "ESOP Structuring", "Board Governance Charter"],
    icon: "governance",
    highlight: false,
  },
  {
    num: "05",
    tag: "Investment Priority",
    lead: "Capital Pathway",
    sub: "to Nayokan VC Fund",
    badge: "Direct Fund Sourcing",
    desc: "Fast-track review by the Nayokan Venture Capital Investment Committee upon successful milestone completion, plus syndicated co-investor introductions across Africa and Europe.",
    pills: ["VC Investment Review", "Data Room Hosting", "Syndicate Introductions"],
    icon: "capital",
    highlight: true,
  },
  {
    num: "06",
    tag: "Shared Assets",
    lead: "Ecosystem Access",
    sub: "& Technical Labs",
    badge: "Yaoundé & Douala Hubs",
    desc: "Cross-ecosystem integration across Nayokan Vocational Training Institute (VTI) fabrication clusters, industrial test sites, and executive hospitality assets for founder meetings.",
    pills: ["VTI Prototyping Labs", "Executive Meeting Hubs", "Supplier Network Access"],
    icon: "ecosystem",
    highlight: false,
  },
];

// Confirmed-only intake facts. Cohort size and duration are published with
// each cohort once confirmed.
const INTAKE_FACTS = [
  { label: "Applications", value: "Open" },
  { label: "Location", value: "Yaoundé + partner sites" },
];

export default function StartupProgramme() {
  return (
    <>
      <EditorialHero
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
        facts={[
          { label: "Applications", value: "Open" },
          { label: "Location", value: "Yaoundé + partner sites" },
        ]}
        slot="startup-programme-hero"
        figure="Fig. — A founder presenting milestone progress to mentors"
      />

      {/* WHO THE PROGRAMME IS FOR */}
      <section className="cohorts-section">
        <div className="wrap">
          <div className="cohorts-layout">
            <div className="cohorts-sidebar">
              <span className="cohorts-kicker">
                <span className="cohorts-kicker-dot" />
                Target Profiles · Intake
              </span>
              <h2>
                Ventures, researchers,
                <br />
                university teams.
              </h2>
              <p>
                Four intake tracks configured for different starting points — from uncommercialised
                laboratory research to operational corporate spin-offs and grassroots innovators.
              </p>
              <div className="cohorts-meta-box">
                <div className="cohorts-meta-item">
                  <span className="lbl">PROGRAMME DURATION</span>
                  <span className="val">6 Months</span>
                </div>
                <div className="cohorts-meta-item">
                  <span className="lbl">MILESTONE REVIEWS</span>
                  <span className="val">6 Stages</span>
                </div>
                <div className="cohorts-meta-item">
                  <span className="lbl">CAPITAL PATHWAY</span>
                  <span className="val">Direct to Nayokan VC</span>
                </div>
              </div>
            </div>

            <div className="cohorts-grid">
              {COHORTS.map((c) => (
                <div className="cohort-card" key={c.tag}>
                  <div className="cohort-card-glow-bar" />
                  <span className="cohort-watermark" aria-hidden="true">{c.letter}</span>
                  <div className="cohort-card-header">
                    <span className="cohort-badge">
                      <span className="cohort-dot" />
                      {c.tag}
                    </span>
                    <span className="cohort-track">{c.track}</span>
                  </div>
                  <h3 className="cohort-title">
                    {c.lead} <em>{c.sub}</em>
                  </h3>
                  <p className="cohort-desc">{c.desc}</p>
                  <div className="cohort-pills">
                    {c.pills.map((p) => (
                      <span className="cohort-pill" key={p}>{p}</span>
                    ))}
                  </div>
                  <div className="cohort-card-footer">
                    <span>{c.status}</span>
                    <span className="arrow" aria-hidden="true">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MILESTONES PATHWAY ENGINE */}
      <section className="milestones-pathway-section">
        <div className="wrap">
          <div className="milestones-header">
            <span className="milestones-kicker">
              <span className="milestones-kicker-dot" />
              Rigorous Gating Protocol · Six Reviews
            </span>

            <div className="milestones-title-row">
              <h2 className="milestones-title">
                Six milestones.
                <br />
                One <em>uncompromising</em> pathway.
              </h2>
              <p className="milestones-lede">
                Each cohort progresses through six monthly milestone reviews. Passing a gate unlocks
                the next operational tier and capital sprint; ventures that fall behind receive an
                intensive remediation plan or are transitioned with an actionable roadmap.
              </p>
            </div>

            {/* Telemetry Ribbon */}
            <div className="milestones-telemetry">
              <div className="milestones-telemetry-item">
                <span className="lbl">PROGRAMME CADENCE</span>
                <span className="val">1 Milestone / Month</span>
              </div>
              <div className="milestones-telemetry-item">
                <span className="lbl">REVIEW BOARD</span>
                <span className="val">Mentors + Investment Committee</span>
              </div>
              <div className="milestones-telemetry-item">
                <span className="lbl">EVALUATION METRIC</span>
                <span className="val">Deliverables &amp; Field Data</span>
              </div>
              <div className="milestones-telemetry-item">
                <span className="lbl">TERMINAL OUTCOME</span>
                <span className="val">Direct Nayokan VC Term Sheet</span>
              </div>
            </div>

            {/* Linear Timeline Rail (Desktop) */}
            <div className="milestones-rail" aria-hidden="true">
              <div className="milestones-rail-track">
                <div className="milestones-rail-pulse" />
              </div>
              <div className="milestones-rail-nodes">
                {MILESTONES.map((m) => (
                  <div className={`milestones-rail-node${m.isFinal ? " final" : ""}`} key={m.num}>
                    <div className="milestones-rail-circle">
                      {m.isFinal ? "★" : m.num.replace("M", "")}
                    </div>
                    <span className="milestones-rail-label">{m.lead}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3x2 Milestone Cards Grid */}
          <div className="milestones-grid">
            {MILESTONES.map((m) => (
              <div
                className={`milestone-card${m.isFinal ? " milestone-card-final" : ""}`}
                key={m.num}
              >
                <div className="milestone-top-bar" />
                <div className="milestone-card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="milestone-num-badge">{m.num}</span>
                    <span className="milestone-month-tag">{m.month}</span>
                  </div>
                  <span className="milestone-track-tag">{m.track}</span>
                </div>

                <h3 className="milestone-card-title">
                  {m.lead} <em>{m.sub}</em>
                </h3>

                <p className="milestone-card-desc">{m.desc}</p>

                <div className="milestone-deliverables-box">
                  <span className="milestone-deliverables-title">Gate Deliverables</span>
                  <ul className="milestone-deliverables-list">
                    {m.deliverables.map((d) => (
                      <li key={d}>
                        <span className="check" aria-hidden="true">✓</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="milestone-gate-footer">
                  <div className="milestone-gate-row">
                    <span className="gate-lbl">Gate Review:</span>
                    <span className="gate-val">{m.review}</span>
                  </div>
                  <div className="milestone-unlock-row">
                    <span>{m.unlock}</span>
                    <span aria-hidden="true">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestone photography */}
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <div className="programme-photo-band">
            <MediaSlot slot="startup-commercialization" ratio="21:9" variant="compact" sizes="100vw" />
            <p className="programme-photo-cap">Fig. — A founder demonstrating a prototype to a first customer, mid-pathway</p>
          </div>
        </div>
      </section>

      {/* FOUNDER INFRASTRUCTURE / WHAT THE STARTUP CENTRE PROVIDES */}
      <section className="support-section">
        <div className="wrap">
          <div className="support-header">
            <span className="support-kicker">
              <span className="support-kicker-dot" />
              Founder Infrastructure · Value Stack
            </span>

            <div className="support-title-row">
              <h2 className="support-title">
                What the
                <br />
                Startup Centre <em>provides.</em>
              </h2>
              <p className="support-lede">
                Beyond equity capital: a comprehensive institutional scaffold engineered to eliminate operational friction, validate products with enterprise partners, and accelerate venture readiness.
              </p>
            </div>
          </div>

          <div className="support-grid">
            {SUPPORT_PILLARS.map((p) => (
              <div
                className={`support-card${p.highlight ? " support-card-highlight" : ""}`}
                key={p.num}
              >
                <div className="support-card-bar" />
                <div className="support-card-top">
                  <div className="support-card-num-box">
                    <div className="support-card-icon">
                      <PillarIcon name={p.icon} />
                    </div>
                    <span className="support-card-num">{p.num}</span>
                  </div>
                  <span className="support-card-tag">{p.tag}</span>
                </div>

                <span className="support-card-badge">
                  <span className="support-kicker-dot" style={{ width: 5, height: 5 }} />
                  {p.badge}
                </span>

                <h3 className="support-card-title">
                  {p.lead} <em>{p.sub}</em>
                </h3>

                <p className="support-card-desc">{p.desc}</p>

                <div className="support-card-pills">
                  {p.pills.map((pill) => (
                    <span className="support-card-pill" key={pill}>
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">

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
                className="sub-2col-grid-responsive"
                style={{
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

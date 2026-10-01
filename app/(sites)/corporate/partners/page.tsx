import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import { SubHero } from "@/ui/components/heroes";
import { onlyConfirmed } from "@/platform/content/governance";

export const metadata: Metadata = {
  title: "Partners",
  description:
    "Nayokan institutional partnerships — universities, ministries, development partners, corporates.",
  alternates: canonical("/partners"),
};

const REASONS = [
  {
    num: "01",
    title: "An operating system,",
    sub: "not a project",
    desc: "Nayokan connects training, enterprise, capital and productive assets into one working system — not a series of one-off programmes.",
    pills: ["Full-Stack System", "Unified Operations"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Ecosystem",
    sub: "alignment",
    desc: "Partnerships plug into our full stack — VTI, Startup Centre, VC and Hospitality — not just one division.",
    pills: ["4 Productive Worlds", "Cross-Disciplinary"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Institutional",
    sub: "standards",
    desc: "Transparent governance, structured reporting, and honest content practices. No exaggeration, no invented figures.",
    pills: ["Audit-Grade Standards", "Zero Invented Stats"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Cameroon-",
    sub: "rooted",
    desc: "Built in Yaoundé, for Cameroon and the CEMAC region — not imported wholesale from elsewhere.",
    pills: ["Yaoundé HQ", "CEMAC Regional Scope"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="10" r="3" />
        <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
      </svg>
    ),
  },
];

const WAYS = [
  { title: "Strategic partnership", desc: "Multi-year, multi-division collaboration." },
  { title: "Programme partnership", desc: "Co-delivery of a specific programme or cohort." },
  { title: "Capital partnership", desc: "Co-investment and follow-on capital arrangements." },
  { title: "Advisory partnership", desc: "Governance-level advisory relationships." },
];

const WALLS = [
  { num: "01", heading: "Universities & research", desc: "Academic and research institutions collaborating on commercialization pathways.", category: "university", approach: "Research commercialization with the Startup Centre, student innovation, and a shared framework for IP and revenue in resulting ventures." },
  { num: "02", heading: "Ministries & public sector", desc: "Ministries and public bodies supporting productive-sector development.", category: "government", approach: "Vocational standards and recognition for VTI programmes, enterprise policy, and alignment with national skills priorities." },
  { num: "03", heading: "Development partners", desc: "Development finance institutions, foundations and multilaterals.", category: "development", approach: "Programme co-design and funding across the four worlds, with reporting built on verified evidence." },
  { num: "04", heading: "Corporate & private sector", desc: "Corporates partnering on distribution, market access and co-investment.", category: "corporate", approach: "Industry placements for VTI graduates, market access for cluster enterprises, and co-investment alongside Nayokan VC." },
] as const;

export default async function Partners() {
  const repo = await getContentRepository();
  // Named partners appear only once a partnership is formally confirmed.
  const partners = onlyConfirmed(await repo.listPartners("corporate", "partners-wall"), "name");

  return (
    <>
      <SubHero
        sec="§ Corporate · Partners"
        crumbs={[{ label: "Nayokan", href: "/" }, { label: "Partners" }]}
        title={
          <>
            Institutional <em>partnerships</em> across four worlds.
          </>
        }
        lede="Nayokan is designed for long-term institutional partnership. Below: the kinds of partners we work with, why organisations collaborate with us, and how to begin a conversation."
      />

      <section className="section">
        <div className="wrap">
          <div className="spec-grid" style={{ alignItems: "start", paddingBottom: 48, borderBottom: "1px solid var(--line)", marginBottom: 24 }}>
            <div className="reasons-sidebar">
              <span className="reasons-kicker">
                <span className="reasons-kicker-dot" />
                Value Proposition
              </span>
              <h3 className="reasons-title">
                Four reasons
                <br />
                institutions choose
                <br />
                <em>Nayokan</em>.
              </h3>
              <p className="reasons-lead">
                Nayokan is structured for multi-year institutional collaboration, audited governance
                and systemic economic reach across Cameroon and the CEMAC region.
              </p>
              <div className="reasons-telemetry-box">
                <div className="reasons-telemetry-item">
                  <span className="lbl">INTEGRATED WORLDS</span>
                  <span className="val">04 Worlds</span>
                </div>
                <div className="reasons-telemetry-item">
                  <span className="lbl">REPORTING STANDARD</span>
                  <span className="val">Audited · Verified</span>
                </div>
                <div className="reasons-telemetry-item">
                  <span className="lbl">REGIONAL MANDATE</span>
                  <span className="val">Cameroon · CEMAC</span>
                </div>
              </div>
            </div>
            <div className="reasons-grid">
              {REASONS.map((r) => (
                <div className="reason-card" key={r.num}>
                  <div className="reason-card-glow-bar" />
                  <span className="reason-watermark" aria-hidden="true">{r.num}</span>
                  <div className="reason-card-header">
                    <span className="reason-badge">
                      <span className="reason-dot" />
                      REASON {r.num}
                    </span>
                    <div className="reason-icon-box">
                      {r.icon}
                    </div>
                  </div>
                  <h4 className="reason-title">
                    {r.title} <em>{r.sub}</em>
                  </h4>
                  <p className="reason-desc">{r.desc}</p>
                  <div className="reason-footer">
                    {r.pills.map((pill) => (
                      <span className="reason-pill" key={pill}>{pill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {WALLS.map((w) => (
            <div key={w.num} className="spec-grid" style={{ alignItems: "start", padding: "32px 0", borderTop: "1px solid var(--line)" }}>
              <div className="spec-head">
                <span>{w.num}</span>
                <h3>{w.heading}</h3>
                <p>{w.desc}</p>
              </div>
              <div>
                {partners.some((p) => p.category === w.category) ? (
                  <div className="partner-wall">
                    {partners
                      .filter((p) => p.category === w.category)
                      .map((p) => (
                        <div className="pw-cell" key={p.id}>
                          <span className="pw-tag">Partner</span>
                          <span className="pw-name">{p.name}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="partner-wall-note">{w.approach}</p>
                )}
              </div>
            </div>
          ))}

          <div className="spec-grid" style={{ alignItems: "start", padding: "32px 0", borderTop: "1px solid var(--line)" }}>
            <div className="spec-head">
              <h3>
                Four ways to
                <br />
                work with Nayokan.
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 0 }}>
              {WAYS.map((w, i) => (
                <div key={w.title} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: 20, padding: "20px 0", borderTop: "1px solid var(--line)", alignItems: "start" }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.3rem", color: "var(--green-deep)", letterSpacing: "-0.03em" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1.05rem", letterSpacing: "-0.015em" }}>{w.title}</div>
                    <p style={{ color: "var(--muted)", fontSize: "0.92rem", marginTop: 2 }}>{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--ink)", color: "var(--paper)", padding: "80px 0" }}>
        <div className="wrap cta-split-block">
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(2rem,3.2vw,3rem)", letterSpacing: "-0.04em", lineHeight: 1, color: "var(--paper)", marginTop: 16 }}>
              Begin a partnership
              <br />
              <em style={{ fontStyle: "italic", fontWeight: 500, color: "var(--green)" }}>conversation</em>.
            </h2>
          </div>
          <div>
            <p style={{ color: "var(--muted-invert)", fontSize: "1rem", lineHeight: 1.6, maxWidth: "48ch" }}>
              The best partnerships begin with a short written brief — mandate, scope, and any
              constraints we should design around.
            </p>
            <div style={{ marginTop: 24 }}>
              <a href="/contact?topic=partnership" className="btn btn-accent">
                Send a brief <span className="arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

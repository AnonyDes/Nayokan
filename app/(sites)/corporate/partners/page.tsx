import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import { SubHero } from "@/ui/components/heroes";

export const metadata: Metadata = {
  title: "Partners",
  description:
    "Nayokan institutional partnerships — universities, ministries, development partners, corporates.",
  alternates: canonical("/partners"),
};

const REASONS = [
  { num: "01", title: "An operating system, not a project", desc: "Nayokan connects training, enterprise, capital and productive assets into one working system — not a series of one-off programmes." },
  { num: "02", title: "Ecosystem alignment", desc: "Partnerships plug into our full stack — VTI, Startup Centre, VC and Hospitality — not just one division." },
  { num: "03", title: "Institutional standards", desc: "Transparent governance, structured reporting, and honest content practices. No exaggeration, no invented figures." },
  { num: "04", title: "Cameroon-rooted", desc: "Built in Yaoundé, for Cameroon and the CEMAC region — not imported wholesale from elsewhere." },
];

const WAYS = [
  { title: "Strategic partnership", desc: "Multi-year, multi-division collaboration." },
  { title: "Programme partnership", desc: "Co-delivery of a specific programme or cohort." },
  { title: "Capital partnership", desc: "Co-investment and follow-on capital arrangements." },
  { title: "Advisory partnership", desc: "Governance-level advisory relationships." },
];

const WALLS = [
  { num: "01", heading: "Universities & research", desc: "Academic and research institutions collaborating on commercialization pathways.", category: "university" },
  { num: "02", heading: "Ministries & public sector", desc: "Ministries and public bodies supporting productive-sector development.", category: "government" },
  { num: "03", heading: "Development partners", desc: "Development finance institutions, foundations and multilaterals.", category: "development" },
  { num: "04", heading: "Corporate & private sector", desc: "Corporates partnering on distribution, market access and co-investment.", category: "corporate" },
] as const;

export default async function Partners() {
  const repo = await getContentRepository();
  const partners = await repo.listPartners("corporate", "partners-wall");

  return (
    <>
      <SubHero
        sec="§ Corporate · Partners"
        refPath="/partners"
        crumbs={[{ label: "Nayokan", href: "/" }, { label: "Partners" }]}
        title={
          <>
            Institutional <em>partnerships</em> across four worlds.
          </>
        }
        lede="Nayokan is designed for long-term institutional partnership. Below: the categories of partners we work with, why organisations collaborate with us, and how to begin a conversation. All logos and named partners require written confirmation before publication."
      />

      <section className="section">
        <div className="wrap">
          <div className="spec-grid" style={{ alignItems: "start", paddingBottom: 32, borderBottom: "1px solid var(--line)", marginBottom: 16 }}>
            <div className="spec-head">
              <span>§ 01 — Why partner with Nayokan</span>
              <h3>
                Four reasons
                <br />
                institutions choose Nayokan.
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 24 }}>
              {REASONS.map((r) => (
                <div className="deliver-card" key={r.num}>
                  <span className="meta">Reason {r.num}</span>
                  <h4>{r.title}</h4>
                  <p style={{ color: "var(--muted)", fontSize: "0.92rem" }}>{r.desc}</p>
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
                <div className="partner-wall">
                  {partners
                    .filter((p) => p.category === w.category)
                    .map((p) => (
                      <div className="pw-cell" key={p.id}>
                        <span className="pw-tag">Partner</span>
                        <span className="pw-name">{p.name}</span>
                        <span className="pw-placeholder">Logo — tbc</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}

          <div className="spec-grid" style={{ alignItems: "start", padding: "32px 0", borderTop: "1px solid var(--line)" }}>
            <div className="spec-head">
              <span>§ 03 — Partnership models</span>
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
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <span className="meta on-dark">§ 04 — Begin</span>
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

import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { EditorialHero } from "@/ui/components/editorial-hero";
import { onlyConfirmed } from "@/platform/content/governance";
import { PublishingNote } from "@/ui/components/publishing-note";

export const metadata: Metadata = {
  title: "University Partnerships",
  description:
    "Nayokan partners with Cameroonian universities and research institutions to turn academic outputs into ventures — with a common framework for IP, revenue, and long-term equity.",
  alternates: canonical("/university-partnerships"),
};

const GAINS = [
  { tag: "Gain 01", title: "Commercialization pathway", desc: "A defined route from research output to venture — end-to-end, with milestones the university can co-govern." },
  { tag: "Gain 02", title: "Structured IP framework", desc: "A common licensing and revenue framework designed for Cameroonian institutions — not imported wholesale from elsewhere." },
  { tag: "Gain 03", title: "Equity participation", desc: "Universities retain participation in the ventures they help commercialize, on transparent terms agreed at inception." },
  { tag: "Gain 04", title: "Student & researcher paths", desc: "Concrete post-degree pathways for students and researchers — cohorts, mentorships, employment." },
];

const PROVIDES = [
  { num: "P/01", desc: "Programme delivery — the structured commercialization cohort, mentors, tooling, milestone reviews." },
  { num: "P/02", desc: "Commercialization framework — the codified pathway from research to venture." },
  { num: "P/03", desc: "Ecosystem access — routes into Nayokan VC, VTI clusters, hospitality operations and partners." },
  { num: "P/04", desc: "Governance & reporting — transparent shared governance and periodic reporting to partner universities." },
];

export default async function UniversityPartnerships() {
  const repo = await getContentRepository();
  // Universities are named only once a partnership is formally agreed.
  const partners = onlyConfirmed(await repo.listPartners("startup", "university-wall"), "name");

  return (
    <>
      <EditorialHero
        crumbs={[
          { label: "Nayokan", href: siteUrl("corporate", "/") },
          { label: "Startup Centre", href: "/" },
          { label: "University Partnerships" },
        ]}
        title={
          <>
            A shared framework for <em>commercializing</em> research.
          </>
        }
        lede="Nayokan partners with Cameroonian universities and research institutions to turn academic outputs into ventures — with a common framework for IP, revenue, and long-term equity."
        slot="world-startup"
        figure="Fig. — Student founders testing a prototype with a mentor"
      />

      <section className="section">
        <div className="wrap">
          {/* The proposition */}
          <div className="spec-grid" style={{ alignItems: "start", marginBottom: 64 }}>
            <div className="spec-head">
              <h3>
                What universities gain
                <br />
                from partnering with Nayokan.
              </h3>
            </div>
            <div className="sub-2col-grid">
              {GAINS.map((g) => (
                <div className="deliver-card" key={g.tag}>
                  <span className="meta">{g.tag}</span>
                  <h4>{g.title}</h4>
                  <p style={{ color: "var(--muted)", fontSize: "0.92rem" }}>{g.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What Nayokan provides */}
          <div className="spec-grid" style={{ alignItems: "start", marginBottom: 64 }}>
            <div className="spec-head">
              <h3>
                The Startup Centre
                <br />
                brings four things
                <br />
                to the table.
              </h3>
            </div>
            <div>
              {PROVIDES.map((p) => (
                <div
                  key={p.num}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr",
                    gap: 24,
                    padding: "20px 0",
                    borderTop: "1px solid var(--line)",
                    alignItems: "baseline",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      letterSpacing: "0.14em",
                      color: "var(--green-deep)",
                    }}
                  >
                    {p.num}
                  </span>
                  <p style={{ color: "var(--ink)", fontSize: "0.98rem", lineHeight: 1.55 }}>
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Partner wall */}
          <div className="spec-grid" style={{ alignItems: "start", marginBottom: 64 }}>
            <div className="spec-head">
              <h3>
                Partner
                <br />
                institutions.
              </h3>
            </div>
            <div>
              {partners.length > 0 ? (
                <div className="partner-wall">
                  {partners.map((p) => (
                    <div className="pw-cell" key={p.id}>
                      <span className="pw-tag">{p.tag}</span>
                      <span className="pw-name">{p.name}</span>
                      <small style={{ color: "var(--muted)", fontSize: "0.78rem" }}>{p.location}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <PublishingNote
                  title="Partner institutions coming soon."
                  actions={
                    <a href="#partner" className="btn btn-primary">
                      Partner as a university <span className="arrow">→</span>
                    </a>
                  }
                >
                  <p>
                    The Startup Centre works with public universities, applied institutions and research
                    ministries on a shared framework for IP, revenue and equity.
                  </p>
                </PublishingNote>
              )}
            </div>
          </div>

          {/* Partner CTA */}
          <div
            id="partner"
            style={{
              background: "var(--ink)",
              color: "var(--paper)",
              padding: "56px 40px",
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: 48,
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
                Begin a conversation
                <br />
                about{" "}
                <em style={{ fontStyle: "italic", fontWeight: 500, color: "var(--green)" }}>
                  institutional
                </em>{" "}
                partnership.
              </h2>
            </div>
            <div>
              <p style={{ color: "var(--muted-invert)", marginBottom: 24 }}>
                University partnerships begin with a working conversation. We ask that you nominate
                a partnership lead who can speak both to research and to commercialization intent.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href={siteUrl("corporate", "/contact")} className="btn btn-accent">
                  Partner as a university <span className="arrow">→</span>
                </a>
                <a href="/programme" className="btn btn-ghost on-dark">
                  See the programme
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

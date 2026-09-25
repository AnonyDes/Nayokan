import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { SubHero } from "@/ui/components/heroes";
import { Tbc } from "@/ui/components/tbc";
import { VtiProgrammeGrid } from "@/sites/vti/components/programme-grid";

export const metadata: Metadata = {
  title: "Programmes",
  description:
    "Programmes at the Nayokan Vocational Training Institute — categories, certification, entrepreneurial component and application routes.",
  alternates: canonical("/programmes"),
};

const COMPONENTS = [
  { num: "01", tag: "Practical", title: "Hands-on curriculum", desc: "A minimum ratio of 60% practical to 40% theory across every VTI programme." },
  { num: "02", tag: "Certification", title: "Recognised outputs", desc: "Endorsement pathway with Ministry of Employment & Vocational Training (subject to confirmation).", tbc: true },
  { num: "03", tag: "Entrepreneurial", title: "Cluster onboarding", desc: "Every graduate is offered a place in an entrepreneurial cluster aligned with their training track." },
  { num: "04", tag: "Eligibility", title: "Open, structured intake", desc: "Applications reviewed by a VTI selection panel. Cohorts kept small for quality of instruction." },
];

export default async function VtiProgrammes() {
  const repo = await getContentRepository();
  const programmes = await repo.listProgrammes({ site: "vti" });

  return (
    <>
      <SubHero
        sec="§ VTI · Programme directory"
        refPath="/programmes"
        crumbs={[
          { label: "Nayokan", href: siteUrl("corporate", "/") },
          { label: "VTI", href: "/" },
          { label: "Programmes" },
        ]}
        title={
          <>
            The programme <em>catalogue</em>.
          </>
        }
        lede="A live directory of the Vocational Training Institute's programmes — organised by track, with certification, practical component and entrepreneurial pathway for each. Applications open across cohorts throughout the year."
      />

      <section className="section">
        <div className="wrap">
          <div className="sub-stats-grid" style={{ marginBottom: 48 }}>
            {[
              ["Categories", "04", "Digital · Agri · Craft · Hospitality", false],
              ["Active programmes", "—", "Count updated per cohort", true],
              ["Certification", "MINEFOP", "Recognition pending confirmation", true],
              ["Cluster onboarding", "Included", "Every programme feeds a cluster", false],
            ].map(([k, v, sub, tbc]) => (
              <div key={k as string} style={{ background: "var(--paper)", padding: "24px 20px" }}>
                <span className="meta">{k}</span>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.6rem", letterSpacing: "-0.03em", marginTop: 6 }}>
                  {v}
                  {tbc && <Tbc />}
                </div>
                <small style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{sub}</small>
              </div>
            ))}
          </div>

          <VtiProgrammeGrid programmes={programmes} />

          <div className="sub-split-card" style={{ marginTop: 64 }}>
            <div>
              <span className="meta">§ Every programme</span>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.4rem", letterSpacing: "-0.02em", lineHeight: 1.1, marginTop: 8 }}>
                Four common components.
              </h3>
            </div>
            <div className="sub-2col-grid">
              {COMPONENTS.map((c) => (
                <div key={c.num}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--green-deep)", letterSpacing: "0.14em" }}>
                    {c.num} · {c.tag}
                  </div>
                  <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1.05rem", letterSpacing: "-0.015em", margin: "6px 0" }}>
                    {c.title} {c.tbc && <Tbc />}
                  </h4>
                  <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 48, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, padding: "32px 0", borderTop: "1px solid var(--line)" }}>
            <div>
              <span className="meta">Applications</span>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.35rem", letterSpacing: "-0.02em", marginTop: 8 }}>
                Ready to enrol? Start your application.
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/apply" className="btn btn-primary">
                Start application <span className="arrow">→</span>
              </a>
              <a href="/clusters" className="btn btn-ghost">
                See clusters
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

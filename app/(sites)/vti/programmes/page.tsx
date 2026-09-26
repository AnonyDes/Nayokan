import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { EditorialHero } from "@/ui/components/editorial-hero";
import { MediaSlot } from "@/ui/components/media-slot";
import { programmeStatus } from "@/ui/components/programme-card";
import { Tbc } from "@/ui/components/tbc";
import { VtiProgrammeGrid } from "@/sites/vti/components/programme-grid";

export const metadata: Metadata = {
  title: "Programmes",
  description:
    "Programmes at the Nayokan Vocational Training Institute — categories, certification, entrepreneurial component and application routes.",
  alternates: canonical("/programmes"),
};

const COMPONENTS = [
  { num: "01", tag: "Practical", title: "Hands-on curriculum", desc: "Practical work leads every VTI programme; the practical-to-theory ratio is published per programme.", tbc: true },
  { num: "02", tag: "Certification", title: "Recognised outputs", desc: "Endorsement pathway with Ministry of Employment & Vocational Training (subject to confirmation).", tbc: true },
  { num: "03", tag: "Entrepreneurial", title: "Cluster onboarding", desc: "Every graduate is offered a place in an entrepreneurial cluster aligned with their training track." },
  { num: "04", tag: "Eligibility", title: "Open, structured intake", desc: "Applications reviewed by a VTI selection panel. Cohorts kept small for quality of instruction." },
];

export default async function VtiProgrammes() {
  const repo = await getContentRepository();
  const programmes = await repo.listProgrammes({ site: "vti" });
  const featured = programmes.find((p) => programmeStatus(p).open) ?? programmes[0];

  return (
    <>
      <EditorialHero
        crumbs={[
          { label: "Nayokan", href: siteUrl("corporate", "/") },
          { label: "VTI", href: "/" },
          { label: "Programmes" },
        ]}
        eyebrow="§ VTI · Programme catalogue"
        title={
          <>
            The programme <em>catalogue</em>.
          </>
        }
        lede="Every programme at the Vocational Training Institute combines practical training with a route into an entrepreneurial cluster. Applications open by cohort through the year."
        slot="vti-programmes-hero"
        figure="Fig. — Session in the VTI computer lab · Yaoundé"
      />

      {featured && (
        <section className="ed-featured">
          <div className="wrap">
            <a href={`/programmes/${featured.slug}`} className="ed-featured-card">
              <MediaSlot slot="programme-vti" media={featured.heroImage} ratio="16:9" tone="dark" variant="compact" />
              <div className="ed-featured-body">
                <span className="meta">
                  Featured · {featured.code} · {programmeStatus(featured).label}
                </span>
                <h2>{featured.name}</h2>
                <p>{featured.summary}</p>
                <span className="link-inline">
                  Programme details <span className="arrow">→</span>
                </span>
              </div>
            </a>
          </div>
        </section>
      )}

      <section className="section ed-directory">
        <div className="wrap">
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

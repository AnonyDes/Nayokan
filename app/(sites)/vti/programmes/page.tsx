import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { EditorialHero } from "@/ui/components/editorial-hero";
import { ProgrammeCard } from "@/ui/components/programme-card";

export const metadata: Metadata = {
  title: "Programmes",
  description:
    "Training at the Nayokan Vocational Training Institute: local manufacturing and sustainable construction, and a professional certificate in agro-industrialization, export systems and market access.",
  alternates: canonical("/programmes"),
};

const COMPONENTS = [
  { num: "01", tag: "Value chain", title: "Training for the whole chain", desc: "Each field follows a productive chain, from making or processing through quality to the market or the finished structure, rather than a single trade." },
  { num: "02", tag: "Quality", title: "Quality at every stage", desc: "Quality and inspection run through both fields, from production and packaging to equipment and construction." },
  { num: "03", tag: "Digital", title: "Digital across both fields", desc: "Digital technology is treated as part of each value chain, not as a separate subject." },
  { num: "04", tag: "Enterprise", title: "A route to enterprise", desc: "Training connects to Nayokan's wider ecosystem of incubation, financing and enterprise growth." },
];

export default async function VtiProgrammes() {
  const repo = await getContentRepository();
  const programmes = await repo.listProgrammes({ site: "vti" });

  return (
    <>
      <EditorialHero
        crumbs={[
          { label: "Nayokan", href: siteUrl("corporate", "/") },
          { label: "VTI", href: "/" },
          { label: "Programmes" },
        ]}
        title={
          <>
            Two fields, <em>one chain</em>.
          </>
        }
        lede="Two training offerings, each tied to a productive value chain: local manufacturing and sustainable construction, and agro-industrialization with export systems and market access."
        slot="vti-programmes-hero"
        figure="Fig. — Session in the VTI computer lab · Yaoundé"
      />

      <section className="section ed-directory">
        <div className="wrap">
          <div className="ed-grid ed-grid--pair">
            {programmes.map((p) => (
              <ProgrammeCard key={p.id} programme={p} href={`/programmes/${p.slug}`} />
            ))}
          </div>

          <div className="sub-split-card" style={{ marginTop: 64 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.4rem", letterSpacing: "-0.02em", lineHeight: 1.1, marginTop: 8 }}>
                What both share.
              </h3>
            </div>
            <div className="sub-2col-grid">
              {COMPONENTS.map((c) => (
                <div key={c.num}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--green-deep)", letterSpacing: "0.14em" }}>
                    {c.num} · {c.tag}
                  </div>
                  <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1.05rem", letterSpacing: "-0.015em", margin: "6px 0" }}>
                    {c.title}
                  </h4>
                  <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 48, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, padding: "32px 0", borderTop: "1px solid var(--line)" }}>
            <div>
              <span className="meta">Interest</span>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.35rem", letterSpacing: "-0.02em", marginTop: 8 }}>
                Register your interest in a programme.
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/#apply" className="btn btn-primary">
                Register interest <span className="arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

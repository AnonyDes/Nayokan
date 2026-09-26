import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { EditorialHero } from "@/ui/components/editorial-hero";
import { ClusterGrid } from "@/sites/vti/components/cluster-grid";

export const metadata: Metadata = {
  title: "Entrepreneurial Clusters",
  description:
    "How Nayokan clusters turn VTI graduates into productive enterprises. Six sectors, one system.",
  alternates: canonical("/clusters"),
};

const STEPS = [
  { num: "01", title: "Training", desc: "Graduates complete the relevant VTI programme aligned with the cluster sector.", tag: "VTI" },
  { num: "02", title: "Formation", desc: "Members formed into a working cluster with shared tooling, workspace and initial market pilots.", tag: "VTI · Cluster" },
  { num: "03", title: "Market", desc: "Cluster begins serving external customers with structured quality and pricing standards.", tag: "Cluster" },
];

export default async function VtiClusters() {
  const repo = await getContentRepository();
  const clusters = await repo.listClusters();

  return (
    <>
      <EditorialHero
        crumbs={[
          { label: "Nayokan", href: siteUrl("corporate", "/") },
          { label: "VTI", href: "/" },
          { label: "Entrepreneurial clusters" },
        ]}
        eyebrow="§ VTI · Entrepreneurial clusters"
        title={
          <>
            From <em>training</em> to production to market.
          </>
        }
        lede="Clusters turn VTI graduates into productive enterprises: grouped by sector, sharing tools, market access and mentorship. This is where capability becomes economic value inside the Nayokan System."
        slot="vti-clusters-hero"
      />

      <section className="section">
        <div className="wrap">
          <div className="spec-grid" style={{ alignItems: "end", marginBottom: 48 }}>
            <div className="spec-head">
              <span>§ 01 — How clusters work</span>
              <h3>
                Structured groups.
                <br />
                Shared infrastructure.
                <br />
                Common markets.
              </h3>
              <p>
                Each cluster operates as a semi-formal collective of small enterprises and graduates —
                with shared operational infrastructure and a defined pathway to Nayokan Startup Centre
                and VC.
              </p>
            </div>
            <div>
              <div className="stage-rail" style={{ gridTemplateColumns: "repeat(3,1fr)", border: "1px solid var(--line)" }}>
                {STEPS.map((s) => (
                  <div className="rail-step" key={s.num}>
                    <span className="rs-num">STEP {s.num}</span>
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                    <span className="rs-tag">{s.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ClusterGrid clusters={clusters} />

          <div style={{ marginTop: 64, padding: "40px 32px", background: "var(--ink)", color: "var(--paper)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
              <div>
                <span className="meta on-dark">§ System position</span>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.6rem", letterSpacing: "-0.025em", lineHeight: 1.1, color: "var(--paper)", marginTop: 12 }}>
                  Clusters sit between capability and markets.
                </h3>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Capability", "Production", "Markets", "Innovation", "Capital", "Assets"].map((s, i) => (
                  <span
                    key={s}
                    className={`world-locator-stage${i < 3 ? " on" : ""}`}
                    style={i >= 3 ? { color: "var(--muted-invert)", borderColor: "var(--line-invert)" } : undefined}
                  >
                    {String(i + 1).padStart(2, "0")} {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 48, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <span className="meta">Continue</span>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.35rem", letterSpacing: "-0.02em", marginTop: 8 }}>
                Explore a specific cluster
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/apply" className="btn btn-primary">
                Apply to VTI <span className="arrow">→</span>
              </a>
              <a href="/programmes" className="btn btn-ghost">
                Back to programmes
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

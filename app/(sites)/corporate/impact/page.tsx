import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import { CorpHero } from "@/ui/components/heroes";
import { SectionHeader } from "@/ui/components/section-header";
import { BigMetric } from "@/sites/corporate/components/metrics";
import { Tbc } from "@/ui/components/tbc";
import type { World } from "@/platform/sites/types";

export const metadata: Metadata = {
  title: "Impact",
  description:
    "Nayokan impact — verified figures only, broken down by world, plus the stories and reports behind the numbers.",
  alternates: canonical("/impact"),
};

const WORLD_CELLS: { num: string; world: World; label: string; metricKey: string }[] = [
  { num: "01", world: "vti", label: "Trainees", metricKey: "m-vti-trainees" },
  { num: "02", world: "startup", label: "Ventures in pipeline", metricKey: "m-startup-pipeline" },
  { num: "03", world: "venture_capital", label: "Capital deployed", metricKey: "m-vc-deployed" },
  { num: "04", world: "hospitality", label: "Properties operating", metricKey: "m-hosp-properties" },
];

const REPORTS = [
  { ref: "R/2026", title: "Nayokan Ecosystem — Working Foundation.", tag: "draft", sub: "Discovery & product strategy document. Internal release.", meta: "Strategy · 24pp" },
  { ref: "R/2026", title: "VTI — Curriculum Framework v1.0.", tag: "tbc", sub: "Working curriculum for the Vocational Training Institute.", meta: "Curriculum · 36pp" },
  { ref: "R/2026", title: "Startup Centre — Commercialization Framework.", tag: "tbc", sub: "Five-stage commercialization pathway for innovator ventures.", meta: "Framework · 18pp" },
];

export default async function Impact() {
  const repo = await getContentRepository();
  const [coreMetrics, stories] = await Promise.all([
    repo.listMetrics({ keys: ["m-people-trained", "m-programmes", "m-enterprises", "m-partners"] }),
    repo.listStories({ site: "corporate", limit: 3 }),
  ]);
  const worldMetrics = await repo.listMetrics({
    keys: WORLD_CELLS.map((c) => c.metricKey),
  });
  const worldMetric = (key: string) => worldMetrics.find((m) => m.id === key);

  return (
    <>
      <CorpHero
        sec="§ Impact"
        crumbs={[{ label: "Nayokan", href: "/" }, { label: "Impact" }]}
        title={
          <>
            Evidence over <em>exaggeration.</em>
          </>
        }
        lede="We publish verified figures only. Where a number is still being reconciled with our divisions, we mark it — plainly — rather than overstate."
      />

      {/* KEY FIGURES */}
      <section className="big-metrics">
        <div className="wrap">
          <SectionHeader
            num="§ 01 — Key figures"
            title={
              <>
                What we can
                <br />
                verify today.
              </>
            }
            lead="Four core metrics. Where a figure is being reconciled with our divisions, we mark it explicitly rather than publish an unverified number."
          />
          <div className="big-metrics-grid">
            {coreMetrics.map((m, i) => (
              <BigMetric
                key={m.id}
                metric={m}
                index={i}
                sub={["Vocational training", "Programmes", "Enterprises", "Partnerships"][i]}
              />
            ))}
          </div>
          <p className="meta" style={{ marginTop: 24, textAlign: "right" }}>
            Content governance: draft → review → approved → published. All figures subject to
            editorial review.
          </p>
        </div>
      </section>

      {/* IMPACT BY WORLD */}
      <section className="section bg-bone">
        <div className="wrap">
          <SectionHeader
            num="§ 02 — Impact by world"
            title={
              <>
                How each division
                <br />
                is contributing.
              </>
            }
            lead="Impact broken down by operating division. Each world tracks its own leading and lagging indicators aligned with the Nayokan system."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--line)", border: "1px solid var(--line)" }}>
            {WORLD_CELLS.map((c) => {
              const m = worldMetric(c.metricKey);
              return (
                <div key={c.num} style={{ background: "var(--paper)", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 12, minHeight: 280 }}>
                  <span className="meta">World {c.num} · {c.world === "venture_capital" ? "Venture Capital" : c.world === "vti" ? "VTI" : c.world === "startup" ? "Startup Centre" : "Hospitality"}</span>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "3rem", letterSpacing: "-0.04em", lineHeight: 0.9, color: c.world === "venture_capital" ? "var(--ink)" : "var(--muted)", marginTop: 12 }}>
                    {c.world === "venture_capital" ? "— —" : "—"}
                    <Tbc />
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--green-deep)", letterSpacing: "0.02em" }}>
                    {m?.label ?? c.label}
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginTop: "auto" }}>
                    {m?.sourceLabel}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STORIES */}
      <section className="section">
        <div className="wrap">
          <SectionHeader
            num="§ 03 — Stories of impact"
            title="Behind the numbers."
            lead="Impact expressed as stories — the people, cohorts, ventures and partnerships that actually make up the metrics."
          />
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "var(--s-6)" }}>
            {stories[0] && (
              <a href={`/insights/${stories[0].slug}`} className="story-featured" style={{ display: "block", background: "var(--ink)", position: "relative", overflow: "hidden", color: "var(--paper)" }}>
                <figure style={{ position: "relative", height: "100%", minHeight: 520 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stories[0].cover?.src} alt={stories[0].cover?.alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <figcaption style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px 32px 32px", background: "linear-gradient(to top, rgba(10,10,10,0.95) 30%, rgba(10,10,10,0.6) 60%, transparent)", display: "flex", flexDirection: "column", gap: 12 }}>
                    <span className="meta" style={{ color: "var(--green-glow)" }}>Story 001 · VTI</span>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "clamp(1.4rem,2.2vw,2rem)", letterSpacing: "-0.02em", lineHeight: 1.1, color: "var(--paper)", maxWidth: "22ch" }}>
                      {stories[0].title}
                    </h3>
                    <p style={{ color: "var(--muted-invert)", maxWidth: "46ch", fontSize: "0.95rem" }}>{stories[0].excerpt}</p>
                    <span className="link-inline on-dark">
                      Read the story <span className="arrow">→</span>
                    </span>
                  </figcaption>
                </figure>
              </a>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-6)" }}>
              {stories.slice(1).map((s, i) => (
                <a key={s.id} href={`/insights/${s.slug}`} className="story-small">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.cover?.src} alt={s.cover?.alt ?? ""} />
                  <div className="story-small-body">
                    <span className="meta">Story {String(i + 2).padStart(3, "0")} · {s.world === "vti" ? "VTI" : "Startup Centre"}</span>
                    <h4>{s.title}</h4>
                    <span className="story-cat">{s.world === "vti" ? "VTI · Note" : "Startup · Feature"}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* REPORTS */}
      <section className="section bg-bone">
        <div className="wrap">
          <SectionHeader
            num="§ 04 — Reports"
            title={
              <>
                Published reports
                <br />
                and briefings.
              </>
            }
            lead="A working library of Nayokan reports, working papers and evaluations. New reports are published only after governance review."
          />
          <div style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
            {REPORTS.map((r, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr 200px 100px", gap: 24, padding: "24px 8px", alignItems: "center", borderBottom: i < REPORTS.length - 1 ? "1px solid var(--line)" : undefined }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--muted)", letterSpacing: "0.05em" }}>{r.ref}</span>
                <div>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1.1rem", letterSpacing: "-0.015em" }}>
                    {r.title} <Tbc>{r.tag}</Tbc>
                  </div>
                  <small style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{r.sub}</small>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--muted)", letterSpacing: "0.05em" }}>{r.meta}</span>
                <a href="#" className="link-inline" style={{ textAlign: "right" }} aria-disabled="true">
                  PDF →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

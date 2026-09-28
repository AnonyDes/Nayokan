import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import type { PublicMetric } from "@/platform/content/types";
import { EditorialHero } from "@/ui/components/editorial-hero";
import { SectionHeader } from "@/ui/components/section-header";
import { BigMetric } from "@/sites/corporate/components/metrics";
import { CountUp } from "@/ui/components/count-up";
import { Pending } from "@/ui/components/pending";
import { PublishingNote } from "@/ui/components/publishing-note";
import type { World } from "@/platform/sites/types";

export const metadata: Metadata = {
  title: "Impact",
  description:
    "Nayokan impact: verified figures only, broken down by world, with the stories and the evidence process behind the numbers.",
  alternates: canonical("/impact"),
};

const WORLD_CELLS: { num: string; world: World; name: string; label: string; metricKey: string }[] = [
  { num: "01", world: "vti", name: "VTI", label: "Trainees", metricKey: "m-vti-trainees" },
  { num: "02", world: "startup", name: "Startup Centre", label: "Ventures in pipeline", metricKey: "m-startup-pipeline" },
  { num: "03", world: "venture_capital", name: "Venture Capital", label: "Capital deployed", metricKey: "m-vc-deployed" },
  { num: "04", world: "hospitality", name: "Hospitality", label: "Properties operating", metricKey: "m-hosp-properties" },
];

// How a figure reaches this page. Process, not claims.
const EVIDENCE_STEPS = [
  { num: "01", title: "Recorded", desc: "Each division records its own activity: cohorts, ventures, investments and stays." },
  { num: "02", title: "Reconciled", desc: "Figures are checked against source records, such as registers, agreements and accounts." },
  { num: "03", title: "Reviewed", desc: "An editorial and governance review confirms the figure and how it is described." },
  { num: "04", title: "Published", desc: "Only then does the number appear here, with the division that reports it." },
];

function isPublished(m: PublicMetric | undefined): m is PublicMetric & { value: number } {
  return !!m && m.verified && m.value !== null;
}

export default async function Impact() {
  const repo = await getContentRepository();
  const [coreMetrics, stories, worldMetrics] = await Promise.all([
    repo.listMetrics({ keys: ["m-people-trained", "m-programmes", "m-enterprises", "m-partners"] }),
    repo.listStories({ site: "corporate", limit: 3 }),
    repo.listMetrics({ keys: WORLD_CELLS.map((c) => c.metricKey) }),
  ]);
  const worldMetric = (key: string) => worldMetrics.find((m) => m.id === key);

  return (
    <>
      <EditorialHero
        crumbs={[{ label: "Nayokan", href: "/" }, { label: "Impact" }]}
        title={
          <>
            Evidence over <em>exaggeration.</em>
          </>
        }
        lede="We publish a figure only once it has been verified. Until then, each measure is named and left empty rather than estimated, and the work is shown through the people and stories behind it."
        slot="impact-evidence"
        figure="Fig. — Trainees at the VTI computer lab · Yaoundé"
      />

      {/* KEY FIGURES */}
      <section className="big-metrics">
        <div className="wrap">
          <SectionHeader
            num="§ 01 — Key figures"
            title={
              <>
                What we will
                <br />
                report on.
              </>
            }
            lead="Four core measures across the ecosystem."
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
                contributes.
              </>
            }
            lead="Each world tracks its own indicators, aligned with the Nayokan System."
          />
          <div className="impact-worlds">
            {WORLD_CELLS.map((c) => {
              const m = worldMetric(c.metricKey);
              return (
                <div key={c.num} className="impact-world">
                  <span className="meta">
                    World {c.num} · {c.name}
                  </span>
                  {isPublished(m) ? (
                    <CountUp value={m.value} className="impact-world-num" />
                  ) : (
                    <div className="impact-world-num num-pending">
                      <span className="impact-pending-rule" aria-hidden="true" />
                      <Pending>Published once verified</Pending>
                    </div>
                  )}
                  <div className="impact-world-label">{m?.label ?? c.label}</div>
                  {m?.sourceLabel && <p>{m.sourceLabel}</p>}
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
            lead="Impact expressed as stories: the people, cohorts, ventures and partnerships that make up the measures."
          />
          <div className="impact-stories">
            {stories[0] && (
              <a href={`/insights/${stories[0].slug}`} className="story-featured impact-story-lead">
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stories[0].cover?.src} alt={stories[0].cover?.alt ?? ""} loading="lazy" />
                  <figcaption>
                    <span className="meta">Story 001 · VTI</span>
                    <h3>{stories[0].title}</h3>
                    <p>{stories[0].excerpt}</p>
                    <span className="link-inline on-dark">
                      Read the story <span className="arrow">→</span>
                    </span>
                  </figcaption>
                </figure>
              </a>
            )}
            <div className="impact-stories-side">
              {stories.slice(1).map((s, i) => (
                <a key={s.id} href={`/insights/${s.slug}`} className="story-small">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.cover?.src} alt={s.cover?.alt ?? ""} loading="lazy" />
                  <div className="story-small-body">
                    <span className="meta">
                      Story {String(i + 2).padStart(3, "0")} · {s.world === "vti" ? "VTI" : "Startup Centre"}
                    </span>
                    <h4>{s.title}</h4>
                    <span className="story-cat">{s.world === "vti" ? "VTI · Note" : "Startup · Feature"}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EVIDENCE PROCESS + REPORTS */}
      <section className="section bg-ink impact-process">
        <div className="wrap">
          <SectionHeader
            num="§ 04 — How a figure is published"
            onDark
            title={
              <>
                Four steps
                <br />
                before a number.
              </>
            }
            lead="The same standard applies to every figure on every Nayokan site, from a cohort count to capital deployed."
          />
          <ol className="impact-steps">
            {EVIDENCE_STEPS.map((step) => (
              <li key={step.num}>
                <span>{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </li>
            ))}
          </ol>
          <PublishingNote
            onDark
            eyebrow="Reports"
            title="Annual reports and evaluations."
            actions={
              <a href="/contact" className="btn btn-ghost on-dark">
                Request information <span className="arrow">→</span>
              </a>
            }
          />
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { EditorialHero } from "@/ui/components/editorial-hero";
import { MediaSlot } from "@/ui/components/media-slot";
import { CtaBand } from "@/ui/components/strips";
import { PROGRAMME_WORLD_LABEL, programmeSlot, programmeStatus } from "@/ui/components/programme-card";
import { ProgrammeDirectory } from "@/sites/corporate/components/programme-directory";
import { programmeHref } from "@/sites/corporate/programme-href";

export const metadata: Metadata = {
  title: "Programmes",
  description:
    "All Nayokan programmes in one place: a directory across the Vocational Training Institute, Startup Centre, Venture Capital and Hospitality.",
  alternates: canonical("/programmes"),
};

// How a participant can move through the ecosystem. Structural, not a claim
// about outcomes: it restates the Nayokan System stages.
const PATHWAY = [
  { title: "Train at the VTI", body: "Practical skills and certification pathways build capability." },
  { title: "Join a cluster", body: "Graduates organise production with others in the same trade." },
  { title: "Commercialize at the Startup Centre", body: "Innovations and ventures move from idea toward market." },
  { title: "Grow with Venture Capital", body: "Ventures with productive potential prepare for capital." },
];

export default async function Programmes() {
  const repo = await getContentRepository();
  const programmes = await repo.listProgrammes({});
  const featured = programmes.find((p) => p.status === "open") ?? programmes[0];

  return (
    <>
      <EditorialHero
        crumbs={[{ label: "Nayokan", href: "/" }, { label: "Programmes" }]}
        eyebrow="§ Programme directory · All four worlds"
        title={
          <>
            All Nayokan <em>programmes,</em> in one place.
          </>
        }
        lede="Training, commercialization, capital readiness and hospitality programmes across the Nayokan ecosystem. Each programme lives on its own world's site; this directory is the map."
        slot="programmes-hero"
        figure="Fig. — Launch of the VTI computer lab · Yaoundé"
      />

      {featured && (
        <section className="ed-featured">
          <div className="wrap">
            <a href={programmeHref(featured)} className="ed-featured-card">
              <MediaSlot slot={programmeSlot(featured)} media={featured.heroImage} ratio="16:9" tone="dark" variant="compact" />
              <div className="ed-featured-body">
                <span className="meta">
                  Featured · {PROGRAMME_WORLD_LABEL[featured.world]} · {programmeStatus(featured).label}
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

      <section className="section ed-directory" aria-labelledby="directory-title">
        <div className="wrap">
          <header className="section-header">
            <div>
              <span className="meta-num">§ 01 — Directory</span>
              <h2 id="directory-title">Browse by world.</h2>
            </div>
            <p className="lead">
              Filter by division or show only programmes open for applications. Dates, fees and
              durations are published on each programme once confirmed.
            </p>
          </header>
          <ProgrammeDirectory programmes={programmes} />
        </div>
      </section>

      <section className="ed-band">
        <div className="wrap">
          <div className="ed-band-inner">
            <div>
              <span className="meta-num">§ 02 — How programmes connect</span>
              <h2>One pathway, not isolated courses.</h2>
            </div>
            <ol className="ed-steps">
              {PATHWAY.map((s) => (
                <li key={s.title}>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <CtaBand
        sec="§ 03 — Apply"
        title={
          <>
            Start where
            <br />
            <em>you are.</em>
          </>
        }
        lede="Applications are made on each world's own site. Not sure which programme fits? Contact the Nayokan team."
        primary={{ label: "Apply to the VTI", href: siteUrl("vti", "/apply") }}
        secondary={{ label: "Contact Nayokan", href: "/contact" }}
      />
    </>
  );
}

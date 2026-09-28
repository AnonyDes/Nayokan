import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import { CorpHero } from "@/ui/components/heroes";
import { SectionHeader } from "@/ui/components/section-header";
import { CtaBand } from "@/ui/components/strips";
import { onlyConfirmed } from "@/platform/content/governance";
import { MediaSlot } from "@/ui/components/media-slot";

export const metadata: Metadata = {
  title: "About",
  description:
    "Nayokan is a Cameroonian development institution — the people, the story, the mission and the governance behind our four worlds.",
  alternates: canonical("/about"),
};

const VALUES = [
  { num: "01", title: "Institution over improvisation.", desc: "We build systems that outlast individuals. Repeatable processes, documented governance, transparent decisions." },
  { num: "02", title: "Evidence over exaggeration.", desc: "We only publish what we can verify. Marketing claims are held to the same evidentiary standard as reports." },
  { num: "03", title: "People over programmes.", desc: "Programmes are the tools. Individual human capability — its formation, dignity and productive expression — is the goal." },
  { num: "04", title: "Production over performance.", desc: "We measure ourselves by the productive activity we create in Cameroon — not by presentations, prizes or PR." },
  { num: "05", title: "Partnership over paternalism.", desc: "We work with universities, ministries and communities as equals. Local knowledge is the starting point, not a footnote." },
  { num: "06", title: "Long horizon over short signal.", desc: "Building a productive economy takes decades. We are structured to be here for them." },
];

// Milestones in order. A year is shown only once it is confirmed against
// Nayokan's records; until then the milestone carries its phase number.
const TIMELINE: { year?: string; title: string; desc: string }[] = [
  { title: "Nayokan Association founded.", desc: "The founding team convenes around the conviction that Cameroon needs connected institutions for skills, enterprise and capital." },
  { title: "First programme concepts.", desc: "Early curriculum design for the Vocational Training Institute, and first partnership conversations with Cameroonian institutions." },
  { title: "The VTI opens its doors.", desc: "The Nayokan Vocational Training Institute launches its computer lab in Yaoundé." },
  { title: "Startup Centre established.", desc: "The Startup Centre formalises the commercialization pathway from research to venture." },
  { year: "2026", title: "Ecosystem consolidation.", desc: "Venture Capital and Hospitality are structured as full divisions, and the Nayokan digital ecosystem launches with this website." },
];

export default async function About() {
  const repo = await getContentRepository();
  // Only people Nayokan has confirmed by name are published.
  const leaders = onlyConfirmed(await repo.listPeople("corporate", "leadership"), "name");

  return (
    <>
      <CorpHero
        sec="§ About Nayokan"
        crumbs={[{ label: "Nayokan", href: "/" }, { label: "About" }]}
        title={
          <>
            A Cameroonian institution, <em>built</em> for the long term.
          </>
        }
        lede="Nayokan is a development ecosystem connecting vocational training, entrepreneurship, innovation and capital — designed as one working system for building productive capacity in Cameroon."
      />

      {/* STORY */}
      <section className="two-col">
        <div className="two-col-inner">
          <aside className="two-col-side">
            <h3>Where Nayokan came from.</h3>
            <p>
              Nayokan was founded as an association with the conviction that Cameroon needed
              institutions capable of connecting capability, production and capital in one system.
            </p>
            <div className="about-side-photo">
              <MediaSlot slot="about-origin" ratio="4:3" caption />
            </div>
          </aside>
          <div className="two-col-body">
            <p className="lede">
              Cameroon does not lack talent. It does not lack ideas, entrepreneurship or ambition. What
              has often been missing is <em>institutional infrastructure</em> — the connective tissue
              between skill, enterprise, market and capital.
            </p>
            <p>
              Nayokan was founded to build that infrastructure. Our motto —{" "}
              <em>« Skills for Industrialisation »</em> — reflects a specific conviction: that a
              country becomes productive not through isolated programmes, but through connected systems
              that carry capability all the way through to lasting economic value.
            </p>
            <p>
              Our four worlds — VTI, Startup Centre, Venture Capital and Hospitality — are not four
              separate organisations. They are four operating arms of the same institution, each
              covering a stage of the same productive pathway.
            </p>
            <blockquote>
              Skills alone are not enough. <em>Systems create lasting value.</em>
            </blockquote>
            <h3>The Nayokan approach</h3>
            <p>
              Every Nayokan programme is designed to feed the next stage of the ecosystem. VTI
              graduates enter entrepreneurial clusters. Clusters become ventures. Ventures move into
              the Startup Centre for commercialization. Commercialised ventures access Venture Capital.
              Productive assets are anchored in Hospitality.
            </p>
            <p>
              The result is that a young Cameroonian entering VTI today can — through a single
              institution — progress from certified skill to productive enterprise to funded venture,
              without ever leaving the ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="values">
        <div className="wrap">
          <SectionHeader
            num="§ 02 — Values"
            title="What we hold to."
            lead="Six principles that shape how Nayokan operates — internally and with every partner, applicant and community we work with."
          />
          <div className="values-grid">
            {VALUES.map((v) => (
              <div className="value" key={v.num}>
                <span className="num">Value {v.num}</span>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="timeline">
        <div className="wrap">
          <SectionHeader
            num="§ 03 — Story"
            title="A working timeline."
            lead="Nayokan is a young institution with long-term intent."
            onDark
          />
          <div className="timeline-track">
            {TIMELINE.map((t, i) => (
              <div className="timeline-item" key={t.title}>
                <span className={`timeline-year${t.year ? "" : " is-phase"}`}>
                  {t.year ?? `Phase ${String(i + 1).padStart(2, "0")}`}
                </span>
                <div className="timeline-body">
                  <h4>{t.title}</h4>
                  <p>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="leadership">
        <div className="wrap">
          <SectionHeader
            num="§ 04 — Leadership"
            title="The people leading Nayokan."
            lead="The people leading and advising Nayokan. Division leads are introduced here as each appointment is announced."
          />
          <div className={`leadership-grid${leaders.length <= 2 ? " leadership-grid--feature" : ""}`}>
            {leaders.map((p) => (
              <article className="leader-card" key={p.id}>
                {p.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="leader-portrait leader-portrait--photo" src={p.photo.src} alt={p.photo.alt} width={p.photo.width} height={p.photo.height} loading="lazy" />
                ) : (
                  <div className="leader-portrait" aria-hidden="true">
                    {p.initials}
                  </div>
                )}
                <div>
                  <div className="leader-name">{p.name}</div>
                  <div className="leader-role">{p.position}</div>
                  {p.bio && <p className="leader-bio">{p.bio}</p>}
                </div>
                <div className="leader-tag">{p.division}</div>
              </article>
            ))}
          </div>
          <div style={{ marginTop: 32, textAlign: "right" }}>
            <a href="/contact" className="link-inline">
              Contact Nayokan <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      <CtaBand
        sec="§ 05 — Engage"
        title={
          <>
            Partner with
            <br />a serious
            <br />
            <em>institution.</em>
          </>
        }
        lede="Development organizations, universities, corporates, government and investors — Nayokan is designed for long-term institutional partnership."
        primary={{ label: "Contact us", href: "/contact" }}
        secondary={{ label: "See what we do", href: "/what-we-do" }}
      />
    </>
  );
}

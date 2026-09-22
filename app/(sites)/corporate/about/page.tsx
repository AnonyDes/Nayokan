import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import { CorpHero } from "@/ui/components/heroes";
import { SectionHeader } from "@/ui/components/section-header";
import { CtaBand } from "@/ui/components/strips";
import { Tbc } from "@/ui/components/tbc";

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

const TIMELINE = [
  { year: "2019", tbc: true, title: "Nayokan Association founded.", desc: "The founding team convenes around the conviction that Cameroon needs connected institutions for skills, enterprise and capital." },
  { year: "2022", tbc: true, title: "First programme concepts.", desc: "Early curriculum design for the Vocational Training Institute; first partnership conversations with Cameroonian institutions." },
  { year: "2024", tbc: true, title: "VTI inauguration.", desc: "The Nayokan Vocational Training Institute is inaugurated in Yaoundé. First cohort of trainees enters the programme." },
  { year: "2025", tbc: true, title: "Startup Centre established.", desc: "The Startup Centre begins operations, formalising the commercialization pathway and first university partnerships." },
  { year: "2026", tbc: false, title: "Ecosystem consolidation.", desc: "Venture Capital and Hospitality operations are structured as full divisions. The Nayokan Digital Ecosystem launches — this website." },
];

export default async function About() {
  const repo = await getContentRepository();
  const leaders = await repo.listPeople("corporate", "leadership");

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
            <span className="meta">§ 01 — Origin</span>
            <h3>Where Nayokan came from.</h3>
            <p>
              Nayokan was founded as an association with the conviction that Cameroon needed
              institutions capable of connecting capability, production and capital in one system.
            </p>
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
            lead="Nayokan is a young institution with long-term intent. Milestones marked as [tbc] are being reconciled with our records before publication."
            onDark
          />
          <div className="timeline-track">
            {TIMELINE.map((t) => (
              <div className="timeline-item" key={t.year}>
                <span className="timeline-year">
                  {t.year}
                  {t.tbc && <Tbc onDark />}
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
            lead="Named leadership is published only after individual approval. Portraits and full biographies will be added as the team confirms."
          />
          <div className="leadership-grid">
            {leaders.map((p) => (
              <article className="leader-card" key={p.id}>
                <div className="leader-portrait" data-tag="Portrait tbc">
                  {p.initials}
                </div>
                <div>
                  <div className="leader-name">
                    {p.name}
                    <Tbc />
                  </div>
                  <div className="leader-role">{p.position}</div>
                </div>
                <div className="leader-tag">{p.division}</div>
              </article>
            ))}
          </div>
          <div style={{ marginTop: 32, textAlign: "right" }}>
            <a href="/contact" className="link-inline">
              Full leadership & governance <span className="arrow">→</span>
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

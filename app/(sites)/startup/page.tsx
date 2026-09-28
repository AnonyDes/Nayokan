import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { WorldHero, WorldLocator } from "@/ui/components/heroes";
import { SectionHeader } from "@/ui/components/section-header";
import { onlyConfirmed } from "@/platform/content/governance";
import { MediaSlot } from "@/ui/components/media-slot";
import { PublishingNote } from "@/ui/components/publishing-note";
import { MentorKinds } from "@/sites/startup/components/mentor-kinds";
import { RelatedStrip, WORLD_LINKS } from "@/ui/components/strips";

export const metadata: Metadata = {
  title: "Startup Centre",
  description:
    "The Nayokan Startup Centre connects university innovation, entrepreneurship and commercialization — moving ideas from research through validation into ventures with real market traction.",
  alternates: canonical("/"),
};

const PIPELINE = [
  { num: "01", title: "Idea / Research", desc: "Original research, academic outputs and technology ideas that show productive potential — sourced from universities and independent innovators.", tag: "Universities · Innovators" },
  { num: "02", title: "Model", desc: "Business-model design, value proposition, unit economics and initial venture architecture — done with Nayokan mentors.", tag: "Mentorship · Framework" },
  { num: "03", title: "Validate", desc: "Market validation, pilot customers, technical feasibility and first-revenue evidence — before capital deployment.", tag: "Pilots · Customers" },
  { num: "04", title: "Commercialize", desc: "Structured go-to-market — the industry-application-focused programme, with partners for distribution and adoption.", tag: "Programme · Partners" },
  { num: "05", title: "Scale", desc: "Handover into Nayokan Venture Capital for growth funding, or into strategic partnerships for continued expansion.", tag: "→ Venture Capital" },
];

// What a university partnership covers. Framework, not a partner list:
// institutions are named only once a partnership is confirmed.
const UNIVERSITY_FRAMEWORK = [
  { title: "Research into ventures", desc: "A route for research outputs with productive potential into the commercialization pipeline." },
  { title: "Shared IP framework", desc: "Clear, agreed terms for intellectual property before any venture is formed." },
  { title: "Revenue and equity", desc: "Revenue sharing and long-term equity stakes in the ventures that result." },
  { title: "Students and researchers", desc: "Access to mentorship, programmes and opportunities for the university's innovators." },
];

// Innovation in practice: illustrative photography for the Startup Centre's
// world (founders, prototypes, mentoring), until Nayokan's own is supplied.
const PRACTICE: { slot: "startup-programme-hero" | "startup-commercialization" | "world-startup"; label: string }[] = [
  { slot: "startup-programme-hero", label: "001 · Founders at work" },
  { slot: "startup-commercialization", label: "002 · Prototype to product" },
  { slot: "world-startup", label: "003 · Mentorship" },
];

// Decorative commercialization schematic (startup-centre.html hero figure).
function Blueprint() {
  return (
    <div className="startup-blueprint">
      <div className="blueprint-corners">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <svg className="blueprint-svg" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <polygon points="0,0 10,5 0,10" fill="#0A0A0A" />
          </marker>
        </defs>
        <g stroke="#0A0A0A" strokeWidth="1.4" fill="none">
          <circle cx="60" cy="80" r="14" fill="#F3F2ED" />
          <text x="60" y="84" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="10" fill="#0A0A0A" stroke="none">R</text>
          <circle cx="60" cy="180" r="14" fill="#F3F2ED" />
          <text x="60" y="184" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="10" fill="#0A0A0A" stroke="none">R</text>
          <circle cx="60" cy="280" r="14" fill="#F3F2ED" />
          <text x="60" y="284" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="10" fill="#0A0A0A" stroke="none">R</text>
          <rect x="160" y="120" width="80" height="80" fill="#FFFFFF" />
          <text x="200" y="155" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="10" fill="#0A0A0A" stroke="none">VALIDATE</text>
          <text x="200" y="170" textAnchor="middle" fontFamily="Manrope" fontSize="14" fontWeight="700" fill="#0A0A0A" stroke="none">02</text>
          <rect x="160" y="240" width="80" height="80" fill="#FFFFFF" />
          <text x="200" y="275" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="10" fill="#0A0A0A" stroke="none">COMM.</text>
          <text x="200" y="290" textAnchor="middle" fontFamily="Manrope" fontSize="14" fontWeight="700" fill="#0A0A0A" stroke="none">03</text>
          <circle cx="340" cy="240" r="24" fill="#12B82A" stroke="none" />
          <text x="340" y="245" textAnchor="middle" fontFamily="Manrope" fontSize="14" fontWeight="800" fill="#0A0A0A" stroke="none">→VC</text>
          <path d="M 74 80 C 120 80, 140 130, 160 140" markerEnd="url(#arr)" />
          <path d="M 74 180 C 120 180, 140 165, 160 160" markerEnd="url(#arr)" />
          <path d="M 74 280 C 120 280, 140 190, 160 180" markerEnd="url(#arr)" />
          <path d="M 200 200 L 200 240" markerEnd="url(#arr)" />
          <path d="M 240 280 C 280 280, 300 260, 320 250" markerEnd="url(#arr)" />
        </g>
        <text x="60" y="52" fontFamily="IBM Plex Mono" fontSize="9" fill="rgba(10,10,10,0.55)" letterSpacing="1.5">RESEARCH INPUTS · 01</text>
        <text x="160" y="105" fontFamily="IBM Plex Mono" fontSize="9" fill="rgba(10,10,10,0.55)" letterSpacing="1.5">STARTUP CENTRE</text>
        <text x="340" y="215" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="9" fill="rgba(10,10,10,0.55)" letterSpacing="1.5">VENTURE PATH</text>
        <text x="20" y="470" fontFamily="IBM Plex Mono" fontSize="9" fill="rgba(10,10,10,0.4)" letterSpacing="2">FIG. 02 — COMMERCIALIZATION FLOW · WORKING SCHEMATIC</text>
      </svg>
      <span className="blueprint-label">Commercialization schematic · v1.0</span>
    </div>
  );
}

export default async function StartupHome() {
  const repo = await getContentRepository();
  const [mentors, ventures] = await Promise.all([repo.listMentors(), repo.listVentures("startup")]);
  // Mentors and ventures are named only with their consent.
  const confirmedMentors = onlyConfirmed(mentors, "name");
  const confirmedVentures = onlyConfirmed(ventures, "name");

  return (
    <>
      <WorldHero
        num="02"
        world="Startup Centre"
        crumbs={[
          { label: "Nayokan", href: siteUrl("corporate", "/") },
          { label: "Four worlds", href: `${siteUrl("corporate", "/")}#worlds` },
          { label: "Startup Centre" },
        ]}
        title={
          <>
            Where <em>research</em>
            <br />
            becomes enterprise.
          </>
        }
        lede="The Nayokan Startup Centre connects university innovation, entrepreneurship and commercialization — moving ideas from research through validation into ventures with real market traction."
        actions={
          <>
            <a href="#pipeline" className="btn btn-primary">
              See the pipeline <span className="arrow">→</span>
            </a>
            <a href="#universities" className="btn btn-ghost">
              Universities
            </a>
          </>
        }
        figure={<Blueprint />}
      />

      <WorldLocator on={[2, 3, 4]} />

      {/* Innovation in practice */}
      <section className="sc-practice" aria-label="Innovation in practice">
        {PRACTICE.map((f) => (
          <figure key={f.slot} className="sc-practice-frame">
            <MediaSlot slot={f.slot} fill variant="compact" tone="dark" sizes="(max-width: 699px) 100vw, 34vw" />
            <figcaption>{f.label}</figcaption>
          </figure>
        ))}
      </section>

      {/* Commercialization pipeline */}
      <section className="pipeline" id="pipeline">
        <div className="wrap">
          <div className="pipeline-header">
            <SectionHeader
              num="§ 01 — Commercialization Pipeline"
              title={
                <>
                  From idea to
                  <br />
                  venture — five stages.
                </>
              }
              lead="Every venture the Startup Centre supports moves through this pipeline. Some ventures enter at earlier stages; others already have validated concepts requiring commercialization."
            />
          </div>
          <div className="pipeline-track">
            {PIPELINE.map((s) => (
              <article className="pipeline-stage" key={s.num}>
                <span className="pnum">{s.num}</span>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
                <span className="ptag">{s.tag}</span>
                <span className="pipeline-arrow">→</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Mentors */}
      <section className="mentors">
        <div className="wrap">
          <SectionHeader
            num="§ 02 — Mentors"
            title={
              <>
                Working with people
                <br />
                who have built.
              </>
            }
            lead="Nayokan Startup Centre mentors are researchers, founders, operators and investors with lived experience in African markets."
          />
          {confirmedMentors.length > 0 ? (
            <div className="mentors-grid">
              {confirmedMentors.slice(0, 4).map((m) => (
                <article className="mentor-card" key={m.id}>
                  <div className="mentor-portrait">{m.initials}</div>
                  <div className="mentor-name">{m.name}</div>
                  <div className="mentor-role">{m.role}</div>
                  <div className="mentor-tag">{m.expertise.join(" · ")}</div>
                </article>
              ))}
            </div>
          ) : (
            <MentorKinds />
          )}
          <div style={{ textAlign: "right", marginTop: 32 }}>
            <a href="/mentors" className="link-inline">
              All mentors <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* University partnerships band */}
      <section className="univ" id="universities">
        <div className="wrap">
          <div className="univ-grid">
            <div>
              <h2 style={{ marginTop: 16 }}>
                A structured
                <br />
                path from research
                <br />
                to enterprise.
              </h2>
              <p className="univ-lede">
                Nayokan partners with Cameroonian universities and research institutions to
                commercialize innovation — with a shared framework for IP, revenue and long-term
                equity stakes in resulting ventures.
              </p>
              <div style={{ marginTop: 32 }}>
                <a href="/university-partnerships" className="btn btn-accent">
                  Partner as a university <span className="arrow">→</span>
                </a>
              </div>
            </div>
            <div>
              <span className="meta on-dark" style={{ display: "block", marginBottom: 16 }}>
                What a partnership covers
              </span>
              <ul className="univ-framework">
                {UNIVERSITY_FRAMEWORK.map((f) => (
                  <li key={f.title}>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="portfolio">
        <div className="wrap">
          <SectionHeader
            num="§ 04 — Portfolio"
            title="Ventures in the ecosystem."
            lead="Ventures working with the Startup Centre."
          />
          {confirmedVentures.length > 0 ? (
            <>
              <div className="portfolio-grid">
                {confirmedVentures.slice(0, 6).map((v) => (
                  <article className="port-card" key={v.id}>
                    <div className="port-header">
                      <div className="port-logo">{v.code}</div>
                      {v.listingStatus === "active" && <span className="port-status">● Active</span>}
                    </div>
                    <h4>{v.name}</h4>
                    <p>{v.description}</p>
                    <div className="port-tags">
                      <span className="port-tag">{v.sector}</span>
                      <span className="port-tag">{v.stage}</span>
                    </div>
                  </article>
                ))}
              </div>
              <div style={{ textAlign: "right", marginTop: 32 }}>
                <a href="/portfolio" className="link-inline">
                  Full portfolio <span className="arrow">→</span>
                </a>
              </div>
            </>
          ) : (
            <PublishingNote
              title="Portfolio coming soon."
              actions={
                <a href="/portfolio" className="btn btn-ghost">
                  How the portfolio works <span className="arrow">→</span>
                </a>
              }
            >
              <p>
                The Centre works with ventures at every stage of the pipeline, from research outputs to
                ventures ready for Nayokan Venture Capital.
              </p>
            </PublishingNote>
          )}
        </div>
      </section>

      {/* Innovator CTA */}
      <section className="apply" id="apply" style={{ background: "var(--ink)" }}>
        <div className="wrap">
          <div className="cta-grid">
            <div>
              <h2
                className="on-dark"
                style={{
                  marginTop: 16,
                  fontSize: "clamp(2.4rem, 5vw, 4.4rem)",
                  letterSpacing: "-0.04em",
                  lineHeight: 0.98,
                }}
              >
                Have a venture
                <br />
                or research to
                <br />
                <em style={{ fontStyle: "italic", fontWeight: 500, color: "var(--green)" }}>
                  commercialize
                </em>
                ?
              </h2>
            </div>
            <div>
              <p className="lead on-dark" style={{ color: "var(--muted-invert)", marginBottom: 32 }}>
                The Startup Centre accepts innovator applications continuously. Submissions are
                reviewed against the Nayokan pipeline and matched to the right stage.
              </p>
              <div className="hero-actions">
                <a href="/apply" className="btn btn-accent">
                  Apply as an innovator <span className="arrow">→</span>
                </a>
                <a href="/commercialization" className="btn btn-ghost on-dark">
                  Read the framework
                </a>
              </div>
              <div className="cta-contact">
                <div>
                  <span className="meta on-dark">Applications</span>
                  <a href="/apply">Apply online →</a>
                </div>
                <div>
                  <span className="meta on-dark">Cycle</span>
                  <span>Rolling</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RelatedStrip
        items={[WORLD_LINKS.vti, WORLD_LINKS.vc, WORLD_LINKS.hospitality].map((w) => ({
          ...w,
          href: w.href.startsWith("/") ? siteUrl("corporate", w.href) : w.href,
        }))}
      />
    </>
  );
}

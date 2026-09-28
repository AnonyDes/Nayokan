import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { WorldHero, WorldLocator } from "@/ui/components/heroes";
import { SectionHeader } from "@/ui/components/section-header";
import { MediaSlot } from "@/ui/components/media-slot";
import { ProgrammeCard, programmeStatus } from "@/ui/components/programme-card";
import { RelatedStrip } from "@/ui/components/strips";
import { VtiEnquiryForm } from "@/sites/vti/components/forms";

export const metadata: Metadata = {
  title: "Vocational Training Institute",
  description:
    "Nayokan Vocational Training Institute — practical skills, certification and entrepreneurial clusters for young Cameroonians.",
  alternates: canonical("/"),
};

const FEATURES = [
  { num: "01", title: "Skills for industrialisation", desc: "Curriculum designed around Cameroon's productive priorities and the reality of small-enterprise operations." },
  { num: "02", title: "Certification pathways", desc: "Each programme builds toward certification. Where a certificate is formally recognised, the programme page names the recognising body." },
  { num: "03", title: "Entrepreneurial clusters", desc: "Graduates are grouped into clusters that share tools, market access and mentorship — turning skills into enterprises." },
  { num: "04", title: "Pathway to production", desc: "Direct connections to Nayokan's Startup Centre, Venture Capital and Hospitality operations for graduates ready to scale." },
];

export default async function VtiHome() {
  const repo = await getContentRepository();
  const [programmes, clusters] = await Promise.all([
    repo.listProgrammes({ site: "vti" }),
    repo.listClusters(),
  ]);

  return (
    <>
      <WorldHero
        num="01"
        world="VTI"
        crumbs={[
          { label: "Nayokan", href: siteUrl("corporate", "/") },
          { label: "Four worlds", href: `${siteUrl("corporate", "/")}#worlds` },
          { label: "Vocational Training Institute" },
        ]}
        title={
          <>
            Practical skills.
            <br />
            <em>Productive</em> people.
          </>
        }
        lede="The Nayokan Vocational Training Institute develops the foundation of every productive system — practical, employable capability, delivered through a hands-on curriculum built around entrepreneurial clusters."
        actions={
          <>
            <a href="#programmes" className="btn btn-primary">
              See programmes <span className="arrow">→</span>
            </a>
            <a href="#apply" className="btn btn-ghost">
              Apply
            </a>
          </>
        }
        figure={
          <>
            <figure className="world-hero-figure">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/photos/nayokan-06.jpg" alt="Nayokan leadership and staff at the launch of the VTI computer lab, Yaoundé." />
              <figcaption>
                Launch of the VTI computer lab · Yaoundé
              </figcaption>
            </figure>
            <div className="world-hero-stats">
              <div className="world-hero-stat">
                <span className="meta">Programmes</span>
                <div className="num">{String(programmes.length).padStart(2, "0")}</div>
              </div>
              <div className="world-hero-stat">
                <span className="meta">Open now</span>
                <div className="num">{String(programmes.filter((p) => programmeStatus(p).open).length).padStart(2, "0")}</div>
              </div>
              <div className="world-hero-stat">
                <span className="meta">Clusters</span>
                <div className="num">{String(clusters.length).padStart(2, "0")}</div>
              </div>
            </div>
          </>
        }
      />

      <WorldLocator on={[1, 2]} />

      <section className="vti-strip">
        <div className="vti-strip-inner">
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/photos/nayokan-08.jpg" alt="Trainees in a session at the Nayokan VTI computer lab, Yaoundé." />
            <figcaption>001 · Computer lab session</figcaption>
          </figure>
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/photos/nayokan-01.jpg" alt="Nayokan leadership and staff at the launch of the VTI computer lab." />
            <figcaption>002 · Computer lab launch</figcaption>
          </figure>
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/photos/nayokan-05.jpg" alt="Nayokan leadership and staff in the VTI computer lab." />
            <figcaption>003 · Nayokan leadership at the lab</figcaption>
          </figure>
        </div>
      </section>

      <section className="feature">
        <div className="wrap">
          <SectionHeader
            num="§ 01 — Approach"
            title={
              <>
                A practical
                <br />
                curriculum, delivered.
              </>
            }
            lead="VTI graduates are not only knowledgeable but capable — trained to create impactful job solutions and to leverage their skills into productive enterprise."
          />
          <div className="feature-grid">
            <div className="feature-body">
              <ul className="feature-list">
                {FEATURES.map((f) => (
                  <li key={f.num}>
                    <span className="fnum">{f.num}</span>
                    <div className="fbody">
                      <h4>{f.title}</h4>
                      <p>
                        {f.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="feature-media feature-media--slot">
              <MediaSlot slot="programme-vti" ratio="4:5" variant="compact" sizes="(max-width: 899px) 100vw, 45vw" />
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-bone" id="programmes">
        <div className="wrap">
          <SectionHeader
            num="§ 02 — Programmes"
            title="Current programmes."
            lead="Programmes marked open are accepting applications. Every programme pairs practical training with a route into an entrepreneurial cluster."
          />
          <div className="vti-prog-cards">
            {programmes.slice(0, 3).map((p) => (
              <ProgrammeCard key={p.id} programme={p} href={`/programmes/${p.slug}`} />
            ))}
          </div>
          <div className="prog-footer">
            <a href="/programmes" className="link-inline">
              All VTI programmes <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      <section className="clusters" id="clusters">
        <div className="wrap">
          <SectionHeader
            num="§ 03 — Entrepreneurial Clusters"
            title="Where skills become enterprises."
            lead="Clusters are structured groups of VTI graduates and small enterprises collaborating around a common productive activity — sharing tools, market access and mentorship."
          />
          <div className="clusters-grid">
            {clusters.map((c, i) => (
              <a className="cluster-card" key={c.id} href={`/clusters/${c.slug}`}>
                <span className="cnum">{String(i + 1).padStart(2, "0")}</span>
                <h4>{c.name}</h4>
                <p>{c.summary}</p>
                <span className="ctag">{c.sector}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="apply" id="apply">
        <div className="wrap">
          <div className="apply-grid">
            <div>
              <h2 className="on-dark" style={{ marginTop: 16 }}>
                Ready to
                <br />
                become <em>productive</em>?
              </h2>
              <p className="lead on-dark" style={{ color: "var(--muted-invert)", marginTop: 24, maxWidth: "44ch" }}>
                Applications for the next VTI cohort are managed inside the institute. Start your
                enquiry here — we’ll route you to the right programme lead.
              </p>
              <div style={{ marginTop: 32 }} className="cta-contact">
                <div>
                  <span className="meta on-dark">Admissions</span>
                  <span>Use the enquiry form</span>
                </div>
                <div>
                  <span className="meta on-dark">Location</span>
                  <span>Yaoundé · Cameroon</span>
                </div>
              </div>
            </div>
            <VtiEnquiryForm programmes={programmes.map((p) => p.name)} />
          </div>
        </div>
      </section>

      <RelatedStrip
        items={[
          { meta: "World 02", label: "Startup Centre", href: siteUrl("startup", "/") },
          { meta: "World 03", label: "Venture Capital", href: siteUrl("corporate", "/venture-capital") },
          { meta: "World 04", label: "Hospitality", href: siteUrl("corporate", "/hospitality") },
        ]}
      />
    </>
  );
}

import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { WorldHero, WorldLocator } from "@/ui/components/heroes";
import { SectionHeader } from "@/ui/components/section-header";
import { Tbc } from "@/ui/components/tbc";
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
  { num: "02", title: "Certification & recognition", desc: "Officially recognised training, endorsed by the Ministry of Employment & Vocational Training.", tbc: "accreditation tbc" },
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
              <img src="/assets/photos/nayokan-06.jpg" alt="Nayokan Vocational Training Institute inauguration, Yaoundé." />
              <figcaption>
                Nayokan VTI · Inauguration · Yaoundé, 2024. <Tbc onDark>date tbc</Tbc>
              </figcaption>
            </figure>
            <div className="world-hero-stats">
              <div className="world-hero-stat">
                <span className="meta">Cohorts</span>
                <div className="num">
                  02<Tbc />
                </div>
              </div>
              <div className="world-hero-stat">
                <span className="meta">Modules</span>
                <div className="num">06</div>
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
            <img src="/assets/photos/nayokan-08.jpg" alt="Nayokan trainees at computer lab." />
            <figcaption>001 · Training Lab</figcaption>
          </figure>
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/photos/nayokan-01.jpg" alt="Nayokan members at inauguration." />
            <figcaption>002 · Institute Launch</figcaption>
          </figure>
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/photos/nayokan-05.jpg" alt="Nayokan leadership." />
            <figcaption>003 · Handover Ceremony</figcaption>
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
                        {f.desc} {f.tbc && <Tbc>{f.tbc}</Tbc>}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="feature-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/photos/nayokan-08.jpg" alt="Trainees at Nayokan VTI computer lab." />
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-bone" id="programmes">
        <div className="wrap">
          <SectionHeader
            num="§ 02 — Programmes"
            title="Current programmes."
            lead="A live directory. Programmes marked open are currently accepting applications; details are managed inside VTI."
          />
          <div className="prog-table" role="table" aria-label="VTI programmes">
            {programmes.map((p) => (
              <div className="prog-row" key={p.id}>
                <span className="pnum">{p.code}</span>
                <div className="pname">
                  {p.name}
                  <small>{p.summary}</small>
                </div>
                <span className="pmeta">
                  — — —<Tbc>duration tbc</Tbc>
                </span>
                <span className={`pstatus${p.status === "open" ? "" : " up"}`}>
                  {p.status === "open" ? "● Open" : "○ Upcoming"}
                </span>
                <span className="pgo">
                  <a href={`/programmes/${p.slug}`} className="link-inline">
                    Details →
                  </a>
                </span>
              </div>
            ))}
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
                <h4>
                  {c.name}
                  <Tbc>cluster tbc</Tbc>
                </h4>
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
              <span className="meta on-dark">§ 04 — Apply</span>
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
                  <span>
                    admissions@nayokan.org <Tbc onDark />
                  </span>
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

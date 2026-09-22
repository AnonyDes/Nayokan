import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { CorpHero } from "@/ui/components/heroes";
import { SectionHeader } from "@/ui/components/section-header";
import { Tbc } from "@/ui/components/tbc";
import { EnquiryForm } from "@/sites/corporate/components/forms";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Nayokan — enquiry routing for partners, applicants, investors, media and general enquiries.",
  alternates: canonical("/contact"),
};

const ROUTES = [
  { num: "01", title: "Programme applicants", desc: "Prospective students and entrepreneurs applying to VTI or Startup Centre programmes.", email: "admissions@nayokan.org" },
  { num: "02", title: "Institutional partners", desc: "Universities, ministries, development organizations and corporate partners.", email: "partners@nayokan.org" },
  { num: "03", title: "Investors & funders", desc: "Institutional investors, DFIs and co-investors interested in Nayokan VC.", email: "ir@nayokan.org" },
  { num: "04", title: "Media & press", desc: "Journalists, researchers and media outlets requesting information or interviews.", email: "media@nayokan.org" },
];

export default function Contact() {
  return (
    <>
      <CorpHero
        sec="§ Contact & enquiries"
        crumbs={[{ label: "Nayokan", href: "/" }, { label: "Contact" }]}
        title={
          <>
            Say <em>hello.</em>
            <br />
            Or send a serious enquiry.
          </>
        }
        lede="Choose the route that matches your enquiry — we'll direct you to the right team. General enquiries reach us within one business day."
      />

      <section className="contact-routes">
        <div className="wrap">
          <SectionHeader
            num="§ 01 — Choose a route"
            title={
              <>
                Four enquiry types.
                <br />
                Four direct routes.
              </>
            }
            lead="Structured routing helps us respond faster. All routes are managed by real people inside the relevant Nayokan team."
          />
          <div className="routes-grid">
            {ROUTES.map((r) => (
              <a key={r.num} href="#form" className="route-card">
                <span className="meta">Route {r.num}</span>
                <h4>{r.title}</h4>
                <p className="route-desc">{r.desc}</p>
                <span className="route-email">
                  {r.email} <Tbc />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-form-section" id="form">
        <div className="wrap">
          <div className="contact-form-grid">
            <div>
              <span className="meta">§ 02 — Send a general enquiry</span>
              <h2 style={{ marginTop: 16, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(2.2rem,4vw,3.4rem)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                General
                <br />
                enquiry.
              </h2>
              <p className="lead" style={{ marginTop: 24, maxWidth: "36ch" }}>
                Use this form if your enquiry doesn’t fit a specific route above, or if you’re not
                sure who to reach. We’ll route it internally.
              </p>
              <div style={{ marginTop: 40, padding: "24px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                  <span className="meta">Yaoundé office</span>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, marginTop: 6, letterSpacing: "-0.015em" }}>
                    Central Region · Cameroon <Tbc>address tbc</Tbc>
                  </div>
                </div>
                <div>
                  <span className="meta">Hours</span>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, marginTop: 6, letterSpacing: "-0.015em" }}>
                    Mon–Fri · 08:00–18:00 WAT
                  </div>
                </div>
              </div>
            </div>
            <EnquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}

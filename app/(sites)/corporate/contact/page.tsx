import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { EditorialHero } from "@/ui/components/editorial-hero";
import { SectionHeader } from "@/ui/components/section-header";
import { MediaSlot } from "@/ui/components/media-slot";
import { EnquiryForm } from "@/sites/corporate/components/forms";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Nayokan — enquiry routing for partners, applicants, investors, media and general enquiries.",
  alternates: canonical("/contact"),
};

// Enquiry routes. Each sends the reader to the page built for that audience;
// anything else comes through the general form below.
const ROUTES = [
  { num: "01", title: "Programme applicants", desc: "Prospective trainees and entrepreneurs applying to VTI or Startup Centre programmes.", action: "Find a programme and apply", href: "/programmes" },
  { num: "02", title: "Institutional partners", desc: "Universities, ministries, development organisations and corporate partners.", action: "Partner with Nayokan", href: "/partners" },
  { num: "03", title: "Investors & funders", desc: "Institutional investors, development finance partners and co-investors interested in Nayokan VC.", action: "Venture Capital enquiry", href: "/venture-capital/partner" },
  { num: "04", title: "Media & press", desc: "Journalists, researchers and media outlets requesting information or interviews.", action: "Use the enquiry form", href: "#form" },
];

const NEXT_STEPS = [
  { num: "01", title: "You send your enquiry", desc: "Tell us who you are and what you need. A few lines is enough." },
  { num: "02", title: "We route it", desc: "Your enquiry goes to the Nayokan team responsible for that area." },
  { num: "03", title: "The team replies", desc: "A member of that team replies to the email address you give us." },
];

export default function Contact() {
  return (
    <>
      <EditorialHero
        crumbs={[{ label: "Nayokan", href: "/" }, { label: "Contact" }]}
        title={
          <>
            Say <em>hello.</em>
            <br />
            Or send a serious enquiry.
          </>
        }
        lede="Choose the route that matches your enquiry and we will direct you to the right team. Anything else comes through the general form."
        slot="contact-hero"
        figure="Fig. — Nayokan leadership · Yaoundé"
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
            lead="Structured routing helps us respond faster. Each route leads to the team, and the page, built for that audience."
          />
          <div className="routes-grid">
            {ROUTES.map((r) => (
              <a key={r.num} href={r.href} className="route-card">
                <span className="meta">Route {r.num}</span>
                <h4>{r.title}</h4>
                <p className="route-desc">{r.desc}</p>
                <span className="route-email">
                  {r.action} <span aria-hidden="true">→</span>
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
              <h2 style={{ marginTop: 16, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(2.2rem,4vw,3.4rem)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                General
                <br />
                enquiry.
              </h2>
              <p className="lead" style={{ marginTop: 24, maxWidth: "36ch" }}>
                Use this form if your enquiry doesn’t fit a specific route above, or if you’re not
                sure who to reach. We’ll route it internally.
              </p>
              <div className="contact-photo">
                <MediaSlot slot="contact-hero" ratio="4:3" caption />
              </div>
              <div className="contact-office">
                <span className="meta">Nayokan</span>
                <div>Yaoundé · Cameroon</div>
              </div>
              <ol className="contact-steps" aria-label="What happens next">
                {NEXT_STEPS.map((step) => (
                  <li key={step.num}>
                    <span>{step.num}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <EnquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { SubHero } from "@/ui/components/heroes";
import { Tbc } from "@/ui/components/tbc";
import { VcPartnerForm } from "@/sites/corporate/components/forms";

export const metadata: Metadata = {
  title: "Partnership Enquiry",
  description:
    "Nayokan VC partnership enquiries — begin with a written brief. Investor Relations responds within five business days.",
  alternates: canonical("/venture-capital/partner"),
};

export default function VcPartner() {
  return (
    <>
      <SubHero
        sec="§ Venture Capital · Partnership Enquiry"
        refPath="/venture-capital/partner"
        crumbs={[
          { label: "Nayokan", href: "/" },
          { label: "Venture Capital", href: "/venture-capital" },
          { label: "Partnership Enquiry" },
        ]}
        title={
          <>
            Serious enquiries, <em>seriously</em> handled.
          </>
        }
        lede="Partnership conversations begin with a written brief. Investor Relations reviews each enquiry and responds within five business days."
      />

      <section className="section" style={{ background: "var(--navy)", color: "var(--paper)", padding: "80px 0" }}>
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 56, alignItems: "start" }}>
            <div>
              <span className="meta on-dark">§ Contact</span>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(2rem,3.4vw,3.2rem)", letterSpacing: "-0.04em", lineHeight: 1, color: "var(--paper)", marginTop: 16 }}>
                Begin a<br />
                conversation.
              </h2>
              <p style={{ color: "var(--muted-invert)", marginTop: 24, fontSize: "1.05rem", lineHeight: 1.55, maxWidth: "44ch" }}>
                Nayokan VC works with institutional investors, development finance partners,
                co-investors, corporate partners, universities and entrepreneurs aligned with
                productive-sector development in Central Africa.
              </p>
              <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16, paddingTop: 24, borderTop: "1px solid var(--line-invert)" }}>
                {[
                  ["Investor relations", <>ir@nayokan.org <Tbc onDark /></>],
                  ["Response cadence", "Within 5 business days"],
                  ["Yaoundé", "Central Region, Cameroon"],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <span className="meta on-dark">{k}</span>
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.15rem", letterSpacing: "-0.02em", color: "var(--paper)", marginTop: 4 }}>
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--paper)", color: "var(--ink)", padding: "48px 40px" }}>
              <VcPartnerForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

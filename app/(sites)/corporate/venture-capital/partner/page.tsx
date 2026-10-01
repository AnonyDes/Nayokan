import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { SubHero } from "@/ui/components/heroes";
import { VcPartnerForm } from "@/sites/corporate/components/forms";

export const metadata: Metadata = {
  title: "Partnership Enquiry",
  description:
    "Nayokan VC partnership enquiries — begin with a written brief. Investor Relations reviews every brief.",
  alternates: canonical("/venture-capital/partner"),
};

export default function VcPartner() {
  return (
    <>
      <SubHero
        sec="§ Venture Capital · Partnership Enquiry"
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
        lede="Partnership conversations begin with a written brief. Investor Relations reviews each enquiry and replies in writing."
      />

      <section className="section" style={{ padding: "80px 0" }}>
        <div className="wrap">
          <div className="vc-partner-grid">
            <div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(2rem,3.4vw,3.2rem)", letterSpacing: "-0.04em", lineHeight: 1, marginTop: 16 }}>
                Begin a<br />
                conversation.
              </h2>
              <p style={{ color: "var(--muted)", marginTop: 24, fontSize: "1.05rem", lineHeight: 1.55, maxWidth: "44ch" }}>
                Nayokan VC works with institutional investors, development finance partners,
                co-investors, corporate partners, universities and entrepreneurs aligned with
                productive-sector development in Central Africa.
              </p>
              <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
                {[
                  ["Investor relations", "Use the enquiry form"],
                  ["Yaoundé", "Central Region, Cameroon"],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <span className="meta">{k}</span>
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.15rem", letterSpacing: "-0.02em", marginTop: 4 }}>
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--bone)", padding: "clamp(28px, 4vw, 48px) clamp(20px, 3.5vw, 40px)" }}>
              <VcPartnerForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

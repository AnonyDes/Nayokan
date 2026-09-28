import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import { SubHero } from "@/ui/components/heroes";
import { SectionHeader } from "@/ui/components/section-header";
import { PropertyGrid } from "@/sites/corporate/components/hospitality";

export const metadata: Metadata = {
  title: "Properties",
  description:
    "Nayokan Hospitality properties — a curated portfolio in Yaoundé operated to institutional standards.",
  alternates: canonical("/hospitality/properties"),
};

export default async function Properties() {
  const repo = await getContentRepository();
  const properties = await repo.listProperties();

  return (
    <>
      <SubHero
        sec="§ Hospitality · Properties"
        crumbs={[
          { label: "Nayokan", href: "/" },
          { label: "Hospitality", href: "/hospitality" },
          { label: "Properties" },
        ]}
        title={
          <>
            Three properties.
            <br />
            All in <em>Yaoundé</em>.
          </>
        }
        lede="A curated portfolio operated to institutional standards. Each property serves a specific role in the Nayokan hospitality footprint — from guest stays to institutional convening."
      />

      <section className="section">
        <div className="wrap">
          <PropertyGrid properties={properties} />

          <div style={{ marginTop: 80 }}>
            <SectionHeader
              num="§ Booking pathway"
              title={
                <>
                  Enquiry now.
                  <br />
                  Direct booking later.
                </>
              }
              lead="Today, bookings are managed directly by the hospitality team. Direct online booking will follow."
            />
            <div className="booking-two">
              <div className="bt-card now">
                <span className="bt-tag">● Active today · Direct enquiry</span>
                <h3>Send an enquiry, and the team confirms your stay.</h3>
                <p>
                  Today, the hospitality team confirms availability and pricing directly, and holds
                  quiet dates for institutional visitors and Nayokan cohorts.
                </p>
                <div className="bt-actions">
                  <a href="/hospitality#booking" className="btn btn-primary">
                    Send an enquiry <span className="arrow">→</span>
                  </a>
                </div>
              </div>
              <div className="bt-card future">
                <span className="bt-tag">○ Planned · Direct booking</span>
                <h3>A Nayokan-operated booking system.</h3>
                <p>
                  Planned for a future release once operational systems (rates, occupancy, payments)
                  are in place. External partners considered where they align with Nayokan standards.
                </p>
                <div className="bt-actions">
                  <a href="#" className="btn btn-ghost" aria-disabled="true">
                    Not yet available <span style={{ opacity: 0.4 }}>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

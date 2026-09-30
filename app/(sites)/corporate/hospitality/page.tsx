import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { WorldHero, WorldLocator } from "@/ui/components/heroes";
import { SectionHeader } from "@/ui/components/section-header";
import { RelatedStrip } from "@/ui/components/strips";
import { BookingForm } from "@/sites/corporate/components/forms";
import { MediaSlot } from "@/ui/components/media-slot";
import { getNamedIllustrative } from "@/ui/media/image-briefs";

export const metadata: Metadata = {
  title: "Hospitality",
  description:
    "Nayokan Hospitality — refined guesthouses and productive assets in Yaoundé. Hospitality treated as economic infrastructure.",
  alternates: canonical("/hospitality"),
};

// Per-property display rows. Purpose and access only: room counts, rates and
// capacities are published once confirmed, never estimated.
const PROP_META: Record<string, [string, string][]> = {
  "nayokan-guesthouse": [
    ["Type", "Guesthouse"],
    ["For", "Visitors & delegations"],
    ["Booking", "By enquiry"],
  ],
  "long-stay-residence": [
    ["Type", "Long-stay"],
    ["For", "Multi-week stays"],
    ["Booking", "By enquiry"],
  ],
  "workspace-reception": [
    ["Type", "Meeting space"],
    ["For", "Cohorts & partners"],
    ["Access", "On request"],
  ],
};

export default async function Hospitality() {
  const repo = await getContentRepository();
  const properties = await repo.listProperties();

  return (
    <>
      <WorldHero
        crumbs={[
          { label: "Nayokan", href: "/" },
          { label: "Four worlds", href: "/#worlds" },
          { label: "Hospitality" },
        ]}
        title={
          <>
            A place to
            <br />
            <em>arrive</em>, work,
            <br />
            return.
          </>
        }
        lede="Nayokan Hospitality treats guesthouses and properties as productive assets: hospitality as economic infrastructure, not decoration."
        actions={
          <>
            <a href="#properties" className="btn btn-primary">
              See properties <span className="arrow">→</span>
            </a>
            <a href="#booking" className="btn btn-ghost">
              Enquire about a stay
            </a>
          </>
        }
        figure={
          <div className="hosp-hero-photo">
            <MediaSlot slot="hospitality-hero" ratio="4:5" tone="sand" variant="compact" eager caption />
          </div>
        }
      />

      <WorldLocator on={[3, 6]} />

      <section className="hosp-intro">
        <div className="wrap">
          <div className="hosp-intro-inner">
            <div>
              <p style={{ maxWidth: "24ch", marginTop: 12, color: "var(--muted)", fontSize: "0.92rem" }}>
                Hospitality inside Nayokan is not lifestyle. It is <em>productive infrastructure</em> —
                long-term assets that generate consistent value.
              </p>
            </div>
            <div>
              <p className="hosp-intro-lead">
                A well-run guesthouse anchors an ecosystem — <em>hosting visitors, investors,
                researchers, families</em> — and returns value to Nayokan’s wider work.
              </p>
              <p className="hosp-intro-body">
                Each property is designed to hold its own economically while contributing to
                Cameroon’s productive-asset base. Operations are professionalised and the
                hospitality experience is refined, cultural and calm.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="hosp-properties" id="properties">
        <div className="wrap">
          <SectionHeader
            num="§ 02 — Properties"
            title={
              <>
                Places to stay,
                <br />
                work and meet.
              </>
            }
            lead="A short, curated portfolio, run to institutional standards and open to guests, partners and long-stay visitors. Property details are published as each one is confirmed."
          />

          {properties.map((p, i) => (
            <article className="hosp-property" key={p.id}>
              <div
                className={`hosp-property-media${i === 1 ? " p2" : i === 2 ? " p3" : ""}`}
                data-label={`${p.code ?? "Property"} · ${(p.type ?? "Property").toUpperCase()}`}
              >
                <MediaSlot
                  slot="property"
                  fill
                  media={p.gallery[0]}
                  illustrative={getNamedIllustrative(`property-${p.slug}`, `Illustrative image of ${p.name}.`)}
                  tone="sand"
                  variant="compact"
                />
              </div>
              <div className="hosp-property-body">
                <div className="hosp-property-num">
                  {p.code ? `Property ${p.code.replace("P/", "")} · ` : ""}
                  {p.location}
                </div>
                <h3 className="hosp-property-title">{p.name}.</h3>
                <p className="hosp-property-desc">{p.summary}</p>
                <div className="hosp-property-meta">
                  {(PROP_META[p.slug] ?? []).map(([k, v]) => (
                    <div key={k}>
                      <span className="meta">{k}</span>
                      <span className="val">{v}</span>
                    </div>
                  ))}
                </div>
                <a href={`/hospitality/properties/${p.slug}`} className="link-inline">
                  Property details <span className="arrow">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="hosp-booking" id="booking">
        <div className="wrap">
          <div className="hosp-booking-grid">
            <div>
              <h2 style={{ marginTop: 16 }}>
                Simple
                <br />
                <em>enquiries.</em>
              </h2>
              <p className="lead" style={{ marginTop: 24 }}>
                Booking is managed directly by the hospitality team. Send an enquiry with your dates
                and the team will confirm availability with you.
              </p>
            </div>
            <BookingForm />
          </div>
        </div>
      </section>

      <RelatedStrip
        items={[
          { meta: "World 01", label: "Vocational Training Institute", href: siteUrl("vti", "/") },
          { meta: "World 02", label: "Startup Centre", href: siteUrl("startup", "/") },
          { meta: "World 03", label: "Venture Capital", href: "/venture-capital" },
        ]}
      />
    </>
  );
}

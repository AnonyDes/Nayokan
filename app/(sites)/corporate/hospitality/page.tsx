import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { WorldHero, WorldLocator } from "@/ui/components/heroes";
import { SectionHeader } from "@/ui/components/section-header";
import { Tbc } from "@/ui/components/tbc";
import { RelatedStrip } from "@/ui/components/strips";
import { BookingForm } from "@/sites/corporate/components/forms";

export const metadata: Metadata = {
  title: "Hospitality",
  description:
    "Nayokan Hospitality — refined guesthouses and productive assets in Yaoundé. Hospitality treated as economic infrastructure.",
  alternates: canonical("/hospitality"),
};

// Per-property display rows (the "Rooms / Style / Rates" strip differs per asset).
const PROP_META: Record<string, [string, string, boolean][]> = {
  "nayokan-guesthouse": [
    ["Rooms", "06", true],
    ["Style", "Colonial · Refined", false],
    ["Rates from", "— — —", true],
  ],
  "long-stay-residence": [
    ["Units", "04", true],
    ["Min. stay", "14 nights", false],
    ["Rates from", "— — —", true],
  ],
  "workspace-reception": [
    ["Capacity", "60", true],
    ["Format", "Boardroom · Event", false],
    ["Access", "On request", false],
  ],
};

const PROP_TITLES: Record<string, string> = {
  "nayokan-guesthouse": "The Nayokan Guesthouse — Central Region.",
  "long-stay-residence": "Long-stay Residence — Nsimeyong.",
  "workspace-reception": "Workspace & Reception — Institutional Base.",
};

export default async function Hospitality() {
  const repo = await getContentRepository();
  const properties = await repo.listProperties();

  return (
    <>
      <WorldHero
        num="04"
        world="Hospitality"
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
        lede="Nayokan Hospitality operates refined guesthouses and productive assets in Yaoundé and beyond — hospitality treated as economic infrastructure, not decoration."
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
          <div className="hosp-hero-figure" aria-hidden="true">
            <div className="hosp-hero-sun" />
            <div className="hosp-hero-arches">
              <div className="hosp-hero-arch" />
              <div className="hosp-hero-arch" />
              <div className="hosp-hero-arch" />
            </div>
            <span className="hosp-hero-caption">Guesthouse 001 · Yaoundé</span>
          </div>
        }
      />

      <WorldLocator on={[3, 6]} />

      <section className="hosp-intro">
        <div className="wrap">
          <div className="hosp-intro-inner">
            <div>
              <span className="meta">§ 01 — The Idea</span>
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
                Three properties.
                <br />
                All in Yaoundé.
              </>
            }
            lead="A short, curated portfolio. Each property is operated to institutional standards and open to guests, partners and long-stay visitors."
          />

          {properties.map((p, i) => (
            <article className="hosp-property" key={p.id}>
              <div
                className={`hosp-property-media${i === 1 ? " p2" : i === 2 ? " p3" : ""}`}
                data-label={`${p.code ?? "P/—"} · YAOUNDÉ · ${(p.type ?? "Property").toUpperCase()}`}
              >
                <div className="hosp-arch-detail" />
              </div>
              <div className="hosp-property-body">
                <div className="hosp-property-num">Property {(p.code ?? "").replace("P/", "") || "—"} · Yaoundé</div>
                <h3 className="hosp-property-title">{PROP_TITLES[p.slug] ?? p.name}</h3>
                <p className="hosp-property-desc">{p.summary}</p>
                <div className="hosp-property-meta">
                  {(PROP_META[p.slug] ?? []).map(([k, v, tbc]) => (
                    <div key={k}>
                      <span className="meta">{k}</span>
                      <span className="val">
                        {v}
                        {tbc && <Tbc />}
                      </span>
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
              <span className="meta">§ 03 — Enquiries</span>
              <h2 style={{ marginTop: 16 }}>
                Simple
                <br />
                <em>enquiries.</em>
              </h2>
              <p className="lead" style={{ marginTop: 24 }}>
                Booking is managed directly by the hospitality team. Send an enquiry with your dates
                and we will confirm availability within one business day.
              </p>
              <p className="hosp-booking-note">
                Enquiries route to <em>hospitality@nayokan.org</em> <Tbc />. Direct booking
                integrations are planned for a future release.
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

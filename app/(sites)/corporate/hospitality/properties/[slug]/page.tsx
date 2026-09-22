import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import { RichBlocks } from "@/ui/components/rich-blocks";
import { Tbc } from "@/ui/components/tbc";
import { RelatedStrip } from "@/ui/components/strips";
import { BookingForm } from "@/sites/corporate/components/forms";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const repo = await getContentRepository();
  const p = await repo.getProperty(slug);
  if (!p) return {};
  return {
    title: `${p.name} — Nayokan Hospitality`,
    description: p.summary,
    alternates: canonical(`/hospitality/properties/${slug}`),
  };
}

// Design feature rows are per-property in property-detail.html; only the
// Guesthouse carries a fully designed feature set. Others fall back to the
// amenity list so nothing is fabricated.
const FEATURES: Record<string, [string, string, boolean][]> = {
  "nayokan-guesthouse": [
    ["Rooms", "06", true],
    ["Style", "Colonial · Refined", false],
    ["Location", "Central Region · Yaoundé", false],
    ["Nearest airport", "NSI · ~35 min", false],
    ["On-site", "Library · Garden · WiFi", false],
    ["Language", "EN · FR", false],
  ],
};

export default async function PropertyDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = await getContentRepository();
  const property = await repo.getProperty(slug);
  if (!property) notFound();

  const others = (await repo.listProperties()).filter((p) => p.id !== property.id);
  const features = FEATURES[property.slug];

  return (
    <>
      <section className="property-detail-hero">
        <div className="property-hero-image">
          <span className="property-hero-caption">
            {property.code ?? "—"} · {property.location ?? "Yaoundé"}
          </span>
        </div>
      </section>

      <section className="property-detail-body">
        <div className="wrap">
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", paddingBottom: 24, marginBottom: 24, borderBottom: "1px solid rgba(10,10,10,0.15)", fontFamily: "var(--font-mono)", fontSize: "var(--f-meta)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>
              <a href="/" style={{ color: "var(--muted)" }}>Nayokan</a>
              <span style={{ opacity: 0.4 }}>/</span>
              <a href="/hospitality" style={{ color: "var(--muted)" }}>Hospitality</a>
              <span style={{ opacity: 0.4 }}>/</span>
              <span style={{ color: "var(--ink)" }}>{property.code ?? "—"}</span>
            </div>
            <span className="meta">
              Property {(property.code ?? "").replace("P/", "") || "—"} · {property.location ?? "Yaoundé"}
            </span>
            <h1 className="property-detail-title">
              {property.name.split(" ").slice(0, -1).join(" ")}{" "}
              <em>{property.name.split(" ").slice(-1)}</em>
            </h1>
            <p style={{ fontSize: "1.2rem", lineHeight: 1.55, color: "var(--muted)", maxWidth: "52ch", marginBottom: 16 }}>
              {property.summary}
            </p>

            {features ? (
              <div className="property-features">
                {features.map(([k, v, tbc]) => (
                  <div key={k}>
                    <span className="meta">{k}</span>
                    <span className="val">
                      {v} {tbc && <Tbc />}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="property-features">
                {property.amenities.map((a) => (
                  <div key={a}>
                    <span className="meta">Feature</span>
                    <span className="val">
                      {a} <Tbc />
                    </span>
                  </div>
                ))}
              </div>
            )}

            {(property.body?.length ?? 0) > 0 ? (
              <RichBlocks blocks={property.body ?? []} />
            ) : (
              <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "var(--ink)", maxWidth: "56ch", marginTop: 32 }}>
                {property.summary} <Tbc>full description tbc</Tbc>
              </p>
            )}
          </div>

          <aside className="property-book-card">
            <span className="meta">Rates from</span>
            <div className="rate">
              — — — <small>/ night <Tbc /></small>
            </div>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 20 }}>
              Rates vary by room type, season and length of stay. Institutional and long-stay rates
              on request.
            </p>
            <BookingForm compact />
            <p style={{ marginTop: 16, fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--muted)", letterSpacing: "0.02em", textAlign: "center" }}>
              Direct booking · Confirmed within 24h
            </p>
          </aside>
        </div>
      </section>

      <RelatedStrip
        title="Other properties"
        items={[
          ...others.map((p) => ({
            meta: `Property ${(p.code ?? "").replace("P/", "") || "—"}`,
            label: p.name,
            href: `/hospitality/properties/${p.slug}`,
          })),
          { meta: "All properties", label: "Hospitality overview", href: "/hospitality" },
        ]}
      />
    </>
  );
}

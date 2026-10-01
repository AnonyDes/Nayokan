import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import { RichBlocks } from "@/ui/components/rich-blocks";
import { isUnconfirmed } from "@/platform/content/governance";
import { RelatedStrip } from "@/ui/components/strips";
import { BookingForm } from "@/sites/corporate/components/forms";
import { MediaSlot } from "@/ui/components/media-slot";
import { getPropertyGallery } from "@/ui/media/image-briefs";

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

export default async function PropertyDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = await getContentRepository();
  const property = await repo.getProperty(slug);
  if (!property) notFound();

  const others = (await repo.listProperties()).filter((p) => p.id !== property.id);
  // Physical facts appear only once confirmed; purpose and access always can.
  const amenities = isUnconfirmed(property.provenance, "amenities") ? [] : property.amenities;
  const features: [string, string][] = [
    ["Type", property.type ?? "Property"],
    ["City", property.location ?? "Yaoundé"],
    ["Booking", "By enquiry"],
    ...amenities.map((a): [string, string] => ["Feature", a]),
  ];
  const gallery = getPropertyGallery(property.slug, property.name);
  const [hero, ...moreFrames] = gallery;

  return (
    <>
      <section className="property-detail-hero">
        <div className="property-hero-image">
          <MediaSlot slot="property" fill media={property.gallery[0]} illustrative={hero} tone="sand" variant="compact" />
          <span className="property-hero-caption">
            {property.code ? `${property.code} · ` : ""}
            {property.location ?? "Yaoundé"}
          </span>
        </div>
      </section>

      {moreFrames.length > 0 && (
        <section className="property-gallery-strip">
          <div className="wrap">
            {moreFrames.map((frame) => (
              <MediaSlot key={frame.src} slot="property" illustrative={frame} ratio="4:3" tone="sand" variant="compact" />
            ))}
          </div>
        </section>
      )}

      <section className="property-detail-body">
        <div className="wrap">
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", paddingBottom: 24, marginBottom: 24, borderBottom: "1px solid rgba(10,10,10,0.15)", fontFamily: "var(--font-mono)", fontSize: "var(--f-meta)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>
              <a href="/" style={{ color: "var(--muted)" }}>Nayokan</a>
              <span style={{ opacity: 0.4 }}>/</span>
              <a href="/hospitality" style={{ color: "var(--muted)" }}>Hospitality</a>
              <span style={{ opacity: 0.4 }}>/</span>
              <span style={{ color: "var(--ink)" }}>{property.name}</span>
            </div>
            <h1 className="property-detail-title">
              {property.name.split(" ").slice(0, -1).join(" ")}{" "}
              <em>{property.name.split(" ").slice(-1)}</em>
            </h1>
            <p style={{ fontSize: "1.2rem", lineHeight: 1.55, color: "var(--muted)", maxWidth: "52ch", marginBottom: 16 }}>
              {property.summary}
            </p>

            <div className="property-features">
              {features.map(([k, v]) => (
                <div key={`${k}-${v}`}>
                  <span className="meta">{k}</span>
                  <span className="val">{v}</span>
                </div>
              ))}
            </div>

            {(property.body?.length ?? 0) > 0 && <RichBlocks blocks={property.body ?? []} />}
          </div>

          <aside className="property-book-card">
            <span className="meta">Rates</span>
            <div className="rate">On request</div>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 20 }}>
              Rates depend on the stay and are shared on enquiry, including institutional and
              long-stay rates.
            </p>
            <BookingForm compact />
            <p style={{ marginTop: 16, fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--muted)", letterSpacing: "0.02em", textAlign: "center" }}>
              Direct booking with the hospitality team
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

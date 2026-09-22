import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { RichBlocks } from "@/ui/components/rich-blocks";
import { Tbc } from "@/ui/components/tbc";
import { RelatedStrip } from "@/ui/components/strips";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const repo = await getContentRepository();
  const v = await repo.getVenture("startup", slug);
  if (!v) return {};
  return {
    title: `${v.name} — Startup Centre portfolio`,
    description: v.description,
    alternates: canonical(`/portfolio/${slug}`),
  };
}

export default async function VentureDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const repo = await getContentRepository();
  const venture = await repo.getVenture("startup", slug);
  if (!venture) notFound();

  const others = (await repo.listVentures("startup")).filter((v) => v.id !== venture.id);

  return (
    <>
      <section className="portv-hero">
        <div className="portv-hero-inner">
          <div>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                paddingBottom: 24,
                marginBottom: 24,
                borderBottom: "1px solid var(--line)",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--f-meta)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              <a href={siteUrl("corporate", "/")} style={{ color: "var(--muted)" }}>
                Nayokan
              </a>
              <span style={{ opacity: 0.4 }}>/</span>
              <a href="/" style={{ color: "var(--muted)" }}>
                Startup Centre
              </a>
              <span style={{ opacity: 0.4 }}>/</span>
              <a href="/portfolio" style={{ color: "var(--muted)" }}>
                Portfolio
              </a>
              <span style={{ opacity: 0.4 }}>/</span>
              <span style={{ color: "var(--ink)" }}>{venture.code}</span>
            </div>
            <span className="meta">
              Portfolio venture {venture.code} · {venture.sector}
            </span>
            <h1 className="world-hero-title" style={{ marginTop: 20 }}>
              {venture.name}. <Tbc>venture name tbc</Tbc>
            </h1>
            <p className="world-hero-lede" style={{ marginTop: 24 }}>
              {venture.description} Currently listed as {venture.listingStatus}.
            </p>
            <div className="world-hero-actions">
              <a href="/apply" className="btn btn-primary">
                Explore Startup Centre <span className="arrow">→</span>
              </a>
              <a href={siteUrl("corporate", "/contact")} className="btn btn-ghost">
                Contact team
              </a>
            </div>
          </div>
          <div>
            <div className="portv-logo-box" data-num={`${venture.code} · Portfolio`}>
              {venture.code}
            </div>
            <div className="portv-facts">
              {(venture.facts ?? [
                { label: "Stage", value: venture.stage ?? "—" },
                { label: "Sector", value: venture.sector ?? "—" },
                { label: "Region", value: venture.location ?? "—" },
                { label: "Founded", value: "—", tbc: true },
                { label: "Round", value: "—", tbc: true },
                { label: "Employees", value: "—", tbc: true },
              ]).map((f) => (
                <div key={f.label}>
                  <span className="meta">{f.label}</span>
                  <span className="val">
                    {f.value} {f.tbc && <Tbc>tbc</Tbc>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pd-body">
        <div className="pd-body-inner">
          <div className="pd-content">
            {venture.body ? (
              <RichBlocks blocks={venture.body} />
            ) : (
              <>
                <h2>What the venture does</h2>
                <p>{venture.description}</p>
                <p>
                  A fuller public profile is published after venture consent and editorial review.
                  Until then this page intentionally stays brief. <Tbc>profile tbc</Tbc>
                </p>
              </>
            )}
          </div>
          <aside>
            <div className="pd-sticky-apply">
              <h4>Interested in the Startup Centre?</h4>
              <p>Apply as an innovator or partner to explore commercialization pathways with Nayokan.</p>
              <a href="/apply" className="btn btn-accent">
                Enquire <span className="arrow">→</span>
              </a>
            </div>
          </aside>
        </div>
      </section>

      <RelatedStrip
        title="Other portfolio ventures"
        items={others.slice(0, 3).map((v) => ({
          meta: v.code ?? "—",
          label: v.name,
          href: `/portfolio/${v.slug}`,
        }))}
      />
    </>
  );
}

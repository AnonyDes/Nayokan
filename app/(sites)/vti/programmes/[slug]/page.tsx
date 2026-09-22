import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { RichBlocks } from "@/ui/components/rich-blocks";
import { Tbc, isTbc } from "@/ui/components/tbc";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const repo = await getContentRepository();
  const p = await repo.getProgramme("vti", slug);
  if (!p) return {};
  return {
    title: p.seo?.title ?? p.name,
    description: p.seo?.description ?? p.summary,
    alternates: canonical(`/programmes/${slug}`),
  };
}

export default async function VtiProgrammeDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = await getContentRepository();
  const p = await repo.getProgramme("vti", slug);
  if (!p) notFound();

  return (
    <>
      <section className="pd-hero">
        <div className="pd-hero-inner">
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", paddingBottom: 24, marginBottom: 24, borderBottom: "1px solid var(--line)", fontFamily: "var(--font-mono)", fontSize: "var(--f-meta)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>
              <a href={siteUrl("corporate", "/")} style={{ color: "var(--muted)" }}>Nayokan</a>
              <span style={{ opacity: 0.4 }}>/</span>
              <a href="/programmes" style={{ color: "var(--muted)" }}>Programmes</a>
              <span style={{ opacity: 0.4 }}>/</span>
              <span style={{ color: "var(--ink)" }}>{p.code}</span>
            </div>
            <span className="meta">Programme {p.code} · World 01 · VTI</span>
            <h1 className="pd-hero-title">{p.name}.</h1>
            <p className="pd-hero-lede">{p.summary}</p>
            <div className="pd-status-badge">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} />
              {p.status === "open" ? "● Open · Rolling admissions" : "○ Upcoming"}
              {isTbc(p.provenance, "applicationDeadline") && <Tbc>dates tbc</Tbc>}
            </div>
          </div>
          <aside className="pd-hero-side">
            <div className="pd-hero-facts">
              {(
                [
                  ["Duration", "— — —", true],
                  ["Format", p.deliveryMode ?? "In-person + workshop", false],
                  ["Location", p.location ?? "Yaoundé · Cameroon", false],
                  ["Language", "EN · FR", false],
                  ["Certification", p.certification ?? "MINEFOP recognised", true],
                  ["Cost", "— — —", true],
                ] as [string, string, boolean][]
              ).map(([k, v, tbc]) => (
                <div className="pd-fact" key={k}>
                  <span className="meta">{k}</span>
                  <span className="val">
                    {v} {tbc && <Tbc />}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="pd-body">
        <div className="pd-body-inner">
          <div className="pd-content">
            {p.body && p.body.length > 0 ? (
              <RichBlocks blocks={p.body} />
            ) : (
              <>
                <h2>Overview</h2>
                <p>{p.summary}</p>
                <h2>Learning outcomes</h2>
                <p>
                  Detailed learning outcomes per track are published in the Programme Framework
                  document — available on request. <Tbc>framework tbc</Tbc>
                </p>
              </>
            )}
          </div>
          <aside>
            <div className="pd-sticky-apply">
              <h4>Ready to apply?</h4>
              <p>
                Applications are reviewed on a rolling basis. Submit yours and a VTI programme lead
                will be in touch within one week.
              </p>
              {p.applicationOpen ? (
                <a href={`/apply?programme=${p.slug}`} className="btn btn-accent">
                  Apply to {p.code} <span className="arrow">→</span>
                </a>
              ) : (
                <a href="/apply" className="btn btn-accent" aria-disabled="true">
                  Opens soon <Tbc>dates tbc</Tbc>
                </a>
              )}
            </div>
            <div style={{ marginTop: 24, padding: 20, border: "1px solid var(--line)", background: "var(--paper)" }}>
              <span className="meta">Questions</span>
              <p style={{ marginTop: 8, color: "var(--muted)", fontSize: "0.9rem" }}>
                Contact the VTI admissions team directly.
              </p>
              <p style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--green-deep)" }}>
                admissions@nayokan.org <Tbc />
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import type { Programme, RichBlock } from "@/platform/content/types";
import { RichBlocks } from "@/ui/components/rich-blocks";
import { MediaSlot } from "@/ui/components/media-slot";
import { MetaRail, type MetaRailItem } from "@/ui/components/meta-rail";
import { ProgrammeCard, programmeStatus } from "@/ui/components/programme-card";
import { isUnconfirmed } from "@/platform/content/governance";
import { getNamedIllustrative } from "@/ui/media/image-briefs";

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

// Editorial section order for a programme page. CMS headings map onto these
// keys; a section the CMS does not supply yet is left out rather than filled
// with invented content, so the numbering always runs without gaps.
const SECTION_ORDER = [
  { key: "overview", title: "Overview", match: ["overview"] },
  { key: "learn", title: "What participants learn", match: ["objectives", "what participants learn", "learning outcomes", "curriculum"] },
  { key: "structure", title: "Programme structure", match: ["programme structure", "structure", "modules"] },
  { key: "audience", title: "Who it is for", match: ["target audience", "who it is for", "audience"] },
  { key: "requirements", title: "Requirements", match: ["requirements", "eligibility"] },
  { key: "outcomes", title: "Outcomes", match: ["outcomes", "after the programme"] },
] as const;

type Section = { key: string; title: string; blocks: RichBlock[] };

function toSections(p: Programme): Section[] {
  const found: Section[] = [];
  let current: Section | null = null;
  for (const b of p.body ?? []) {
    if (b.type === "heading" && b.level === 2) {
      const text = b.text.toLowerCase();
      const known = SECTION_ORDER.find((s) => s.match.some((m) => text === m));
      current = { key: known?.key ?? text, title: known?.title ?? b.text, blocks: [] };
      found.push(current);
    } else if (current) {
      current.blocks.push(b);
    } else {
      current = { key: "overview", title: "Overview", blocks: [b] };
      found.push(current);
    }
  }
  if (!found.some((s) => s.key === "overview")) {
    found.unshift({ key: "overview", title: "Overview", blocks: [{ type: "paragraph", text: p.summary }] });
  }
  // Related opportunities are rendered as linked cards below, not as prose.
  const body = found.filter((s) => !s.key.startsWith("related"));
  const ordered: Section[] = [];
  for (const s of SECTION_ORDER) {
    const section = body.find((b) => b.key === s.key);
    if (section && section.blocks.length > 0) ordered.push(section);
  }
  return [...ordered, ...body.filter((b) => b.blocks.length > 0 && !SECTION_ORDER.some((s) => s.key === b.key))];
}

function railItems(p: Programme): MetaRailItem[] {
  const fact = (label: string, value: string | undefined, field: string): MetaRailItem => ({
    label,
    value,
    unconfirmed: isUnconfirmed(p.provenance, field),
  });
  const status = programmeStatus(p);
  const intake = p.applicationDeadline
    ? `${status.label} · deadline ${new Date(p.applicationDeadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
    : status.label;
  return [
    fact("Duration", p.duration, "duration"),
    fact("Location", p.location, "location"),
    fact("Format", p.deliveryMode, "deliveryMode"),
    fact("Certification", p.certification, "certification"),
    { label: "Intake", value: isUnconfirmed(p.provenance, "applicationDeadline") ? status.label : intake },
  ];
}

export default async function VtiProgrammeDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = await getContentRepository();
  const [p, allProgrammes, clusters] = await Promise.all([
    repo.getProgramme("vti", slug),
    repo.listProgrammes({ site: "vti" }),
    repo.listClusters(),
  ]);
  if (!p) notFound();

  const sections = toSections(p);
  const status = programmeStatus(p);
  const linkedClusters = clusters.filter((c) => c.programmeId === p.id);
  const relatedClusters = (linkedClusters.length > 0 ? linkedClusters : clusters).slice(0, 3);
  const relatedProgrammes = allProgrammes.filter((x) => x.id !== p.id).slice(0, 3);

  return (
    <>
      <section className="pdx-hero">
        <div className="wrap">
          <div className="pdx-hero-head">
            <div>
              <h1 className="pdx-title">{p.name}.</h1>
            </div>
            <div>
              <p className="pdx-lede">{p.summary}</p>
              <span className={`pdx-status${status.open ? "" : " is-upcoming"}`}>
                {status.open ? "● " : "○ "}
                {status.label}
                {p.applicationOpen ? " · applications open" : ""}
              </span>
            </div>
          </div>
          <div className="pdx-media">
            <MediaSlot slot="programme-vti" media={p.heroImage} illustrative={getNamedIllustrative(`programme-${p.slug}`, `Illustrative image for ${p.name}.`)} ratio="21:9" eager tone="light" sizes="100vw" />
          </div>
          <div className="pdx-rail-wrap">
            <MetaRail items={railItems(p)} />
          </div>
        </div>
      </section>

      <section className="pdx-body">
        <div className="wrap">
          <div className="pdx-body-inner">
            <div>
              {sections.map((s, i) => (
                <section className="pdx-section" key={s.key} aria-labelledby={`pdx-${i}`}>
                  <span className="pdx-section-num">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h2 id={`pdx-${i}`}>{s.title}</h2>
                    <RichBlocks blocks={s.blocks} />
                  </div>
                </section>
              ))}
            </div>
            <aside className="pdx-aside" aria-label="Apply">
              <div className="pdx-apply">
                <span className="meta on-dark">
                  {p.code} · {status.label}
                </span>
                <h3>{p.applicationOpen ? "Ready to apply?" : "Applications open soon"}</h3>
                <p>
                  Applications are reviewed by the VTI team, who will contact you about next steps.
                </p>
                {p.applicationOpen ? (
                  <a href={`/apply?programme=${p.slug}`} className="btn btn-accent">
                    Apply to {p.code ?? "this programme"} <span className="arrow">→</span>
                  </a>
                ) : (
                  <a href="/apply" className="btn btn-accent">
                    Register interest <span className="arrow">→</span>
                  </a>
                )}
              </div>
              <div className="pdx-contact">
                <span className="meta">Questions</span>
                <p>
                  <a href="/#apply" className="link-inline">
                    Ask the VTI admissions team <span className="arrow">→</span>
                  </a>
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="pdx-clusters">
          <div className="wrap">
            <header className="section-header">
              <div>
                <h2>Where graduates can go next.</h2>
              </div>
              <p className="lead">
                VTI graduates are offered a place in an entrepreneurial cluster aligned with their
                track, and may be referred to the Startup Centre.
              </p>
            </header>
            <ul className="pdx-next">
              {relatedClusters.map((c) => (
                <li key={c.id}>
                  <a href={`/clusters/${c.slug}`}>
                    <span className="meta">Cluster {c.code ?? ""}</span>
                    <strong>{c.name}</strong>
                    <span>{c.sector}</span>
                  </a>
                </li>
              ))}
              <li>
                <a href={siteUrl("startup")}>
                  <span className="meta">Startup Centre ↗</span>
                  <strong>Commercialization pathway</strong>
                  <span>For graduates with a venture to take to market</span>
                </a>
              </li>
            </ul>
          </div>
        </section>

      {relatedProgrammes.length > 0 && (
        <section className="pdx-related">
          <div className="wrap">
            <header className="section-header">
              <div>
                <h2>Other VTI programmes.</h2>
              </div>
              <a href="/programmes" className="link-inline">
                All programmes <span className="arrow">→</span>
              </a>
            </header>
            <div className="ed-grid">
              {relatedProgrammes.map((x) => (
                <ProgrammeCard key={x.id} programme={x} href={`/programmes/${x.slug}`} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

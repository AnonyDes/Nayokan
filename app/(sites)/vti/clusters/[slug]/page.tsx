import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { SectionHeader } from "@/ui/components/section-header";
import { Tbc } from "@/ui/components/tbc";
import { RelatedStrip } from "@/ui/components/strips";
import type { Cluster } from "@/platform/content/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const repo = await getContentRepository();
  const c = await repo.getCluster(slug);
  if (!c) return {};
  return {
    title: `${c.name} — Cluster`,
    description: c.summary,
    alternates: canonical(`/clusters/${slug}`),
  };
}

// Designed cluster page (cluster-detail.html) is built around Agri-Food —
// its copy is used verbatim for that cluster; other clusters get the same
// structure with tbc markers rather than invented content.
const AGRI_FEATURES = [
  { num: "01", title: "Shared productive infrastructure", desc: "Members share access to processing equipment, cold-chain logistics and technical tools that no single small enterprise could sustain alone." },
  { num: "02", title: "Joint market access", desc: "Structured relationships with buyers, distributors and export partners — negotiated at cluster level, not enterprise-by-enterprise." },
  { num: "03", title: "Continuing mentorship", desc: "Nayokan mentors work with cluster members long after formal VTI training ends. Learning is not a graduation event." },
  { num: "04", title: "Pathway to capital", desc: "Cluster members with growth traction are eligible for referral into the Startup Centre commercialization pathway and, subsequently, Venture Capital." },
];

const AGRI_PARTICIPANTS = [
  ["Post-harvest processing", "Central Region"],
  ["Cold-chain logistics", "Yaoundé"],
  ["Small-batch food processing", "Central Region"],
  ["Agri-input distribution", "Regional"],
  ["Cocoa & coffee finishing", "South Region"],
  ["Speciality food export", "National"],
  ["Packaging & labelling", "Yaoundé"],
  ["Farm-to-hospitality supply", "Cross-cluster"],
];

function ClusterViz({ code, count }: { code: string; count: number }) {
  const nodes: [number, number][] = [
    [80, 80], [200, 60], [320, 80],
    [60, 200], [340, 200],
    [80, 320], [200, 340], [320, 320],
  ];
  return (
    <div className="cluster-viz">
      <svg viewBox="0 0 400 400" aria-hidden="true">
        <circle cx="200" cy="200" r="42" fill="#12B82A" />
        <text x="200" y="196" textAnchor="middle" fontFamily="Manrope" fontSize="12" fontWeight="800" fill="#0A0A0A">{code}</text>
        <text x="200" y="212" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="8" fill="#0A0A0A" letterSpacing="1">CLUSTER</text>
        <g stroke="#0A0A0A" strokeWidth="1" fill="#F3F2ED">
          {nodes.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="24" />)}
        </g>
        <g fill="#0A0A0A" fontFamily="IBM Plex Mono" fontSize="8" textAnchor="middle" letterSpacing="1">
          {nodes.map(([x, y], i) => <text key={i} x={x} y={y + 4}>E/{String(i + 1).padStart(2, "0")}</text>)}
        </g>
        <g stroke="rgba(10,10,10,0.3)" strokeWidth="1" fill="none">
          {nodes.map(([x, y], i) => (
            <line key={i} x1={x + (x - 200) * 0.22} y1={y + (y - 200) * 0.22} x2={200 + (x - 200) * 0.36} y2={200 + (y - 200) * 0.36} />
          ))}
        </g>
        <text x="20" y="380" fontFamily="IBM Plex Mono" fontSize="8" fill="rgba(10,10,10,0.5)" letterSpacing="1.5">
          FIG. {code} — CLUSTER TOPOLOGY · {count} ENTERPRISES
        </text>
      </svg>
    </div>
  );
}

export default async function ClusterDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = await getContentRepository();
  const cluster = await repo.getCluster(slug);
  if (!cluster) notFound();

  const isAgri = cluster.slug === "agri-food-production";
  const others = (await repo.listClusters()).filter((c) => c.id !== cluster.id).slice(0, 3);
  const memberCount = cluster.memberCount ?? 8;
  const code = cluster.code ?? "C/—";

  return (
    <>
      <section className="cluster-detail-hero">
        <div className="cluster-detail-hero-inner">
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", paddingBottom: 24, marginBottom: 24, borderBottom: "1px solid var(--line)", fontFamily: "var(--font-mono)", fontSize: "var(--f-meta)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>
              <a href={siteUrl("corporate", "/")} style={{ color: "var(--muted)" }}>Nayokan</a>
              <span style={{ opacity: 0.4 }}>/</span>
              <a href="/" style={{ color: "var(--muted)" }}>VTI</a>
              <span style={{ opacity: 0.4 }}>/</span>
              <a href="/clusters" style={{ color: "var(--muted)" }}>Clusters</a>
              <span style={{ opacity: 0.4 }}>/</span>
              <span style={{ color: "var(--ink)" }}>{code}</span>
            </div>
            <div className="world-badge">
              <span className="num">{code.replace("C/0", "")}</span>
              <span>Cluster · {cluster.sector}</span>
            </div>
            <h1 className="world-hero-title" style={{ marginTop: 24 }}>
              {cluster.name}
            </h1>
            <p className="world-hero-lede">{cluster.summary}</p>
            <div className="world-hero-actions">
              <a href="/apply" className="btn btn-primary">
                Join this cluster <span className="arrow">→</span>
              </a>
              <a href="#activities" className="btn btn-ghost">
                See activities
              </a>
            </div>
          </div>
          <ClusterViz code={code} count={memberCount} />
        </div>
      </section>

      <section className="feature">
        <div className="wrap">
          <SectionHeader
            num="§ 01 — What this cluster is"
            title={
              <>
                Priority sector.
                <br />
                Structured collaboration.
              </>
            }
            lead={`${cluster.name} is one of the sectors Nayokan clusters organise around. This cluster exists to concentrate skills, tools, mentorship and market access.`}
          />
          <div className="feature-grid">
            <div className="feature-body">
              <ul className="feature-list">
                {AGRI_FEATURES.map((f) => (
                  <li key={f.num}>
                    <span className="fnum">{f.num}</span>
                    <div className="fbody">
                      <h4>{f.title}</h4>
                      <p>{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="feature-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/photos/nayokan-08.jpg" alt="VTI training environment." />
            </div>
          </div>
        </div>
      </section>

      <section className="cluster-participants">
        <div className="wrap">
          <SectionHeader
            num="§ 02 — Participants"
            title={
              <>
                {memberCount} enterprises,
                <br />
                one cluster.
              </>
            }
            lead="Cluster composition is refreshed at each VTI cohort. Full participant profiles are published after individual enterprise consent."
          />
          <div className="cluster-participants-grid">
            {(isAgri ? AGRI_PARTICIPANTS : []).map(([name, loc], i) => (
              <div className="cluster-part" key={i}>
                <span className="num">E/{String(i + 1).padStart(2, "0")}</span>
                <h4>
                  {name} <Tbc />
                </h4>
                <small>{loc}</small>
              </div>
            ))}
            {!isAgri && (
              <div className="cluster-part" style={{ gridColumn: "1 / -1" }}>
                <span className="num">—</span>
                <h4>
                  Participant list pending confirmation <Tbc>member details tbc</Tbc>
                </h4>
                <small>Published after enterprise consent.</small>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="feature" id="activities">
        <div className="wrap">
          <SectionHeader
            num="§ 03 — Activities & outcomes"
            title={
              <>
                What this cluster is
                <br />
                producing.
              </>
            }
            lead="Working outputs — not decorative activity. Metrics reviewed quarterly by cluster members and the VTI programme lead."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--line)", border: "1px solid var(--line)" }}>
            {[
              ["Working output", "Joint contracts secured with regional buyers."],
              ["Cluster meetings", "Structured cluster sessions this year to date."],
              ["Referrals", "Cluster enterprises referred into Startup Centre pipeline."],
            ].map(([k, sub]) => (
              <div key={k} style={{ background: "var(--paper)", padding: 32, display: "flex", flexDirection: "column", gap: 8, minHeight: 200 }}>
                <span className="meta">{k}</span>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "3rem", letterSpacing: "-0.04em", color: "var(--ink)", lineHeight: 0.9 }}>
                  —<Tbc />
                </div>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "auto" }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RelatedStrip
        title="Other clusters"
        items={[
          ...others.map((c: Cluster) => ({
            meta: `Cluster ${c.code ?? ""}`,
            label: c.name,
            href: `/clusters/${c.slug}`,
          })),
          { meta: "All clusters", label: "Cluster directory", href: "/clusters" },
        ]}
      />
    </>
  );
}

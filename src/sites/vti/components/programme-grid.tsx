"use client";

import { useState } from "react";
import type { Programme } from "@/platform/content/types";
import { Tbc } from "@/ui/components/tbc";

// VTI programme catalogue — filter chips + inline search (vti-programmes.html).
const TRACKS = ["Digital & Tech", "Agri-Food", "Craft & Manufacturing", "Hospitality", "Enterprise"];

const TRACK_BY_SLUG: Record<string, string> = {
  "professional-growth-engineering": "Digital & Tech",
  "skills-for-industrialisation": "Enterprise",
  "cluster-formation-programme": "Enterprise",
};

export function VtiProgrammeGrid({ programmes }: { programmes: Programme[] }) {
  const [track, setTrack] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const visible = programmes.filter(
    (p) =>
      (!track || TRACK_BY_SLUG[p.slug] === track) &&
      (!q || `${p.name} ${p.summary}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <>
      <div className="filter-bar">
        <span className="fb-label">Filter</span>
        <button className={`chip${!track && !q ? " on" : ""}`} onClick={() => { setTrack(null); setQ(""); }}>
          All <span className="count">{programmes.length}</span>
        </button>
        {TRACKS.map((t) => (
          <button key={t} className={`chip${track === t ? " on" : ""}`} aria-pressed={track === t} onClick={() => setTrack(track === t ? null : t)}>
            {t}
          </button>
        ))}
        <label className="search-inline" style={{ marginLeft: 16 }}>
          <input type="text" placeholder="Search programmes" aria-label="Search programmes" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <button className="chip-clear" onClick={() => { setTrack(null); setQ(""); }}>
          Reset
        </button>
      </div>

      <div className="pgrid">
        {visible.map((p, i) => (
          <article className={`pcard${i % 2 === 1 ? " pcard-dark" : ""}`} key={p.id}>
            <div className="pcard-head">
              <span className="pcard-ref">
                {p.code} · {TRACK_BY_SLUG[p.slug] ?? p.type ?? "Programme"}
              </span>
              <span className={`pcard-status${p.status === "open" ? "" : " up"}`}>
                {p.status === "open" ? "● Open" : "○ Upcoming"}
              </span>
            </div>
            <h3>{p.name}</h3>
            <p className="pcard-desc">{p.summary}</p>
            <div className="pcard-meta">
              <div>
                <span className={`meta${i % 2 === 1 ? " on-dark" : ""}`}>Duration</span>
                <span className="val">
                  —<Tbc onDark={i % 2 === 1} />
                </span>
              </div>
              <div>
                <span className={`meta${i % 2 === 1 ? " on-dark" : ""}`}>Certification</span>
                <span className="val">
                  {p.certification ?? "MINEFOP"}
                  <Tbc onDark={i % 2 === 1} />
                </span>
              </div>
              <div>
                <span className={`meta${i % 2 === 1 ? " on-dark" : ""}`}>Cluster</span>
                <span className="val">{TRACK_BY_SLUG[p.slug] ?? "Multi-sector"}</span>
              </div>
              <div>
                <span className={`meta${i % 2 === 1 ? " on-dark" : ""}`}>Eligibility</span>
                <span className="val">18+</span>
              </div>
            </div>
            <a href={`/programmes/${p.slug}`} className={`link-inline pcard-link${i % 2 === 1 ? " on-dark" : ""}`}>
              Programme details <span className="arrow">→</span>
            </a>
          </article>
        ))}
      </div>
      {visible.length === 0 && (
        <p className="meta" style={{ padding: "32px 0" }}>
          No programmes match this filter. <button className="chip-clear" onClick={() => { setTrack(null); setQ(""); }}>Reset</button>
        </p>
      )}
    </>
  );
}

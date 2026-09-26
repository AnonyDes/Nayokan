"use client";

import { useState } from "react";
import type { Cluster } from "@/platform/content/types";
import { Tbc } from "@/ui/components/tbc";
import { MediaSlot } from "@/ui/components/media-slot";

// Cluster directory grid with sector chips (vti-clusters.html).
export function ClusterGrid({ clusters }: { clusters: Cluster[] }) {
  const sectors = [...new Set(clusters.map((c) => c.sector))];
  const [sector, setSector] = useState<string | null>(null);
  const visible = sector ? clusters.filter((c) => c.sector === sector) : clusters;

  return (
    <>
      <div className="filter-bar">
        <span className="fb-label">Sectors</span>
        <button className={`chip${!sector ? " on" : ""}`} aria-pressed={!sector} onClick={() => setSector(null)}>
          All <span className="count">{clusters.length}</span>
        </button>
        {sectors.map((s) => (
          <button key={s} className={`chip${sector === s ? " on" : ""}`} aria-pressed={sector === s} onClick={() => setSector(sector === s ? null : s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="pgrid">
        {visible.map((c) => (
          <article className="pcard pcard--media" key={c.id}>
            <MediaSlot slot="cluster-detail" media={c.heroImage} ratio="16:9" variant="compact" className="pcard-media" />
            <div className="pcard-head">
              <span className="pcard-ref">
                {c.code} · {c.sector}
              </span>
              <span className={`pcard-status${c.statusLabel === "Forming" || c.statusLabel === "Planned" ? " up" : ""}`}>
                {c.statusLabel === "Active" ? "● Active" : `○ ${c.statusLabel ?? "Forming"}`}
              </span>
            </div>
            <h3>
              {c.name}
              <Tbc>details tbc</Tbc>
            </h3>
            <p className="pcard-desc">{c.summary}</p>
            <div className="pcard-meta">
              <div>
                <span className="meta">Members</span>
                <span className="val">
                  {c.memberCount ?? "—"}
                  {c.memberCount == null && <Tbc />}
                </span>
              </div>
              <div>
                <span className="meta">Anchor</span>
                <span className="val">{c.location ?? <Tbc>location tbc</Tbc>}</span>
              </div>
              <div>
                <span className="meta">Feeds into</span>
                <span className="val">Startup C. · VC</span>
              </div>
              <div>
                <span className="meta">Status</span>
                <span className="val">{c.statusLabel ?? "Forming"}</span>
              </div>
            </div>
            <a href={`/clusters/${c.slug}`} className="link-inline pcard-link">
              Cluster details <span className="arrow">→</span>
            </a>
          </article>
        ))}
      </div>
    </>
  );
}

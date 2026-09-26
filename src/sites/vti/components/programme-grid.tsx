"use client";

import { useState } from "react";
import type { Programme } from "@/platform/content/types";
import { ProgrammeCard, programmeStatus } from "@/ui/components/programme-card";

// VTI programme catalogue: status filter + inline search over image cards.
// Filters are derived from the programme records themselves, so a chip never
// leads to an empty result set that the data cannot fill.

type StatusFilter = "all" | "open" | "upcoming";

export function VtiProgrammeGrid({ programmes }: { programmes: Programme[] }) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [q, setQ] = useState("");
  const reset = () => {
    setStatus("all");
    setQ("");
  };

  const openCount = programmes.filter((p) => programmeStatus(p).open).length;
  const visible = programmes.filter(
    (p) =>
      (status === "all" || (status === "open") === programmeStatus(p).open) &&
      (!q || `${p.name} ${p.summary}`.toLowerCase().includes(q.toLowerCase())),
  );

  const chips: { id: StatusFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: programmes.length },
    { id: "open", label: "Open for applications", count: openCount },
    { id: "upcoming", label: "Upcoming", count: programmes.length - openCount },
  ];

  return (
    <>
      <div className="filter-bar">
        <span className="fb-label">Filter</span>
        {chips.map((c) => (
          <button key={c.id} className={`chip${status === c.id ? " on" : ""}`} aria-pressed={status === c.id} onClick={() => setStatus(c.id)}>
            {c.label} <span className="count">{c.count}</span>
          </button>
        ))}
        <label className="search-inline" style={{ marginLeft: 16 }}>
          <input type="text" placeholder="Search programmes" aria-label="Search programmes" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <button className="chip-clear" onClick={reset}>
          Reset
        </button>
      </div>

      {visible.length > 0 ? (
        <div className="ed-grid">
          {visible.map((p) => (
            <ProgrammeCard key={p.id} programme={p} href={`/programmes/${p.slug}`} />
          ))}
        </div>
      ) : (
        <div className="ed-empty">
          <p>No programmes match this search.</p>
          <button type="button" className="link-inline" onClick={reset}>
            Show all programmes <span className="arrow">→</span>
          </button>
        </div>
      )}
    </>
  );
}

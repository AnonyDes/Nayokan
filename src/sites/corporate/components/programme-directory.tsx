"use client";

import { useState } from "react";
import type { Programme } from "@/platform/content/types";
import { trackEvent } from "@/platform/analytics";
import { ProgrammeCard } from "@/ui/components/programme-card";
import { programmeHref } from "@/sites/corporate/programme-href";

// Programmes directory: filterable image-card grid (programmes.html).

const FILTERS = [
  { label: "All divisions", world: undefined },
  { label: "VTI", world: "vti" },
  { label: "Startup Centre", world: "startup" },
  { label: "Venture Capital", world: "venture_capital" },
  { label: "Hospitality", world: "hospitality" },
] as const;

export function ProgrammeDirectory({ programmes }: { programmes: Programme[] }) {
  const [world, setWorld] = useState<(typeof FILTERS)[number]["world"]>(undefined);
  const [openOnly, setOpenOnly] = useState(false);

  const visible = programmes.filter(
    (p) => (!world || p.world === world) && (!openOnly || p.status === "open" || p.status === "closing_soon"),
  );
  const reset = () => {
    setWorld(undefined);
    setOpenOnly(false);
  };

  return (
    <>
      <div className="prog-directory-filters" role="group" aria-label="Filter programmes">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            className={`prog-directory-filter${world === f.world ? " active" : ""}`}
            aria-pressed={world === f.world}
            onClick={() => {
              setWorld(f.world);
              trackEvent("filter", { site: "corporate", world: "corporate", list: "programmes", value: f.label });
            }}
          >
            {f.label}
          </button>
        ))}
        <button
          className={`prog-directory-filter${openOnly ? " active" : ""}`}
          aria-pressed={openOnly}
          onClick={() => {
            setOpenOnly((v) => !v);
            trackEvent("filter", { site: "corporate", world: "corporate", list: "programmes", value: "open-only" });
          }}
        >
          Open only
        </button>
        <span className="prog-count" aria-live="polite">
          {visible.length} of {programmes.length} shown
        </span>
      </div>

      {visible.length > 0 ? (
        <div className="ed-grid">
          {visible.map((p) => (
            <ProgrammeCard key={p.id} programme={p} href={programmeHref(p)} showWorld />
          ))}
        </div>
      ) : (
        <div className="ed-empty">
          <p>No programmes match these filters.</p>
          <button type="button" className="link-inline" onClick={reset}>
            Show all programmes <span className="arrow">→</span>
          </button>
        </div>
      )}
    </>
  );
}

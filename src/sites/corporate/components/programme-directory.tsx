"use client";

import { useState } from "react";
import type { Programme } from "@/platform/content/types";
import { Tbc } from "@/ui/components/tbc";
import { siteUrl } from "@/platform/sites/registry";
import { trackEvent } from "@/platform/analytics";

// Programmes directory — filterable card grid (programmes.html).
// Programme detail pages live on the owning site: VTI/Startup programmes link
// cross-site via siteUrl(); corporate-world programmes link to the world page.

const FILTERS = [
  { label: "All divisions", world: undefined },
  { label: "VTI", world: "vti" },
  { label: "Startup Centre", world: "startup" },
  { label: "Venture Capital", world: "venture_capital" },
  { label: "Hospitality", world: "hospitality" },
] as const;

const WORLD_LABEL: Record<Programme["world"], string> = {
  corporate: "Nayokan",
  vti: "VTI",
  startup: "Startup Centre",
  venture_capital: "Venture Capital",
  hospitality: "Hospitality",
};

function programmeHref(p: Programme): string {
  if (p.site === "vti") return siteUrl("vti", `/programmes/${p.slug}`);
  if (p.site === "startup") return siteUrl("startup", `/programme`);
  return p.world === "hospitality" ? "/hospitality" : "/venture-capital";
}

function footText(p: Programme): { location: string; window: string; windowTbc: boolean } {
  const windowText: Record<string, string> = {
    "professional-growth-engineering": "Rolling · reviewed monthly",
    "skills-for-industrialisation": "Cohort · Sept 2026",
    "cluster-formation-programme": "Opens Q1 2027",
    "innovation-commercialization": "Rolling · monthly review",
    "university-research-commercialization": "Rolling",
    "founder-fellowship": "Opens 2027",
    "seed-ticket-programme": "Continuous",
    "growth-co-investment-vehicle": "Structuring · 2027",
    "long-stay-residency": "Continuous",
  };
  const tbcSlugs = new Set(["skills-for-industrialisation", "cluster-formation-programme", "founder-fellowship", "growth-co-investment-vehicle"]);
  return {
    location: p.location ?? "—",
    window: windowText[p.slug] ?? (p.applicationOpen ? "Rolling" : "Upcoming"),
    windowTbc: tbcSlugs.has(p.slug),
  };
}

export function ProgrammeDirectory({ programmes }: { programmes: Programme[] }) {
  const [world, setWorld] = useState<(typeof FILTERS)[number]["world"]>(undefined);
  const [openOnly, setOpenOnly] = useState(false);

  const visible = programmes.filter(
    (p) => (!world || p.world === world) && (!openOnly || p.status === "open"),
  );

  return (
    <>
      <div className="prog-directory-filters" role="group" aria-label="Filter programmes">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            className={`prog-directory-filter${world === f.world && !openOnly ? " active" : ""}`}
            aria-pressed={world === f.world && !openOnly}
            onClick={() => {
              setWorld(f.world);
              setOpenOnly(false);
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
        <span className="prog-count">
          {visible.length} programmes · {visible.filter((p) => p.status === "open").length} open
        </span>
      </div>

      <div className="prog-directory-grid">
        {visible.map((p) => {
          const foot = footText(p);
          return (
            <a key={p.id} href={programmeHref(p)} className="prog-directory-card">
              <div className="head">
                <span className="world">
                  {p.code} · {WORLD_LABEL[p.world]}
                </span>
                <span className={`status${p.status === "open" ? "" : " upcoming"}`}>
                  {p.status === "open" ? "● Open" : "○ Upcoming"}
                </span>
              </div>
              <h3>{p.name}</h3>
              <p>{p.summary}</p>
              <div className="foot">
                <span>{foot.location}</span>
                <span>
                  {foot.window} {foot.windowTbc && <Tbc />}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </>
  );
}

import { siteUrl } from "@/platform/sites/registry";
import { WORLDS_DIRECTORY, type WorldEntry } from "@/platform/content/worlds";
import { isTbc, Tbc } from "@/ui/components/tbc";
import { MediaSlot } from "@/ui/components/media-slot";

// Four Worlds: the ecosystem's visual anchor. A 2×2 editorial composition of
// full-bleed photographic panels in black / green, each explaining its world
// and routing to its destination (VTI and Startup Centre leave for their own
// sub-sites; Venture Capital and Hospitality stay on the corporate site).
//
//   variant="home"      → headline, description, CTA
//   variant="directory" → adds key activities, system stages and destination
//                         (What We Do ecosystem directory)

function href(w: WorldEntry): string {
  return w.crossSite ? siteUrl(w.destination.site, w.destination.path) : w.destination.path;
}

const PH_TONE: Record<WorldEntry["tone"], "dark" | "green" | "navy"> = {
  black: "dark",
  green: "green",
  "green-navy": "navy",
};

export function FourWorlds({
  variant = "home",
  headingLevel = 3,
}: {
  variant?: "home" | "directory";
  headingLevel?: 2 | 3;
}) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <ul className={`fw fw--${variant}`} aria-label="The four Nayokan worlds">
      {WORLDS_DIRECTORY.map((w) => (
        <li key={w.world} className={`fw-item fw--${w.tone}`}>
          <a
            className="fw-panel"
            href={href(w)}
            data-world-transition={w.crossSite ? w.destination.site : undefined}
            aria-label={`${w.name}: ${w.cta}${w.crossSite ? ` (opens ${w.destination.label})` : ""}`}
          >
            <div className="fw-media">
              <MediaSlot slot={w.slot} fill variant="compact" tone={PH_TONE[w.tone]} />
            </div>
            <div className="fw-scrim" aria-hidden="true" />
            <div className="fw-body">
              <div className="fw-top">
                <span className="fw-num">{w.num}</span>
                <span className="fw-eyebrow">{w.name}</span>
                <span className="fw-dest">
                  {w.destination.label}
                  {w.crossSite ? " ↗" : ""}
                </span>
              </div>
              <div className="fw-bottom">
                <span className="fw-rule" aria-hidden="true" />
                <H className="fw-headline">
                  {w.headline}
                  {isTbc(w.provenance, "headline") && (
                    <>
                      {" "}
                      <Tbc onDark>content to be confirmed</Tbc>
                    </>
                  )}
                </H>
                <p className="fw-desc">{w.description}</p>
                {variant === "directory" && (
                  <div className="fw-detail">
                    <ul className="fw-activities" aria-label={`${w.shortName} key activities`}>
                      {w.activities.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                    <span className="fw-stages">{w.stages}</span>
                  </div>
                )}
                <span className="fw-cta">
                  {w.cta}
                  <span className="fw-arrow" aria-hidden="true">
                    {w.crossSite ? "↗" : "→"}
                  </span>
                </span>
              </div>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

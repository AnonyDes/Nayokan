import { WORLDS_DIRECTORY, worldHref } from "@/platform/content/worlds";
import { MediaSlot } from "@/ui/components/media-slot";

// Four Worlds: the ecosystem's visual anchor on the home page. A 2×2
// editorial composition of full-bleed photographic panels alternating black
// and green. Each panel explains its world (positioning, what it is, who it
// serves) before routing on. VTI and the Startup Centre leave for their own
// sites; Venture Capital and Hospitality stay on the corporate site. What We
// Do carries the long-form explanation of each world.

export function FourWorlds({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <ul className="fw" aria-label="The four Nayokan worlds">
      {WORLDS_DIRECTORY.map((w) => (
        <li key={w.world} className={`fw-item fw--${w.tone}`}>
          <a
            className="fw-panel"
            href={worldHref(w)}
            data-world-transition={w.crossSite ? w.destination.site : undefined}
            aria-label={`${w.name}: ${w.cta}${w.crossSite ? ` (opens ${w.destination.label})` : ""}`}
          >
            <div className="fw-media">
              <MediaSlot slot={w.slot} fill variant="compact" tone={w.tone === "green" ? "green" : "dark"} />
            </div>
            <div className="fw-scrim" aria-hidden="true" />
            <div className="fw-body">
              <div className="fw-top">
                <span className="fw-num" aria-hidden="true">
                  {w.num}
                </span>
                <span className="fw-dest">
                  {w.destination.label}
                  {w.crossSite ? " ↗" : ""}
                </span>
              </div>
              <div className="fw-bottom">
                <span className="fw-rule" aria-hidden="true" />
                <H className="fw-name">{w.name}</H>
                <p className="fw-pos">{w.positioning}</p>
                <p className="fw-desc">{w.description}</p>
                <p className="fw-for">
                  <span>For</span> {w.audience}
                </p>
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

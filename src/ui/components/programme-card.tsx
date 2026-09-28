import type { Programme } from "@/platform/content/types";
import type { ImageSlotId } from "@/ui/media/image-briefs";
import { MediaSlot } from "@/ui/components/media-slot";
import { getNamedIllustrative } from "@/ui/media/image-briefs";
import { confirmedValue } from "@/platform/content/governance";

// Programme image card used by every programme listing (corporate directory,
// VTI catalogue, related programmes). Shows only what the record states and
// Nayokan has confirmed; anything else is left out, never defaulted.

export const PROGRAMME_WORLD_LABEL: Record<Programme["world"], string> = {
  corporate: "Nayokan",
  vti: "VTI",
  startup: "Startup Centre",
  venture_capital: "Venture Capital",
  hospitality: "Hospitality",
};

const STATUS_LABEL: Record<Programme["status"], string> = {
  open: "Open",
  closing_soon: "Closing soon",
  upcoming: "Upcoming",
  closed: "Closed",
  pilot: "Pilot",
  under_development: "In development",
};

export function programmeSlot(p: Programme): ImageSlotId {
  if (p.world === "startup") return "programme-startup";
  if (p.world === "venture_capital") return "programme-vc";
  if (p.world === "hospitality") return "programme-hospitality";
  return "programme-vti";
}

export function programmeStatus(p: Programme): { label: string; open: boolean } {
  return { label: STATUS_LABEL[p.status], open: p.status === "open" || p.status === "closing_soon" };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function ProgrammeCard({ programme: p, href, showWorld = false }: { programme: Programme; href: string; showWorld?: boolean }) {
  const status = programmeStatus(p);
  const deadline = confirmedValue(p.provenance, "applicationDeadline", p.applicationDeadline);
  const duration = confirmedValue(p.provenance, "duration", p.duration);
  const location = confirmedValue(p.provenance, "location", p.location);
  return (
    <a href={href} className="ed-card">
      <MediaSlot slot={programmeSlot(p)} media={p.heroImage} illustrative={getNamedIllustrative(`programme-${p.slug}`, `Illustrative image for ${p.name}.`)} ratio="3:2" variant="compact" />
      <div className="ed-card-body">
        <div className="ed-card-head">
          <span>
            {p.code ? `${p.code} · ` : ""}
            {showWorld ? PROGRAMME_WORLD_LABEL[p.world] : p.type ?? "Programme"}
          </span>
          <span className={`ed-card-status${status.open ? "" : " is-upcoming"}`}>
            {status.open ? "● " : "○ "}
            {status.label}
          </span>
        </div>
        <h3>{p.name}</h3>
        <p>{p.summary}</p>
        <div className="ed-card-foot">
          <span>{location ?? PROGRAMME_WORLD_LABEL[p.world]}</span>
          <span>
            {deadline ? `Deadline ${formatDate(deadline)}` : duration ?? <span className="go">Details →</span>}
          </span>
        </div>
      </div>
    </a>
  );
}

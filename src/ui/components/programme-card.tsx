import type { Programme } from "@/platform/content/types";
import type { ImageSlotId } from "@/ui/media/image-briefs";
import { MediaSlot } from "@/ui/components/media-slot";
import { Tbc, isTbc } from "@/ui/components/tbc";

// Programme image card used by every programme listing (corporate directory,
// VTI catalogue, related programmes). Shows only what the record states;
// missing or unconfirmed facts render as "tbc", never as defaults.

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
  const deadlineTbc = isTbc(p.provenance, "applicationDeadline");
  return (
    <a href={href} className="ed-card">
      <MediaSlot slot={programmeSlot(p)} media={p.heroImage} ratio="3:2" variant="compact" />
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
          <span>{p.location ?? <Tbc>location tbc</Tbc>}</span>
          <span>
            {p.applicationDeadline ? (
              <>
                Deadline {formatDate(p.applicationDeadline)} {deadlineTbc && <Tbc />}
              </>
            ) : p.duration ? (
              <>
                {p.duration} {isTbc(p.provenance, "duration") && <Tbc />}
              </>
            ) : (
              <span className="go">Details →</span>
            )}
          </span>
        </div>
      </div>
    </a>
  );
}

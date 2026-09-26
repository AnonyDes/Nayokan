import type { Provenance, World } from "./types";
import type { SiteId } from "@/platform/sites/types";

// The four Nayokan worlds as presented on the corporate site (home Four Worlds
// section and the What We Do ecosystem directory). Institutional structure,
// like the Nayokan System, is static configuration (handoff I/02); the copy
// below is directional until Nayokan confirms it.
//
// Descriptions reuse approved design copy (Designs/index.html, what-we-do.html).
// Headlines and activity lists are directional and flagged for confirmation.

export interface WorldEntry {
  num: string;
  world: Exclude<World, "corporate">;
  name: string;
  shortName: string;
  headline: string;
  description: string;
  activities: string[];
  /** System stages this world operates at (What We Do). */
  stages: string;
  destination: { site: SiteId; path: string; label: string };
  /** Leaves the corporate site for a dedicated sub-site. */
  crossSite: boolean;
  cta: string;
  tone: "black" | "green" | "green-navy";
  slot: "world-vti" | "world-startup" | "world-vc" | "world-hospitality";
  provenance: Provenance;
}

const directional: Provenance = { isDemo: true, unconfirmedFields: ["headline", "activities"] };

export const WORLDS_DIRECTORY: WorldEntry[] = [
  {
    num: "01",
    world: "vti",
    name: "Vocational Training Institute",
    shortName: "VTI",
    headline: "Building practical capability.",
    description:
      "Practical skills, certification and entrepreneurial clusters: the foundation of productive capability.",
    activities: ["Practical skills training", "Certification pathways", "Entrepreneurial clusters", "Cluster onboarding"],
    stages: "Stages 01–02",
    destination: { site: "vti", path: "/", label: "vti.nayokan.org" },
    crossSite: true,
    cta: "Explore VTI",
    tone: "black",
    slot: "world-vti",
    provenance: directional,
  },
  {
    num: "02",
    world: "startup",
    name: "Startup Centre",
    shortName: "Startup Centre",
    headline: "Turning innovation into enterprise.",
    description:
      "University innovation, commercialization and venture creation. Where research becomes enterprise.",
    activities: ["University partnerships", "Commercialization programme", "Mentorship", "Opportunities and calls"],
    stages: "Stages 02–04",
    destination: { site: "startup", path: "/", label: "startup.nayokan.org" },
    crossSite: true,
    cta: "Explore Startup Centre",
    tone: "green",
    slot: "world-startup",
    provenance: directional,
  },
  {
    num: "03",
    world: "venture_capital",
    name: "Venture Capital",
    shortName: "Venture Capital",
    headline: "Capital for productive growth.",
    description:
      "Capital pathways, investment readiness and venture growth for enterprises with productive potential.",
    activities: ["Investment readiness", "Capital pathways", "Portfolio support"],
    stages: "Stages 05–06",
    destination: { site: "corporate", path: "/venture-capital", label: "nayokan.org/venture-capital" },
    crossSite: false,
    cta: "Explore Venture Capital",
    tone: "green-navy",
    slot: "world-vc",
    provenance: directional,
  },
  {
    num: "04",
    world: "hospitality",
    name: "Hospitality",
    shortName: "Hospitality",
    headline: "Building productive assets.",
    description:
      "Refined properties, guesthouses and long-term productive assets: hospitality as economic infrastructure.",
    activities: ["Guesthouses and stays", "Productive assets", "Hosting partners and visitors"],
    stages: "Stages 03 · 06",
    destination: { site: "corporate", path: "/hospitality", label: "nayokan.org/hospitality" },
    crossSite: false,
    cta: "Explore Hospitality",
    tone: "black",
    slot: "world-hospitality",
    provenance: directional,
  },
];

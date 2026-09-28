import type { World } from "./types";
import { siteUrl } from "@/platform/sites/registry";
import type { SiteId } from "@/platform/sites/types";

// The four Nayokan worlds as presented on the corporate site: the home Four
// Worlds section and the What We Do ecosystem gateway. Institutional
// structure, like the Nayokan System, is static configuration (handoff I/02).
//
// Copy is positioning, not fact: every line is reused or condensed from the
// approved copy on each world's own pages (VTI and Startup Centre home pages,
// Venture Capital and Hospitality world pages). It carries no figures, dates,
// partners or outcomes. Anything factual belongs in the CMS with provenance.

export interface WorldEntry {
  num: string;
  world: Exclude<World, "corporate">;
  /** In-page anchor on What We Do. */
  anchor: string;
  name: string;
  shortName: string;
  /** One-line positioning statement. */
  positioning: string;
  /** Short explanation (home panels). */
  description: string;
  /** What it is (What We Do). */
  whatItIs: string;
  /** Why it exists. */
  why: string;
  /** Who it serves. */
  audience: string;
  /** What it offers. */
  offers: string[];
  /** How it fits the Nayokan System. */
  systemFit: string;
  /** System stages this world operates at. */
  stages: string;
  destination: { site: SiteId; path: string; label: string };
  /** Leaves the corporate site for a dedicated sub-site. */
  crossSite: boolean;
  cta: string;
  tone: "black" | "green";
  slot: "world-vti" | "world-startup" | "world-vc" | "world-hospitality";
}

export const WORLDS_DIRECTORY: WorldEntry[] = [
  {
    num: "01",
    world: "vti",
    anchor: "vti",
    name: "Vocational Training Institute",
    shortName: "VTI",
    positioning: "Practical skills. Productive people.",
    description:
      "Practical skills, certification and entrepreneurial clusters: the foundation of productive capability.",
    whatItIs:
      "The Nayokan Vocational Training Institute develops practical, employable capability through a hands-on curriculum built around entrepreneurial clusters. Trainees learn by doing: in workshops, labs and production settings, not only in classrooms.",
    why:
      "Skills alone are not enough. VTI graduates are trained to be capable as well as knowledgeable: to create job solutions and turn their skills into productive enterprise.",
    audience: "Young Cameroonians, school leavers and workers who want practical, employable skills.",
    offers: [
      "Practical, workshop-based training",
      "Certification pathways",
      "Entrepreneurial clusters",
      "Production-oriented learning",
    ],
    systemFit:
      "VTI is where the system starts. It builds capability, then organises graduates into clusters that turn skills into production.",
    stages: "Stages 01–02 · Capability, Production",
    destination: { site: "vti", path: "/", label: "vti.nayokan.org" },
    crossSite: true,
    cta: "Explore VTI",
    tone: "black",
    slot: "world-vti",
  },
  {
    num: "02",
    world: "startup",
    anchor: "startup",
    name: "Startup Centre",
    shortName: "Startup Centre",
    positioning: "Where research becomes enterprise.",
    description:
      "University innovation, commercialization and venture creation. Where research becomes enterprise.",
    whatItIs:
      "The Nayokan Startup Centre connects university innovation, entrepreneurship and commercialization, moving ideas from research through validation into ventures with real market traction.",
    why:
      "Promising research and ideas too often stop at the prototype. The Centre gives them a structured commercialization pathway: model, validate, commercialize, scale.",
    audience: "University researchers, students, innovators and early-stage founders.",
    offers: [
      "University innovation partnerships",
      "Commercialization programme",
      "Venture building and market validation",
      "Mentorship",
      "Opportunities and calls",
    ],
    systemFit:
      "The Centre turns innovation into enterprise and connects it to markets. Ventures ready to grow move on to Nayokan Venture Capital.",
    stages: "Stages 02–04 · Production, Markets, Innovation",
    destination: { site: "startup", path: "/", label: "startup.nayokan.org" },
    crossSite: true,
    cta: "Explore Startup Centre",
    tone: "green",
    slot: "world-startup",
  },
  {
    num: "03",
    world: "venture_capital",
    anchor: "venture-capital",
    name: "Venture Capital",
    shortName: "Venture Capital",
    positioning: "Capital for productive enterprises.",
    description:
      "Capital pathways, investment readiness and venture growth for enterprises with productive potential.",
    whatItIs:
      "Nayokan Venture Capital provides structured capital pathways for Cameroonian enterprises with productive potential, sourced from within the ecosystem and from selected institutional partnerships.",
    why:
      "Capital works best when it arrives with capability. Nayokan VC is designed to invest alongside training, mentorship, market access and productive assets, never in isolation.",
    audience:
      "Founders of productive enterprises, and institutional investors, development finance partners and co-investors.",
    offers: [
      "Investment readiness",
      "Patient, stage-matched instruments",
      "Portfolio support",
      "Co-investment partnerships",
    ],
    systemFit:
      "Venture Capital mobilises capital for enterprises that come through the clusters and the Startup Centre, closing the gap between a validated venture and a growing one.",
    stages: "Stage 05 · Capital",
    destination: { site: "corporate", path: "/venture-capital", label: "nayokan.org/venture-capital" },
    crossSite: false,
    cta: "Explore Venture Capital",
    tone: "black",
    slot: "world-vc",
  },
  {
    num: "04",
    world: "hospitality",
    anchor: "hospitality",
    name: "Hospitality",
    shortName: "Hospitality",
    positioning: "Hospitality as productive infrastructure.",
    description:
      "Refined guesthouses and long-term productive assets: hospitality as economic infrastructure.",
    whatItIs:
      "Nayokan Hospitality treats guesthouses and properties as productive assets: economic infrastructure rather than decoration, run to institutional standards.",
    why:
      "A well-run guesthouse anchors an ecosystem. It hosts visitors, investors, researchers and partners, and returns value to Nayokan's wider work.",
    audience: "Visiting partners and delegations, researchers, investors and long-stay guests.",
    offers: ["Guesthouse stays", "Long-stay accommodation", "Meeting and reception space", "Productive-asset development"],
    systemFit:
      "Hospitality creates demand by hosting the people the ecosystem works with, and builds the long-term productive assets that close the loop.",
    stages: "Stages 03 · 06 · Markets, Productive Assets",
    destination: { site: "corporate", path: "/hospitality", label: "nayokan.org/hospitality" },
    crossSite: false,
    cta: "Explore Hospitality",
    tone: "green",
    slot: "world-hospitality",
  },
];

/** Destination URL: dedicated sub-site for VTI / Startup, corporate path otherwise. */
export function worldHref(w: WorldEntry): string {
  return w.crossSite ? siteUrl(w.destination.site, w.destination.path) : w.destination.path;
}

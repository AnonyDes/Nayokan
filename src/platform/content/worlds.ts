import type { World } from "./types";
import { siteUrl } from "@/platform/sites/registry";
import type { SiteId } from "@/platform/sites/types";

export const NAYOKAN_STAGES = [
  { num: "01", title: "Learn practical skills", desc: "Build skills you can use at work or in your own business.", tag: "Vocational Training Institute" },
  { num: "02", title: "Make products and offer services", desc: "Work with others to put your skills to use.", tag: "VTI · Startup Centre" },
  { num: "03", title: "Find customers", desc: "Reach people in Cameroon and beyond.", tag: "Startup Centre · Hospitality" },
  { num: "04", title: "Test new ideas", desc: "Turn promising ideas into products people can use.", tag: "Startup Centre" },
  { num: "05", title: "Prepare for funding", desc: "Get your business ready for investment.", tag: "Venture Capital" },
  { num: "06", title: "Create places to work and stay", desc: "Manage spaces that support local business and welcome visitors.", tag: "Hospitality" },
];

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

export const STARTUP_CENTRE_COPY = {
  positioning: "Help for your next business idea.",
  description: "Test an idea, build a product and prepare to reach customers.",
  whatItIs:
    "We help founders, researchers and companies test ideas, build products and find customers.",
  why:
    "The Centre helps you find out whether your idea solves a problem people will pay to fix.",
  audience:
    "Researchers, students, independent innovators, early-stage founders, universities and companies seeking innovation partners.",
  systemFit:
    "The Centre helps teams get ready to sell. Businesses ready to grow can explore investment through Nayokan Venture Capital.",
  stages: "Stages 02–04 · Make products, find customers, test ideas",
  offers: [
    "Help turning research into products",
    "Support for starting a business",
    "Programmes for companies with a problem to solve",
    "Help testing ideas with customers",
    "Mentoring and support to bring products to market",
    "Funding opportunities and calls for ideas",
  ],
};

export const WORLDS_DIRECTORY: WorldEntry[] = [
  {
    num: "01",
    world: "vti",
    anchor: "vti",
    name: "Vocational Training Institute",
    shortName: "VTI",
    positioning: "Learn practical skills for work and business.",
    description:
      "Hands-on training for people who want to learn a skill for work or business.",
    whatItIs:
      "The Vocational Training Institute helps people learn by doing, with practice in workshops and labs.",
    why:
      "The training helps people build skills they can use at work or in a business of their own.",
    audience: "Young Cameroonians, school leavers and workers who want to learn practical skills.",
    offers: [
      "Hands-on training",
      "Practice with digital tools",
      "Support for groups of trainees and small businesses working together",
    ],
    systemFit:
      "Training helps people build skills they can put to work in local businesses.",
    stages: "Stages 01–02 · Learn skills and make products",
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
    ...STARTUP_CENTRE_COPY,
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
      "Funding can help a business grow when it comes with training, mentoring and help finding customers.",
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
    stages: "Stage 05 · Prepare for funding",
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
    positioning: "Places to stay and meet.",
    description:
      "Guesthouses and spaces for visiting guests and partners.",
    whatItIs:
      "Nayokan Hospitality focuses on places for visitors and partners to stay or meet.",
    why:
      "A well-run guesthouse anchors an ecosystem. It hosts visitors, investors, researchers and partners, and returns value to Nayokan's wider work.",
    audience: "Visiting partners and delegations, researchers, investors and long-stay guests.",
    offers: ["Guesthouse stays", "Long-stay accommodation", "Meeting and reception space", "Property development"],
    systemFit:
      "Hospitality helps Nayokan host visitors and partners and gives them space to work together.",
    stages: "Stages 03 and 06 · Find customers and create places to work and stay",
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

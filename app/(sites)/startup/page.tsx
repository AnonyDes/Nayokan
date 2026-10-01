import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { WorldHero, WorldLocator } from "@/ui/components/heroes";
import { SectionHeader } from "@/ui/components/section-header";
import { onlyConfirmed } from "@/platform/content/governance";
import { MediaSlot } from "@/ui/components/media-slot";
import { PublishingNote } from "@/ui/components/publishing-note";
import { MentorKinds } from "@/sites/startup/components/mentor-kinds";
import { RelatedStrip, WORLD_LINKS } from "@/ui/components/strips";

export const metadata: Metadata = {
  title: "Startup Centre",
  description:
    "The Nayokan Startup Centre connects university innovation, entrepreneurship and commercialization — moving ideas from research through validation into ventures with real market traction.",
  alternates: canonical("/"),
};

const PIPELINE = [
  { num: "01", title: "Idea / Research", desc: "Original research, academic outputs and technology ideas that show productive potential — sourced from universities and independent innovators.", tag: "Universities · Innovators" },
  { num: "02", title: "Model", desc: "Business-model design, value proposition, unit economics and initial venture architecture — done with Nayokan mentors.", tag: "Mentorship · Framework" },
  { num: "03", title: "Validate", desc: "Market validation, pilot customers, technical feasibility and first-revenue evidence — before capital deployment.", tag: "Pilots · Customers" },
  { num: "04", title: "Commercialize", desc: "Structured go-to-market — the industry-application-focused programme, with partners for distribution and adoption.", tag: "Programme · Partners" },
  { num: "05", title: "Scale", desc: "Handover into Nayokan Venture Capital for growth funding, or into strategic partnerships for continued expansion.", tag: "→ Venture Capital" },
];

// What a university partnership covers. Framework, not a partner list:
// institutions are named only once a partnership is confirmed.
const UNIVERSITY_FRAMEWORK = [
  { title: "Research into ventures", desc: "A route for research outputs with productive potential into the commercialization pipeline." },
  { title: "Shared IP framework", desc: "Clear, agreed terms for intellectual property before any venture is formed." },
  { title: "Revenue and equity", desc: "Revenue sharing and long-term equity stakes in the ventures that result." },
  { title: "Students and researchers", desc: "Access to mentorship, programmes and opportunities for the university's innovators." },
];

// Innovation in practice: illustrative photography for the Startup Centre's
// world (founders, prototypes, mentoring), until Nayokan's own is supplied.
const PRACTICE: { slot: "startup-programme-hero" | "startup-commercialization" | "world-startup"; label: string }[] = [
  { slot: "startup-programme-hero", label: "001 · Founders at work" },
  { slot: "startup-commercialization", label: "002 · Prototype to product" },
  { slot: "world-startup", label: "003 · Mentorship" },
];

// Living commercialization schematic: shows how innovation enters, circulates and exits.
function Blueprint() {
  return (
    <div className="startup-blueprint" aria-label="Schéma animé du circuit de valorisation Nayokan Startup Centre">
      <div className="blueprint-corners">
        <span />
        <span />
        <span />
        <span />
      </div>

      <svg
        className="blueprint-svg"
        viewBox="0 0 460 560"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="bp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="20" y2="0" stroke="rgba(25, 230, 57, 0.05)" strokeWidth="0.8" />
            <line x1="0" y1="0" x2="0" y2="20" stroke="rgba(25, 230, 57, 0.05)" strokeWidth="0.8" />
          </pattern>

          {/* Glow filters */}
          <filter id="bp-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="bp-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" result="blur1" />
            <feGaussianBlur stdDeviation="2.5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradients */}
          <linearGradient id="bp-grad-vc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#19E639" />
            <stop offset="100%" stopColor="#0B9E25" />
          </linearGradient>
          <linearGradient id="bp-grad-card" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#131B15" />
            <stop offset="100%" stopColor="#0E1611" />
          </linearGradient>

          {/* Arrowhead marker */}
          <marker id="bp-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <polygon points="0,1 8,5 0,9" fill="#19E639" />
          </marker>
        </defs>

        {/* Background grid fill */}
        <rect width="460" height="560" fill="url(#bp-grid)" />

        {/* HEADER STATUS BAR */}
        <rect x="20" y="16" width="168" height="20" rx="3" fill="rgba(25, 230, 57, 0.08)" stroke="rgba(25, 230, 57, 0.28)" strokeWidth="0.8" />
        <circle cx="30" cy="26" r="3.2" fill="#19E639" className="bp-beacon" filter="url(#bp-glow)" />
        <text x="40" y="29.5" fontFamily="var(--font-mono, monospace)" fontSize="8" letterSpacing="1.2" fill="#19E639" fontWeight="600">
          CIRCUIT · ACTIF · EN CONTINU
        </text>
        <text x="440" y="29.5" textAnchor="end" fontFamily="var(--font-mono, monospace)" fontSize="8" letterSpacing="1" fill="rgba(255, 255, 255, 0.45)">
          PROTOCOLE NAYOKAN · v2.4
        </text>
        <line x1="20" y1="44" x2="440" y2="44" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.8" />

        {/* THREE COLUMNS TITLES */}
        <text x="20" y="64" fontFamily="var(--font-mono, monospace)" fontSize="8.5" letterSpacing="1.5" fill="#19E639" fontWeight="600">
          01 · ENTRÉES R&amp;D
        </text>
        <text x="156" y="64" fontFamily="var(--font-mono, monospace)" fontSize="8.5" letterSpacing="1.5" fill="#19E639" fontWeight="600">
          02 · MOTEUR D&apos;INCUBATION
        </text>
        <text x="345" y="64" fontFamily="var(--font-mono, monospace)" fontSize="8.5" letterSpacing="1.5" fill="#19E639" fontWeight="600">
          03 · SORTIES MARCHÉ
        </text>

        {/* ======================================================== */}
        {/* TRANSMISSION WIRES & CIRCUIT PATHS (UNDERNEATH BOXES)    */}
        {/* ======================================================== */}

        {/* Input Wire 1: Labs -> Ingest */}
        <path d="M 108 101 C 130 101, 132 122, 154 122" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.6" fill="none" />
        <path d="M 108 101 C 130 101, 132 122, 154 122" stroke="#19E639" strokeWidth="1.6" fill="none" className="bp-flow-line" markerEnd="url(#bp-arr)" />

        {/* Input Wire 2: Tech -> Ingest */}
        <path d="M 108 163 C 130 163, 132 125, 154 125" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.6" fill="none" />
        <path d="M 108 163 C 130 163, 132 125, 154 125" stroke="#19E639" strokeWidth="1.6" fill="none" className="bp-flow-line" markerEnd="url(#bp-arr)" />

        {/* Input Wire 3: Field -> Validate */}
        <path d="M 108 225 C 130 225, 132 200, 154 200" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.6" fill="none" />
        <path d="M 108 225 C 130 225, 132 200, 154 200" stroke="#19E639" strokeWidth="1.6" fill="none" className="bp-flow-line" markerEnd="url(#bp-arr)" />

        {/* Internal Core Wire 1: Ingest -> Validate */}
        <path d="M 225 148 L 225 174" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.8" fill="none" />
        <path d="M 225 148 L 225 174" stroke="#19E639" strokeWidth="1.8" fill="none" className="bp-flow-line" markerEnd="url(#bp-arr)" />

        {/* Internal Core Wire 2: Validate -> Commercialize */}
        <path d="M 225 226 L 225 252" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.8" fill="none" />
        <path d="M 225 226 L 225 252" stroke="#19E639" strokeWidth="1.8" fill="none" className="bp-flow-line" markerEnd="url(#bp-arr)" />

        {/* Mentor Circulation Loop (Comm -> Validate) */}
        <path d="M 296 292 C 326 292, 326 200, 296 200" stroke="rgba(25, 230, 57, 0.4)" strokeWidth="1.4" strokeDasharray="3 4" fill="none" className="bp-flow-loop" markerEnd="url(#bp-arr)" />

        {/* Exit Wire 1: Comm -> Nayokan VC */}
        <path d="M 296 270 C 322 270, 324 119, 345 119" stroke="rgba(255, 255, 255, 0.14)" strokeWidth="1.8" fill="none" />
        <path d="M 296 270 C 322 270, 324 119, 345 119" stroke="#19E639" strokeWidth="1.8" fill="none" className="bp-flow-line" markerEnd="url(#bp-arr)" />

        {/* Exit Wire 2: Comm -> Enterprise */}
        <path d="M 296 280 C 320 280, 324 200, 345 200" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5" fill="none" />
        <path d="M 296 280 C 320 280, 324 200, 345 200" stroke="#19E639" strokeWidth="1.5" fill="none" className="bp-flow-line" markerEnd="url(#bp-arr)" />

        {/* Exit Wire 3: Comm -> Production */}
        <path d="M 296 290 C 320 290, 324 278, 345 278" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5" fill="none" />
        <path d="M 296 290 C 320 290, 324 278, 345 278" stroke="#19E639" strokeWidth="1.5" fill="none" className="bp-flow-line" markerEnd="url(#bp-arr)" />

        {/* ======================================================== */}
        {/* ANIMATED PACKETS (LIGHT PARTICLES MOVING ON WIRES)       */}
        {/* ======================================================== */}

        {/* Stream 1: Labs Inflow */}
        <circle r="3.5" fill="#19E639" filter="url(#bp-glow)">
          <animateMotion dur="2.4s" repeatCount="indefinite" path="M 108 101 C 130 101, 132 122, 154 122" />
        </circle>
        <circle r="1.8" fill="#FFFFFF">
          <animateMotion dur="2.4s" repeatCount="indefinite" path="M 108 101 C 130 101, 132 122, 154 122" />
        </circle>
        <circle r="3" fill="#19E639" filter="url(#bp-glow)">
          <animateMotion dur="2.4s" begin="1.2s" repeatCount="indefinite" path="M 108 101 C 130 101, 132 122, 154 122" />
        </circle>

        {/* Stream 2: Tech Inflow */}
        <circle r="3.5" fill="#19E639" filter="url(#bp-glow)">
          <animateMotion dur="2.1s" begin="0.3s" repeatCount="indefinite" path="M 108 163 C 130 163, 132 125, 154 125" />
        </circle>
        <circle r="1.8" fill="#FFFFFF">
          <animateMotion dur="2.1s" begin="0.3s" repeatCount="indefinite" path="M 108 163 C 130 163, 132 125, 154 125" />
        </circle>

        {/* Stream 3: Field Inflow */}
        <circle r="3.5" fill="#19E639" filter="url(#bp-glow)">
          <animateMotion dur="2.5s" begin="0.7s" repeatCount="indefinite" path="M 108 225 C 130 225, 132 200, 154 200" />
        </circle>
        <circle r="1.8" fill="#FFFFFF">
          <animateMotion dur="2.5s" begin="0.7s" repeatCount="indefinite" path="M 108 225 C 130 225, 132 200, 154 200" />
        </circle>

        {/* Core Stream: Ingest -> Validate */}
        <circle r="3" fill="#19E639" filter="url(#bp-glow)">
          <animateMotion dur="1.3s" begin="0.2s" repeatCount="indefinite" path="M 225 148 L 225 174" />
        </circle>
        <circle r="1.5" fill="#FFFFFF">
          <animateMotion dur="1.3s" begin="0.2s" repeatCount="indefinite" path="M 225 148 L 225 174" />
        </circle>

        {/* Core Stream: Validate -> Comm */}
        <circle r="3" fill="#19E639" filter="url(#bp-glow)">
          <animateMotion dur="1.3s" begin="0.8s" repeatCount="indefinite" path="M 225 226 L 225 252" />
        </circle>
        <circle r="1.5" fill="#FFFFFF">
          <animateMotion dur="1.3s" begin="0.8s" repeatCount="indefinite" path="M 225 226 L 225 252" />
        </circle>

        {/* Loop Stream: Feedback Iteration */}
        <circle r="2.4" fill="#19E639">
          <animateMotion dur="2.8s" begin="0.5s" repeatCount="indefinite" path="M 296 292 C 326 292, 326 200, 296 200" />
        </circle>

        {/* Outflow 1: Comm -> Nayokan VC */}
        <circle r="4" fill="#19E639" filter="url(#bp-glow-strong)">
          <animateMotion dur="1.9s" begin="0.4s" repeatCount="indefinite" path="M 296 270 C 322 270, 324 119, 345 119" />
        </circle>
        <circle r="2" fill="#FFFFFF">
          <animateMotion dur="1.9s" begin="0.4s" repeatCount="indefinite" path="M 296 270 C 322 270, 324 119, 345 119" />
        </circle>
        <circle r="3" fill="#19E639" filter="url(#bp-glow)">
          <animateMotion dur="1.9s" begin="1.35s" repeatCount="indefinite" path="M 296 270 C 322 270, 324 119, 345 119" />
        </circle>

        {/* Outflow 2: Comm -> Enterprise */}
        <circle r="3" fill="#19E639" filter="url(#bp-glow)">
          <animateMotion dur="2.0s" begin="0.9s" repeatCount="indefinite" path="M 296 280 C 320 280, 324 200, 345 200" />
        </circle>

        {/* Outflow 3: Comm -> Production */}
        <circle r="3" fill="#19E639" filter="url(#bp-glow)">
          <animateMotion dur="2.3s" begin="1.1s" repeatCount="indefinite" path="M 296 290 C 320 290, 324 278, 345 278" />
        </circle>

        {/* ======================================================== */}
        {/* COLUMN 1: RESEARCH INPUT NODES                           */}
        {/* ======================================================== */}

        {/* Input 1: Labs */}
        <g className="bp-card">
          <rect x="20" y="78" width="88" height="46" rx="4" fill="url(#bp-grad-card)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          <text x="28" y="93" fontFamily="var(--font-mono, monospace)" fontSize="8" fill="#19E639" fontWeight="600">R1 · LABS</text>
          <text x="28" y="106" fontFamily="var(--font-heading, sans-serif)" fontSize="9.5" fontWeight="700" fill="#FFFFFF">Recherche Univ.</text>
          <text x="28" y="117" fontFamily="var(--font-mono, monospace)" fontSize="7" fill="rgba(255,255,255,0.45)">Brevets &amp; Thèses</text>
          <circle cx="108" cy="101" r="3" fill="#19E639" />
        </g>

        {/* Input 2: Tech */}
        <g className="bp-card">
          <rect x="20" y="140" width="88" height="46" rx="4" fill="url(#bp-grad-card)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          <text x="28" y="155" fontFamily="var(--font-mono, monospace)" fontSize="8" fill="#19E639" fontWeight="600">R2 · TECH</text>
          <text x="28" y="168" fontFamily="var(--font-heading, sans-serif)" fontSize="9.5" fontWeight="700" fill="#FFFFFF">Prototypes Ing.</text>
          <text x="28" y="179" fontFamily="var(--font-mono, monospace)" fontSize="7" fill="rgba(255,255,255,0.45)">Polytech &amp; Matériel</text>
          <circle cx="108" cy="163" r="3" fill="#19E639" />
        </g>

        {/* Input 3: Field */}
        <g className="bp-card">
          <rect x="20" y="202" width="88" height="46" rx="4" fill="url(#bp-grad-card)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          <text x="28" y="217" fontFamily="var(--font-mono, monospace)" fontSize="8" fill="#19E639" fontWeight="600">R3 · TERRAIN</text>
          <text x="28" y="230" fontFamily="var(--font-heading, sans-serif)" fontSize="9.5" fontWeight="700" fill="#FFFFFF">Inventeurs Locaux</text>
          <text x="28" y="241" fontFamily="var(--font-mono, monospace)" fontSize="7" fill="rgba(255,255,255,0.45)">Solutions Métiers</text>
          <circle cx="108" cy="225" r="3" fill="#19E639" />
        </g>

        {/* Inflow Sourcing Badge */}
        <rect x="20" y="260" width="88" height="84" rx="4" fill="rgba(25, 230, 57, 0.03)" stroke="rgba(25, 230, 57, 0.18)" strokeDasharray="3 3" />
        <text x="28" y="276" fontFamily="var(--font-mono, monospace)" fontSize="7" fill="#19E639" letterSpacing="0.8">SOURCING ANNUEL</text>
        <text x="28" y="295" fontFamily="var(--font-heading, sans-serif)" fontSize="13" fontWeight="800" fill="#FFFFFF">48+ Projets</text>
        <text x="28" y="310" fontFamily="var(--font-mono, monospace)" fontSize="7" fill="rgba(255,255,255,0.45)">Comité scientifique</text>
        <text x="28" y="331" fontFamily="var(--font-mono, monospace)" fontSize="7.5" fill="#19E639" fontWeight="600">FILTRAGE: ACTIF</text>

        {/* ======================================================== */}
        {/* COLUMN 2: INCUBATION ENGINE CORE                         */}
        {/* ======================================================== */}
        <rect x="146" y="74" width="158" height="274" rx="6" fill="rgba(10, 16, 12, 0.65)" stroke="rgba(25, 230, 57, 0.22)" strokeDasharray="4 4" strokeWidth="0.8" />
        <text x="156" y="88" fontFamily="var(--font-mono, monospace)" fontSize="7.5" fill="rgba(25, 230, 57, 0.85)" letterSpacing="1">
          CENTRE NAYOKAN STARTUP
        </text>

        {/* Stage 1: Ingest */}
        <g className="bp-card">
          <rect x="154" y="96" width="142" height="52" rx="4" fill="#111B14" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          <text x="164" y="111" fontFamily="var(--font-mono, monospace)" fontSize="8" fill="#19E639" fontWeight="600">01 · CADRAGE PI</text>
          <rect x="238" y="100" width="50" height="13" rx="2" fill="rgba(25, 230, 57, 0.15)" stroke="rgba(25, 230, 57, 0.3)" strokeWidth="0.5" />
          <text x="263" y="109.5" textAnchor="middle" fontFamily="var(--font-mono, monospace)" fontSize="6.5" fill="#19E639" fontWeight="700">VALIDÉ ✓</text>
          <text x="164" y="125" fontFamily="var(--font-heading, sans-serif)" fontSize="10" fontWeight="700" fill="#FFFFFF">Protection PI &amp; Modèle</text>
          <text x="164" y="138" fontFamily="var(--font-mono, monospace)" fontSize="6.8" fill="rgba(255,255,255,0.45)">Partenariats Universitaires</text>
          <circle cx="154" cy="122" r="3" fill="#19E639" />
          <circle cx="225" cy="148" r="3" fill="#19E639" />
        </g>

        {/* Stage 2: Validate */}
        <g className="bp-card">
          <rect x="154" y="174" width="142" height="52" rx="4" fill="#111B14" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          <text x="164" y="189" fontFamily="var(--font-mono, monospace)" fontSize="8" fill="#19E639" fontWeight="600">02 · VALIDATION</text>
          <rect x="234" y="178" width="54" height="13" rx="2" fill="rgba(25, 230, 57, 0.15)" stroke="rgba(25, 230, 57, 0.3)" strokeWidth="0.5" />
          <text x="261" y="187.5" textAnchor="middle" fontFamily="var(--font-mono, monospace)" fontSize="6.5" fill="#19E639" fontWeight="700">94% FEAS.</text>
          <text x="164" y="203" fontFamily="var(--font-heading, sans-serif)" fontSize="10" fontWeight="700" fill="#FFFFFF">Pilotes &amp; Faisabilité</text>
          <text x="164" y="216" fontFamily="var(--font-mono, monospace)" fontSize="6.8" fill="rgba(255,255,255,0.45)">Tests Utilisateurs &amp; MVP</text>
          <circle cx="225" cy="174" r="3" fill="#19E639" />
          <circle cx="225" cy="226" r="3" fill="#19E639" />
        </g>

        {/* Stage 3: Commercialize */}
        <g className="bp-card">
          <rect x="154" y="252" width="142" height="52" rx="4" fill="#111B14" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          <text x="164" y="267" fontFamily="var(--font-mono, monospace)" fontSize="8" fill="#19E639" fontWeight="600">03 · MARCHÉ GTM</text>
          <rect x="236" y="256" width="52" height="13" rx="2" fill="rgba(25, 230, 57, 0.15)" stroke="rgba(25, 230, 57, 0.3)" strokeWidth="0.5" />
          <text x="262" y="265.5" textAnchor="middle" fontFamily="var(--font-mono, monospace)" fontSize="6.5" fill="#19E639" fontWeight="700">PRÊT ✓</text>
          <text x="164" y="281" fontFamily="var(--font-heading, sans-serif)" fontSize="10" fontWeight="700" fill="#FFFFFF">Commercialisation</text>
          <text x="164" y="294" fontFamily="var(--font-mono, monospace)" fontSize="6.8" fill="rgba(255,255,255,0.45)">Structure Juridique &amp; Revenus</text>
          <circle cx="225" cy="252" r="3" fill="#19E639" />
          <circle cx="296" cy="270" r="3" fill="#19E639" />
        </g>

        {/* Feedback label */}
        <text x="312" y="246" textAnchor="middle" fontFamily="var(--font-mono, monospace)" fontSize="6.5" fill="#19E639" letterSpacing="0.8">
          MENTORAT ↺
        </text>

        {/* ======================================================== */}
        {/* COLUMN 3: VENTURE DESTINATIONS & OUTPUTS                 */}
        {/* ======================================================== */}

        {/* Output 1: NAYOKAN VC (Primary Luminous Node) */}
        <g className="bp-card">
          <circle cx="393" cy="119" r="16" fill="none" stroke="#19E639" className="bp-radar" />
          <circle cx="393" cy="119" r="16" fill="none" stroke="#19E639" className="bp-radar-delayed" />
          <rect x="345" y="84" width="96" height="70" rx="6" fill="url(#bp-grad-vc)" filter="url(#bp-glow)" />
          <text x="393" y="113" textAnchor="middle" fontFamily="var(--font-heading, sans-serif)" fontSize="18" fontWeight="800" fill="#060A07">
            → VC
          </text>
          <text x="393" y="128" textAnchor="middle" fontFamily="var(--font-mono, monospace)" fontSize="8" fontWeight="700" fill="#060A07" letterSpacing="0.8">
            NAYOKAN VC
          </text>
          <text x="393" y="141" textAnchor="middle" fontFamily="var(--font-mono, monospace)" fontSize="6.8" fill="#060A07" fontWeight="600">
            Amorçage &amp; Série A
          </text>
          <circle cx="345" cy="119" r="3.2" fill="#060A07" />
        </g>

        {/* Output 2: Enterprise Customers */}
        <g className="bp-card">
          <rect x="345" y="174" width="96" height="52" rx="4" fill="url(#bp-grad-card)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          <text x="353" y="189" fontFamily="var(--font-mono, monospace)" fontSize="7.5" fill="#19E639" fontWeight="600">ENTREPRISES</text>
          <text x="353" y="203" fontFamily="var(--font-heading, sans-serif)" fontSize="9.5" fontWeight="700" fill="#FFFFFF">Clients Industriels</text>
          <text x="353" y="215" fontFamily="var(--font-mono, monospace)" fontSize="6.8" fill="rgba(255,255,255,0.45)">Contrats Commerciaux</text>
          <circle cx="345" cy="200" r="3" fill="#19E639" />
        </g>

        {/* Output 3: National Production Assets */}
        <g className="bp-card">
          <rect x="345" y="252" width="96" height="52" rx="4" fill="url(#bp-grad-card)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          <text x="353" y="267" fontFamily="var(--font-mono, monospace)" fontSize="7.5" fill="#19E639" fontWeight="600">PRODUCTION</text>
          <text x="353" y="281" fontFamily="var(--font-heading, sans-serif)" fontSize="9.5" fontWeight="700" fill="#FFFFFF">Impact National</text>
          <text x="353" y="293" fontFamily="var(--font-mono, monospace)" fontSize="6.8" fill="rgba(255,255,255,0.45)">Usines &amp; Écosystème</text>
          <circle cx="345" cy="278" r="3" fill="#19E639" />
        </g>

        {/* ======================================================== */}
        {/* BOTTOM DASHBOARD: REAL-TIME ARCHITECTURE & TELEMETRY     */}
        {/* ======================================================== */}
        <rect x="20" y="365" width="420" height="175" rx="5" fill="#0C130E" stroke="rgba(25, 230, 57, 0.22)" strokeWidth="0.8" />
        
        {/* Dashboard Title Header */}
        <rect x="20" y="365" width="420" height="24" rx="5" fill="rgba(25, 230, 57, 0.08)" />
        <text x="32" y="380.5" fontFamily="var(--font-mono, monospace)" fontSize="7.5" fill="#19E639" letterSpacing="1.2" fontWeight="600">
          FIG. 02 — MONITEUR DE VALORISATION EN TEMPS RÉEL
        </text>
        <circle cx="426" cy="377" r="3.2" fill="#19E639" className="bp-beacon" />

        {/* 3 Telemetry Metrics */}
        {/* Metric 1 */}
        <text x="34" y="411" fontFamily="var(--font-mono, monospace)" fontSize="7" fill="rgba(255, 255, 255, 0.45)">
          CYCLE D&apos;ACCÉLÉRATION
        </text>
        <text x="34" y="432" fontFamily="var(--font-heading, sans-serif)" fontSize="16" fontWeight="800" fill="#FFFFFF">
          16 Semaines
        </text>
        <text x="34" y="446" fontFamily="var(--font-mono, monospace)" fontSize="7" fill="#19E639">
          Du labo au marché
        </text>

        {/* Divider 1 */}
        <line x1="165" y1="404" x2="165" y2="455" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.8" />

        {/* Metric 2 */}
        <text x="178" y="411" fontFamily="var(--font-mono, monospace)" fontSize="7" fill="rgba(255, 255, 255, 0.45)">
          SURVIE POST-PILOTE
        </text>
        <text x="178" y="432" fontFamily="var(--font-heading, sans-serif)" fontSize="16" fontWeight="800" fill="#FFFFFF">
          82.4%
        </text>
        <text x="178" y="446" fontFamily="var(--font-mono, monospace)" fontSize="7" fill="#19E639">
          Traction commerciale
        </text>

        {/* Divider 2 */}
        <line x1="305" y1="404" x2="305" y2="455" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.8" />

        {/* Metric 3 */}
        <text x="318" y="411" fontFamily="var(--font-mono, monospace)" fontSize="7" fill="rgba(255, 255, 255, 0.45)">
          ACCÈS CAPITAL NAYOKAN
        </text>
        <text x="318" y="432" fontFamily="var(--font-heading, sans-serif)" fontSize="16" fontWeight="800" fill="#19E639">
          100% Direct
        </text>
        <text x="318" y="446" fontFamily="var(--font-mono, monospace)" fontSize="7" fill="rgba(255, 255, 255, 0.5)">
          Guichet Venture Capital
        </text>

        {/* Activity Signal Bar Monitor */}
        <line x1="32" y1="468" x2="428" y2="468" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.8" />
        <text x="32" y="486" fontFamily="var(--font-mono, monospace)" fontSize="7" fill="rgba(255, 255, 255, 0.5)">
          FLUX D&apos;ACTIVITÉ EN DIRECT :
        </text>
        <text x="428" y="486" textAnchor="end" fontFamily="var(--font-mono, monospace)" fontSize="7" fill="#19E639" fontWeight="600">
          SYNCHRONISÉ · 60 FPS
        </text>

        {/* Dynamic Activity Spectrum Equalizer */}
        {[
          { x: 34, h: 14, d: "0.1s" },
          { x: 54, h: 22, d: "0.4s" },
          { x: 74, h: 18, d: "0.2s" },
          { x: 94, h: 26, d: "0.6s" },
          { x: 114, h: 15, d: "0.3s" },
          { x: 134, h: 28, d: "0.8s" },
          { x: 154, h: 20, d: "0.1s" },
          { x: 174, h: 24, d: "0.5s" },
          { x: 194, h: 17, d: "0.7s" },
          { x: 214, h: 30, d: "0.2s" },
          { x: 234, h: 22, d: "0.9s" },
          { x: 254, h: 16, d: "0.4s" },
          { x: 274, h: 25, d: "0.3s" },
          { x: 294, h: 19, d: "0.6s" },
          { x: 314, h: 27, d: "0.1s" },
          { x: 334, h: 21, d: "0.5s" },
          { x: 354, h: 29, d: "0.7s" },
          { x: 374, h: 18, d: "0.2s" },
          { x: 394, h: 24, d: "0.4s" },
          { x: 414, h: 15, d: "0.8s" },
        ].map((bar, i) => (
          <rect
            key={i}
            x={bar.x}
            y={526 - bar.h}
            width="12"
            height={bar.h}
            rx="2"
            fill="rgba(25, 230, 57, 0.45)"
            className="bp-eq-bar"
            style={{ animationDelay: bar.d }}
          />
        ))}
      </svg>
    </div>
  );
}

export default async function StartupHome() {
  const repo = await getContentRepository();
  const [mentors, ventures] = await Promise.all([repo.listMentors(), repo.listVentures("startup")]);
  // Mentors and ventures are named only with their consent.
  const confirmedMentors = onlyConfirmed(mentors, "name");
  const confirmedVentures = onlyConfirmed(ventures, "name");

  return (
    <>
      <WorldHero
        crumbs={[
          { label: "Nayokan", href: siteUrl("corporate", "/") },
          { label: "Four worlds", href: `${siteUrl("corporate", "/")}#worlds` },
          { label: "Startup Centre" },
        ]}
        title={
          <>
            Where <em>research</em>
            <br />
            becomes enterprise.
          </>
        }
        lede="The Nayokan Startup Centre connects university innovation, entrepreneurship and commercialization — moving ideas from research through validation into ventures with real market traction."
        actions={
          <>
            <a href="#pipeline" className="btn btn-primary">
              See the pipeline <span className="arrow">→</span>
            </a>
            <a href="#universities" className="btn btn-ghost">
              Universities
            </a>
          </>
        }
        figure={<Blueprint />}
      />

      <WorldLocator on={[2, 3, 4]} />

      {/* Innovation in practice */}
      <section className="sc-practice" aria-label="Innovation in practice">
        {PRACTICE.map((f) => (
          <figure key={f.slot} className="sc-practice-frame">
            <MediaSlot slot={f.slot} fill variant="compact" tone="dark" sizes="(max-width: 699px) 100vw, 34vw" />
            <figcaption>{f.label}</figcaption>
          </figure>
        ))}
      </section>

      {/* Commercialization pipeline */}
      <section className="pipeline" id="pipeline">
        <div className="wrap">
          <div className="pipeline-header">
            <SectionHeader
              num="§ 01 — Commercialization Pipeline"
              title={
                <>
                  From idea to
                  <br />
                  venture — five stages.
                </>
              }
              lead="Every venture the Startup Centre supports moves through this pipeline. Some ventures enter at earlier stages; others already have validated concepts requiring commercialization."
            />
          </div>
          <div className="pipeline-track">
            {PIPELINE.map((s) => (
              <article className="pipeline-stage" key={s.num}>
                <span className="pnum">{s.num}</span>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
                <span className="ptag">{s.tag}</span>
                <span className="pipeline-arrow">→</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Mentors */}
      <section className="mentors">
        <div className="wrap">
          <SectionHeader
            num="§ 02 — Mentors"
            title={
              <>
                Working with people
                <br />
                who have built.
              </>
            }
            lead="Nayokan Startup Centre mentors are researchers, founders, operators and investors with lived experience in African markets."
          />
          {confirmedMentors.length > 0 ? (
            <div className="mentors-grid">
              {confirmedMentors.slice(0, 4).map((m) => (
                <article className="mentor-card" key={m.id}>
                  <div className="mentor-portrait">{m.initials}</div>
                  <div className="mentor-name">{m.name}</div>
                  <div className="mentor-role">{m.role}</div>
                  <div className="mentor-tag">{m.expertise.join(" · ")}</div>
                </article>
              ))}
            </div>
          ) : (
            <MentorKinds />
          )}
          <div style={{ textAlign: "right", marginTop: 32 }}>
            <a href="/mentors" className="link-inline">
              All mentors <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* University partnerships band */}
      <section className="univ" id="universities">
        <div className="wrap">
          <div className="univ-grid">
            <div>
              <h2 style={{ marginTop: 16 }}>
                A structured
                <br />
                path from research
                <br />
                to enterprise.
              </h2>
              <p className="univ-lede">
                Nayokan partners with Cameroonian universities and research institutions to
                commercialize innovation — with a shared framework for IP, revenue and long-term
                equity stakes in resulting ventures.
              </p>
              <div style={{ marginTop: 32 }}>
                <a href="/university-partnerships" className="btn btn-accent">
                  Partner as a university <span className="arrow">→</span>
                </a>
              </div>
            </div>
            <div>
              <span className="meta on-dark" style={{ display: "block", marginBottom: 16 }}>
                What a partnership covers
              </span>
              <ul className="univ-framework">
                {UNIVERSITY_FRAMEWORK.map((f) => (
                  <li key={f.title}>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="portfolio">
        <div className="wrap">
          <SectionHeader
            num="§ 04 — Portfolio"
            title="Ventures in the ecosystem."
            lead="Ventures working with the Startup Centre."
          />
          {confirmedVentures.length > 0 ? (
            <>
              <div className="portfolio-grid">
                {confirmedVentures.slice(0, 6).map((v) => (
                  <article className="port-card" key={v.id}>
                    <div className="port-header">
                      <div className="port-logo">{v.code}</div>
                      {v.listingStatus === "active" && <span className="port-status">● Active</span>}
                    </div>
                    <h4>{v.name}</h4>
                    <p>{v.description}</p>
                    <div className="port-tags">
                      <span className="port-tag">{v.sector}</span>
                      <span className="port-tag">{v.stage}</span>
                    </div>
                  </article>
                ))}
              </div>
              <div style={{ textAlign: "right", marginTop: 32 }}>
                <a href="/portfolio" className="link-inline">
                  Full portfolio <span className="arrow">→</span>
                </a>
              </div>
            </>
          ) : (
            <PublishingNote
              title="Portfolio coming soon."
              actions={
                <a href="/portfolio" className="btn btn-ghost">
                  How the portfolio works <span className="arrow">→</span>
                </a>
              }
            >
              <p>
                The Centre works with ventures at every stage of the pipeline, from research outputs to
                ventures ready for Nayokan Venture Capital.
              </p>
            </PublishingNote>
          )}
        </div>
      </section>

      {/* Innovator CTA */}
      <section className="apply" id="apply" style={{ background: "var(--ink)" }}>
        <div className="wrap">
          <div className="cta-grid">
            <div>
              <h2
                className="on-dark"
                style={{
                  marginTop: 16,
                  fontSize: "clamp(2.4rem, 5vw, 4.4rem)",
                  letterSpacing: "-0.04em",
                  lineHeight: 0.98,
                }}
              >
                Have a venture
                <br />
                or research to
                <br />
                <em style={{ fontStyle: "italic", fontWeight: 500, color: "var(--green)" }}>
                  commercialize
                </em>
                ?
              </h2>
            </div>
            <div>
              <p className="lead on-dark" style={{ color: "var(--muted-invert)", marginBottom: 32 }}>
                The Startup Centre accepts innovator applications continuously. Submissions are
                reviewed against the Nayokan pipeline and matched to the right stage.
              </p>
              <div className="hero-actions">
                <a href="/apply" className="btn btn-accent">
                  Apply as an innovator <span className="arrow">→</span>
                </a>
                <a href="/commercialization" className="btn btn-ghost on-dark">
                  Read the framework
                </a>
              </div>
              <div className="cta-contact">
                <div>
                  <span className="meta on-dark">Applications</span>
                  <a href="/apply">Apply online →</a>
                </div>
                <div>
                  <span className="meta on-dark">Cycle</span>
                  <span>Rolling</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RelatedStrip
        items={[WORLD_LINKS.vti, WORLD_LINKS.vc, WORLD_LINKS.hospitality].map((w) => ({
          ...w,
          href: w.href.startsWith("/") ? siteUrl("corporate", w.href) : w.href,
        }))}
      />
    </>
  );
}

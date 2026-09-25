import type {
  Article,
  Cluster,
  Mentor,
  Opportunity,
  Partner,
  Person,
  Programme,
  Property,
  Provenance,
  PublicMetric,
  SiteId,
  SiteNavigation,
  SiteSettings,
  Story,
  Venture,
} from "../types";
import { siteUrl } from "@/platform/sites/registry";

// All content below is sourced verbatim from the approved Genspark design
// package (Designs/*.html) and the Copy doc. Every record is demo content:
// provenance.isDemo = true, and unconfirmed fields are listed so the sites
// render "tbc" tags. Nothing here is verified production data.

const demo = (unconfirmedFields: string[] = []): Provenance => ({
  isDemo: true,
  unconfirmedFields,
});

const photo = (id: string, file: string, alt: string, caption?: string) => ({
  id,
  src: `/assets/photos/${file}`,
  alt,
  width: 1600,
  height: 1000,
  caption,
});

// ---------------------------------------------------------------------------
// Site settings + navigation
// ---------------------------------------------------------------------------

export const siteSettings: Record<SiteId, SiteSettings> = {
  corporate: {
    site: "corporate",
    name: "Nayokan",
    tagline: "Building people, enterprises and productive systems for Cameroon.",
    contactEmail: "contact@nayokan.org",
    address: "Yaoundé, Cameroon",
    defaultSeo: {
      description:
        "Nayokan is a digital ecosystem building people, enterprises and productive systems for Cameroon — vocational training, a startup centre, venture capital and hospitality.",
    },
    provenance: demo(["contactEmail", "address"]),
  },
  vti: {
    site: "vti",
    name: "Nayokan VTI",
    tagline: "Practical skills and entrepreneurial clusters for young Cameroonians.",
    contactEmail: "vti@nayokan.org",
    defaultSeo: {
      description:
        "Nayokan Vocational Training Institute: practical skills training and entrepreneurial cluster onboarding in Yaoundé, Cameroon.",
    },
    provenance: demo(["contactEmail"]),
  },
  startup: {
    site: "startup",
    name: "Nayokan Startup Centre",
    tagline: "Commercializing innovation from idea to scale.",
    contactEmail: "startup@nayokan.org",
    defaultSeo: {
      description:
        "Nayokan Startup Centre: a structured commercialization pathway moving ventures from validated concept to real market traction.",
    },
    provenance: demo(["contactEmail"]),
  },
};

const corporateFooter = [
  {
    heading: "Divisions",
    links: [
      { id: "f-vti", label: "Vocational Training Institute", href: siteUrl("vti"), crossSite: true },
      { id: "f-sc", label: "Startup Centre", href: siteUrl("startup"), crossSite: true },
      { id: "f-vc", label: "Venture Capital", href: "/venture-capital" },
      { id: "f-h", label: "Hospitality", href: "/hospitality" },
    ],
  },
  {
    heading: "Institution",
    links: [
      { id: "f-about", label: "About", href: "/about" },
      { id: "f-wwd", label: "What we do", href: "/what-we-do" },
      { id: "f-impact", label: "Impact", href: "/impact" },
      { id: "f-insights", label: "Insights", href: "/insights" },
      { id: "f-sitemap", label: "Sitemap", href: "/sitemap.xml" },
    ],
  },
  {
    heading: "Engage",
    links: [
      { id: "f-contact", label: "Contact", href: "/contact" },
      { id: "f-programmes", label: "All programmes", href: "/programmes" },
      { id: "f-apply", label: "Apply", href: "/application" },
      { id: "f-partners", label: "Partners", href: "/partners" },
    ],
  },
];

export const navigation: Record<SiteId, SiteNavigation> = {
  corporate: {
    site: "corporate",
    primary: [
      { id: "n-wwd", label: "What we do", href: "/what-we-do" },
      { id: "n-vti", label: "VTI", href: siteUrl("vti"), crossSite: true },
      { id: "n-sc", label: "Startup Centre", href: siteUrl("startup"), crossSite: true },
      { id: "n-vc", label: "Venture Capital", href: "/venture-capital" },
      { id: "n-h", label: "Hospitality", href: "/hospitality" },
      { id: "n-impact", label: "Impact", href: "/impact" },
      { id: "n-insights", label: "Insights", href: "/insights" },
      { id: "n-about", label: "About", href: "/about" },
    ],
    cta: { label: "Contact", href: "/contact" },
    footerColumns: corporateFooter,
  },
  // VTI + Startup navs are derived (not designed) — pendingConfirmation.
  vti: {
    site: "vti",
    pendingConfirmation: true,
    primary: [
      { id: "n-home", label: "Overview", href: "/" },
      { id: "n-programmes", label: "Programmes", href: "/programmes" },
      { id: "n-clusters", label: "Clusters", href: "/clusters" },
      { id: "n-sc", label: "Startup Centre", href: siteUrl("startup"), crossSite: true },
      { id: "n-corp", label: "Nayokan", href: siteUrl("corporate"), crossSite: true },
    ],
    cta: { label: "Apply", href: "/apply" },
    footerColumns: [
      {
        heading: "Institute",
        links: [
          { id: "f-overview", label: "Overview", href: "/" },
          { id: "f-programmes", label: "Programmes", href: "/programmes" },
          { id: "f-clusters", label: "Clusters", href: "/clusters" },
          { id: "f-apply", label: "Apply", href: "/apply" },
        ],
      },
      {
        heading: "Nayokan",
        links: [
          { id: "f-corp", label: "Nayokan", href: siteUrl("corporate"), crossSite: true },
          { id: "f-sc", label: "Startup Centre", href: siteUrl("startup"), crossSite: true },
          { id: "f-vc", label: "Venture Capital", href: siteUrl("corporate", "/venture-capital"), crossSite: true },
          { id: "f-h", label: "Hospitality", href: siteUrl("corporate", "/hospitality"), crossSite: true },
        ],
      },
      {
        heading: "Legal",
        links: [
          { id: "f-privacy", label: "Privacy", href: "/privacy" },
          { id: "f-terms", label: "Terms", href: "/terms" },
        ],
      },
    ],
  },
  startup: {
    site: "startup",
    pendingConfirmation: true,
    primary: [
      { id: "n-home", label: "Overview", href: "/" },
      { id: "n-programme", label: "Programme", href: "/programme" },
      { id: "n-portfolio", label: "Portfolio", href: "/portfolio" },
      { id: "n-opps", label: "Opportunities", href: "/opportunities" },
      { id: "n-mentors", label: "Mentors", href: "/mentors" },
      { id: "n-vti", label: "VTI", href: siteUrl("vti"), crossSite: true },
      { id: "n-corp", label: "Nayokan", href: siteUrl("corporate"), crossSite: true },
    ],
    cta: { label: "Apply", href: "/apply" },
    footerColumns: [
      {
        heading: "Centre",
        links: [
          { id: "f-programme", label: "Programme", href: "/programme" },
          { id: "f-comm", label: "Commercialization", href: "/commercialization" },
          { id: "f-portfolio", label: "Portfolio", href: "/portfolio" },
          { id: "f-univ", label: "University partnerships", href: "/university-partnerships" },
        ],
      },
      {
        heading: "Nayokan",
        links: [
          { id: "f-corp", label: "Nayokan", href: siteUrl("corporate"), crossSite: true },
          { id: "f-vti", label: "VTI", href: siteUrl("vti"), crossSite: true },
          { id: "f-vc", label: "Venture Capital", href: siteUrl("corporate", "/venture-capital"), crossSite: true },
          { id: "f-h", label: "Hospitality", href: siteUrl("corporate", "/hospitality"), crossSite: true },
        ],
      },
      {
        heading: "Legal",
        links: [
          { id: "f-privacy", label: "Privacy", href: "/privacy" },
          { id: "f-terms", label: "Terms", href: "/terms" },
        ],
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Programmes (programmes.html — corporate directory of all divisions)
// ---------------------------------------------------------------------------

export const programmes: Programme[] = [
  {
    id: "prog-001",
    site: "vti",
    world: "vti",
    slug: "professional-growth-engineering",
    code: "P/001",
    name: "Professional Growth Engineering",
    summary:
      "Practical skills training + entrepreneurial cluster onboarding for young Cameroonian graduates.",
    type: "Training",
    status: "open",
    location: "Yaoundé",
    applicationOpen: true,
    body: [
      { type: "heading", level: 2, text: "Overview" },
      {
        type: "paragraph",
        text: "Professional Growth Engineering is a cornerstone VTI programme designed for young Cameroonians ready to move from general education into productive activity. It combines practical technical training with a structured cluster-onboarding pathway.",
      },
      {
        type: "paragraph",
        text: "Unlike traditional vocational programmes, Professional Growth Engineering does not end at certification. Graduates are onboarded directly into entrepreneurial clusters aligned with their skills and interests, giving them immediate access to shared tools, market access and continuing mentorship.",
      },
      { type: "heading", level: 2, text: "Objectives" },
      { type: "paragraph", text: "By the end of the programme, participants will:" },
      {
        type: "list",
        items: [
          "Have demonstrated competence in the practical technical modules of their track.",
          "Understand the fundamentals of small-enterprise operations and productive routines.",
          "Have joined an entrepreneurial cluster aligned to their skills.",
          "Have produced at least one concrete productive output (project, prototype or first offering).",
          "Be positioned to access downstream Nayokan support (Startup Centre, Venture Capital or Hospitality).",
        ],
      },
      { type: "heading", level: 2, text: "Target audience" },
      {
        type: "paragraph",
        text: "The programme is designed for young Cameroonian graduates and workers seeking a practical pathway into productive activity. Prior technical experience is not required — motivation, seriousness and intent to remain and build in Cameroon are.",
      },
      { type: "heading", level: 2, text: "Requirements" },
      {
        type: "list",
        items: [
          "Cameroonian resident, 18+.",
          "Baccalaureate or equivalent educational level.",
          "Committed availability for the programme duration.",
          "Written motivation submitted with application.",
        ],
      },
      { type: "heading", level: 2, text: "Related opportunities" },
      {
        type: "paragraph",
        text: "Graduates of Professional Growth Engineering are eligible for the Cluster Formation Programme (P/003) and, where relevant, referral into the Startup Centre commercialization pathway.",
      },
    ],
    provenance: demo(),
  },
  {
    id: "prog-002",
    site: "vti",
    world: "vti",
    slug: "skills-for-industrialisation",
    code: "P/002",
    name: "Skills for Industrialisation",
    summary:
      "Foundational technical curriculum with entrepreneurial modules — the core VTI programme.",
    type: "Training",
    status: "open",
    location: "Yaoundé",
    applicationOpen: true,
    provenance: demo(["applicationDeadline"]),
  },
  {
    id: "prog-003",
    site: "vti",
    world: "vti",
    slug: "cluster-formation-programme",
    code: "P/003",
    name: "Cluster Formation Programme",
    summary:
      "Post-training pathway into productive entrepreneurial clusters and joint enterprise creation.",
    type: "Cluster pathway",
    status: "upcoming",
    location: "Yaoundé",
    applicationOpen: false,
    provenance: demo(["applicationDeadline"]),
  },
  {
    id: "prog-v004",
    site: "vti",
    world: "vti",
    slug: "industry-application-certification",
    code: "P/004",
    name: "Industry Application Certification",
    summary:
      "Advanced applied module for enterprise-ready graduates. Focused on industry deployment and productive output.",
    type: "Certification",
    status: "upcoming",
    location: "Yaoundé",
    applicationOpen: false,
    provenance: demo(["applicationDeadline", "certification"]),
  },
  {
    id: "prog-v005",
    site: "vti",
    world: "vti",
    slug: "agri-food-post-harvest",
    code: "P/005",
    name: "Agri-Food & Post-Harvest",
    summary:
      "Practical training in agri-processing, cold-chain and post-harvest logistics — feeding directly into productive clusters.",
    type: "Training",
    status: "open",
    location: "Yaoundé",
    applicationOpen: true,
    provenance: demo(["certification"]),
  },
  {
    id: "prog-v006",
    site: "vti",
    world: "vti",
    slug: "hospitality-operations",
    code: "P/006",
    name: "Hospitality Operations",
    summary:
      "Structured training for hospitality operations — front-of-house, service excellence and productive-asset management.",
    type: "Training",
    status: "upcoming",
    location: "Yaoundé",
    applicationOpen: false,
    provenance: demo(["applicationDeadline", "certification"]),
  },
  {
    id: "prog-004",
    site: "startup",
    world: "startup",
    slug: "innovation-commercialization",
    code: "P/004",
    name: "Innovation Commercialization",
    summary:
      "Industry-application-focused programme moving ventures from validated concept to real market traction.",
    type: "Commercialization",
    status: "open",
    location: "Yaoundé + partner sites",
    applicationOpen: true,
    provenance: demo(),
  },
  {
    id: "prog-005",
    site: "startup",
    world: "startup",
    slug: "university-research-commercialization",
    code: "P/005",
    name: "University Research Commercialization",
    summary:
      "Structured commercialization pathway for research from partner Cameroonian universities.",
    type: "Commercialization",
    status: "open",
    location: "National",
    applicationOpen: true,
    provenance: demo(),
  },
  {
    id: "prog-006",
    site: "startup",
    world: "startup",
    slug: "founder-fellowship",
    code: "P/006",
    name: "Founder Fellowship",
    summary:
      "A cohort-based fellowship for founders working on productive-sector ventures with proven traction.",
    type: "Fellowship",
    status: "upcoming",
    location: "Yaoundé",
    applicationOpen: false,
    provenance: demo(["applicationDeadline"]),
  },
  {
    id: "prog-007",
    site: "corporate",
    world: "venture_capital",
    slug: "seed-ticket-programme",
    code: "P/007",
    name: "Seed Ticket Programme",
    summary:
      "Structured seed capital for ventures graduating from the Startup Centre pipeline.",
    type: "Capital",
    status: "open",
    location: "By referral",
    applicationOpen: true,
    provenance: demo(),
  },
  {
    id: "prog-008",
    site: "corporate",
    world: "venture_capital",
    slug: "growth-co-investment-vehicle",
    code: "P/008",
    name: "Growth Co-investment Vehicle",
    summary:
      "Institutional co-investment vehicle for growth-stage productive-sector ventures.",
    type: "Capital",
    status: "upcoming",
    location: "Institutional partners",
    applicationOpen: false,
    provenance: demo(["applicationDeadline"]),
  },
  {
    id: "prog-009",
    site: "corporate",
    world: "hospitality",
    slug: "long-stay-residency",
    code: "P/009",
    name: "Long-stay Residency",
    summary:
      "Extended-stay hospitality for institutional visitors, researchers and partner delegations.",
    type: "Residency",
    status: "open",
    location: "Yaoundé",
    applicationOpen: true,
    provenance: demo(),
  },
];

// ---------------------------------------------------------------------------
// VTI clusters (article.html: "Six clusters are currently being formed")
// ---------------------------------------------------------------------------

export const clusters: Cluster[] = [
  {
    id: "cluster-01",
    slug: "digital-technology",
    code: "C/001",
    name: "Digital & Technology",
    sector: "Digital services",
    location: "Yaoundé",
    summary: "Graduates and small enterprises collaborating around digital services and technology work.",
    statusLabel: "Forming",
    programmeId: "prog-003",
    provenance: demo(["memberCount"]),
  },
  {
    id: "cluster-02",
    slug: "agri-food-production",
    code: "C/002",
    name: "Agri-food & Production",
    sector: "Agri-food",
    location: "Yaoundé",
    summary: "Producers and processors working together on agri-food value chains.",
    statusLabel: "Forming",
    programmeId: "prog-003",
    provenance: demo(["memberCount"]),
  },
  {
    id: "cluster-03",
    slug: "craft-manufacturing",
    code: "C/003",
    name: "Craft & Manufacturing",
    sector: "Manufacturing",
    location: "Yaoundé",
    summary: "Craft producers and small manufacturers sharing tools, orders and market access.",
    statusLabel: "Forming",
    programmeId: "prog-003",
    provenance: demo(["memberCount"]),
  },
  {
    id: "cluster-04",
    slug: "hospitality-services",
    code: "C/004",
    name: "Hospitality & Services",
    sector: "Hospitality",
    location: "Yaoundé",
    summary: "Hospitality and services graduates — including pathways into Nayokan Hospitality operations.",
    statusLabel: "Forming",
    programmeId: "prog-003",
    provenance: demo(["memberCount"]),
  },
  {
    id: "cluster-05",
    slug: "health-wellness",
    code: "C/005",
    name: "Health & Wellness",
    sector: "Health",
    location: "Yaoundé",
    summary: "Community health and wellness services delivered through structured small enterprises.",
    statusLabel: "Forming",
    programmeId: "prog-003",
    provenance: demo(["memberCount"]),
  },
  {
    id: "cluster-06",
    slug: "creative-economy",
    code: "C/006",
    name: "Creative Economy",
    sector: "Creative",
    location: "Yaoundé",
    summary: "Creative-economy graduates building productive enterprises around cultural work.",
    statusLabel: "Forming",
    programmeId: "prog-003",
    provenance: demo(["memberCount"]),
  },
];

// ---------------------------------------------------------------------------
// Ventures — VC portfolio (vc-portfolio.html, anonymised per governance) is
// listed on the corporate site; the Startup Centre portfolio is added in
// Phase 5. Ventures carry no site field: the mapping lives here.
// ---------------------------------------------------------------------------

const vcVentures: Venture[] = [
  {
    id: "vc-001",
    slug: "agri-processing-venture",
    code: "VC/001",
    name: "Agri-processing venture",
    description: "Post-harvest cold-chain for smallholder producers, Central Region.",
    sector: "Agri",
    stage: "Seed",
    location: "Central Region",
    listingStatus: "active",
    provenance: demo(["name"]),
  },
  {
    id: "vc-002",
    slug: "sme-fintech",
    code: "VC/002",
    name: "SME fintech",
    description: "Working capital + payment infrastructure for productive SMEs.",
    sector: "Fintech",
    stage: "Growth",
    location: "Douala",
    listingStatus: "active",
    provenance: demo(["name"]),
  },
  {
    id: "vc-003",
    slug: "digital-health",
    code: "VC/003",
    name: "Digital health",
    description: "Community-based diagnostics platform.",
    sector: "Health",
    stage: "Seed",
    location: "Yaoundé",
    listingStatus: "active",
    provenance: demo(["name"]),
  },
  {
    id: "vc-004",
    slug: "renewable-micro-grid",
    code: "VC/004",
    name: "Renewable micro-grid",
    description: "Productive-use energy in peri-urban zones.",
    sector: "Energy",
    stage: "Seed",
    location: "Peri-urban",
    listingStatus: "active",
    provenance: demo(["name"]),
  },
  {
    id: "vc-005",
    slug: "manufacturing-cluster",
    code: "VC/005",
    name: "Manufacturing cluster",
    description: "Structured cluster of small textile enterprises.",
    sector: "Manufacturing",
    stage: "Growth",
    location: "Bafoussam",
    listingStatus: "active",
    provenance: demo(["name"]),
  },
  {
    id: "vc-006",
    slug: "vocational-edtech",
    code: "VC/006",
    name: "Vocational edtech",
    description: "National-scale vocational skills platform, aligned with VTI.",
    sector: "Edtech",
    stage: "Seed",
    location: "Yaoundé",
    listingStatus: "active",
    provenance: demo(["name"]),
  },
];

// Startup Centre portfolio (startup-centre.html + startup-portfolio.html +
// portfolio-detail.html). Anonymised ventures — names/logos/financials are
// only published after venture consent, so every name is a placeholder.
const startupVentures: Venture[] = [
  {
    id: "sc-001",
    slug: "agri-processing-venture",
    code: "V/01",
    name: "Agri-processing venture",
    description:
      "Post-harvest processing and cold-chain logistics for smallholder producers in the Central Region.",
    sector: "Agri-tech · Logistics",
    stage: "Commercialization",
    location: "Central Region",
    listingStatus: "active",
    facts: [
      { label: "Stage", value: "Commercialization" },
      { label: "Sector", value: "Agri-tech · Logistics" },
      { label: "Founded", value: "2024", tbc: true },
      { label: "Region", value: "Central · Cameroon" },
      { label: "Round", value: "Seed", tbc: true },
      { label: "Employees", value: "—", tbc: true },
    ],
    body: [
      { type: "heading", level: 2, text: "What the venture does" },
      {
        type: "paragraph",
        text: "The venture operates a hub-and-spoke model connecting smallholder producers to formal markets through post-harvest processing infrastructure and cold-chain logistics — reducing post-harvest loss and improving unit economics for producers and buyers alike.",
      },
      {
        type: "paragraph",
        text: "Its productive infrastructure was designed with support from Nayokan mentors and aligns with the priorities of the VTI Agri-Food & Production cluster, from which two of its operations leads were recruited.",
      },
      { type: "heading", level: 2, text: "Traction to date" },
      {
        type: "list",
        items: [
          "Operational hub covering multiple producer villages (details to be confirmed).",
          "Structured off-take agreements with regional buyers (to be confirmed).",
          "Cross-cluster supply relationships with Nayokan Hospitality.",
          "Team drawn partly from VTI Agri-Food cluster graduates.",
        ],
      },
      { type: "heading", level: 2, text: "Why Nayokan supports it" },
      {
        type: "paragraph",
        text: "The venture demonstrates the productive-systems thesis in action: capability built in VTI, organized into cluster activity, commercialized through the Startup Centre, and positioned for capital deployment through Venture Capital.",
      },
      { type: "heading", level: 2, text: "What comes next" },
      {
        type: "paragraph",
        text: "Commercialization stage focus is expansion into additional producer regions and formalising off-take agreements with export partners. VC referral is anticipated subject to standard portfolio review.",
      },
    ],
    provenance: demo(["name", "logo", "facts"]),
  },
  {
    id: "sc-002",
    slug: "digital-health-venture",
    code: "V/02",
    name: "Digital health venture",
    description: "Community-first digital tools bringing basic diagnostics to underserved regions.",
    sector: "Health",
    stage: "Pre-seed",
    location: "Yaoundé",
    listingStatus: "active",
    provenance: demo(["name", "logo"]),
  },
  {
    id: "sc-003",
    slug: "craft-manufacturing-venture",
    code: "V/03",
    name: "Craft-manufacturing venture",
    description: "Structured cluster of small textile enterprises building shared quality standards.",
    sector: "Manufacturing",
    stage: "Cluster",
    location: "Bafoussam",
    listingStatus: "active",
    provenance: demo(["name", "logo"]),
  },
  {
    id: "sc-004",
    slug: "sme-fintech-venture",
    code: "V/04",
    name: "SME fintech venture",
    description: "Payments and working-capital infrastructure for productive small enterprises.",
    sector: "Fintech",
    stage: "Seed",
    location: "Douala",
    listingStatus: "active",
    provenance: demo(["name", "logo"]),
  },
  {
    id: "sc-005",
    slug: "vocational-edtech-venture",
    code: "V/05",
    name: "Vocational edtech venture",
    description: "Digital platform extending vocational training beyond Yaoundé, aligned with VTI.",
    sector: "Edtech",
    stage: "Pre-seed",
    location: "Yaoundé",
    listingStatus: "active",
    provenance: demo(["name", "logo"]),
  },
  {
    id: "sc-006",
    slug: "renewable-micro-grid-venture",
    code: "V/06",
    name: "Renewable-energy venture",
    description: "Small-scale productive-use micro-grids powering activity in peri-urban zones.",
    sector: "Energy",
    stage: "Seed",
    location: "Douala · peri-urban",
    listingStatus: "active",
    provenance: demo(["name", "logo"]),
  },
  {
    id: "sc-007",
    slug: "post-harvest-logistics-venture",
    code: "V/07",
    name: "Post-harvest logistics venture",
    description: "Route and route-density optimisation for agricultural cooperatives.",
    sector: "Logistics",
    stage: "Pre-seed",
    location: "Central Region",
    listingStatus: "active",
    provenance: demo(["name", "logo"]),
  },
];

export const venturesBySite: Record<SiteId, Venture[]> = {
  corporate: vcVentures,
  startup: startupVentures,
  vti: [],
};

// ---------------------------------------------------------------------------
// Hospitality properties (hospitality.html + hospitality-properties.html)
// ---------------------------------------------------------------------------

export const properties: Property[] = [
  {
    id: "prop-001",
    slug: "nayokan-guesthouse",
    code: "P/001",
    name: "The Nayokan Guesthouse",
    location: "Yaoundé · Bastos",
    type: "Guesthouse",
    summary:
      "A restored residence with 6 refined rooms, a garden courtyard and a shared working library. Positioned for institutional visitors, long-stay researchers and partner delegations.",
    body: [
      {
        type: "paragraph",
        text: "The Nayokan Guesthouse occupies a restored residence in one of Yaoundé's more settled residential quarters. The building carries its original architectural detail — high ceilings, arched windows, deep verandahs — refreshed with a calm contemporary sensibility and West African material accents.",
      },
      {
        type: "paragraph",
        text: "The property is designed to be quiet, professional and productive. Guests are typically institutional visitors, long-stay researchers and Nayokan partner delegations — with a small number of individually-booked stays.",
      },
      { type: "heading", level: 2, text: "The productive-asset angle" },
      {
        type: "paragraph",
        text: "Every Nayokan property is designed to hold its own economically while contributing to Cameroon's productive-asset base. Revenue from the Guesthouse is reinvested into Nayokan operations, and staffing is drawn — where suitable — from the VTI Hospitality & Services cluster.",
      },
    ],
    amenities: ["06 rooms", "Boutique", "24h reception", "Working library"],
    gallery: [
      photo("m-gh-1", "hospitality/prop-guesthouse-ext.jpg", "The Nayokan Guesthouse exterior garden courtyard, Bastos, Yaoundé."),
      photo("m-gh-2", "hospitality/prop-guesthouse-room.jpg", "The Nayokan Guesthouse refined guest room."),
      photo("m-gh-3", "hospitality/prop-guesthouse-lib.jpg", "The Nayokan Guesthouse working library."),
    ],
    provenance: demo(["amenities"]),
  },
  {
    id: "prop-002",
    slug: "long-stay-residence",
    code: "P/002",
    name: "Long-stay Residence",
    location: "Yaoundé · Nsimeyong",
    type: "Long-stay",
    summary:
      "Extended-stay apartments for corporate visitors, embassy secondments and multi-week research trips. Serviced, professional, quiet.",
    amenities: ["04 units", "14-night min.", "Weekly housekeeping", "Workspace"],
    gallery: [
      photo("m-ls-1", "hospitality/prop-residence.jpg", "Long-stay serviced residence apartment, Nsimeyong, Yaoundé."),
    ],
    provenance: demo(["amenities"]),
  },
  {
    id: "prop-003",
    slug: "workspace-reception",
    code: "P/003",
    name: "Workspace & Reception",
    location: "Yaoundé · Central",
    type: "Workspace",
    summary:
      "Dedicated meeting and event rooms for Nayokan cohorts, partner visits and workshops. Available to external partners on request.",
    amenities: ["60 capacity", "Boardroom + event", "On request", "Catering"],
    gallery: [
      photo("m-ws-1", "hospitality/prop-workspace.jpg", "Workspace & Reception boardroom facility, Central Yaoundé."),
    ],
    provenance: demo(["amenities"]),
  },
];

// ---------------------------------------------------------------------------
// Articles (insights.html; featured article body from article.html)
// ---------------------------------------------------------------------------

const article = (
  id: string,
  slug: string,
  title: string,
  excerpt: string,
  category: string,
  world: Article["world"],
  authorName: string,
  publishedAt: string,
  readingMinutes: number,
): Article => ({
  id,
  site: "corporate",
  world,
  slug,
  title,
  excerpt,
  category,
  authorName,
  publishedAt,
  readingMinutes,
  body: [],
  provenance: demo(["authorName", "publishedAt"]),
});

export const articles: Article[] = [
  {
    ...article(
      "art-001",
      "inauguration-day-vti-yaounde",
      "Inauguration day — the Nayokan Vocational Training Institute in Yaoundé.",
      "A documentary look at the launch of Nayokan's VTI, the first cohort of trainees, and what this means for the wider productive-systems agenda.",
      "Nayokan Updates",
      "corporate",
      "Nayokan Editorial",
      "2026-09-01",
      8,
    ),
    cover: photo(
      "m-art-001",
      "nayokan-06.jpg",
      "Nayokan VTI inauguration ceremony, Yaoundé.",
      "Fig. 001 — Members of the Nayokan Association at the VTI inauguration, Yaoundé.",
    ),
    body: [
      {
        type: "paragraph",
        text: "The Nayokan Vocational Training Institute opened its doors to its first cohort of trainees this month. What follows is less a ceremonial account than a working note on what the launch means for the wider Nayokan agenda — and for the productive-systems thesis it stands on.",
      },
      {
        type: "paragraph",
        text: "The idea behind Nayokan has always been institutional rather than programmatic. Not a single training, not a single incubation, not a single investment vehicle — but a connected pathway from human capability to productive enterprise to productive assets. The VTI is the front door to that pathway.",
      },
      {
        type: "paragraph",
        text: "Its curriculum is explicit about this. Every module is designed with a downstream destination in mind — an entrepreneurial cluster, a small enterprise, a venture in the Startup Centre pipeline. Practical skills are the starting point, not the endpoint.",
      },
      { type: "quote", text: "Skills alone are not enough. Systems create lasting value." },
      { type: "heading", level: 2, text: "Why vocational training comes first" },
      {
        type: "paragraph",
        text: "Cameroon's economic debate has long oscillated between two poles: the \u201cinnovation economy\u201d narrative and the \u201cindustrial base\u201d narrative. Nayokan's position is that neither works without the other, and that both rest on a foundation neither one always names — productive human capability.",
      },
      {
        type: "paragraph",
        text: "That is what the VTI produces. Not degree-holders, not incubatees, not investees — people who can produce. Who can operate machinery, deliver services, structure small enterprises, and — critically — train the next cohort themselves.",
      },
      {
        type: "image",
        media: photo(
          "m-art-001b",
          "nayokan-08.jpg",
          "Trainees at the Nayokan VTI computer lab.",
          "Fig. 002 — VTI training lab in operation. First cohort onboarding session.",
        ),
      },
      { type: "heading", level: 2, text: "The cluster question" },
      {
        type: "paragraph",
        text: "The VTI is not designed to graduate individuals into a generic labour market. It is designed to graduate them into entrepreneurial clusters — structured groups of graduates and small enterprises collaborating around a common productive activity.",
      },
      {
        type: "paragraph",
        text: "Six clusters are currently being formed, covering digital & technology, agri-food & production, craft & manufacturing, hospitality & services, health & wellness, and the creative economy. Each cluster shares tools, market access, mentorship and — in time — access to Nayokan Startup Centre and Venture Capital resources.",
      },
      { type: "heading", level: 2, text: "What happens next" },
      {
        type: "paragraph",
        text: "The first cohort will move through the practical modules over the coming months. Cluster formation begins in parallel. The Startup Centre commercialization pathway will be opened to select cluster ventures in early 2027.",
      },
      {
        type: "paragraph",
        text: "The full capability → production → markets → innovation → capital → assets pathway now has an operating front door. The remaining work is to run it — cohort after cohort, cluster after cluster, year after year.",
      },
      {
        type: "paragraph",
        text: "We will return with more from inside the VTI in the coming issues.",
      },
    ],
  },
  {
    ...article(
      "art-010",
      "training-lab-day-one",
      "The training lab in operation — day one.",
      "First cohort onboarding session inside the VTI computer lab in Yaoundé.",
      "VTI Note",
      "vti",
      "VTI Editorial",
      "2026-09-05",
      5,
    ),
    cover: photo(
      "m-art-010",
      "nayokan-08.jpg",
      "Trainees at the Nayokan VTI computer lab.",
      "Fig. 001 — VTI trainees during the first digital skills module.",
    ),
    body: [
      {
        type: "paragraph",
        text: "The computers were powered on at 08:30 in Yaoundé, marking day one of practical instruction for the first VTI cohort. Forty workstations, fully connected, dedicated to technical skills and digital workflow routines.",
      },
      {
        type: "paragraph",
        text: "The objective of the first week is immersion: establishing coding standards, collaborative version control, and problem decomposition. Trainees work in paired stations designed to encourage direct peer review and technical dialogue.",
      },
      { type: "quote", text: "Theory becomes capability only when hands touch the tools." },
      { type: "heading", level: 2, text: "Curriculum architecture" },
      {
        type: "paragraph",
        text: "The digital curriculum is built backwards from the needs of small productive enterprises and tech ventures across Central Africa. Rather than abstract computer literacy, participants build real-world software modules, automation tools, and web-based business infrastructure from day one.",
      },
      {
        type: "paragraph",
        text: "By month three, these trainees will begin integrating directly with entrepreneurial clusters, contributing working digital assets to active local businesses.",
      },
    ],
  },
  {
    ...article(
      "art-011",
      "commercialization-playbook-central-africa",
      "Building a commercialization playbook for Central Africa.",
      "How the Startup Centre structures the path from research to market across a six-milestone framework.",
      "Startup Feature",
      "startup",
      "Startup Centre Editorial",
      "2026-08-20",
      7,
    ),
    cover: photo(
      "m-art-011",
      "nayokan-04.jpg",
      "Nayokan leadership and innovation team.",
      "Fig. 001 — Startup Centre steering committee review session.",
    ),
    body: [
      {
        type: "paragraph",
        text: "Central African universities and technical institutes produce substantial research, but very little of it crosses into commercial deployment. The Nayokan Startup Centre was founded to bridge that specific fracture.",
      },
      {
        type: "paragraph",
        text: "The commercialization playbook is a 26-week milestone-driven framework. It takes validated technical concepts and guides founding teams through unit economics, customer validation, intellectual property structuring, and pilot deployment.",
      },
      { type: "quote", text: "Innovation is only completed when a customer derives repeatable value from it." },
      { type: "heading", level: 2, text: "The six milestones" },
      {
        type: "paragraph",
        text: "Each cohort moves through six milestones: Onboarding & Mentor Pairing, Model & Unit Economics, Market Pilots, Product & Distribution, Investment Readiness, and Handover to the Venture Capital pipeline or alumni network.",
      },
      {
        type: "paragraph",
        text: "Teams are paired with sector-specific mentors and granted direct access to Nayokan ecosystem infrastructure, ensuring ventures solve real market constraints within Cameroon and the wider CEMAC region.",
      },
    ],
  },
  article(
    "art-002",
    "commercializing-university-research-central-africa",
    "Commercializing university research in Central Africa.",
    "How the Startup Centre's research commercialization pathway moves university work toward real market application.",
    "Innovation",
    "startup",
    "Startup Centre",
    "2026-08-01",
    6,
  ),
  article(
    "art-003",
    "why-vocational-training-must-precede-innovation",
    "Why vocational training must precede any innovation agenda.",
    "The capability foundation that innovation narratives tend to skip.",
    "Skills",
    "vti",
    "VTI",
    "2026-08-01",
    5,
  ),
  article(
    "art-004",
    "cluster-formation-practical-guide-graduates",
    "Cluster formation — a practical guide for graduates.",
    "What joining a productive entrepreneurial cluster actually involves after VTI training.",
    "Entrepreneurship",
    "vti",
    "VTI",
    "2026-07-01",
    7,
  ),
  article(
    "art-005",
    "building-demand-cameroonian-products-beyond-cameroon",
    "Building demand for Cameroonian products beyond Cameroon.",
    "Market access and demand-building work across the commercialization pathway.",
    "Markets",
    "startup",
    "Startup Centre",
    "2026-07-01",
    9,
  ),
  article(
    "art-006",
    "productive-systems-thesis-capability-to-capital",
    "The productive-systems thesis — capability to capital.",
    "The long-form argument behind Nayokan's six-stage system.",
    "Development",
    "corporate",
    "Nayokan",
    "2026-06-01",
    12,
  ),
  article(
    "art-007",
    "what-a-working-commercialization-pipeline-looks-like",
    "What a working commercialization pipeline actually looks like.",
    "Inside the stages, gates and support model of the Startup Centre pipeline.",
    "Innovation",
    "startup",
    "Startup Centre",
    "2026-06-01",
    8,
  ),
  article(
    "art-008",
    "practical-curricula-productive-economies-framework",
    "Practical curricula for productive economies — a working framework.",
    "How the VTI designs modules with a downstream destination in mind.",
    "Skills",
    "vti",
    "VTI",
    "2026-05-01",
    6,
  ),
  article(
    "art-009",
    "new-hospitality-property-joins-asset-base",
    "A new hospitality property joins the Nayokan asset base.",
    "The productive-asset logic behind Nayokan Hospitality's growing portfolio.",
    "Nayokan Updates",
    "hospitality",
    "Hospitality",
    "2026-05-01",
    4,
  ),
];

// ---------------------------------------------------------------------------
// Stories (index.html + impact.html "Stories of impact")
// ---------------------------------------------------------------------------

export const stories: Story[] = [
  {
    id: "story-001",
    site: "corporate",
    world: "vti",
    slug: "inauguration-day-vti-yaounde",
    title: "Inaugurating the Nayokan Vocational Training Institute — the first cohort.",
    excerpt:
      "A documentary look at the launch of VTI and the first cohort of trainees to walk through its doors.",
    type: "cohort",
    cover: photo("m-story-001", "nayokan-06.jpg", "Nayokan VTI inauguration."),
    provenance: demo(),
  },
  {
    id: "story-002",
    site: "corporate",
    world: "vti",
    slug: "training-lab-day-one",
    title: "The training lab in operation — day one.",
    excerpt: "First cohort onboarding session inside the VTI computer lab.",
    type: "beneficiary",
    cover: photo("m-story-002", "nayokan-08.jpg", "VTI trainees at computer lab."),
    provenance: demo(),
  },
  {
    id: "story-003",
    site: "corporate",
    world: "startup",
    slug: "commercialization-playbook-central-africa",
    title: "Building a commercialization playbook for Central Africa.",
    excerpt: "How the Startup Centre structures the path from research to market.",
    type: "enterprise",
    cover: photo("m-story-003", "nayokan-04.jpg", "Nayokan leadership."),
    provenance: demo(),
  },
];

// ---------------------------------------------------------------------------
// Partners (partners.html walls — all names pending written confirmation)
// ---------------------------------------------------------------------------

const partner = (
  id: string,
  name: string,
  category: Partner["category"],
  relationship?: string,
): Partner => ({
  id,
  name,
  category,
  relationship,
  provenance: demo(["name", "logo"]),
});

export const partners: Partner[] = [
  // § 01 Universities & research
  partner("ptn-u-yaounde", "University of Yaoundé I", "university"),
  partner("ptn-u-douala", "University of Douala", "university"),
  partner("ptn-u-buea", "University of Buea", "university"),
  partner("ptn-u-bamenda", "University of Bamenda", "university"),
  partner("ptn-u-minresi", "MINRESI", "university", "Research partner"),
  partner("ptn-u-minesup", "MINESUP", "university", "Research partner"),
  // § 02 Ministries & public sector
  partner("ptn-g-minefop", "MINEFOP", "government"),
  partner("ptn-g-minpmeesa", "MINPMEESA", "government"),
  partner("ptn-g-minresi", "MINRESI", "government"),
  partner("ptn-g-minesup", "MINESUP", "government"),
  // § 03 Development partners
  partner("ptn-d-idreams", "i-DREAMS", "development"),
  partner("ptn-d-scino", "SCINO 360", "development"),
  partner("ptn-d-conceptionx", "Conception X", "development"),
  partner("ptn-d-enovation", "Enovation", "development"),
  // § 04 Corporate & private sector (unnamed in design)
  partner("ptn-c-01", "Corporate partner", "corporate"),
  partner("ptn-c-02", "Corporate partner", "corporate"),
  partner("ptn-c-03", "Corporate partner", "corporate"),
  partner("ptn-c-04", "Corporate partner", "corporate"),
];

// ---------------------------------------------------------------------------
// People (about.html leadership — names withheld pending approval)
// ---------------------------------------------------------------------------

export const people: Person[] = [
  {
    id: "ppl-founder",
    name: "Founder / President",
    initials: "FN",
    position: "Institutional leadership · Strategy",
    division: "Nayokan · Founding",
    provenance: demo(["name", "photo"]),
  },
  {
    id: "ppl-vti",
    name: "Director · VTI",
    initials: "DV",
    position: "Vocational Training Institute lead",
    division: "VTI",
    provenance: demo(["name", "photo"]),
  },
  {
    id: "ppl-startup",
    name: "Director · Startup Centre",
    initials: "DS",
    position: "Innovation & commercialization",
    division: "Startup Centre",
    provenance: demo(["name", "photo"]),
  },
  {
    id: "ppl-vc",
    name: "Managing Partner · VC",
    initials: "MP",
    position: "Venture Capital · Portfolio",
    division: "Venture Capital",
    provenance: demo(["name", "photo"]),
  },
];

// ---------------------------------------------------------------------------
// Metrics — every value null + unverified. Never fabricate.
// ---------------------------------------------------------------------------

const metric = (
  id: string,
  label: string,
  world: PublicMetric["world"],
  sourceLabel?: string,
  description?: string,
): PublicMetric => ({
  id,
  label,
  value: null,
  verified: false,
  world,
  sourceLabel,
  description,
});

export const metrics: PublicMetric[] = [
  metric(
    "m-people-trained",
    "People trained",
    "vti",
    "Individuals through Nayokan VTI programmes.",
    "Cumulative graduates and current trainees across VTI cohorts since the institute's inauguration.",
  ),
  metric(
    "m-programmes",
    "Programmes across four worlds",
    "corporate",
    "Active programmes running inside the ecosystem.",
    "Training, cluster formation, commercialization, mentorship, hospitality and venture support programmes.",
  ),
  metric(
    "m-enterprises",
    "Enterprises supported",
    "corporate",
    "Small enterprises, clusters and ventures.",
    "Enterprises receiving structured Nayokan support — including cluster members, Startup Centre ventures and VC portfolio companies.",
  ),
  metric(
    "m-partners",
    "Institutional partners",
    "corporate",
    "Universities, ministries, corporates & organizations.",
    "Active and in-conversation institutional partners across Cameroon's public and private sector.",
  ),
  metric("m-vti-trainees", "Trainees", "vti", "Individuals through the vocational curriculum."),
  metric("m-startup-pipeline", "Ventures in pipeline", "startup", "Ventures currently in the commercialization pathway."),
  metric(
    "m-vc-deployed",
    "Capital deployed",
    "venture_capital",
    "Financial figures published only after partner and portfolio consent.",
  ),
  metric(
    "m-hosp-properties",
    "Properties operating",
    "hospitality",
    "Refined guesthouses and productive-asset facilities in Yaoundé.",
  ),
];

// ---------------------------------------------------------------------------
// Startup Centre opportunities (startup-opportunities.html — OPP/001–007)
// ---------------------------------------------------------------------------

const opportunity = (
  slug: string,
  code: string,
  title: string,
  summary: string,
  category: Opportunity["category"],
  status: Opportunity["status"],
  deadline?: string,
): Opportunity => ({
  id: `opp-${slug}`,
  slug,
  code,
  title,
  // summary is carried in eligibility for now — the contract has no teaser
  // field; widening tracked in the content-contract note.
  eligibility: summary,
  category,
  status,
  deadline,
  provenance: demo(["deadline"]),
});

export const opportunities: Opportunity[] = [
  opportunity("innovator-programme-c03", "OPP/001", "Innovator Programme · Cohort 03", "26-week structured commercialization programme.", "programme", "open", "Rolling"),
  opportunity("agri-food-innovation-challenge", "OPP/002", "Agri-Food Innovation Challenge", "Prize-supported call for post-harvest technology ventures.", "challenge", "upcoming", "Q1 · date tbc"),
  opportunity("corporate-startup-partnership", "OPP/003", "Corporate–Startup Partnership Call", "Introductions between corporates and shortlisted ventures.", "partnership", "open", "Rolling"),
  opportunity("university-fellowship", "OPP/004", "University Fellowship — Startup Centre", "12-month applied fellowship for university researchers.", "programme", "upcoming", "date tbc"),
  opportunity("fintech-for-smes", "OPP/005", "Fintech for SMEs — Sector Call", "Call for productive-sector fintech solutions.", "call", "upcoming", "date tbc"),
  opportunity("mentor-cycle", "OPP/006", "Mentor Applications · Next Cycle", "Applications open for mentors joining the next programme cycle.", "mentor", "upcoming", "date tbc"),
  opportunity("grant-facility-early-ventures", "OPP/007", "Grant Facility — Early Ventures", "Seed grants for pre-commercial ventures. Subject to funder confirmation.", "funding", "expired", "tbc"),
];

// ---------------------------------------------------------------------------
// Startup Centre mentors (startup-mentors.html — names withheld pending
// approval; initials + roles only)
// ---------------------------------------------------------------------------

const mentor = (
  initials: string,
  role: string,
  expertise: string[],
  availability: Mentor["availability"],
): Mentor => ({
  id: `men-${initials.toLowerCase()}`,
  name: "Mentor Name",
  initials,
  role,
  expertise,
  availability,
  provenance: demo(["name", "photo", "bio"]),
});

export const mentors: Mentor[] = [
  mentor("AK", "Founder · Agri-tech venture, Yaoundé", ["Commercialization", "Agri"], "open"),
  mentor("MN", "Researcher · University of Yaoundé I", ["Research", "IP"], "open"),
  mentor("SO", "Operator · Digital services, Douala", ["Product", "Go-to-market"], "by_request"),
  mentor("CD", "Investor · Central African fund", ["Capital", "Structuring"], "open"),
  mentor("LB", "Founder · Fintech SME, Douala", ["Fintech", "Fundraising"], "open"),
  mentor("NE", "Corporate innovator · Telco", ["B2B", "Enterprise sales"], "by_request"),
  mentor("TT", "Public-sector strategist", ["Policy", "Public-private"], "open"),
  mentor("PR", "Craft-sector founder", ["Manufacturing", "Exports"], "open"),
];

// ---------------------------------------------------------------------------
// University partners wall (startup-university-partnerships.html) — all
// partnerships are placeholders until written confirmation.
// ---------------------------------------------------------------------------

const universityPartner = (name: string, tag: string, location: string): Partner => ({
  id: `up-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name,
  category: "university",
  tag,
  location,
  relationship: "Partnership to be confirmed",
  provenance: demo(["name", "relationship"]),
});

export const universityPartners: Partner[] = [
  universityPartner("University of Yaoundé I", "Research", "Yaoundé · Central"),
  universityPartner("University of Douala", "Applied", "Douala · Littoral"),
  universityPartner("University of Buea", "Applied", "Buea · SW"),
  universityPartner("University of Bamenda", "Applied", "Bamenda · NW"),
  universityPartner("University of Dschang", "Applied", "Dschang · West"),
  universityPartner("University of Ngaoundéré", "Applied", "Ngaoundéré · Adamawa"),
  universityPartner("MINRESI", "Public", "Ministry · Research"),
  universityPartner("MINESUP", "Public", "Ministry · Higher Ed"),
];

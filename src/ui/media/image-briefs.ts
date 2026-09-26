// Image briefs: the art-direction contract for every photographic slot on the
// public sites. A slot renders its approved asset when one exists, otherwise a
// deliberate placeholder that states the brief. Supplying approved photography
// means adding `asset` here (or a CMS MediaRef override): the slot keeps its
// ratio, so the layout never changes.
//
// Rules (docs/architecture/ux-refinement-2026-09.md §0, §9):
//   - Only real Nayokan photography may be used as an asset. No stock, no
//     generated images, no photos from one context captioned as another.
//   - The only approved photographs today are the nine taken at the launch of
//     the VTI computer lab in Yaoundé (public/assets/photos/nayokan-0*.jpg).

export type ImageRatio = "16:9" | "21:9" | "3:2" | "4:3" | "4:5" | "1:1" | "3:4";

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** CSS object-position, for art-directed crops of the same file. */
  position?: string;
  caption?: string;
  isIllustrative?: boolean;
}

export interface ImageBrief {
  id: string;
  /** Where the image sits and what job it does. */
  role: string;
  /** What the photograph must show. */
  subject: string;
  location: string;
  composition: string;
  ratio: ImageRatio;
  treatment: string;
  asset?: ImageAsset;
  illustrative?: ImageAsset;
}

const LAB_SESSION: ImageAsset = {
  src: "/assets/photos/nayokan-08.jpg",
  alt: "Trainees in a session at the Nayokan VTI computer lab in Yaoundé, with a Nayokan Association banner in the background.",
  width: 1024,
  height: 768,
  caption: "Nayokan VTI computer lab · Yaoundé",
};

const LAB_LAUNCH: ImageAsset = {
  src: "/assets/photos/nayokan-06.jpg",
  alt: "Nayokan leadership and staff at the launch of the VTI computer lab in Yaoundé.",
  width: 1024,
  height: 768,
  caption: "Launch of the VTI computer lab · Yaoundé",
};

const LAB_BANNER: ImageAsset = {
  src: "/assets/photos/nayokan-07.jpg",
  alt: "Nayokan leadership at the VTI computer lab beside the Nayokan Association banner describing the VTI, Startup Centre and Venture Capital.",
  width: 1024,
  height: 768,
  caption: "Nayokan Association · VTI computer lab · Yaoundé",
};

const DOCUMENTARY = "Natural light, documentary. No staging, no retouching beyond exposure.";

const briefs = {
  // ── Corporate: home ────────────────────────────────────────────────────────
  "home-hero": {
    role: "Home hero: first proof that Nayokan is a working institution",
    subject: "Trainees at work in a Nayokan training session",
    location: "Nayokan VTI, Yaoundé",
    composition: "Wide, people in the middle ground, institutional banner visible",
    ratio: "4:3",
    treatment: DOCUMENTARY,
    asset: LAB_SESSION,
  },
  "home-about": {
    role: "What Nayokan is: the institution behind the ecosystem",
    subject: "Nayokan leadership with staff at a Nayokan facility",
    location: "Yaoundé",
    composition: "Group at eye level, Nayokan signage legible",
    ratio: "4:3",
    treatment: DOCUMENTARY,
    asset: LAB_BANNER,
  },
  "world-vti": {
    role: "Four Worlds panel 01: Vocational Training Institute",
    subject: "Trainees working with tools or equipment in a practical workshop",
    location: "Nayokan VTI, Yaoundé",
    composition: "Hands and faces at work, shallow depth, landscape",
    ratio: "16:9",
    treatment: DOCUMENTARY,
    asset: { ...LAB_SESSION, position: "30% 60%" },
  },
  "world-startup": {
    role: "Four Worlds panel 02: Startup Centre",
    subject: "Student or researcher founders testing a prototype with a mentor",
    location: "Cameroonian university lab or Startup Centre workspace",
    composition: "Over-the-shoulder on the prototype, whiteboard or bench behind",
    ratio: "16:9",
    treatment: DOCUMENTARY,
    illustrative: {
      src: "/assets/photos/illustrative/world-startup.jpg",
      alt: "Cameroonian student founders testing a hardware prototype on a workbench with a mentor in Yaoundé.",
      width: 1792,
      height: 1024,
      isIllustrative: true,
      caption: "Startup Centre · Prototyping workshop",
    },
  },
  "world-vc": {
    role: "Four Worlds panel 03: Venture Capital",
    subject: "Founder and investment team reviewing an operating business",
    location: "Productive enterprise site in Cameroon (workshop, processing unit)",
    composition: "Business in operation in the foreground, conversation behind",
    ratio: "16:9",
    treatment: `${DOCUMENTARY} Cooler grade to sit on deep green.`,
    illustrative: {
      src: "/assets/photos/illustrative/world-vc.jpg",
      alt: "A founder and investment analysts reviewing an operating enterprise in Cameroon.",
      width: 1792,
      height: 1024,
      isIllustrative: true,
      caption: "Venture Capital · Enterprise site review",
    },
  },
  "world-hospitality": {
    role: "Four Worlds panel 04: Hospitality",
    subject: "Exterior or arrival space of a Nayokan hospitality property",
    location: "Confirmed Nayokan property, Yaoundé",
    composition: "Calm architectural frame, dusk or early morning light",
    ratio: "16:9",
    treatment: "Architectural, warm and quiet. Real property only.",
    illustrative: {
      src: "/assets/photos/illustrative/world-hospitality.jpg",
      alt: "Quiet arrival courtyard of a modern hospitality property in Yaoundé.",
      width: 1792,
      height: 1024,
      isIllustrative: true,
      caption: "Hospitality · Bastos residence arrival",
    },
  },
  "programme-vti": {
    role: "VTI programme card and detail hero",
    subject: "Trainees in the programme's practical module",
    location: "Nayokan VTI training rooms, Yaoundé",
    composition: "Activity-led: tools, screens or materials in use",
    ratio: "3:2",
    treatment: DOCUMENTARY,
    illustrative: {
      src: "/assets/photos/illustrative/programme-vti.jpg",
      alt: "Vocational trainees working with tools and equipment in a practical workshop in Yaoundé.",
      width: 1536,
      height: 1024,
      isIllustrative: true,
    },
  },
  "programme-startup": {
    role: "Startup Centre programme card and detail hero",
    subject: "A cohort working session: founders mapping a venture on a wall or board",
    location: "Startup Centre workspace",
    composition: "Group around a surface covered in work",
    ratio: "3:2",
    treatment: DOCUMENTARY,
    illustrative: {
      src: "/assets/photos/illustrative/programme-startup.jpg",
      alt: "Startup founders mapping a venture on a wall during a cohort working session.",
      width: 1536,
      height: 1024,
      isIllustrative: true,
    },
  },
  "programme-vc": {
    role: "Venture Capital programme card",
    subject: "Investment-readiness review between a founder and the Nayokan team",
    location: "Nayokan offices, Yaoundé",
    composition: "Documents and people at a table, natural window light",
    ratio: "3:2",
    treatment: DOCUMENTARY,
    illustrative: {
      src: "/assets/photos/illustrative/programme-vc.jpg",
      alt: "Investment review meeting between an entrepreneur and investment analysts in Yaoundé.",
      width: 1536,
      height: 1024,
      isIllustrative: true,
    },
  },
  "programme-hospitality": {
    role: "Hospitality programme card",
    subject: "Hospitality trainees or staff at work in a Nayokan property",
    location: "Confirmed Nayokan property",
    composition: "Service in progress, guest area in background",
    ratio: "3:2",
    treatment: DOCUMENTARY,
    illustrative: {
      src: "/assets/photos/illustrative/programme-hospitality.jpg",
      alt: "Hospitality trainees and staff at work preparing a dining area in Yaoundé.",
      width: 1536,
      height: 1024,
      isIllustrative: true,
    },
  },
  "programmes-hero": {
    role: "Programme directory hero: the breadth of Nayokan programmes",
    subject: "A Nayokan training or cohort session in progress",
    location: "Nayokan VTI, Yaoundé",
    composition: "Wide room shot, participants and facilitator",
    ratio: "4:3",
    treatment: DOCUMENTARY,
    asset: { ...LAB_LAUNCH, position: "50% 40%" },
  },

  // ── VTI ────────────────────────────────────────────────────────────────────
  "vti-hero": {
    role: "VTI home hero",
    subject: "Trainees and staff inside the VTI",
    location: "Nayokan VTI, Yaoundé",
    composition: "Wide, people and training equipment",
    ratio: "4:3",
    treatment: DOCUMENTARY,
    asset: LAB_LAUNCH,
  },
  "vti-programmes-hero": {
    role: "VTI programmes listing hero",
    subject: "Trainees at workstations during a practical session",
    location: "Nayokan VTI, Yaoundé",
    composition: "Row of workstations receding, trainees engaged",
    ratio: "4:3",
    treatment: DOCUMENTARY,
    asset: { ...LAB_SESSION, position: "20% 50%" },
  },
  "vti-clusters-hero": {
    role: "Entrepreneurial clusters listing hero",
    subject: "Cluster members producing together (brick press, food processing line or plumbing workshop)",
    location: "A confirmed Nayokan cluster site, Cameroon",
    composition: "Production in progress, product visible",
    ratio: "4:3",
    treatment: DOCUMENTARY,
    illustrative: {
      src: "/assets/photos/illustrative/vti-clusters-hero.jpg",
      alt: "Artisanal production cluster members manufacturing interlocking earth blocks in Cameroon.",
      width: 1365,
      height: 1024,
      isIllustrative: true,
    },
  },
  "cluster-detail": {
    role: "Cluster detail hero",
    subject: "The cluster's members and their product or workspace",
    location: "The cluster's own site",
    composition: "Wide establishing shot, then product close-up",
    ratio: "16:9",
    treatment: DOCUMENTARY,
    illustrative: {
      src: "/assets/photos/illustrative/cluster-detail.jpg",
      alt: "Members of an artisanal cluster crafting woodwork and fabrication products in Cameroon.",
      width: 1792,
      height: 1024,
      isIllustrative: true,
    },
  },

  // ── Startup Centre ─────────────────────────────────────────────────────────
  "startup-programme-hero": {
    role: "Startup programme page hero",
    subject: "Founders presenting progress to mentors at a milestone review",
    location: "Startup Centre workspace",
    composition: "Presenter and audience, work on screen or wall",
    ratio: "4:3",
    treatment: DOCUMENTARY,
    illustrative: {
      src: "/assets/photos/illustrative/startup-programme-hero.jpg",
      alt: "A young entrepreneur presenting milestone progress to mentors in a modern workspace.",
      width: 1365,
      height: 1024,
      isIllustrative: true,
    },
  },
  "startup-commercialization": {
    role: "Commercialization pathway illustration photo",
    subject: "A prototype moving toward product: testing with a first customer",
    location: "Customer site or market in Cameroon",
    composition: "Product in the customer's hands",
    ratio: "16:9",
    treatment: DOCUMENTARY,
    illustrative: {
      src: "/assets/photos/illustrative/startup-commercialization.jpg",
      alt: "An entrepreneur demonstrating a hardware product prototype to a customer in Yaoundé.",
      width: 1792,
      height: 1024,
      isIllustrative: true,
    },
  },
  "startup-opportunities-hero": {
    role: "Opportunities index hero",
    subject: "A call or challenge information session with applicants",
    location: "Partner university or Startup Centre, Cameroon",
    composition: "Audience facing the speaker, notes and laptops",
    ratio: "4:3",
    treatment: DOCUMENTARY,
    illustrative: {
      src: "/assets/photos/illustrative/startup-opportunities-hero.jpg",
      alt: "Aspiring entrepreneurs and students at a programme briefing session in Cameroon.",
      width: 1365,
      height: 1024,
      isIllustrative: true,
    },
  },
  "startup-portfolio": {
    role: "Portfolio venture card and detail hero",
    subject: "The venture's team with its product or operation",
    location: "The venture's own workplace",
    composition: "Team in their environment, product visible",
    ratio: "3:2",
    treatment: `${DOCUMENTARY} Consent from the venture required.`,
    illustrative: {
      src: "/assets/photos/illustrative/startup-portfolio.jpg",
      alt: "A clean technology startup team gathered around their prototype in their workshop in Yaoundé.",
      width: 1536,
      height: 1024,
      isIllustrative: true,
    },
  },
  "startup-mentor": {
    role: "Mentor portrait",
    subject: "Head-and-shoulders portrait of the named mentor",
    location: "Neutral indoor light",
    composition: "Eye level, plain background",
    ratio: "4:5",
    treatment: "Consistent portrait set: same light, same crop, consent recorded.",
    illustrative: {
      src: "/assets/photos/illustrative/startup-mentor.jpg",
      alt: "Portrait of a startup mentor and enterprise advisor in Cameroon.",
      width: 1365,
      height: 1024,
      position: "85% 60%",
      isIllustrative: true,
    },
  },

  // ── Corporate worlds ──────────────────────────────────────────────────────
  "vc-hero": {
    role: "Venture Capital page supporting image",
    subject: "A productive enterprise in operation that fits the investment thesis",
    location: "Cameroon",
    composition: "Operation in progress, no identifiable financial documents",
    ratio: "4:3",
    treatment: `${DOCUMENTARY} Cool grade for navy pages.`,
    illustrative: {
      src: "/assets/photos/illustrative/vc-hero.jpg",
      alt: "A productive enterprise manufacturing building materials in Cameroon.",
      width: 1365,
      height: 1024,
      isIllustrative: true,
    },
  },
  "hospitality-hero": {
    role: "Hospitality page hero",
    subject: "A confirmed Nayokan property at arrival",
    location: "Yaoundé",
    composition: "Entrance or courtyard, human scale",
    ratio: "4:5",
    treatment: "Architectural, warm and quiet. Real property only.",
    illustrative: {
      src: "/assets/photos/illustrative/hospitality-hero.jpg",
      alt: "Courtyard and entrance of a quiet boutique property in Yaoundé.",
      width: 1792,
      height: 1024,
      position: "50% 50%",
      isIllustrative: true,
    },
  },
  "property": {
    role: "Property listing and detail image",
    subject: "The named property: exterior, then a room and a shared space",
    location: "The property itself",
    composition: "Three frames: arrival, room, shared space",
    ratio: "3:2",
    treatment: "Architectural, warm and quiet. Real property only; no renders.",
    illustrative: {
      src: "/assets/photos/illustrative/property.jpg",
      alt: "Refined dining and guest reception space at a Nayokan hospitality property.",
      width: 1536,
      height: 1024,
      isIllustrative: true,
    },
  },

  // ── Editorial ─────────────────────────────────────────────────────────────
  "story-startup": {
    role: "Startup Centre story cover",
    subject: "The founders or researchers featured in the story",
    location: "Their workplace",
    composition: "Environmental portrait",
    ratio: "3:2",
    treatment: DOCUMENTARY,
    illustrative: {
      src: "/assets/photos/illustrative/story-startup.jpg",
      alt: "The founder team in their workshop developing early-stage technology in Yaoundé.",
      width: 1536,
      height: 1024,
      isIllustrative: true,
    },
  },
  "article-default": {
    role: "Insight article cover",
    subject: "The people, place or work the article reports on",
    location: "Where the story happened",
    composition: "Environmental, landscape",
    ratio: "16:9",
    treatment: DOCUMENTARY,
    illustrative: {
      src: "/assets/photos/illustrative/article-default.jpg",
      alt: "Artisans and technicians working on fabrication inside a cooperative workshop.",
      width: 1792,
      height: 1024,
      isIllustrative: true,
    },
  },
} satisfies Record<string, Omit<ImageBrief, "id">>;

export type ImageSlotId = keyof typeof briefs;

export function getImageBrief(id: ImageSlotId): ImageBrief {
  return { id, ...briefs[id] } as ImageBrief;
}

export const RATIO_CSS: Record<ImageRatio, string> = {
  "16:9": "16 / 9",
  "21:9": "21 / 9",
  "3:2": "3 / 2",
  "4:3": "4 / 3",
  "4:5": "4 / 5",
  "1:1": "1 / 1",
  "3:4": "3 / 4",
};

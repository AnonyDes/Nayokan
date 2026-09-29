// Site-wide scroll motion: which elements enter, and how. One source of truth
// for both the server-rendered hidden state (motion-styles.tsx) and the client
// observer (motion-observer.tsx), so the two can never drift apart.
//
// Three entrance treatments:
//   rise    — block fades up (headers, copy columns, CTA halves)
//   stagger — children of a card collection enter one after another
//   mask    — photograph unmasks upward while the image settles from a zoom
//
// Heroes are not listed here: they animate on load in pure CSS (motion.css),
// so they never wait for hydration.

const SCOPE = "#main";

// Card collections whose direct children stagger in.
export const STAGGER_GRIDS = [
  "article-related-grid",
  "big-metrics-grid",
  "clusters-grid",
  "contact-steps",
  "dir-grid",
  "ed-grid",
  "ed-steps",
  "feature-list",
  "idea-grid",
  "impact-grid",
  "impact-steps",
  "leadership-grid",
  "mentors-grid",
  "partner-wall",
  "partners-grid",
  "pf-grid",
  "pgrid",
  "portfolio-grid",
  "related-grid",
  "routes-grid",
  "spec-grid",
  "stage-rail",
  "stories-grid",
  "timeline-track",
  "univ-grid",
  "values-grid",
  "vti-prog-cards",
] as const;

// Blocks that rise as one piece.
const RISE_BLOCKS = [
  ".section-header > *",
  ".cta-grid > *",
  ".related > .wrap > h3",
  ".apply-grid > *",
  ".prog-footer",
  ".two-col-inner > *",
  ".sub-2col-grid > *",
  ".ed-band-inner > *",
  ".contact-form-grid > *",
  ".vc-enquiry-grid > *",
  ".hosp-booking-grid > *",
  ".article-body-wrap > *",
  ".article-cover-cap",
];

// Standalone photography (not inside a card, which already staggers).
const MASK_MEDIA = [
  ".media-slot",
  ".vti-strip-inner > figure",
  ".article-cover-inner",
];

const grids = STAGGER_GRIDS.map((g) => `.${g}`).join(", ");

// Anything the older `.reveal` system or a hero already animates is left alone.
const NOT_OWNED = `:not(.reveal, .reveal *, .hero *, .world-hero *, .corp-hero *, .sub-hero *, .ed-hero *, .article-hero *)`;

const scoped = (selectors: string[]) => selectors.map((s) => `${SCOPE} :is(${s})${NOT_OWNED}`).join(",\n");

export const RISE_SELECTOR = scoped([...RISE_BLOCKS, ".wrap > .link-inline"]);
export const STAGGER_SELECTOR = `${SCOPE} :is(${grids}) > *${NOT_OWNED}`;
export const MASK_SELECTOR = scoped(
  MASK_MEDIA.map((m) => `${m}:not(:is(${grids}) > * ${m}, .pcard ${m}, .card ${m})`),
);

export const ALL_TARGETS = [RISE_SELECTOR, STAGGER_SELECTOR, MASK_SELECTOR].join(",\n");

// Timing contract shared by CSS and the observer.
export const MOTION = {
  riseMs: 900,
  maskMs: 1300,
  staggerStepMs: 70,
  staggerCap: 6,
  // If the client never hydrates, CSS reveals everything after this.
  failsafeMs: 3000,
} as const;

// MOCK articles + stories — pending Session B's content tables
// (readiness-report §8). List rows mirror Designs/admin/articles.html and
// stories.html verbatim; the flagship article's body is article-editor.html's
// demo copy. All rows carry isDemo provenance.
import "server-only";
import type { SiteFilter } from "@/admin/shell/SiteSelector";
import { filterByQuery, filterBySite, filterByStatus, paginate, type ListQuery, type Page } from "@/admin/data/query";
import { mockGet, mockId, mockInsert, mockList, mockUpdate } from "@/admin/data/mock-store";
import type { SiteId } from "@/platform/sites/types";
import type { AdminArticle, AdminStory } from "./types";

const DEMO = { isDemo: true } as const;

// The flagship draft body — article-editor.html's demo article, block by block.
const FLAGSHIP_BODY: AdminArticle["body"] = [
  {
    type: "paragraph",
    text: "Cameroon does not lack ambition. Across cities and villages, young people build things — repair engines, run enterprises out of small workshops, coax value out of raw agricultural output. What Cameroon lacks, structurally, is a formal recognition of that capability. Vocational training is where recognition begins.",
  },
  { type: "heading", level: 2, text: "Capability, not credentials" },
  {
    type: "paragraph",
    text: "The Nayokan Vocational Training Institute exists to make one thing explicit: skill is infrastructure. When a welder can prove their skill against a national standard, when an agri-processor can join a productive cluster with peer accountability, when a small enterprise can hire against a recognisable qualification — that country becomes measurably more productive.",
  },
  { type: "quote", text: "We are not training people to leave Cameroon. We are training people to build it.", attribution: "A Nayokan cluster lead, September 2026" },
  { type: "image", media: { id: "m-field-c4", src: "", alt: "Cluster session, Yaoundé", caption: "Cluster session, Yaoundé. Photo credit to be added before publish." } },
  {
    type: "callout",
    text: "Clusters are peer groupings of small enterprises within a shared sector — welding, agri-processing, textiles — that train, produce and defend market share together.",
  },
  {
    type: "paragraph",
    text: "This is what a vocational renaissance looks like in practice: not new buildings, but new proofs of capability, distributed across the country, connected to buyers and mentors and capital pathways. Nayokan is one node in that network. There must be many more.",
  },
];

const SEED_ARTICLES: AdminArticle[] = [
  {
    id: "art-1",
    code: "ART-2026-024",
    site: "corporate",
    world: "vti",
    slug: "building-productive-capability",
    title: "Building productive capability: why Cameroon needs a vocational renaissance",
    excerpt:
      "A field-note from Nayokan on how vocational training becomes the backbone of a productive economy — and what happens when we treat it as strategic infrastructure.",
    category: "Field notes",
    authorName: "John Bekolo",
    authorInitials: "JB",
    status: "in_review",
    tags: ["Vocational", "Clusters", "Cameroon"],
    body: FLAGSHIP_BODY,
    seoTitle: "Building productive capability — Nayokan",
    seoDesc: "",
    reviewer: "David Ekwe",
    submittedAgo: "Yesterday · 16:42",
    updatedAgo: "2h ago",
    views30d: null,
    version: 4,
    provenance: { ...DEMO },
  },
  { id: "art-2", code: "ART-2026-021", site: "corporate", world: "startup", slug: "university-commercialisation", title: "How Cameroonian universities are commercialising research", excerpt: "", category: "Field notes", authorName: "Sarah Ndenge", authorInitials: "SN", status: "draft", tags: [], body: [], seoTitle: "", seoDesc: "", updatedAgo: "Yesterday", views30d: null, version: 1, provenance: { ...DEMO } },
  { id: "art-3", code: "ART-2026-018", site: "corporate", world: null, slug: "q3-impact-review", title: "Nayokan Q3 impact review — twelve verified indicators", excerpt: "", category: "Impact review", authorName: "Maria Ndongo", authorInitials: "MN", status: "scheduled", statusNote: "Scheduled · Wed 08:00", tags: [], body: [], seoTitle: "", seoDesc: "", updatedAgo: "3d ago", views30d: null, version: 6, provenance: { ...DEMO } },
  { id: "art-4", code: "ART-2026-011", site: "corporate", world: "vti", slug: "cohort-4-welcome", title: "Cohort 4 — welcoming our newest learners", excerpt: "", category: "Programme updates", authorName: "Aïssa Tchoumi", authorInitials: "AT", status: "published", tags: [], body: [], seoTitle: "", seoDesc: "", updatedAgo: "1w ago", views30d: 1204, version: 8, provenance: { ...DEMO } },
  { id: "art-5", code: "ART-2026-015", site: "corporate", world: "hospitality", slug: "hospitality-year-in-review", title: "Hospitality year in review — Yaoundé guesthouse learnings", excerpt: "", category: "Field notes", authorName: "David Ekwe", authorInitials: "DE", status: "changes_requested", tags: [], body: [], seoTitle: "", seoDesc: "", updatedAgo: "Yesterday", views30d: null, version: 3, provenance: { ...DEMO } },
  { id: "art-6", code: "ART-2026-009", site: "corporate", world: "vti", slug: "enterprise-cluster-model", title: "Field notes: the enterprise cluster model", excerpt: "", category: "Field notes", authorName: "John Bekolo", authorInitials: "JB", status: "published", tags: [], body: [], seoTitle: "", seoDesc: "", updatedAgo: "2w ago", views30d: 862, version: 5, provenance: { ...DEMO } },
  { id: "art-7", code: "ART-2026-007", site: "corporate", world: "startup", slug: "innovator-residency-2026", title: "Innovator residency — 2026 call for applications", excerpt: "", category: "Announcement", authorName: "Sarah Ndenge", authorInitials: "SN", status: "published", tags: [], body: [], seoTitle: "", seoDesc: "", updatedAgo: "3w ago", views30d: 2140, version: 4, provenance: { ...DEMO } },
  { id: "art-8", code: "ART-2026-019", site: "corporate", world: "startup", slug: "enterprise-readiness", title: "Building enterprise readiness in Cameroon's startups", excerpt: "", category: "Programme updates", authorName: "Sarah Ndenge", authorInitials: "SN", status: "scheduled", statusNote: "Scheduled · 1 Oct", tags: [], body: [], seoTitle: "", seoDesc: "", updatedAgo: "4d ago", views30d: null, version: 2, provenance: { ...DEMO } },
  { id: "art-9", code: "ART-2026-014", site: "corporate", world: "startup", slug: "mentors-chair-cohort-3", title: "The mentor's chair — six lessons from Cohort 3", excerpt: "", category: "Field notes", authorName: "Maria Ndongo", authorInitials: "MN", status: "draft", tags: [], body: [], seoTitle: "", seoDesc: "", updatedAgo: "32d ago", views30d: null, version: 1, provenance: { ...DEMO } },
  { id: "art-10", code: "ART-2026-005", site: "corporate", world: "hospitality", slug: "nayokan-guesthouse-practice", title: "Nayokan Guesthouse — a productive asset in practice", excerpt: "", category: "Field notes", authorName: "David Ekwe", authorInitials: "DE", status: "published", tags: [], body: [], seoTitle: "", seoDesc: "", updatedAgo: "5w ago", views30d: 548, version: 7, provenance: { ...DEMO } },
  { id: "art-11", code: "ART-2026-003", site: "corporate", world: "venture_capital", slug: "patient-capital-letter", title: "On patient capital: a Nayokan letter", excerpt: "", category: "Institutional letter", authorName: "Maria Ndongo", authorInitials: "MN", status: "published", tags: [], body: [], seoTitle: "", seoDesc: "", updatedAgo: "6w ago", views30d: 1802, version: 9, provenance: { ...DEMO } },
  { id: "art-12", code: "ART-2025-231", site: "corporate", world: null, slug: "draft-abc-1029", title: "Old draft — abandoned working title", excerpt: "", category: "Field notes", authorName: "John Bekolo", authorInitials: "JB", status: "archived", tags: [], body: [], seoTitle: "", seoDesc: "", updatedAgo: "4mo ago", views30d: null, version: 2, provenance: { ...DEMO } },
];

const SEED_STORIES: AdminStory[] = [
  { id: "st-1", site: "vti", world: "vti", slug: "cohort-4-welcoming-our-newest-learners", title: "Cohort 4 — welcoming our newest learners", excerpt: "", type: "beneficiary", programme: "VTI · Cluster", consentRecorded: true, evidenceAttached: true, status: "in_review", updatedAgo: "2d", provenance: { ...DEMO } },
  { id: "st-2", site: "vti", world: "vti", slug: "from-workshop-to-registered-enterprise-a-textile-s", title: "From workshop to registered enterprise · A textile story", excerpt: "", type: "enterprise", programme: "VTI · Cluster", consentRecorded: true, evidenceAttached: true, status: "published", updatedAgo: "1w", provenance: { ...DEMO } },
  { id: "st-3", site: "vti", world: "vti", slug: "building-cohort-3-one-year-on", title: "Building Cohort 3 — one year on", excerpt: "", type: "cohort", programme: "VTI", consentRecorded: true, evidenceAttached: true, status: "published", updatedAgo: "2w", provenance: { ...DEMO } },
  { id: "st-4", site: "startup", world: "startup", slug: "innovator-residency-a-first-cohort", title: "Innovator Residency — a first cohort", excerpt: "", type: "cohort", programme: "Startup", consentRecorded: true, evidenceAttached: true, status: "published", updatedAgo: "3w", provenance: { ...DEMO } },
  { id: "st-5", site: "vti", world: "vti", slug: "a-welder-becomes-a-certified-trainer", title: "A welder becomes a certified trainer", excerpt: "", type: "beneficiary", programme: "VTI · Cluster", consentRecorded: true, evidenceAttached: true, status: "published", updatedAgo: "1mo", provenance: { ...DEMO } },
  { id: "st-6", site: "startup", world: "startup", slug: "a-commercialised-research-idea-ready-for-market", title: "A commercialised research idea, ready for market", excerpt: "", type: "enterprise", programme: "Startup", consentRecorded: true, evidenceAttached: false, status: "draft", updatedAgo: "4d", provenance: { ...DEMO } },
  { id: "st-7", site: "vti", world: "vti", slug: "draft-beneficiary-story-14", title: "Draft · beneficiary story #14", excerpt: "", type: "beneficiary", consentRecorded: false, evidenceAttached: false, status: "draft", updatedAgo: "6d", provenance: { ...DEMO } },
];

export function listArticles(site: SiteFilter, query: ListQuery): Page<AdminArticle> {
  let rows = mockList("articles", () => SEED_ARTICLES);
  rows = filterBySite(rows, site, (r) => r.site);
  rows = filterByStatus(rows, query.status, (r) => r.status);
  rows = filterByQuery(rows, query.q, (r) => [r.title, r.slug, r.authorName]);
  return paginate(rows, query.page, query.pageSize);
}

export function articleStatusCounts(site: SiteFilter): Record<string, number> {
  const rows = filterBySite(mockList("articles", () => SEED_ARTICLES), site, (r) => r.site);
  const counts: Record<string, number> = { all: rows.length };
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
  return counts;
}

export function getArticle(id: string): AdminArticle | null {
  return mockGet("articles", () => SEED_ARTICLES, id);
}

export function listStories(site: SiteFilter, query: ListQuery): Page<AdminStory> {
  let rows = mockList("stories", () => SEED_STORIES);
  rows = filterBySite(rows, site, (r) => r.site);
  rows = filterByStatus(rows, query.status, (r) => r.status);
  rows = filterByQuery(rows, query.q, (r) => [r.title, r.slug, r.programme]);
  return paginate(rows, query.page, query.pageSize);
}

export function storyStatusCounts(site: SiteFilter): Record<string, number> {
  const rows = filterBySite(mockList("stories", () => SEED_STORIES), site, (r) => r.site);
  const counts: Record<string, number> = { all: rows.length };
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
  return counts;
}

export function getStory(id: string): AdminStory | null {
  return mockGet("stories", () => SEED_STORIES, id);
}

// — mock mutations (called only from actions.ts after authZ) —

export function saveArticle(id: string, patch: Partial<AdminArticle>): AdminArticle | null {
  return mockUpdate("articles", () => SEED_ARTICLES, id, { ...patch, updatedAgo: "now" });
}

export function createArticle(site: SiteId, author: { name: string; initials: string }): AdminArticle {
  const n = mockList("articles", () => SEED_ARTICLES).length + 1;
  return mockInsert("articles", () => SEED_ARTICLES, {
    id: mockId("art"),
    code: `ART-2026-${String(100 + n)}`,
    site,
    world: null,
    slug: `untitled-${n}`,
    title: "Untitled article",
    excerpt: "",
    category: "Field notes",
    authorName: author.name,
    authorInitials: author.initials,
    status: "draft",
    tags: [],
    body: [],
    seoTitle: "",
    seoDesc: "",
    updatedAgo: "now",
    views30d: null,
    version: 1,
    provenance: { ...DEMO },
  });
}

export function saveStory(id: string, patch: Partial<AdminStory>): AdminStory | null {
  return mockUpdate("stories", () => SEED_STORIES, id, { ...patch, updatedAgo: "now" });
}

export function createStory(site: SiteId): AdminStory {
  const n = mockList("stories", () => SEED_STORIES).length + 1;
  return mockInsert("stories", () => SEED_STORIES, {
    id: mockId("st"),
    site,
    world: null,
    slug: `untitled-story-${n}`,
    title: "Untitled story",
    excerpt: "",
    type: "beneficiary",
    consentRecorded: false,
    evidenceAttached: false,
    status: "draft",
    updatedAgo: "now",
    provenance: { ...DEMO },
  });
}

// MOCK review queue + version history — pending Session B's review/
// versions tables. The queue is DERIVED from the content modules' real
// statuses (article/story in_review, metric needs_verification|verified,
// programme draft) so submit-for-review elsewhere in the admin surfaces
// here automatically; per-item review metadata lives in queue_meta.
// Rows mirror review-queue.html / content-review.html / version-history.html.
import "server-only";
import type { SiteFilter } from "@/admin/shell/SiteSelector";
import { filterBySite } from "@/admin/data/query";
import { mockGet, mockId, mockInsert, mockList, mockUpdate } from "@/admin/data/mock-store";
import { getArticle, listArticles, saveArticle } from "@/admin/content/articles/data";
import { getStory, listStories } from "@/admin/content/articles/data";
import { listMetrics, WORLD_SITE } from "@/admin/operations/impact/data";
import { listProgrammes } from "@/admin/content/programmes/data";
import type { AdminArticle, AdminStory } from "@/admin/content/articles/types";
import type { RichBlock } from "@/platform/content/types";
import type { SiteId, World } from "@/platform/sites/types";
import { WORLD_LABEL } from "@/admin/operations/impact/labels";
import type {
  ContentVersion,
  DiffSeg,
  PreflightCheck,
  QueueMeta,
  ReviewComment,
  ReviewDetail,
  ReviewKind,
  ReviewQueueItem,
  VersionBodyBlock,
} from "./types";

const DEMO = { isDemo: true } as const;
const META = "queue_meta";
const VERSIONS = "content_versions";
const COMMENTS = "review_comments";

const WORLD_DISPLAY: Record<World, string> = { ...WORLD_LABEL, corporate: "Corporate" };

const worldLabel = (w: World | null): string => (w ? WORLD_DISPLAY[w] : "All worlds");

// — queue metadata seed (mirrors review-queue.html's four cards) —

const SEED_META: QueueMeta[] = [
  {
    id: "art-1",
    kind: "article",
    submittedBy: "John Bekolo",
    assignedTo: "Maria Ndongo",
    waitingHours: 22,
    waitingLabel: "22h",
    meta: [
      { label: "Words", value: "1,024" },
      { label: "Waiting", value: "22h" },
      { label: "SEO", value: "Needs work", tone: "warn" },
    ],
    secondary: "reassign",
  },
  {
    id: "met-1",
    kind: "metric",
    submittedBy: "Maria Ndongo",
    assignedTo: null,
    waitingHours: 96,
    waitingLabel: "4 days",
    meta: [
      { label: "Value", value: "240 people" },
      { label: "Waiting", value: "4 days" },
      { label: "Evidence", value: "Missing", tone: "danger" },
    ],
    secondary: "request-evidence",
  },
  {
    id: "prog-3",
    kind: "programme",
    submittedBy: "John Bekolo",
    assignedTo: null,
    waitingHours: 72,
    waitingLabel: "3 days",
    meta: [
      { label: "Duration", value: "18 months" },
      { label: "Waiting", value: "3 days" },
      { label: "Fields", value: "1 missing", tone: "warn" },
    ],
    secondary: "request-changes",
  },
  {
    id: "st-1",
    kind: "story",
    submittedBy: "Aïssa Tchoumi",
    assignedTo: null,
    waitingHours: 1,
    waitingLabel: "1h",
    meta: [
      { label: "Media", value: "12 images" },
      { label: "Waiting", value: "1h" },
      { label: "Publishing", value: "Scheduled" },
    ],
    secondary: "approve-now",
  },
];

function defaultMeta(id: string, kind: ReviewKind, submittedBy: string, meta: QueueMeta["meta"]): QueueMeta {
  return { id, kind, submittedBy, assignedTo: null, waitingHours: 6, waitingLabel: "6h", meta, secondary: "reassign" };
}

function agingOf(hours: number): ReviewQueueItem["aging"] {
  if (hours >= 72) return "stale";
  if (hours < 8) return "fresh";
  return "normal";
}

function toItem(meta: QueueMeta, base: { title: string; excerpt: string; worldLabel: string; href: string; site: SiteId; filterSite?: SiteId | null }): ReviewQueueItem {
  return {
    id: meta.id,
    kind: meta.kind,
    kindLabel: meta.kind === "article" ? "Article" : meta.kind === "story" ? "Story" : meta.kind === "metric" ? "Impact metric" : "Programme",
    title: base.title,
    excerpt: base.excerpt,
    submittedBy: meta.submittedBy,
    assignedTo: meta.assignedTo,
    worldLabel: base.worldLabel,
    meta: [{ label: "World", value: base.worldLabel }, ...meta.meta],
    waitingLabel: meta.waitingLabel,
    waitingHours: meta.waitingHours,
    aging: agingOf(meta.waitingHours),
    secondary: meta.secondary,
    href: base.href,
    site: base.site,
    filterSite: base.filterSite === undefined ? base.site : base.filterSite,
  };
}

function articleMeta(a: AdminArticle): QueueMeta {
  return (
    mockGet(META, () => SEED_META, a.id) ??
    defaultMeta(a.id, "article", a.authorName, [
      { label: "Words", value: String(bodyWords(a.body).toLocaleString("en-US")) },
      { label: "Waiting", value: "6h" },
    ])
  );
}

function bodyWords(body: RichBlock[]): number {
  return body
    .map((b) => ("text" in b ? b.text : "items" in b ? b.items.join(" ") : ""))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * The review queue. `scope: "mine"` (default, per the design's lede) shows
 * items assigned to sessionName plus unassigned leadership-review items;
 * "all" shows everything awaiting review. `sort: "oldest"` orders by
 * waiting time descending; default keeps submission order.
 */
export function listReviewQueue(opts: { sessionName?: string; scope?: "mine" | "all"; sort?: string; site?: SiteFilter }): ReviewQueueItem[] {
  const items: ReviewQueueItem[] = [];

  for (const a of listArticles("all", { page: 1, pageSize: 200, status: "in_review" }).rows) {
    items.push(
      toItem(articleMeta(a), {
        title: a.title,
        excerpt: a.excerpt,
        worldLabel: worldLabel(a.world),
        href: `/admin/review-queue/${a.id}`,
        site: a.site,
      }),
    );
  }
  for (const s of listStories("all", { page: 1, pageSize: 200, status: "in_review" }).rows) {
    const meta =
      mockGet(META, () => SEED_META, s.id) ??
      defaultMeta(s.id, "story", s.title.split("·")[0]?.trim() || "Editorial team", [{ label: "Waiting", value: "6h" }]);
    items.push(
      toItem(meta, {
        title: s.title,
        excerpt: s.excerpt || `A ${s.type} story awaiting review.`,
        worldLabel: worldLabel(s.world),
        href: `/admin/review-queue/${s.id}`,
        site: s.site,
      }),
    );
  }
  for (const m of listMetrics("all", { page: 1, pageSize: 200 }).rows.filter((r) => r.status === "needs_verification" || r.status === "verified")) {
    const meta =
      mockGet(META, () => SEED_META, m.id) ??
      defaultMeta(m.id, "metric", m.audit[0]?.actor ?? "Impact office", [
        { label: "Value", value: m.value === null ? "—" : `${m.value} ${m.unit}` },
        { label: "Waiting", value: "6h" },
      ]);
    items.push(
      toItem(meta, {
        title: m.title,
        excerpt: `Value ${m.value ?? "—"} · ${m.evidence.label}. Verification chain ${m.status === "verified" ? "awaiting approval" : "incomplete"}.`,
        worldLabel: WORLD_LABEL[m.world],
        href: `/admin/impact/metrics/${m.id}`,
        site: WORLD_SITE[m.world] ?? "corporate",
        filterSite: WORLD_SITE[m.world],
      }),
    );
  }
  for (const p of listProgrammes("all", { page: 1, pageSize: 200, status: "draft" }).rows) {
    const meta =
      mockGet(META, () => SEED_META, p.id) ??
      defaultMeta(p.id, "programme", "Programme team", [
        { label: "Duration", value: p.duration || "tbc" },
        { label: "Waiting", value: "6h" },
      ]);
    items.push(
      toItem(meta, {
        title: p.name,
        excerpt: `Programme draft ready for review. ${p.deadline === "Missing" ? "Application deadline still missing — programme cannot open publicly until this is set." : "Details under review."}`,
        worldLabel: worldLabel(p.world),
        href: `/admin/programmes/${p.id}`,
        site: p.site,
      }),
    );
  }

  // Keep seeded design order first (art-1, met-1, prog-3, st-1), then any
  // unseeded rows in discovery order — mirroring the design's card order.
  const seedOrder = SEED_META.map((m) => m.id);
  items.sort((a, b) => {
    const ai = seedOrder.indexOf(a.id);
    const bi = seedOrder.indexOf(b.id);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  let rows = items;
  if (opts.scope !== "all") {
    rows = rows.filter((r) => r.assignedTo === null || r.assignedTo === opts.sessionName);
  }
  rows = filterBySite(rows, opts.site, (r) => r.filterSite);
  if (opts.sort === "oldest") rows = [...rows].sort((a, b) => b.waitingHours - a.waitingHours);
  return rows;
}

export function queueStats(items: ReviewQueueItem[]): { assigned: number; stale: number; total: number } {
  return { total: items.length, assigned: items.filter((i) => i.assignedTo !== null).length, stale: items.filter((i) => i.aging === "stale").length };
}

/** Look up one queue item across every kind (used by the review route to redirect non-editorial kinds). */
export function getReviewItem(id: string): ReviewQueueItem | null {
  return listReviewQueue({ scope: "all" }).find((i) => i.id === id) ?? null;
}

export function setQueueAssignee(contentId: string, kind: ReviewKind, submittedBy: string, assignee: string | null): void {
  if (mockGet(META, () => SEED_META, contentId)) {
    mockUpdate(META, () => SEED_META, contentId, { assignedTo: assignee });
  } else {
    mockInsert(META, () => SEED_META, { ...defaultMeta(contentId, kind, submittedBy, []), assignedTo: assignee });
  }
}

// REVIEWERS lives in types.ts — it's a client-safe constant shared with
// PublishingClient; this module stays server-only.

// — content review detail —

function seg(text: string, kind: DiffSeg["kind"] = "same"): DiffSeg {
  return { kind, text };
}

const ARTICLE_REVIEW_EXTRA = {
  authorRoleLine: "Programme Manager · VTI",
  submittedAt: "Submitted · 20 Sep · 16:42",
  wordsLabel: "Words · 1,024",
  diffTitle: "Changes since v3",
  diff: [
    seg("Cameroon does not lack ambition. "),
    seg("Across the country, there are people who…", "del"),
    seg("Across cities and villages, young people build things —", "ins"),
    seg(" repair engines, run enterprises out of small workshops…"),
  ],
  diffNotes: ["+ Added quote from cluster lead", "+ Added callout: cluster model definition"],
  preflightExtra: [{ label: "Related programme link", ok: true, note: "Linked" }] satisfies PreflightCheck[],
};

function articlePreflight(a: AdminArticle): PreflightCheck[] {
  const hasImage = a.body.some((b) => b.type === "image") || Boolean(a.coverImage);
  const allAlt = a.body.every((b) => b.type !== "image" || Boolean(b.media.alt.trim()));
  return [
    { label: "Cover image", ok: hasImage, note: hasImage ? "Present" : "Missing" },
    { label: "SEO title", ok: a.seoTitle.trim().length > 0, note: a.seoTitle.trim() ? "Set" : "Missing" },
    { label: "SEO description", ok: a.seoDesc.trim().length > 0, note: a.seoDesc.trim() ? "Set" : "Missing" },
    { label: "Alt text · all media", ok: allAlt, note: allAlt ? "Complete" : "Incomplete" },
    ...ARTICLE_REVIEW_EXTRA.preflightExtra,
    { label: "Tags", ok: a.tags.length > 0, note: a.tags.length ? `${a.tags.length} tags` : "None" },
    { label: "Word count within range", ok: true, note: "OK" },
  ];
}

function storyPreflight(s: AdminStory): PreflightCheck[] {
  return [
    { label: "Consent recorded", ok: s.consentRecorded, note: s.consentRecorded ? "Recorded" : "Missing" },
    { label: "Evidence attached", ok: s.evidenceAttached, note: s.evidenceAttached ? "Attached" : "Missing" },
    { label: "Cover image", ok: true, note: "Present" },
    { label: "Alt text · all media", ok: true, note: "Complete" },
    { label: "Programme link", ok: Boolean(s.programme), note: s.programme ? "Linked" : "Missing" },
    { label: "Word count within range", ok: true, note: "OK" },
  ];
}

/** Photo-essay preview for the seeded story review (content-review.html's layout). */
const STORY_PREVIEW: RichBlock[] = [
  { type: "paragraph", text: "A photo essay following the first two weeks of Cohort 4 — orientation, first workshop sessions, and the beginnings of cluster bonds. Scheduled to publish Friday 26 Sept." },
  { type: "image", media: { id: "m-st-1", src: "", alt: "Cohort 4 orientation morning, Yaoundé", caption: "Orientation morning · cohort 4." } },
  { type: "quote", text: "We arrived as strangers. By Friday we were already planning together.", attribution: "A Cohort 4 learner, week two" },
  { type: "image", media: { id: "m-st-2", src: "", alt: "First welding practice under supervision", caption: "First supervised practice." } },
];

export function getReviewDetail(id: string): ReviewDetail | null {
  const item = getReviewItem(id);
  if (!item) return null;

  if (item.kind === "article") {
    const a = getArticle(id);
    if (!a) return null;
    const meta = articleMeta(a);
    return {
      item,
      codeLabel: `Article #${a.code}`,
      submittedLabel: `Submitted by ${a.authorName} · ${meta.waitingLabel} ago · v${a.version} (${a.version - 1} revisions since first draft)`,
      authorName: a.authorName,
      authorInitials: a.authorInitials,
      authorRoleLine: ARTICLE_REVIEW_EXTRA.authorRoleLine,
      submittedAt: ARTICLE_REVIEW_EXTRA.submittedAt,
      assignedTo: meta.assignedTo ?? "Leadership review",
      versionLabel: `Version · v${a.version}`,
      wordsLabel: ARTICLE_REVIEW_EXTRA.wordsLabel,
      preview: {
        eyebrow: `${a.category} · ${worldLabel(a.world)}`,
        title: a.title,
        sub: a.excerpt,
        blocks: a.body,
      },
      preflight: articlePreflight(a),
      diffTitle: ARTICLE_REVIEW_EXTRA.diffTitle,
      diff: ARTICLE_REVIEW_EXTRA.diff,
      diffNotes: ARTICLE_REVIEW_EXTRA.diffNotes,
      versionsHref: `/admin/version-history?content=${a.id}`,
      comments: reviewComments(id),
    };
  }

  if (item.kind === "story") {
    const s = getStory(id);
    if (!s) return null;
    const meta = mockGet(META, () => SEED_META, id) ?? defaultMeta(id, "story", "Editorial team", []);
    return {
      item,
      codeLabel: `Story · ${s.type}`,
      submittedLabel: `Submitted by ${meta.submittedBy} · ${meta.waitingLabel} ago`,
      authorName: meta.submittedBy,
      authorInitials: meta.submittedBy.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      authorRoleLine: `Content Editor · ${worldLabel(s.world)}`,
      submittedAt: `Submitted · ${s.updatedAgo}`,
      assignedTo: meta.assignedTo ?? "Leadership review",
      versionLabel: "Version · v1",
      wordsLabel: "Media · 12 images",
      preview: { eyebrow: `${s.type} story · ${worldLabel(s.world)}`, title: s.title, sub: s.excerpt || "Awaiting excerpt.", blocks: STORY_PREVIEW },
      preflight: storyPreflight(s),
      diffTitle: "Changes since previous version",
      diff: [seg("First submission — no previous version to compare.")],
      diffNotes: [],
      versionsHref: `/admin/version-history?content=${s.id}`,
      comments: reviewComments(id),
    };
  }

  return null; // metric/programme review happens in their own editors
}

// — version history —

const p = (segs: DiffSeg[]): VersionBodyBlock => ({ tag: "p", segs });
const plain = (text: string): VersionBodyBlock[] => [p([seg(text)])];

const SEED_VERSIONS: ContentVersion[] = [
  {
    id: "ver-art-1-4",
    contentId: "art-1",
    version: 4,
    statusLabel: "Published",
    note: "Current version",
    author: "Maria Ndongo",
    at: "Sep 21 · 09:14",
    isCurrent: true,
    diffStat: "42 words added, 18 removed",
    body: [
      { tag: "h4", segs: [seg("Building productive capability: "), seg("why Cameroon needs a vocational renaissance", "ins")] },
      { tag: "em", segs: [seg("A field-note from Nayokan on how vocational training becomes the backbone of a productive economy — and what happens when we treat it as strategic infrastructure.")] },
      p([
        seg("Cameroon does not lack ambition. "),
        seg("Across the country, there are people who make things — engines are repaired, small workshops run enterprises, agricultural value is coaxed out of raw output.", "del"),
        seg("Across cities and villages, young people build things — repair engines, run enterprises out of small workshops, coax value out of raw agricultural output.", "ins"),
        seg(" What Cameroon lacks, structurally, is a formal recognition of that capability. Vocational training is where recognition begins."),
      ]),
      { tag: "q", segs: [seg("We are not training people to leave Cameroon. We are training people to build it.", "ins")] },
      p([
        seg("The Nayokan Vocational Training Institute exists to make one thing explicit: skill is infrastructure. When a welder can prove their skill against a national standard, when an agri-processor can join a productive cluster with peer accountability, when a small enterprise can hire against a recognisable qualification — that country becomes measurably more productive."),
      ]),
    ],
    provenance: { ...DEMO },
  },
  {
    id: "ver-art-1-3",
    contentId: "art-1",
    version: 3,
    statusLabel: "Approved",
    note: "SEO title added, minor rewrite",
    author: "David Ekwe",
    at: "Sep 20 · 11:22",
    isCurrent: false,
    diffStat: "18 words added, 6 removed",
    body: plain("v3 body — approved draft with the earlier opening paragraph and no pull-quote. Restored verbatim if this version is restored."),
    provenance: { ...DEMO },
  },
  {
    id: "ver-art-1-2",
    contentId: "art-1",
    version: 2,
    statusLabel: "Changes requested",
    note: "Structural revision to opening",
    author: "Sarah Ndenge",
    at: "Sep 19 · 15:08",
    isCurrent: false,
    diffStat: "96 words added, 40 removed",
    body: plain("v2 body — the structural revision of the opening that review sent back for changes."),
    provenance: { ...DEMO },
  },
  {
    id: "ver-art-1-1",
    contentId: "art-1",
    version: 1,
    statusLabel: "Draft",
    note: "Initial draft",
    author: "Maria Ndongo",
    at: "Sep 18 · 09:02",
    isCurrent: false,
    diffStat: "Initial draft",
    body: plain("v1 body — the initial draft as first submitted."),
    provenance: { ...DEMO },
  },
];

const STORY_VERSION: ContentVersion = {
  id: "ver-st-1-1",
  contentId: "st-1",
  version: 1,
  statusLabel: "In review",
  note: "First submission",
  author: "Aïssa Tchoumi",
  at: "Sep 22 · 08:31",
  isCurrent: true,
  diffStat: "First submission",
  body: plain("First submission of the Cohort 4 photo essay — no earlier version to compare."),
  provenance: { ...DEMO },
};

export function listVersions(contentId: string): ContentVersion[] {
  const rows = mockList(VERSIONS, () => [...SEED_VERSIONS, STORY_VERSION]);
  return rows.filter((v) => v.contentId === contentId).sort((a, b) => b.version - a.version);
}

/** Content ids that have a version trail — for the history picker. */
export function versionedContent(): { id: string; title: string }[] {
  const out: { id: string; title: string }[] = [];
  for (const v of mockList(VERSIONS, () => [...SEED_VERSIONS, STORY_VERSION])) {
    if (!out.some((o) => o.id === v.contentId)) {
      const title = v.contentId === "art-1" ? (getArticle("art-1")?.title ?? v.contentId) : v.contentId === "st-1" ? (getStory("st-1")?.title ?? v.contentId) : v.contentId;
      out.push({ id: v.contentId, title });
    }
  }
  return out;
}

export function getVersion(contentId: string, version: number): ContentVersion | null {
  return listVersions(contentId).find((v) => v.version === version) ?? null;
}

/**
 * Restore an earlier version: a NEW current version is appended (nothing is
 * rewritten — history is append-only) and the owning article drops back to
 * draft with a restore note. Returns the new version.
 */
export function restoreVersion(contentId: string, version: number, actor: string): ContentVersion | null {
  const source = getVersion(contentId, version);
  if (!source) return null;
  const versions = listVersions(contentId);
  const next = versions.reduce((m, v) => Math.max(m, v.version), 0) + 1;
  for (const v of versions) mockUpdate(VERSIONS, () => SEED_VERSIONS, v.id, { isCurrent: false });
  const restored = mockInsert(VERSIONS, () => SEED_VERSIONS, {
    id: mockId("ver"),
    contentId,
    version: next,
    statusLabel: "Draft",
    note: `Restored from v${version}`,
    author: actor,
    at: "Now",
    isCurrent: true,
    diffStat: `Restored from v${version}`,
    body: source.body.map((b) => ({ tag: b.tag, segs: b.segs.map((s) => ({ kind: "same" as const, text: s.text })) })),
    provenance: { ...DEMO },
  });
  const article = getArticle(contentId);
  if (article) saveArticle(article.id, { status: "draft", statusNote: `Restored from v${version}` });
  return restored;
}

// — review comments —

export function reviewComments(contentId: string): ReviewComment[] {
  return mockList(COMMENTS, () => [] as ReviewComment[]).filter((c) => c.contentId === contentId);
}

export function addReviewComment(contentId: string, author: string, body: string): ReviewComment {
  return mockInsert(COMMENTS, () => [] as ReviewComment[], { id: mockId("rc"), contentId, author, body, ago: "now" });
}

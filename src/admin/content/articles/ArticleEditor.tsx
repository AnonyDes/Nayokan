"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/admin/ui/Button";
import { Notice } from "@/admin/ui/Notice";
import { Pill, type PillTone } from "@/admin/ui/Pill";
import { Field, Input, Textarea } from "@/admin/ui/Field";
import { Select, Progress } from "@/admin/ui/Data";
import { Tag } from "@/admin/ui/Feedback";
import { ARTICLE_CATEGORIES, type AdminArticle } from "./types";
import type { RichBlock, World } from "@/platform/content/types";
import { saveArticle, submitArticleForReview } from "./actions";
import "./article-editor.css";

const STATUS_TONE: Record<string, PillTone> = {
  draft: "draft",
  in_review: "review",
  changes_requested: "rejected",
  approved: "approved",
  scheduled: "scheduled",
  published: "published",
  archived: "archived",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  in_review: "In review",
  changes_requested: "Changes requested",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

const WORKFLOW_STEPS = ["Draft", "Submitted", "In review", "Approved", "Scheduled", "Published"] as const;

function stepIndex(status: string): number {
  switch (status) {
    case "draft":
      return 1;
    case "in_review":
    case "changes_requested":
      return 3;
    case "approved":
      return 4;
    case "scheduled":
      return 5;
    case "published":
      return 6;
    default:
      return 1;
  }
}

const WORLD_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All worlds" },
  { value: "vti", label: "01 · Vocational Training Institute" },
  { value: "startup", label: "02 · Startup Centre" },
  { value: "venture_capital", label: "03 · Venture Capital" },
  { value: "hospitality", label: "04 · Hospitality" },
];

const AUTHORS = [
  { name: "John Bekolo", initials: "JB", role: "Programme Manager" },
  { name: "Maria Ndongo", initials: "MN", role: "Super Admin" },
  { name: "Sarah Ndenge", initials: "SN", role: "Communications" },
  { name: "David Ekwe", initials: "DE", role: "Reviewer" },
  { name: "Aïssa Tchoumi", initials: "AT", role: "Content Editor" },
];

type BlockType = RichBlock["type"];

const INSERTABLE: { type: BlockType; label: string }[] = [
  { type: "heading", label: "Heading" },
  { type: "paragraph", label: "Paragraph" },
  { type: "image", label: "Image" },
  { type: "quote", label: "Quote" },
  { type: "callout", label: "Callout" },
  { type: "list", label: "List" },
  { type: "cta", label: "CTA" },
];
// Design offers Video/Gallery/Related too — not in the RichBlock contract;
// rendered disabled until the contract extends (content-contract.md).
const PENDING_BLOCKS = ["Video", "Gallery", "Related"];

function newBlock(type: BlockType): RichBlock {
  switch (type) {
    case "paragraph":
      return { type: "paragraph", text: "" };
    case "heading":
      return { type: "heading", level: 2, text: "" };
    case "quote":
      return { type: "quote", text: "", attribution: "" };
    case "image":
      return { type: "image", media: { id: "", src: "", alt: "", caption: "" } };
    case "callout":
      return { type: "callout", text: "" };
    case "list":
      return { type: "list", ordered: false, items: [""] };
    case "cta":
      return { type: "cta", cta: { label: "", href: "" } };
  }
}

function blockLabel(b: RichBlock): string {
  switch (b.type) {
    case "paragraph":
      return "Paragraph";
    case "heading":
      return `Heading · H${b.level}`;
    case "quote":
      return "Quote";
    case "image":
      return "Image · Media block";
    case "callout":
      return "Callout · Contextual note";
    case "list":
      return "List";
    case "cta":
      return "Call to action";
  }
}

const wordCount = (blocks: RichBlock[], extra: string[]) =>
  [...blocks.map((b) => ("text" in b ? b.text : b.type === "list" ? b.items.join(" ") : "")), ...extra]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

export function ArticleEditor({ article, host, previewPath, previewSigned }: { article: AdminArticle; host: string; previewPath: string; previewSigned?: boolean }) {
  const [title, setTitle] = useState(article.title);
  const [slug, setSlug] = useState(article.slug);
  const [slugEditing, setSlugEditing] = useState(false);
  const [excerpt, setExcerpt] = useState(article.excerpt);
  const [world, setWorld] = useState<string>(article.world ?? "");
  const [category, setCategory] = useState(article.category);
  const [authorName, setAuthorName] = useState(article.authorName);
  const [tags, setTags] = useState<string[]>(article.tags);
  const [newTag, setNewTag] = useState("");
  const [seoTitle, setSeoTitle] = useState(article.seoTitle);
  const [seoDesc, setSeoDesc] = useState(article.seoDesc);
  const [blocks, setBlocks] = useState<RichBlock[]>(article.body);
  const [status, setStatus] = useState(article.status);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const words = useMemo(() => wordCount(blocks, [title, excerpt]), [blocks, title, excerpt]);
  const reading = Math.max(1, Math.round(words / 200));

  const issues: string[] = [];
  if (!seoDesc.trim()) issues.push("SEO description missing");
  if (!article.coverImage) issues.push("Cover image missing");

  const patchBlock = (i: number, next: RichBlock) => setBlocks((prev) => prev.map((b, j) => (j === i ? next : b)));
  const moveBlock = (i: number, dir: -1 | 1) =>
    setBlocks((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  const removeBlock = (i: number) => setBlocks((prev) => prev.filter((_, j) => j !== i));

  const save = () =>
    startTransition(async () => {
      const res = await saveArticle({
        id: article.id,
        title,
        slug,
        excerpt,
        world: (world || null) as World | null,
        category,
        tags,
        seoTitle,
        seoDesc,
        body: blocks,
      });
      setMessage(res.ok ? { tone: "success", text: "Draft saved (mock store)." } : { tone: "danger", text: res.error });
    });

  const submit = () =>
    startTransition(async () => {
      // Persist the latest edits first so the reviewer sees this revision.
      const saved = await saveArticle({
        id: article.id,
        title,
        slug,
        excerpt,
        world: (world || null) as World | null,
        category,
        tags,
        seoTitle,
        seoDesc,
        body: blocks,
      });
      if (!saved.ok) {
        setMessage({ tone: "danger", text: saved.error });
        return;
      }
      const res = await submitArticleForReview({ id: article.id });
      if (res.ok) {
        setStatus("in_review");
        setMessage({ tone: "success", text: "Submitted for review." });
      } else {
        setMessage({ tone: "danger", text: res.error });
      }
    });

  return (
    <div className="ed-shell">
      {/* MAIN DOC */}
      <div className="ed-doc">
        <div className="ed-doc__meta">
          <strong>Article</strong>
          <span className="ed-doc__meta__sep">·</span>
          <Pill tone={STATUS_TONE[status]}>{article.statusNote && status === article.status ? article.statusNote : STATUS_LABEL[status]}</Pill>
          <span className="ed-doc__meta__sep">·</span>
          <span>{article.updatedAgo === "now" ? "Unsaved session" : `Autosaved · ${article.updatedAgo}`}</span>
          <span className="ed-doc__meta__sep">·</span>
          <span>
            v{article.version} ·{" "}
            <a href="/admin/version-history" style={{ color: "var(--info-ink)", textDecoration: "underline" }}>
              Version history
            </a>
          </span>
          <span style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
            <span>
              Words <strong style={{ color: "var(--ink)", fontFamily: "var(--f-sans)", fontSize: 12 }}>{words.toLocaleString()}</strong>
            </span>
            <span>
              Reading <strong style={{ color: "var(--ink)", fontFamily: "var(--f-sans)", fontSize: 12 }}>{reading} min</strong>
            </span>
            <span>
              Language <strong style={{ color: "var(--ink)", fontFamily: "var(--f-sans)", fontSize: 12 }}>EN</strong>
            </span>
          </span>
        </div>

        <div className="ed-doc__canvas">
          <div className="ed-cover">
            <div>{article.coverImage ? `COVER · ${article.coverImage}` : "COVER IMAGE · 16 / 8 · Drop or select"}</div>
            {/* MediaPicker wires in with the media slice — pending. */}
            <button className="ed-cover__btn" disabled title="Media picker lands with the media slice" style={{ opacity: 0.6 }}>
              Choose from media library
            </button>
          </div>

          <input className="ed-title" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Article title" />

          <div className="ed-slug">
            {host}
            <em>/insights/{slug}</em>
            {slugEditing ? (
              <input
                className="ax-input ax-input--mono"
                style={{ display: "inline-block", width: 240, marginLeft: 8, height: 26 }}
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                onBlur={() => setSlugEditing(false)}
                onKeyDown={(e) => e.key === "Enter" && setSlugEditing(false)}
                autoFocus
                aria-label="Slug"
              />
            ) : (
              <button onClick={() => setSlugEditing(true)}>Edit slug</button>
            )}
          </div>

          <textarea className="ed-excerpt" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Excerpt — one or two sentences shown in listings." aria-label="Excerpt" />

          {blocks.map((b, i) => (
            <div className="ed-block" key={i}>
              <div className="ed-block__rail">
                <button className="ed-block__rail-btn" aria-label="Move block up" disabled={i === 0} onClick={() => moveBlock(i, -1)}>
                  <svg viewBox="0 0 24 24">
                    <path d="m6 15 6-6 6 6" />
                  </svg>
                </button>
                <button className="ed-block__rail-btn" aria-label="Move block down" disabled={i === blocks.length - 1} onClick={() => moveBlock(i, 1)}>
                  <svg viewBox="0 0 24 24">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <button className="ed-block__rail-btn" aria-label="Delete block" onClick={() => removeBlock(i)}>
                  <svg viewBox="0 0 24 24">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
              <div className="ed-block__type">{blockLabel(b)}</div>
              <BlockBody block={b} onChange={(next) => patchBlock(i, next)} />
            </div>
          ))}

          <div className="ed-insert" role="group" aria-label="Add a new block">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Add a new block</span>
            <div className="ed-insert__opts">
              {INSERTABLE.map((o) => (
                <button key={o.type} className="ed-insert__opt" onClick={() => setBlocks((prev) => [...prev, newBlock(o.type)])}>
                  {o.label}
                </button>
              ))}
              {PENDING_BLOCKS.map((label) => (
                <button key={label} className="ed-insert__opt" disabled title="Not in the RichBlock contract — pending an extension (content-contract.md)">
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="ed-footer-actions">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {issues.map((i) => (
              <Pill key={i} tone="needs">
                {i}
              </Pill>
            ))}
            <span className="ax-mono ax-mute-2">{issues.length} issue{issues.length === 1 ? "" : "s"} before publish</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Button variant="soft" onClick={save} disabled={pending}>
              Save draft
            </Button>
            <Button
              variant="ghost"
              disabled={pending}
              onClick={() => {
                setTitle(article.title);
                setSlug(article.slug);
                setExcerpt(article.excerpt);
                setBlocks(article.body);
                setSeoTitle(article.seoTitle);
                setSeoDesc(article.seoDesc);
                setTags(article.tags);
                setMessage(null);
              }}
            >
              Discard changes
            </Button>
            <Button variant="primary" onClick={submit} disabled={pending || status === "in_review"}>
              {status === "in_review" ? "In review" : "Submit for review"}
            </Button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="ed-side">
        {message && <Notice tone={message.tone}>{message.text}</Notice>}

        <div className="ed-side__status">
          <div className="ed-side__status-row">
            <span className="ed-side__status-lb">Status</span>
            <Pill tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Pill>
          </div>
          <div className="ed-side__status-row">
            <span className="ed-side__status-lb">Assigned reviewer</span>
            <span className="ed-side__status-val">{article.reviewer ?? "Unassigned"}</span>
          </div>
          <div className="ed-side__status-row">
            <span className="ed-side__status-lb">Submitted</span>
            <span className="ed-side__status-val">{article.submittedAgo ?? "—"}</span>
          </div>
          <div className="ed-side__status-row">
            <span className="ed-side__status-lb">Visibility</span>
            <span className="ed-side__status-val">{status === "published" ? "Public" : "Not visible publicly"}</span>
          </div>
          <div className="ed-side__status-actions">
            <Button variant="ghost" size="sm" style={{ borderColor: "rgba(255,255,255,0.3)", color: "white", justifyContent: "center" }} disabled title="Reviewer assignment lands with the workflow RPC (Phase 10)">
              Reassign
            </Button>
            <Button variant="accent" size="sm" style={{ justifyContent: "center" }} disabled title="Recall lands with the workflow RPC (Phase 10)">
              Recall
            </Button>
          </div>
        </div>

        <div className="ed-side__acc">
          <div className="ed-side__acc-head">
            <span>Publishing workflow</span>
            <span className="ed-side__acc-head__num">Step {stepIndex(status)} · 6</span>
          </div>
          <div className="ed-side__acc-body">
            <ol style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "12.5px", margin: 0, padding: 0, listStyle: "none" }}>
              {WORKFLOW_STEPS.map((label, i) => {
                const n = i + 1;
                const current = stepIndex(status);
                const done = n < current;
                const active = n === current;
                return (
                  <li
                    key={label}
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      color: done ? "var(--text-3)" : active ? "var(--ink)" : "var(--text-4)",
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    <span
                      className="ax-avatar"
                      style={{
                        background: done ? "var(--success)" : active ? "var(--warn)" : "var(--ws-3)",
                        color: done || active ? "white" : "var(--text-3)",
                        width: 20,
                        height: 20,
                        fontSize: 10,
                      }}
                    >
                      {done ? "✓" : n}
                    </span>
                    {label}
                    {active && status === "in_review" && article.reviewer ? ` · ${article.reviewer.split(" ")[0]}` : ""}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div className="ed-side__acc">
          <div className="ed-side__acc-head">
            <span>Article metadata</span>
            <span className="ed-side__acc-head__num">B · 04a</span>
          </div>
          <div className="ed-side__acc-body">
            <Field label="Nayokan world" htmlFor="ed-world">
              <Select id="ed-world" value={world} onChange={(e) => setWorld(e.target.value)}>
                {WORLD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Category" htmlFor="ed-category">
              <Select id="ed-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                {ARTICLE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Author" htmlFor="ed-author">
              <Select id="ed-author" value={authorName} onChange={(e) => setAuthorName(e.target.value)}>
                {AUTHORS.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name} · {a.role}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tags">
              <div className="ed-tags">
                {tags.map((t) => (
                  <Tag key={t} onRemove={() => setTags(tags.filter((x) => x !== t))}>
                    {t}
                  </Tag>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add tag" style={{ height: 28, fontSize: 12 }} onKeyDown={(e) => {
                  if (e.key === "Enter" && newTag.trim()) {
                    setTags([...tags, newTag.trim()]);
                    setNewTag("");
                  }
                }} />
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => {
                    if (newTag.trim()) {
                      setTags([...tags, newTag.trim()]);
                      setNewTag("");
                    }
                  }}
                >
                  + Add
                </Button>
              </div>
            </Field>
          </div>
        </div>

        <div className="ed-side__acc">
          <div className="ed-side__acc-head">
            <span>SEO &amp; discovery</span>
            <span className="ed-side__acc-head__num" style={seoDesc.trim() ? undefined : { color: "var(--warn-ink)" }}>
              {seoDesc.trim() ? "Complete" : "Needs work"}
            </span>
          </div>
          <div className="ed-side__acc-body">
            {!seoDesc.trim() && (
              <Notice tone="warn" title="Meta description is missing">
                This article cannot be scheduled for publication until the SEO description is added.
              </Notice>
            )}
            <Field
              label={
                <>
                  Meta title{" "}
                  <span className="ax-mute" style={{ fontFamily: "var(--f-mono)", fontSize: "9.5px", marginLeft: "auto" }}>
                    {seoTitle.length} / 60
                  </span>
                </>
              }
              htmlFor="ed-seo-title"
            >
              <Input id="ed-seo-title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
            </Field>
            <Field
              label={
                <>
                  Meta description <span className="ax-req">Required</span>{" "}
                  <span className="ax-mute" style={{ fontFamily: "var(--f-mono)", fontSize: "9.5px", marginLeft: "auto" }}>
                    {seoDesc.length} / 160
                  </span>
                </>
              }
              htmlFor="ed-seo-desc"
              error={!seoDesc.trim() ? "Meta description is required before publishing." : undefined}
            >
              <Textarea id="ed-seo-desc" error={!seoDesc.trim()} placeholder="One clear paragraph, 140–160 characters." value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} />
            </Field>
            <div className="ed-progress">
              <div className="ed-progress__meta">
                <span>SEO health</span>
                <span className="ed-progress__val" style={seoDesc.trim() ? undefined : { color: "var(--warn-ink)" }}>
                  {seoDesc.trim() ? "Good" : "Needs improvement"}
                </span>
              </div>
              <Progress value={seoDesc.trim() ? (seoTitle.trim() ? 100 : 75) : 45} tone={seoDesc.trim() ? "green" : "warn"} />
            </div>
            <div className="ed-seo-preview">
              <div className="ed-seo-preview__site">
                {host} › insights › {slug}
              </div>
              <div className="ed-seo-preview__title">{seoTitle || title}</div>
              <div className="ed-seo-preview__desc">{seoDesc || "— add a meta description to complete the search preview —"}</div>
            </div>
          </div>
        </div>

        <div className="ed-side__acc">
          <div className="ed-side__acc-head">
            <span>Preview</span>
            <span className="ed-side__acc-head__num">B · 05</span>
          </div>
          <div className="ed-side__acc-body">
            <a href={previewPath} target="_blank" rel="noreferrer" className="ax-btn ax-btn--ghost" style={{ justifyContent: "center" }}>
              Open preview on {host}
            </a>
            <Notice tone="soft">
              {previewSigned ? (
                <>
                  Signed preview — renders the draft on {host} at <span className="ax-mono">/__preview/</span> with a not-live badge.
                </>
              ) : (
                <>
                  Preview renders on the owning site&apos;s host. It is <strong>not live</strong> — the signed-preview route
                  itself lands with Session A&apos;s site work.
                </>
              )}
            </Notice>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlockBody({ block, onChange }: { block: RichBlock; onChange: (b: RichBlock) => void }) {
  switch (block.type) {
    case "paragraph":
      return <textarea className="ed-p" rows={3} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} aria-label="Paragraph text" />;
    case "heading":
      return <input className="ed-h" value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} aria-label="Heading text" />;
    case "quote":
      return (
        <blockquote className="ed-quote">
          <textarea rows={2} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} aria-label="Quote text" />
          <span className="ed-quote__cite">
            — <input value={block.attribution ?? ""} onChange={(e) => onChange({ ...block, attribution: e.target.value })} placeholder="Attribution" aria-label="Quote attribution" />
          </span>
        </blockquote>
      );
    case "image":
      return (
        <>
          <div className="ed-inline-img">{block.media.alt || "IMAGE BLOCK · select from media library"}</div>
          <div className="ed-inline-cap">
            <input
              value={block.media.caption ?? ""}
              onChange={(e) => onChange({ ...block, media: { ...block.media, caption: e.target.value } })}
              placeholder="Caption · describe what the image shows"
              aria-label="Image caption"
            />
            <input
              value={block.media.alt}
              onChange={(e) => onChange({ ...block, media: { ...block.media, alt: e.target.value } })}
              placeholder="Alt text — required"
              aria-label="Alt text (required)"
              style={{ marginTop: 4 }}
            />
          </div>
        </>
      );
    case "callout":
      return (
        <div className="ed-callout">
          <textarea rows={2} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} aria-label="Callout text" />
        </div>
      );
    case "list":
      return (
        <div className="ed-list-items">
          {block.items.map((item, i) => (
            <input
              key={i}
              value={item}
              onChange={(e) => onChange({ ...block, items: block.items.map((x, j) => (j === i ? e.target.value : x)) })}
              placeholder={`Item ${i + 1}`}
              aria-label={`List item ${i + 1}`}
            />
          ))}
          <Button variant="ghost" size="sm" onClick={() => onChange({ ...block, items: [...block.items, ""] })}>
            + Item
          </Button>
        </div>
      );
    case "cta":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Input value={block.cta.label} onChange={(e) => onChange({ ...block, cta: { ...block.cta, label: e.target.value } })} placeholder="Button label" aria-label="CTA label" />
          <Input className="ax-input--mono" value={block.cta.href} onChange={(e) => onChange({ ...block, cta: { ...block.cta, href: e.target.value } })} placeholder="/path or https://…" aria-label="CTA destination" />
        </div>
      );
  }
}

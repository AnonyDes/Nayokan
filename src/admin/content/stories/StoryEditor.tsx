"use client";

import { useState, useTransition } from "react";
import { Button } from "@/admin/ui/Button";
import { Notice } from "@/admin/ui/Notice";
import { Pill, type PillTone } from "@/admin/ui/Pill";
import { Field, Input } from "@/admin/ui/Field";
import { Select } from "@/admin/ui/Data";
import { Toggle } from "@/admin/ui/Toggle";
import { STORY_TYPES, type AdminStory } from "@/admin/content/articles/types";
import { saveStory, submitStoryForReview } from "@/admin/content/articles/actions";
import "@/admin/content/articles/article-editor.css";

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

const TYPE_LABEL: Record<AdminStory["type"], string> = {
  beneficiary: "Beneficiary",
  enterprise: "Enterprise",
  cohort: "Cohort",
};

const WORLD_OPTIONS = [
  { value: "", label: "All worlds" },
  { value: "vti", label: "01 · Vocational Training Institute" },
  { value: "startup", label: "02 · Startup Centre" },
  { value: "venture_capital", label: "03 · Venture Capital" },
  { value: "hospitality", label: "04 · Hospitality" },
];

/**
 * Story editor — shares the article editor's chrome (article-editor.css) but
 * is metadata-first: a story is a governed, consented piece of evidence-backed
 * content, not a free-form article. Consent + evidence are the hard gates
 * (stories.html); the publish transition enforces them server-side in Phase 10.
 */
export function StoryEditor({ story, host, previewPath, previewSigned }: { story: AdminStory; host: string; previewPath: string; previewSigned?: boolean }) {
  const [title, setTitle] = useState(story.title);
  const [slug, setSlug] = useState(story.slug);
  const [slugEditing, setSlugEditing] = useState(false);
  const [excerpt, setExcerpt] = useState(story.excerpt);
  const [type, setType] = useState<AdminStory["type"]>(story.type);
  const [programme, setProgramme] = useState(story.programme ?? "");
  const [world, setWorld] = useState<string>(story.world ?? "");
  const [consent, setConsent] = useState(story.consentRecorded);
  const [evidence, setEvidence] = useState(story.evidenceAttached);
  const [status, setStatus] = useState(story.status);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const issues: string[] = [];
  if (!consent) issues.push("Consent not recorded");
  if (!evidence) issues.push("No evidence attached");

  const payload = () => ({ id: story.id, title, slug, excerpt, type, programme: programme || undefined, world: (world || null) as AdminStory["world"], consentRecorded: consent, evidenceAttached: evidence });

  const save = () =>
    startTransition(async () => {
      const res = await saveStory(payload());
      setMessage(res.ok ? { tone: "success", text: "Draft saved (mock store)." } : { tone: "danger", text: res.error });
    });

  const submit = () =>
    startTransition(async () => {
      const saved = await saveStory(payload());
      if (!saved.ok) {
        setMessage({ tone: "danger", text: saved.error });
        return;
      }
      const res = await submitStoryForReview({ id: story.id });
      if (res.ok) {
        setStatus("in_review");
        setMessage({ tone: "success", text: "Submitted for review." });
      } else {
        setMessage({ tone: "danger", text: res.error });
      }
    });

  return (
    <div className="ed-shell">
      <div className="ed-doc">
        <div className="ed-doc__meta">
          <strong>Story</strong>
          <span className="ed-doc__meta__sep">·</span>
          <Pill tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Pill>
          <span className="ed-doc__meta__sep">·</span>
          <span>{TYPE_LABEL[type]} story</span>
          {story.programme && (
            <>
              <span className="ed-doc__meta__sep">·</span>
              <span>{story.programme}</span>
            </>
          )}
        </div>

        <div className="ed-doc__canvas">
          <div className="ed-cover">
            <div>{story.coverImage ? `COVER · ${story.coverImage}` : "COVER IMAGE · 16 / 8 · Drop or select"}</div>
            <button className="ed-cover__btn" disabled title="Media picker lands with the media slice" style={{ opacity: 0.6 }}>
              Choose from media library
            </button>
          </div>

          <input className="ed-title" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Story title" />

          <div className="ed-slug">
            {host}
            <em>/stories/{slug}</em>
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

          <textarea className="ed-excerpt" rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Story summary — shown in listings and review." aria-label="Excerpt" />

          <div className="ed-block">
            <div className="ed-block__type">Story body</div>
            <textarea
              className="ed-p"
              rows={10}
              placeholder="Write the story here. Rich blocks land with the shared block editor; until then this is plain prose."
              aria-label="Story body"
            />
          </div>
        </div>

        <div className="ed-footer-actions">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {issues.map((i) => (
              <Pill key={i} tone="needs">
                {i}
              </Pill>
            ))}
            <span className="ax-mono ax-mute-2">
              {issues.length === 0 ? "Governance complete" : `${issues.length} governance issue${issues.length === 1 ? "" : "s"} before publish`}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Button variant="soft" onClick={save} disabled={pending}>
              Save draft
            </Button>
            <Button variant="primary" onClick={submit} disabled={pending || status === "in_review"}>
              {status === "in_review" ? "In review" : "Submit for review"}
            </Button>
          </div>
        </div>
      </div>

      <div className="ed-side">
        {message && <Notice tone={message.tone}>{message.text}</Notice>}

        <div className="ed-side__status">
          <div className="ed-side__status-row">
            <span className="ed-side__status-lb">Status</span>
            <Pill tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Pill>
          </div>
          <div className="ed-side__status-row">
            <span className="ed-side__status-lb">Visibility</span>
            <span className="ed-side__status-val">{status === "published" ? "Public" : "Not visible publicly"}</span>
          </div>
          <div className="ed-side__status-row">
            <span className="ed-side__status-lb">Consent</span>
            <span className="ed-side__status-val" style={{ color: consent ? "var(--paper)" : "var(--warn)" }}>
              {consent ? "Recorded" : "Not recorded"}
            </span>
          </div>
          <div className="ed-side__status-row">
            <span className="ed-side__status-lb">Evidence</span>
            <span className="ed-side__status-val" style={{ color: evidence ? "var(--paper)" : "var(--warn)" }}>
              {evidence ? "Attached" : "None attached"}
            </span>
          </div>
        </div>

        <div className="ed-side__acc">
          <div className="ed-side__acc-head">
            <span>Story metadata</span>
            <span className="ed-side__acc-head__num">B · 04b</span>
          </div>
          <div className="ed-side__acc-body">
            <Field label="Story type" htmlFor="st-type">
              <Select id="st-type" value={type} onChange={(e) => setType(e.target.value as AdminStory["type"])}>
                {STORY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABEL[t]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Nayokan world" htmlFor="st-world">
              <Select id="st-world" value={world} onChange={(e) => setWorld(e.target.value)}>
                {WORLD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Programme / cluster" htmlFor="st-programme" hint="The programme or cluster this story evidences.">
              <Input id="st-programme" value={programme} onChange={(e) => setProgramme(e.target.value)} placeholder="e.g. VTI · Cluster" />
            </Field>
          </div>
        </div>

        <div className="ed-side__acc">
          <div className="ed-side__acc-head">
            <span>Governance</span>
            <span className="ed-side__acc-head__num" style={consent && evidence ? undefined : { color: "var(--warn-ink)" }}>
              {consent && evidence ? "Complete" : "Required"}
            </span>
          </div>
          <div className="ed-side__acc-body">
            <Notice tone="soft">
              Stories about real people are <strong>consent-gated</strong>: the publish transition rejects a story whose
              subject consent isn&apos;t recorded (enforced server-side by the workflow RPC — Phase 10).
            </Notice>
            <Toggle checked={consent} onChange={setConsent} label="Subject consent recorded" hint="Required before publication" />
            <Toggle checked={evidence} onChange={setEvidence} label="Evidence attached" hint="Link to the evidence library lands with Phase 9" />
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

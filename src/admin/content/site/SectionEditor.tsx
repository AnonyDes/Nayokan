"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/admin/ui/Button";
import { Notice } from "@/admin/ui/Notice";
import { Input, Textarea } from "@/admin/ui/Field";
import { FormRow, ImgSlot } from "@/admin/ui/Data";
import { Toggle } from "@/admin/ui/Toggle";
import { Pill } from "@/admin/ui/Pill";
import type { SiteId } from "@/platform/content/types";
import type { AdminPageSection } from "./types";
import { saveSectionFields, setSectionLive } from "./actions";

/**
 * The sectioned editor pattern shared by homepage-editor.html and
 * page-editor.html: a sticky left rail of fixed sections (toggle affordances)
 * and a canvas that edits the selected section's copy fields. Layout is
 * fixed by design — only the whitelisted fields below render.
 */
export function SectionedEditor({ site, pageId, sections, basePath, showPreview }: {
  site: SiteId;
  pageId: string | "home";
  sections: AdminPageSection[];
  /** Route that ?section= writes to (e.g. /admin/sites/vti/homepage). */
  basePath: string;
  showPreview?: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [items, setItems] = useState(sections);
  const activeKey = params.get("section") ?? sections[0]?.key;
  const active = items.find((s) => s.key === activeKey) ?? items[0];
  const liveCount = items.filter((s) => s.isLive).length;
  const [, startTransition] = useTransition();

  const toggleSection = (key: string, isLive: boolean) => {
    setItems((prev) => prev.map((s) => (s.key === key ? { ...s, isLive } : s)));
    startTransition(async () => {
      const res = await setSectionLive({ site, pageId, sectionKey: key, isLive });
      if (!res.ok) setItems((prev) => prev.map((s) => (s.key === key ? { ...s, isLive: !isLive } : s)));
    });
  };

  return (
    <div className="he-grid">
      <div className="he-sections">
        <div className="he-sections__head">
          <div className="he-sections__title">Sections</div>
          <div className="ax-mono ax-mute">
            {liveCount} of {items.length}
          </div>
        </div>
        <div className="he-sections__list">
          {items.map((s, i) => (
            <div
              key={s.key}
              className={`he-sec${s.key === active?.key ? " is-active" : ""}`}
              style={s.isLive ? undefined : { opacity: 0.55 }}
              onClick={() => router.replace(`${basePath}?section=${s.key}`, { scroll: false })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") router.replace(`${basePath}?section=${s.key}`, { scroll: false });
              }}
            >
              <div className="he-sec__drag" aria-hidden="true">
                ::
              </div>
              <div className="he-sec__num">{String(i + 1).padStart(2, "0")}</div>
              <div>
                <div className="he-sec__title">{s.title}</div>
                {s.sub && <div className="he-sec__sub">{s.sub}</div>}
              </div>
              <button
                type="button"
                className={`he-sec__toggle${s.isLive ? " is-on" : ""}`}
                aria-label={`${s.isLive ? "Disable" : "Enable"} ${s.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection(s.key, !s.isLive);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {active && (
        <SectionCanvas
          key={`${active.key}:${JSON.stringify(active.fields)}`}
          site={site}
          pageId={pageId}
          index={items.indexOf(active)}
          section={active}
          showPreview={showPreview}
          onLiveChange={toggleSection}
        />
      )}
    </div>
  );
}

// Field metadata per homepage-editor.html's hero form. Sections can carry
// other keys (curated picks etc.) — unknown keys render as plain inputs.
const FIELD_META: Record<string, { label: string; hint?: string; multiline?: boolean }> = {
  eyebrow: { label: "Eyebrow", hint: "The small mono label above the headline." },
  headline: { label: "Headline", hint: "Use <em> tags for the accented italic word.", multiline: true },
  supportingCopy: { label: "Supporting copy", hint: "1–3 sentences.", multiline: true },
  primaryCtaLabel: { label: "Primary CTA · Label", hint: "The dark button in the hero." },
  primaryCtaHref: { label: "Primary CTA · Destination" },
  secondaryCtaLabel: { label: "Secondary CTA · Label", hint: "Ghost button next to primary." },
  secondaryCtaHref: { label: "Secondary CTA · Destination" },
  heroImage: { label: "Hero visual", hint: "Selected from the media library. 16:9 recommended." },
};

const FIELD_ORDER = Object.keys(FIELD_META);

/** Render the headline's <em> accent safely — strip every tag except <em>,
 *  then rebuild as React nodes (never dangerouslySetInnerHTML). */
function HeadlineText({ text }: { text: string }) {
  const cleaned = text.replace(/<(?!\/?em>)[^>]*>/g, "").replace(/&nbsp;/g, " ");
  const parts = cleaned.split(/<\/?em>/g);
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <em key={i}>{p}</em> : <span key={i}>{p}</span>))}
    </>
  );
}

function SectionCanvas({ site, pageId, index, section, showPreview, onLiveChange }: {
  site: SiteId;
  pageId: string | "home";
  index: number;
  section: AdminPageSection;
  showPreview?: boolean;
  onLiveChange: (key: string, isLive: boolean) => void;
}) {
  const [fields, setFields] = useState(section.fields);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const orderedKeys = [...Object.keys(fields)].sort((a, b) => {
    const ai = FIELD_ORDER.indexOf(a);
    const bi = FIELD_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const save = () =>
    startTransition(async () => {
      const res = await saveSectionFields({ site, pageId, sectionKey: section.key, fields });
      setMessage(res.ok ? { tone: "success", text: "Section saved (mock store — persists until the dev server restarts)." } : { tone: "danger", text: res.error });
    });

  return (
    <div className="he-canvas">
      <div className="he-canvas__head">
        <div>
          <div className="he-canvas__title">
            Section {String(index + 1).padStart(2, "0")} · {section.title}
          </div>
          <div className="he-canvas__sub">{section.sub ?? "Fixed layout · edit copy only"}</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Pill tone={section.isLive ? "published" : "draft"}>{section.isLive ? "Live" : "Hidden"}</Pill>
          <Button variant="soft" size="sm" onClick={() => setFields(section.fields)} disabled={pending}>
            Revert
          </Button>
          <Button variant="primary" size="sm" onClick={save} disabled={pending}>
            Save section
          </Button>
        </div>
      </div>
      <div className="he-canvas__body">
        {showPreview && section.key === "hero" && (
          <div className="he-preview">
            <div className="he-preview__badge">Preview · not live</div>
            <div className="he-preview__eyebrow">{fields.eyebrow || "Eyebrow"}</div>
            <h2 className="he-preview__title">
              <HeadlineText text={fields.headline || "Headline"} />
            </h2>
            <div className="he-preview__lede">{fields.supportingCopy}</div>
          </div>
        )}

        {message && (
          <div style={{ marginBottom: 14 }}>
            <Notice tone={message.tone}>{message.text}</Notice>
          </div>
        )}

        {orderedKeys.length === 0 ? (
          <Notice tone="info" title="Curated section">
            This section pulls from managed content (programmes, metrics, stories, partners). Its layout is fixed; select
            the sources it renders once the pickers land with the media/ecosystem slices.
          </Notice>
        ) : (
          <div className="ax-form">
            {orderedKeys.map((key) => {
              const meta = FIELD_META[key] ?? { label: key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()) };
              if (key === "heroImage") {
                return (
                  <FormRow key={key} title={meta.label} hint={meta.hint}>
                    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, alignItems: "center" }}>
                      <ImgSlot variant="wide" label={fields[key] ? `HERO · ${fields[key]}` : "HERO · none selected"} />
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{fields[key] || "No image selected"}</div>
                        <div className="ax-mono ax-mute" style={{ fontSize: "10.5px" }}>
                          {fields[key] ? "Alt text set" : "Pick from the media library"}
                        </div>
                        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                          {/* MediaPicker wires in with the media slice — pending. */}
                          <Button variant="soft" size="sm" disabled title="Media picker lands with the media slice">
                            Replace
                          </Button>
                          <Button variant="ghost" size="sm" disabled={!fields[key]} onClick={() => setFields({ ...fields, [key]: "" })}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </FormRow>
                );
              }
              return (
                <FormRow key={key} title={meta.label} hint={meta.hint}>
                  {meta.multiline ? (
                    <Textarea rows={3} value={fields[key]} onChange={(e) => setFields({ ...fields, [key]: e.target.value })} />
                  ) : (
                    <Input value={fields[key]} onChange={(e) => setFields({ ...fields, [key]: e.target.value })} />
                  )}
                </FormRow>
              );
            })}
            <FormRow title="Public visibility" hint="Whether this section renders on the live website.">
              <Toggle checked={section.isLive} onChange={(next) => onLiveChange(section.key, next)} label={section.isLive ? "Section is live" : "Section is hidden"} />
            </FormRow>
          </div>
        )}
      </div>
    </div>
  );
}

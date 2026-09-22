"use client";

import { useState, useTransition } from "react";
import { Button } from "@/admin/ui/Button";
import { Notice } from "@/admin/ui/Notice";
import { Panel, PanelBody } from "@/admin/ui/Panel";
import { Field, Input, Textarea } from "@/admin/ui/Field";
import { Select, FormRow } from "@/admin/ui/Data";
import { Toggle } from "@/admin/ui/Toggle";
import { CERTIFICATIONS, DELIVERY_MODELS, PROGRAMME_TYPES, type AdminProgramme } from "./types";
import { saveProgramme } from "./actions";
import type { World } from "@/platform/sites/types";
import "./programme-editor.css";

const WORLD_OPTIONS = [
  { value: "", label: "Select world" },
  { value: "vti", label: "01 · Vocational Training Institute" },
  { value: "startup", label: "02 · Startup Centre" },
  { value: "venture_capital", label: "03 · Venture Capital" },
  { value: "hospitality", label: "04 · Hospitality" },
];

// programme-editor.html: Overview is the implemented tab; the rest land with
// their own workflows (Application → Phase 8, Media → media slice, SEO /
// Publishing → Phase 10). Disabled rather than hidden so the tab order stays
// faithful to the design.
const PENDING_TABS = ["Details", "Application", "Media", "SEO", "Publishing"];

export function ProgrammeEditor({ programme }: { programme: AdminProgramme }) {
  const [name, setName] = useState(programme.name);
  const [world, setWorld] = useState<string>(programme.world ?? "");
  const [type, setType] = useState(programme.type);
  const [shortDesc, setShortDesc] = useState(programme.shortDesc);
  const [fullDesc, setFullDesc] = useState(programme.fullDesc);
  const [duration, setDuration] = useState(programme.duration);
  const [startDate, setStartDate] = useState(programme.startDate);
  const [endDate, setEndDate] = useState(programme.endDate);
  const [location, setLocation] = useState(programme.location);
  const [delivery, setDelivery] = useState(programme.delivery);
  const [certification, setCertification] = useState(programme.certification);
  const [appsOpen, setAppsOpen] = useState(programme.appsOpen);
  const [deadline, setDeadline] = useState(programme.deadline);
  const [applyPath, setApplyPath] = useState(programme.applyPath);
  const [places, setPlaces] = useState<string>(programme.appsCapacity === null ? "" : String(programme.appsCapacity));
  const [isPublic, setIsPublic] = useState(programme.isPublic);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const res = await saveProgramme({
        id: programme.id,
        name,
        world: (world || null) as World | null,
        type,
        shortDesc,
        fullDesc,
        duration,
        startDate,
        endDate,
        location,
        delivery,
        certification,
        appsOpen,
        applyPath,
        appsCapacity: places === "" ? null : Number.parseInt(places, 10),
        isPublic,
      });
      setMessage(res.ok ? { tone: "success", text: "Programme saved (mock store)." } : { tone: "danger", text: res.error });
    });

  return (
    <>
      <div className="pe-tabs" role="tablist">
        <button className="is-active" role="tab" aria-selected="true">
          Overview
        </button>
        {PENDING_TABS.map((t) => (
          <button key={t} role="tab" aria-selected="false" disabled title={`${t} lands in a later phase`}>
            {t}
          </button>
        ))}
      </div>

      {message && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone={message.tone}>{message.text}</Notice>
        </div>
      )}

      <Panel>
        <PanelBody>
          <div className="ax-form">
            <FormRow title="Programme name" hint="Visible on public site.">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormRow>

            <FormRow title="World & category" hint="Determines where this programme appears in navigation.">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Nayokan world" htmlFor="pe-world">
                  <Select id="pe-world" value={world} onChange={(e) => setWorld(e.target.value)}>
                    {WORLD_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Programme type" htmlFor="pe-type">
                  <Select id="pe-type" value={type} onChange={(e) => setType(e.target.value)}>
                    {PROGRAMME_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </FormRow>

            <FormRow title="Short description" hint="One paragraph. Appears in listings.">
              <Textarea rows={2} value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} />
            </FormRow>

            <FormRow title="Full description" hint="Public programme page body. Supports paragraphs and headings.">
              <Textarea rows={6} value={fullDesc} onChange={(e) => setFullDesc(e.target.value)} />
            </FormRow>

            <FormRow title="Duration & delivery" hint="Programme logistics.">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <Field label="Duration" htmlFor="pe-duration">
                  <Input id="pe-duration" value={duration} onChange={(e) => setDuration(e.target.value)} />
                </Field>
                <Field label="Start date" htmlFor="pe-start">
                  <Input id="pe-start" className="ax-input--mono" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </Field>
                <Field label="End date" htmlFor="pe-end">
                  <Input id="pe-end" className="ax-input--mono" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </Field>
                <Field label="Location" htmlFor="pe-location">
                  <Input id="pe-location" value={location} onChange={(e) => setLocation(e.target.value)} />
                </Field>
                <Field label="Delivery model" htmlFor="pe-delivery">
                  <Select id="pe-delivery" value={delivery} onChange={(e) => setDelivery(e.target.value)}>
                    {DELIVERY_MODELS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Certification" htmlFor="pe-cert">
                  <Select id="pe-cert" value={certification} onChange={(e) => setCertification(e.target.value)}>
                    {CERTIFICATIONS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </FormRow>

            <FormRow title="Application window" hint='Nayokan will automatically mark the programme "Closed" 24h after the deadline.'>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Applications">
                  <div className="ax-radio-group" role="radiogroup" aria-label="Applications open or closed">
                    <button type="button" className={appsOpen ? "is-active" : ""} onClick={() => setAppsOpen(true)} aria-pressed={appsOpen}>
                      Open
                    </button>
                    <button type="button" className={!appsOpen ? "is-active" : ""} onClick={() => setAppsOpen(false)} aria-pressed={!appsOpen}>
                      Closed
                    </button>
                  </div>
                </Field>
                <Field label="Deadline" htmlFor="pe-deadline">
                  <Input id="pe-deadline" className="ax-input--mono" value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="e.g. 27 Sept 2026 · 23:59 WAT" />
                </Field>
                <Field label="Application URL" htmlFor="pe-apply">
                  <div className="ax-input__prefix">
                    <span>nayokan.cm</span>
                    <input id="pe-apply" value={applyPath} onChange={(e) => setApplyPath(e.target.value)} placeholder="/apply/…" />
                  </div>
                </Field>
                <Field label="Places available" htmlFor="pe-places">
                  <Input id="pe-places" className="ax-input--mono" inputMode="numeric" value={places} onChange={(e) => setPlaces(e.target.value.replace(/[^0-9]/g, ""))} />
                </Field>
              </div>
              <Notice tone="soft">
                Required application documents are configured in the <strong>Application</strong> tab — that surface
                lands with Phase 8 (applications pipeline).
              </Notice>
            </FormRow>

            <FormRow title="Public visibility" hint="Whether this programme is visible on the public Nayokan website.">
              <Toggle checked={isPublic} onChange={setIsPublic} label="Visible on website" />
            </FormRow>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 8 }}>
              <Button variant="primary" onClick={save} disabled={pending}>
                Save changes
              </Button>
            </div>
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

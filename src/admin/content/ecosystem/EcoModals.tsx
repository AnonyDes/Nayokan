"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/admin/ui/Button";
import { Modal } from "@/admin/ui/Modal";
import { Field, Input } from "@/admin/ui/Field";
import { Select } from "@/admin/ui/Data";
import { Toggle } from "@/admin/ui/Toggle";
import { Notice } from "@/admin/ui/Notice";
import { Pill, type PillTone } from "@/admin/ui/Pill";
import { RowActions } from "@/admin/ui/Table";
import {
  createMentor,
  createPartner,
  createPerson,
  createProperty,
  createVenture,
  saveMentor,
  savePartner,
  savePerson,
  saveProperty,
  saveVenture,
  setPartnerPublic,
  setPropertyPublic,
  setVenturePublic,
} from "./actions";
import type { AdminMentor, AdminPartner, AdminPerson, AdminProperty, AdminVenture } from "./types";

const plusIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

function AddButton({ label, onCreate }: { label: string; onCreate: () => Promise<{ ok: boolean; id?: string; error?: string }> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="primary"
      icon={plusIcon}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await onCreate();
          if (res.ok) router.refresh();
        })
      }
    >
      {label}
    </Button>
  );
}

export const NewPersonButton = () => <AddButton label="Add person" onCreate={createPerson} />;
export const NewMentorButton = () => <AddButton label="Add mentor" onCreate={createMentor} />;
export const NewPartnerButton = () => <AddButton label="Add partner" onCreate={createPartner} />;
export const NewVentureButton = () => <AddButton label="Add venture" onCreate={createVenture} />;
export const NewPropertyButton = () => <AddButton label="Add property" onCreate={createProperty} />;

// — row toggle —

function RowToggle({ id, isPublic, label, onToggle }: { id: string; isPublic: boolean; label?: string; onToggle: (input: { id: string; isPublic: boolean }) => Promise<{ ok: boolean; error?: string }> }) {
  const [on, setOn] = useState(isPublic);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <span title={error ?? undefined} style={{ display: "inline-block" }}>
      <Toggle
        checked={on}
        label={label}
        disabled={pending}
        onChange={(next) => {
          setOn(next);
          setError(null);
          startTransition(async () => {
            const res = await onToggle({ id, isPublic: next });
            if (!res.ok) {
              setOn(!next);
              setError(res.error ?? "Not allowed");
            }
          });
        }}
      />
    </span>
  );
}

// — people —

export function PersonRow({ person }: { person: AdminPerson }) {
  const [editing, setEditing] = useState(false);
  return (
    <tr>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="ax-avatar" style={{ background: "var(--ws-2)", color: "var(--text-3)" }}>
            {person.initials}
          </span>
          <div>
            <button className="ax-table__title" style={{ cursor: "pointer", textAlign: "left" }} onClick={() => setEditing(true)}>
              {person.name}
              {person.provenance.isDemo && <span className="ax-demo-tag">Demo</span>}
            </button>
            <span className="ax-table__sub">Institutional record #{person.code}</span>
          </div>
        </div>
      </td>
      <td>{person.position || "—"}</td>
      <td className="is-mono" style={{ textTransform: "capitalize" }}>
        {person.division}
      </td>
      <td>{person.hasPhoto ? <Pill tone="verified">Set</Pill> : <Pill tone="needs">Missing</Pill>}</td>
      <td>
        {person.bioStatus === "complete" ? <Pill tone="verified">Complete</Pill> : person.bioStatus === "draft" ? <Pill tone="needs">Draft</Pill> : <Pill tone="draft">Missing</Pill>}
      </td>
      <td className="is-mono">{person.order}</td>
      <td>
        <PersonPublicCell person={person} onEdit={() => setEditing(true)} />
      </td>
      <td>
        <RowActions>
          <button className="ax-iconbtn" aria-label={`Edit ${person.name}`} onClick={() => setEditing(true)}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
        </RowActions>
        <PersonModal person={person} open={editing} onClose={() => setEditing(false)} />
      </td>
    </tr>
  );
}

/** Public cell for people — the toggle routes through savePerson so the
 *  consent gate applies (can't publish without consentRecorded). */
function PersonPublicCell({ person, onEdit }: { person: AdminPerson; onEdit: () => void }) {
  const [on, setOn] = useState(person.isPublic);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  return (
    <span title={err ?? undefined}>
      <Toggle
        checked={on}
        disabled={pending}
        onChange={(next) => {
          if (next && !person.consentRecorded) {
            setErr("Consent required — open the record to record it first");
            onEdit();
            return;
          }
          setOn(next);
          startTransition(async () => {
            const res = await savePerson({ id: person.id, name: person.name, position: person.position, division: person.division, order: person.order, consentRecorded: person.consentRecorded, isPublic: next });
            if (!res.ok) {
              setOn(!next);
              setErr(res.error);
            }
          });
        }}
      />
    </span>
  );
}

function PersonModal({ person, open, onClose }: { person: AdminPerson; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(person.name);
  const [position, setPosition] = useState(person.position);
  const [division, setDivision] = useState(person.division);
  const [order, setOrder] = useState(String(person.order));
  const [consent, setConsent] = useState(person.consentRecorded);
  const [isPublic, setIsPublic] = useState(person.isPublic);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const res = await savePerson({ id: person.id, name, position, division, order: Number.parseInt(order || "0", 10), consentRecorded: consent, isPublic });
      if (res.ok) {
        onClose();
        router.refresh();
      } else setError(res.error);
    });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Person · ${person.code}`}
      footer={
        <>
          <Button variant="soft" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} disabled={pending}>
            Save person
          </Button>
        </>
      }
    >
      <div className="ax-form" style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
        {error && <Notice tone="danger">{error}</Notice>}
        <Field label="Name" htmlFor="p-name" hint="Leave as “to be confirmed” until the record is verified — never fabricate names.">
          <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Position" htmlFor="p-position">
            <Input id="p-position" value={position} onChange={(e) => setPosition(e.target.value)} />
          </Field>
          <Field label="Division" htmlFor="p-division">
            <Select id="p-division" value={division} onChange={(e) => setDivision(e.target.value as AdminPerson["division"])}>
              <option value="leadership">Leadership</option>
              <option value="programme">Programme</option>
              <option value="advisor">Advisor</option>
            </Select>
          </Field>
        </div>
        <Field label="Display order" htmlFor="p-order">
          <Input id="p-order" className="ax-input--mono" inputMode="numeric" value={order} onChange={(e) => setOrder(e.target.value.replace(/[^0-9]/g, ""))} />
        </Field>
        <Toggle checked={consent} onChange={setConsent} label="Publish consent recorded" hint="Required before the record can go public" />
        <Toggle checked={isPublic} onChange={setIsPublic} label={isPublic ? "Public" : "Hidden"} hint={!consent ? "Consent required first" : undefined} />
      </div>
    </Modal>
  );
}

// — mentors —

export function MentorRow({ mentor }: { mentor: AdminMentor }) {
  const [editing, setEditing] = useState(false);
  const statusTone: Record<AdminMentor["status"], PillTone> = { active: "active", inactive: "inactive", draft: "draft" };
  const availLabel = { open: "Open", limited: "Limited", by_request: "By request" } as const;
  return (
    <tr>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="ax-avatar" style={{ background: "var(--ws-2)", color: "var(--text-3)" }}>
            {mentor.initials}
          </span>
          <div>
            <button className="ax-table__title" style={{ cursor: "pointer", textAlign: "left" }} onClick={() => setEditing(true)}>
              {mentor.name}
              {mentor.provenance.isDemo && <span className="ax-demo-tag">Demo</span>}
            </button>
            <span className="ax-table__sub">#{mentor.code}</span>
          </div>
        </div>
      </td>
      <td>{mentor.expertise || "—"}</td>
      <td className="is-mono">{mentor.sector}</td>
      <td className="is-mono">{availLabel[mentor.availability]}</td>
      <td className="is-mono">{mentor.cohortLabel}</td>
      <td>
        <Pill tone={statusTone[mentor.status]}>{mentor.status}</Pill>
      </td>
      <td>
        <MentorPublicCell mentor={mentor} />
      </td>
      <td>
        <RowActions>
          <button className="ax-iconbtn" aria-label={`Edit ${mentor.name}`} onClick={() => setEditing(true)}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
        </RowActions>
        <MentorModal mentor={mentor} open={editing} onClose={() => setEditing(false)} />
      </td>
    </tr>
  );
}

function MentorPublicCell({ mentor }: { mentor: AdminMentor }) {
  const [on, setOn] = useState(mentor.isPublic);
  const [pending, startTransition] = useTransition();
  return (
    <Toggle
      checked={on}
      disabled={pending}
      onChange={(next) => {
        setOn(next);
        startTransition(async () => {
          const res = await saveMentor({ id: mentor.id, name: mentor.name, expertise: mentor.expertise, sector: mentor.sector, availability: mentor.availability, cohortLabel: mentor.cohortLabel, status: mentor.status, isPublic: next });
          if (!res.ok) setOn(!next);
        });
      }}
    />
  );
}

function MentorModal({ mentor, open, onClose }: { mentor: AdminMentor; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(mentor.name);
  const [expertise, setExpertise] = useState(mentor.expertise);
  const [sector, setSector] = useState(mentor.sector);
  const [availability, setAvailability] = useState(mentor.availability);
  const [cohortLabel, setCohortLabel] = useState(mentor.cohortLabel);
  const [status, setStatus] = useState(mentor.status);
  const [isPublic, setIsPublic] = useState(mentor.isPublic);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const res = await saveMentor({ id: mentor.id, name, expertise, sector, availability, cohortLabel, status, isPublic });
      if (res.ok) {
        onClose();
        router.refresh();
      } else setError(res.error);
    });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Mentor · ${mentor.code}`}
      footer={
        <>
          <Button variant="soft" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} disabled={pending}>
            Save mentor
          </Button>
        </>
      }
    >
      <div className="ax-form" style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
        {error && <Notice tone="danger">{error}</Notice>}
        <Field label="Name" htmlFor="m-name" hint="Leave as “to be confirmed” until verified.">
          <Input id="m-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Expertise" htmlFor="m-expertise">
          <Input id="m-expertise" value={expertise} onChange={(e) => setExpertise(e.target.value)} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Sector" htmlFor="m-sector">
            <Input id="m-sector" value={sector} onChange={(e) => setSector(e.target.value)} />
          </Field>
          <Field label="Availability" htmlFor="m-avail">
            <Select id="m-avail" value={availability} onChange={(e) => setAvailability(e.target.value as AdminMentor["availability"])}>
              <option value="open">Open</option>
              <option value="limited">Limited</option>
              <option value="by_request">By request</option>
            </Select>
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Cohort" htmlFor="m-cohort">
            <Input id="m-cohort" value={cohortLabel} onChange={(e) => setCohortLabel(e.target.value)} />
          </Field>
          <Field label="Status" htmlFor="m-status">
            <Select id="m-status" value={status} onChange={(e) => setStatus(e.target.value as AdminMentor["status"])}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </Select>
          </Field>
        </div>
        <Toggle checked={isPublic} onChange={setIsPublic} label={isPublic ? "Public" : "Hidden"} />
      </div>
    </Modal>
  );
}

// — partners —

const PARTNER_CATEGORY_LABEL: Record<AdminPartner["category"], string> = {
  university: "University",
  corporate: "Corporate",
  development: "Development",
  government: "Government",
  investor: "Investor",
  community: "Community",
};

export function PartnerGrid({ partners }: { partners: AdminPartner[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
      {partners.map((p) => (
        <div key={p.id} style={{ background: "var(--panel)", border: "1px solid var(--line-2)", borderRadius: "var(--radius)", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => setEditing(p.id)}
            aria-label={`Edit ${p.name}`}
            style={{
              aspectRatio: "16/9",
              background: "var(--ws)",
              border: "1px dashed var(--line-2)",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--f-mono)",
              fontSize: 10,
              letterSpacing: "0.14em",
              color: "var(--text-3)",
              textTransform: "uppercase",
              padding: 6,
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            {p.hasLogo ? "Partner logo" : "Logo missing"}
          </button>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>
              {p.name}
              {p.provenance.isDemo && <span className="ax-demo-tag">Content to be confirmed</span>}
            </div>
            <div className="ax-mono ax-mute" style={{ fontSize: "10.5px", marginTop: 3, letterSpacing: "0.06em" }}>
              {PARTNER_CATEGORY_LABEL[p.category]}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--line)" }}>
            {p.status === "visible" ? (
              <Pill tone="published">Visible</Pill>
            ) : p.status === "missing_logo" ? (
              <Pill tone="needs">Missing logo</Pill>
            ) : (
              <Pill tone="draft">Draft</Pill>
            )}
            <RowToggle id={p.id} isPublic={p.isPublic} onToggle={setPartnerPublic} />
          </div>
          <PartnerModal partner={p} open={editing === p.id} onClose={() => setEditing(null)} />
        </div>
      ))}
    </div>
  );
}

function PartnerModal({ partner, open, onClose }: { partner: AdminPartner; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(partner.name);
  const [category, setCategory] = useState(partner.category);
  const [consent, setConsent] = useState(partner.consentRecorded);
  const [isPublic, setIsPublic] = useState(partner.isPublic);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const res = await savePartner({ id: partner.id, name, category, consentRecorded: consent, isPublic });
      if (res.ok) {
        onClose();
        router.refresh();
      } else setError(res.error);
    });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Partner · ${partner.name}`}
      footer={
        <>
          <Button variant="soft" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} disabled={pending}>
            Save partner
          </Button>
        </>
      }
    >
      <div className="ax-form" style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
        {error && <Notice tone="danger">{error}</Notice>}
        <Field label="Partner name" htmlFor="ptn-name" hint="Never fabricate names or logos — mark unconfirmed records instead.">
          <Input id="ptn-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Category" htmlFor="ptn-category">
          <Select id="ptn-category" value={category} onChange={(e) => setCategory(e.target.value as AdminPartner["category"])}>
            {(Object.keys(PARTNER_CATEGORY_LABEL) as AdminPartner["category"][]).map((c) => (
              <option key={c} value={c}>
                {PARTNER_CATEGORY_LABEL[c]}
              </option>
            ))}
          </Select>
        </Field>
        <Toggle checked={consent} onChange={setConsent} label="Written consent recorded" hint="Names/logos go public only after this" />
        <Toggle checked={isPublic} onChange={setIsPublic} label={isPublic ? "Public" : "Hidden"} hint={!consent ? "Consent required first" : undefined} />
      </div>
    </Modal>
  );
}

// — ventures —

export function VentureRow({ venture }: { venture: AdminVenture }) {
  const [editing, setEditing] = useState(false);
  const stageTone: Record<AdminVenture["listingStatus"], PillTone> = { pipeline: "draft", active: "published", alumni: "archived", exited: "archived" };
  const stageLabel = { pipeline: "Pipeline", active: "Invested", alumni: "Alumni", exited: "Exited" } as const;
  return (
    <tr>
      <td>
        <button className="ax-table__title" style={{ cursor: "pointer", textAlign: "left" }} onClick={() => setEditing(true)}>
          {venture.name}
          {venture.provenance.isDemo && <span className="ax-demo-tag">Content to be confirmed</span>}
        </button>
        <span className="ax-table__sub">/portfolio/#{venture.code}</span>
      </td>
      <td>{venture.sector || "—"}</td>
      <td className="is-mono">{venture.stage || "—"}</td>
      <td className="is-mono">{venture.location || "—"}</td>
      <td>{venture.relatedProgramme || "—"}</td>
      <td>
        <Pill tone={stageTone[venture.listingStatus]}>{stageLabel[venture.listingStatus]}</Pill>
      </td>
      <td>
        <RowToggle id={venture.id} isPublic={venture.isPublic} onToggle={setVenturePublic} />
      </td>
      <td>
        <RowActions>
          <button className="ax-iconbtn" aria-label={`Edit ${venture.name}`} onClick={() => setEditing(true)}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
        </RowActions>
        <VentureModal venture={venture} open={editing} onClose={() => setEditing(false)} />
      </td>
    </tr>
  );
}

function VentureModal({ venture, open, onClose }: { venture: AdminVenture; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(venture.name);
  const [sector, setSector] = useState(venture.sector);
  const [stage, setStage] = useState(venture.stage);
  const [location, setLocation] = useState(venture.location);
  const [relatedProgramme, setRelatedProgramme] = useState(venture.relatedProgramme);
  const [listingStatus, setListingStatus] = useState(venture.listingStatus);
  const [isPublic, setIsPublic] = useState(venture.isPublic);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const res = await saveVenture({ id: venture.id, name, sector, stage, location, relatedProgramme, listingStatus, isPublic });
      if (res.ok) {
        onClose();
        router.refresh();
      } else setError(res.error);
    });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Venture · ${venture.code}`}
      footer={
        <>
          <Button variant="soft" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} disabled={pending}>
            Save venture
          </Button>
        </>
      }
    >
      <div className="ax-form" style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
        {error && <Notice tone="danger">{error}</Notice>}
        <Field label="Venture label" htmlFor="v-name" hint="No financial figures are recorded here unless externally verified and disclosed with venture consent.">
          <Input id="v-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Sector" htmlFor="v-sector">
            <Input id="v-sector" value={sector} onChange={(e) => setSector(e.target.value)} />
          </Field>
          <Field label="Stage" htmlFor="v-stage">
            <Input id="v-stage" value={stage} onChange={(e) => setStage(e.target.value)} placeholder="Pre-seed · Seed · Series A" />
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Location" htmlFor="v-location">
            <Input id="v-location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
          <Field label="Related programme" htmlFor="v-programme">
            <Input id="v-programme" value={relatedProgramme} onChange={(e) => setRelatedProgramme(e.target.value)} />
          </Field>
        </div>
        <Field label="Listing status" htmlFor="v-status">
          <Select id="v-status" value={listingStatus} onChange={(e) => setListingStatus(e.target.value as AdminVenture["listingStatus"])}>
            <option value="pipeline">Pipeline</option>
            <option value="active">Invested</option>
            <option value="alumni">Alumni</option>
            <option value="exited">Exited</option>
          </Select>
        </Field>
        <Toggle checked={isPublic} onChange={setIsPublic} label={isPublic ? "Public" : "Hidden"} />
      </div>
    </Modal>
  );
}

// — properties —

export function PropertyGrid({ properties }: { properties: AdminProperty[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <div className="ax-grid ax-grid-3">
      {properties.map((p) => (
        <div key={p.id} style={{ background: "var(--panel)", border: "1px solid var(--line-2)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div className="ax-imgslot ax-imgslot--wide" style={{ borderRadius: 0, border: "none", aspectRatio: "16/9" }}>
            PROPERTY · {p.name}
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <div>
                <div style={{ fontFamily: "var(--f-head)", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
                  {p.name}
                  {p.provenance.isDemo && <span className="ax-demo-tag">Content to be confirmed</span>}
                </div>
                <div className="ax-mono ax-mute" style={{ fontSize: "10.5px", marginTop: 4, letterSpacing: "0.06em" }}>
                  {[p.location, p.region, p.type, p.rooms === null ? null : `${p.rooms} rooms`].filter(Boolean).join(" · ")}
                </div>
              </div>
              <Pill tone={p.status === "published" ? "published" : "draft"}>{p.status === "published" ? "Published" : "Draft"}</Pill>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)", fontFamily: "var(--f-mono)", fontSize: "10.5px", color: "var(--text-3)", letterSpacing: "0.04em" }}>
              <div>
                Booking · <strong style={{ color: "var(--ink)" }}>External URL</strong>
              </div>
              <div>
                Gallery ·{" "}
                <strong style={{ color: p.galleryCount === null ? "var(--warn-ink)" : "var(--ink)" }}>
                  {p.galleryCount === null ? "Missing" : `${p.galleryCount} images`}
                </strong>
              </div>
              <div>
                Amenities · <strong style={{ color: "var(--ink)" }}>{p.amenitiesCount} listed</strong>
              </div>
              <div>
                Enquiries · <strong style={{ color: "var(--ink)" }}>{p.enquiriesCount ?? "—"}</strong>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <RowToggle id={p.id} isPublic={p.isPublic} label="Visible on website" onToggle={setPropertyPublic} />
              <Button variant="soft" size="sm" onClick={() => setEditing(p.id)}>
                Edit
              </Button>
            </div>
          </div>
          <PropertyModal property={p} open={editing === p.id} onClose={() => setEditing(null)} />
        </div>
      ))}
    </div>
  );
}

function PropertyModal({ property, open, onClose }: { property: AdminProperty; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(property.name);
  const [slug, setSlug] = useState(property.slug);
  const [location, setLocation] = useState(property.location);
  const [region, setRegion] = useState(property.region);
  const [type, setType] = useState(property.type);
  const [rooms, setRooms] = useState(property.rooms === null ? "" : String(property.rooms));
  const [bookingUrl, setBookingUrl] = useState(property.externalBookingUrl);
  const [status, setStatus] = useState(property.status);
  const [isPublic, setIsPublic] = useState(property.isPublic);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const res = await saveProperty({
        id: property.id,
        name,
        slug,
        location,
        region,
        type,
        rooms: rooms === "" ? null : Number.parseInt(rooms, 10),
        externalBookingUrl: bookingUrl,
        status,
        isPublic,
      });
      if (res.ok) {
        onClose();
        router.refresh();
      } else setError(res.error);
    });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Property · ${property.name}`}
      footer={
        <>
          <Button variant="soft" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} disabled={pending}>
            Save property
          </Button>
        </>
      }
    >
      <div className="ax-form" style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
        {error && <Notice tone="danger">{error}</Notice>}
        <Field label="Property name" htmlFor="pr-name">
          <Input id="pr-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Slug" htmlFor="pr-slug">
          <Input id="pr-slug" className="ax-input--mono" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Location" htmlFor="pr-location">
            <Input id="pr-location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
          <Field label="Region" htmlFor="pr-region">
            <Input id="pr-region" value={region} onChange={(e) => setRegion(e.target.value)} />
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Type" htmlFor="pr-type">
            <Select id="pr-type" value={type} onChange={(e) => setType(e.target.value)}>
              <option>Guesthouse</option>
              <option>Short stay</option>
            </Select>
          </Field>
          <Field label="Rooms" htmlFor="pr-rooms">
            <Input id="pr-rooms" className="ax-input--mono" inputMode="numeric" value={rooms} onChange={(e) => setRooms(e.target.value.replace(/[^0-9]/g, ""))} />
          </Field>
        </div>
        <Field label="External booking URL" htmlFor="pr-booking" hint="Bookings are handled externally — the admin only manages listing content.">
          <Input id="pr-booking" className="ax-input--mono" value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} placeholder="https://…" />
        </Field>
        <Field label="Status" htmlFor="pr-status">
          <Select id="pr-status" value={status} onChange={(e) => setStatus(e.target.value as AdminProperty["status"])}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
        </Field>
        <Toggle checked={isPublic} onChange={setIsPublic} label={isPublic ? "Visible on website" : "Hidden"} />
      </div>
    </Modal>
  );
}

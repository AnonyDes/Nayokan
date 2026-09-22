"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/admin/ui/Button";
import { Modal } from "@/admin/ui/Modal";
import { Field, Input } from "@/admin/ui/Field";
import { Select } from "@/admin/ui/Data";
import { Toggle } from "@/admin/ui/Toggle";
import { Notice } from "@/admin/ui/Notice";
import { OPPORTUNITY_CATEGORIES, type AdminCluster, type AdminOpportunity } from "./types";
import { createCluster, createOpportunity, createProgramme, saveCluster, saveOpportunity, setClusterPublic } from "./actions";
import type { SiteId, World } from "@/platform/sites/types";

const WORLD_OPTIONS = [
  { value: "", label: "All worlds" },
  { value: "vti", label: "01 · Vocational Training Institute" },
  { value: "startup", label: "02 · Startup Centre" },
  { value: "venture_capital", label: "03 · Venture Capital" },
  { value: "hospitality", label: "04 · Hospitality" },
];

/** Cluster edit modal — clusters.html has no dedicated editor page; the card
 *  grid's Edit button opens this. */
export function ClusterModal({ cluster, open, onClose }: { cluster: AdminCluster; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(cluster.name);
  const [sector, setSector] = useState(cluster.sector);
  const [location, setLocation] = useState(cluster.location);
  const [cohortLabel, setCohortLabel] = useState(cluster.cohortLabel);
  const [memberCount, setMemberCount] = useState(String(cluster.memberCount));
  const [isPublic, setIsPublic] = useState(cluster.isPublic);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const res = await saveCluster({
        id: cluster.id,
        name,
        sector,
        location,
        cohortLabel,
        memberCount: Number.parseInt(memberCount || "0", 10),
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
      title={`Edit cluster · ${cluster.name}`}
      footer={
        <>
          <Button variant="soft" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} disabled={pending}>
            Save cluster
          </Button>
        </>
      }
    >
      <div className="ax-form" style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
        {error && <Notice tone="danger">{error}</Notice>}
        <Field label="Cluster name" htmlFor="cl-name" required>
          <Input id="cl-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Sector line" htmlFor="cl-sector" hint="e.g. Textile · garments · Yaoundé">
          <Input id="cl-sector" value={sector} onChange={(e) => setSector(e.target.value)} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Location" htmlFor="cl-location">
            <Input id="cl-location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
          <Field label="Cohort status" htmlFor="cl-cohort">
            <Input id="cl-cohort" value={cohortLabel} onChange={(e) => setCohortLabel(e.target.value)} placeholder="Cohort 4 open" />
          </Field>
        </div>
        <Field label="Members" htmlFor="cl-members">
          <Input id="cl-members" className="ax-input--mono" inputMode="numeric" value={memberCount} onChange={(e) => setMemberCount(e.target.value.replace(/[^0-9]/g, ""))} />
        </Field>
        <Toggle checked={isPublic} onChange={setIsPublic} label={isPublic ? "Public" : "Hidden"} />
      </div>
    </Modal>
  );
}

/** Card-grid client wrapper — owns modal state per cluster. */
export function ClusterGrid({ clusters }: { clusters: AdminCluster[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <div className="ax-grid ax-grid-3">
      {clusters.map((c) => (
        <div key={c.id} style={{ background: "var(--panel)", border: "1px solid var(--line-2)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div className="ax-imgslot ax-imgslot--wide" style={{ borderRadius: 0, border: "none" }}>
            CLUSTER · {c.name}
          </div>
          <div style={{ padding: "14px 16px" }}>
            <div className="ax-mono ax-mute" style={{ fontSize: "10.5px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {c.sector || "Sector · tbc"}
            </div>
            <div style={{ fontFamily: "var(--f-head)", fontWeight: 700, fontSize: 15, marginTop: 4 }}>
              {c.name}
              {c.provenance.isDemo && <span className="ax-demo-tag">Demo</span>}
            </div>
            <div className="ax-mono ax-mute" style={{ fontSize: 11, marginTop: 6 }}>
              {c.cohortLabel} · {c.memberCount} member{c.memberCount === 1 ? "" : "s"}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)", alignItems: "center" }}>
              <ClusterCardToggle cluster={c} />
              <Button variant="soft" size="sm" onClick={() => setEditing(c.id)}>
                Edit
              </Button>
            </div>
          </div>
          <ClusterModal cluster={c} open={editing === c.id} onClose={() => setEditing(null)} />
        </div>
      ))}
    </div>
  );
}

function ClusterCardToggle({ cluster }: { cluster: AdminCluster }) {
  const [on, setOn] = useState(cluster.isPublic);
  const [pending, startTransition] = useTransition();
  return (
    <Toggle
      checked={on}
      disabled={pending}
      label={on ? "Public" : "Hidden"}
      onChange={(next) => {
        setOn(next);
        startTransition(async () => {
          const res = await setClusterPublic({ id: cluster.id, isPublic: next });
          if (!res.ok) setOn(!next);
        });
      }}
    />
  );
}

/** "Add cluster" — creates a draft then opens its modal via refresh. */
export function NewClusterButton({ site }: { site: SiteId }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="primary"
      icon={
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      }
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await createCluster({ site });
          if (res.ok) router.refresh();
        })
      }
    >
      Add cluster
    </Button>
  );
}

/** Opportunity edit modal — opportunities.html has no editor page either. */
export function OpportunityModal({ opportunity, open, onClose }: { opportunity: AdminOpportunity; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState(opportunity.title);
  const [slug, setSlug] = useState(opportunity.slug);
  const [category, setCategory] = useState(opportunity.category);
  const [world, setWorld] = useState<string>(opportunity.world ?? "");
  const [deadlineLabel, setDeadlineLabel] = useState(opportunity.deadlineLabel);
  const [isPublic, setIsPublic] = useState(opportunity.isPublic);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const res = await saveOpportunity({
        id: opportunity.id,
        title,
        slug,
        category,
        world: (world || null) as World | null,
        deadlineLabel,
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
      title={`Edit opportunity · ${opportunity.title}`}
      footer={
        <>
          <Button variant="soft" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} disabled={pending}>
            Save opportunity
          </Button>
        </>
      }
    >
      <div className="ax-form" style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
        {error && <Notice tone="danger">{error}</Notice>}
        <Field label="Title" htmlFor="op-title" required>
          <Input id="op-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Slug" htmlFor="op-slug">
          <Input id="op-slug" className="ax-input--mono" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Category" htmlFor="op-category">
            <Select id="op-category" value={category} onChange={(e) => setCategory(e.target.value as AdminOpportunity["category"])}>
              {OPPORTUNITY_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Nayokan world" htmlFor="op-world">
            <Select id="op-world" value={world} onChange={(e) => setWorld(e.target.value)}>
              {WORLD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Deadline" htmlFor="op-deadline" hint="Display label — e.g. 15 Oct 2026, Rolling, Opens 1 Nov.">
          <Input id="op-deadline" className="ax-input--mono" value={deadlineLabel} onChange={(e) => setDeadlineLabel(e.target.value)} />
        </Field>
        <Toggle checked={isPublic} onChange={setIsPublic} label={isPublic ? "Public" : "Hidden"} />
      </div>
    </Modal>
  );
}

/** "Add programme" — creates a draft and routes into the programme editor. */
export function NewProgrammeButton({ site }: { site: SiteId }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="primary"
      icon={
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      }
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await createProgramme({ site });
          if (res.ok && res.id) router.push(`/admin/programmes/${res.id}`);
        })
      }
    >
      Add programme
    </Button>
  );
}

export function NewOpportunityButton({ site }: { site: SiteId }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="primary"
      icon={
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      }
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await createOpportunity({ site });
          if (res.ok) router.refresh();
        })
      }
    >
      Add opportunity
    </Button>
  );
}

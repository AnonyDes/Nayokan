"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/admin/ui/Button";
import { Field, Input, Textarea } from "@/admin/ui/Field";
import { Select } from "@/admin/ui/Data";
import { Modal } from "@/admin/ui/Modal";
import { Toggle } from "@/admin/ui/Toggle";
import {
  confirmApproval,
  inviteUser,
  rejectApproval,
  requestDangerZone,
  requestRolePermission,
  requestUserDisable,
  requestUserRoleChange,
  saveOrgSettings,
  saveSecuritySettings,
  saveWebsiteDefaults,
  setNotificationPref,
} from "./actions";
import { ROLE_LABELS } from "@/platform/auth/roles";
import { PERMISSION_LEVELS, ROLE_IDS, type PermissionArea, type PermissionLevel, type RoleId } from "@/platform/auth/types";
import type { AdminUser, NotificationPref, OrgSettings, PendingApproval, SecuritySettings, WebsiteDefaults } from "./types";

type ErrorFn = (e: string | null) => void;

function useAction(router: ReturnType<typeof useRouter>, onResult: ErrorFn) {
  const [pending, startTransition] = useTransition();
  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>, after?: () => void) =>
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        onResult(null);
        after?.();
        router.refresh();
      } else onResult(res.error);
    });
  return { pending, run };
}

function ErrorLine({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="ax-mono" style={{ fontSize: 10.5, marginTop: 6, color: "var(--danger)" }} role="alert">
      {error}
    </div>
  );
}

// — users —

export function InviteUserButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleId>("content_editor");
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction(router, setError);
  return (
    <>
      <Button
        variant="primary"
        onClick={() => setOpen(true)}
        icon={
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        }
      >
        Invite user
      </Button>
      <Modal
        open={open}
        title="Invite a staff member"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="soft" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" disabled={pending || !name.trim() || !email.trim()} onClick={() => run(() => inviteUser({ name, email, role }), () => setOpen(false))}>
              Send invitation
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Full name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aïssa Tchoumi" />
          </Field>
          <Field label="Email" required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@nayokan.cm" />
          </Field>
          <Field label="Role" hint="Invited accounts enrol in 2FA on first sign-in.">
            <Select value={role} onChange={(e) => setRole(e.target.value as RoleId)}>
              {ROLE_IDS.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </Select>
          </Field>
          <ErrorLine error={error} />
        </div>
      </Modal>
    </>
  );
}

/** Per-row overflow menu — change role or disable; both queue dual approval. */
export function UserRowMenu({ user, sessionName }: { user: AdminUser; sessionName: string }) {
  const router = useRouter();
  const [modal, setModal] = useState<"role" | "disable" | null>(null);
  const [role, setRole] = useState<RoleId>(user.role);
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction(router, setError);
  const isSelf = user.name === sessionName;
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-label={`Actions for ${user.name}`}
        onClick={() => setModal("role")}
        icon={
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
          </svg>
        }
      />
      <Modal
        open={modal === "role"}
        title={`Manage ${user.name}`}
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="soft" onClick={() => setModal(null)}>Close</Button>
            <Button variant="danger" disabled={pending || isSelf || user.status === "disabled"} onClick={() => setModal("disable")}>
              Disable account…
            </Button>
            <Button variant="primary" disabled={pending || isSelf || user.status === "disabled" || role === user.role} onClick={() => run(() => requestUserRoleChange({ userId: user.id, role }), () => setModal(null))}>
              Request role change
            </Button>
          </>
        }
      >
        {isSelf && <p className="ax-mute" style={{ fontSize: 12.5, marginBottom: 8 }}>You can&apos;t change your own role or disable your own account.</p>}
        <Field label="Role" hint="Role changes queue for a second Super Admin (dual approval).">
          <Select value={role} onChange={(e) => setRole(e.target.value as RoleId)} disabled={isSelf || user.status === "disabled"}>
            {ROLE_IDS.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </Select>
        </Field>
        <ErrorLine error={error} />
      </Modal>
      <Modal
        open={modal === "disable"}
        tone="warn"
        title={`Disable ${user.name}?`}
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="soft" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="danger" disabled={pending} onClick={() => run(() => requestUserDisable({ userId: user.id }), () => setModal(null))}>
              Request disable
            </Button>
          </>
        }
      >
        <p className="ax-mute" style={{ fontSize: 13 }}>
          Disabling removes admin access immediately on confirmation. This is a dangerous action — a second Super Admin must approve before it takes effect.
        </p>
      </Modal>
    </>
  );
}

/** Pending-approvals strip — confirm (second admin) / reject. */
export function PendingApprovals({ approvals, sessionName }: { approvals: PendingApproval[]; sessionName: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction(router, setError);
  if (approvals.length === 0) return null;
  return (
    <div className="pa-strip">
      <div className="pa-strip__title">{approvals.length} change{approvals.length > 1 ? "s" : ""} awaiting a second Super Admin</div>
      {approvals.map((a) => (
        <div className="pa-item" key={a.id}>
          <div>
            <div className="pa-item__label">{a.label}</div>
            <div className="pa-item__meta">
              {a.detail} · requested by {a.requestedBy} · {a.requestedAt}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Button
              variant="accent"
              size="sm"
              disabled={pending || a.requestedBy === sessionName}
              title={a.requestedBy === sessionName ? "Dual approval requires a different Super Admin" : "Approve and apply"}
              onClick={() => run(() => confirmApproval({ approvalId: a.id }))}
            >
              Approve
            </Button>
            <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => rejectApproval({ approvalId: a.id }))}>
              Reject
            </Button>
          </div>
        </div>
      ))}
      <ErrorLine error={error} />
    </div>
  );
}

// — roles matrix —

const LEVEL_LABEL: Record<PermissionLevel, string> = { none: "—", view: "View", review: "Review", full: "Full" };

/** One matrix cell — opens a level picker; dangerous areas warn about dual approval. */
export function RoleCell({ role, area, level, dangerous, canEdit }: { role: RoleId; area: PermissionArea; level: PermissionLevel; dangerous: boolean; canEdit: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [next, setNext] = useState<PermissionLevel>(level);
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction(router, setError);
  return (
    <>
      <button type="button" className={`rp-cell rp-cell--${level}`} onClick={() => canEdit && setOpen(true)} title={canEdit ? `Change ${ROLE_LABELS[role]} · ${area}` : undefined} disabled={!canEdit}>
        {LEVEL_LABEL[level]}
      </button>
      <Modal
        open={open}
        tone={dangerous ? "warn" : "info"}
        title={`${ROLE_LABELS[role]} · ${area}`}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="soft" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant={dangerous ? "danger" : "primary"} disabled={pending || next === level} onClick={() => run(() => requestRolePermission({ role, area, level: next }), () => setOpen(false))}>
              {dangerous ? "Request change" : "Apply"}
            </Button>
          </>
        }
      >
        <Field label="Permission level" hint={dangerous ? "Dangerous area — applies only after a second Super Admin confirms." : undefined}>
          <Select value={next} onChange={(e) => setNext(e.target.value as PermissionLevel)}>
            {PERMISSION_LEVELS.map((l) => (
              <option key={l} value={l}>{LEVEL_LABEL[l]}</option>
            ))}
          </Select>
        </Field>
        {dangerous && (
          <p className="ax-mute" style={{ fontSize: 12.5, marginTop: 8 }}>
            Users, roles and settings are dangerous areas. This change enters the pending-approvals queue and takes effect only when a second Super Admin approves it.
          </p>
        )}
        <ErrorLine error={error} />
      </Modal>
    </>
  );
}

// — settings —

export function OrgSettingsForm({ initial }: { initial: OrgSettings }) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction(router, setError);
  const set = (k: keyof OrgSettings) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  return (
    <>
      <div className="ax-form-row"><div className="ax-form-row__head"><div className="ax-form-row__title">Legal name</div></div>
        <div className="ax-form-row__body"><Input value={f.legalName} onChange={set("legalName")} /></div>
      </div>
      <div className="ax-form-row"><div className="ax-form-row__head"><div className="ax-form-row__title">Contact email</div></div>
        <div className="ax-form-row__body"><Input className="ax-input--mono" value={f.contactEmail} onChange={set("contactEmail")} /></div>
      </div>
      <div className="ax-form-row"><div className="ax-form-row__head"><div className="ax-form-row__title">Address</div></div>
        <div className="ax-form-row__body"><Textarea rows={3} value={f.address} onChange={set("address")} /></div>
      </div>
      <div className="ax-form-row"><div className="ax-form-row__head"><div className="ax-form-row__title">Social links</div><div className="ax-form-row__hint">Public social channels.</div></div>
        <div className="ax-form-row__body">
          <Field label="LinkedIn"><div className="ax-input__prefix"><span>linkedin.com/company/</span><input value={f.linkedin} onChange={set("linkedin")} /></div></Field>
          <Field label="X / Twitter"><div className="ax-input__prefix"><span>x.com/</span><input value={f.twitter} onChange={set("twitter")} /></div></Field>
          <Field label="YouTube"><div className="ax-input__prefix"><span>youtube.com/@</span><input value={f.youtube} onChange={set("youtube")} /></div></Field>
        </div>
      </div>
      <div className="ax-form-row"><div className="ax-form-row__head" /><div className="ax-form-row__body">
        <Button variant="primary" size="sm" disabled={pending} onClick={() => run(() => saveOrgSettings({ legalName: f.legalName, contactEmail: f.contactEmail, address: f.address, linkedin: f.linkedin, twitter: f.twitter, youtube: f.youtube }))}>
          Save organisation
        </Button>
        <ErrorLine error={error} />
      </div></div>
    </>
  );
}

export function WebsiteDefaultsControls({ initial }: { initial: WebsiteDefaults }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction(router, setError);
  return (
    <div className="ax-form-row">
      <div className="ax-form-row__head"><div className="ax-form-row__title">Default language</div></div>
      <div className="ax-form-row__body">
        <div className="ax-radio-group">
          {(["EN", "FR"] as const).map((l) => (
            <button key={l} type="button" className={initial.defaultLang === l ? "is-active" : ""} disabled={pending} onClick={() => run(() => saveWebsiteDefaults({ defaultLang: l }))}>
              {l}
            </button>
          ))}
        </div>
        <ErrorLine error={error} />
      </div>
    </div>
  );
}

export function NotificationPrefRow({ pref }: { pref: NotificationPref }) {
  const router = useRouter();
  const [, setError] = useState<string | null>(null);
  const { pending, run } = useAction(router, setError);
  return (
    <tr>
      <td>{pref.event}</td>
      <td><Toggle checked={pref.email} disabled={pending} hint={`Email · ${pref.event}`} onChange={(v) => run(() => setNotificationPref({ id: pref.id, channel: "email", on: v }))} /></td>
      <td><Toggle checked={pref.inApp} disabled={pending} hint={`In-app · ${pref.event}`} onChange={(v) => run(() => setNotificationPref({ id: pref.id, channel: "inApp", on: v }))} /></td>
      <td>{pref.digest}</td>
    </tr>
  );
}

export function SecurityControls({ initial }: { initial: SecuritySettings }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction(router, setError);
  const timeouts: { value: string; label: string }[] = [
    { value: "15", label: "15 min" },
    { value: "30", label: "30 min" },
    { value: "60", label: "60 min" },
    { value: "240", label: "4 hours" },
  ];
  return (
    <>
      <div className="ax-form-row"><div className="ax-form-row__head"><div className="ax-form-row__title">Two-factor authentication</div></div>
        <div className="ax-form-row__body">
          <Toggle checked={initial.require2fa} disabled={pending} label="Required for all Nayokan staff (recommended)" onChange={(v) => run(() => saveSecuritySettings({ require2fa: v }))} />
        </div>
      </div>
      <div className="ax-form-row"><div className="ax-form-row__head"><div className="ax-form-row__title">Session timeout</div></div>
        <div className="ax-form-row__body">
          <div className="ax-radio-group">
            {timeouts.map((t) => (
              <button key={t.value} type="button" className={initial.sessionTimeout === t.value ? "is-active" : ""} disabled={pending} onClick={() => run(() => saveSecuritySettings({ sessionTimeout: t.value as SecuritySettings["sessionTimeout"] }))}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="ax-form-row"><div className="ax-form-row__head"><div className="ax-form-row__title">Dual approval for dangerous actions</div><div className="ax-form-row__hint">User deletion, role escalation, integrations.</div></div>
        <div className="ax-form-row__body">
          <Toggle checked={initial.dualApproval} disabled={pending} label="Requires two Super Admins" onChange={(v) => run(() => saveSecuritySettings({ dualApproval: v }))} />
        </div>
      </div>
      <ErrorLine error={error} />
    </>
  );
}

export function DangerZoneButtons() {
  const router = useRouter();
  const [modal, setModal] = useState<"reset_site" | "decommission" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction(router, setError);
  const isReset = modal === "reset_site";
  return (
    <>
      <div className="ax-form-row"><div className="ax-form-row__head"><div className="ax-form-row__title">Reset website to draft</div><div className="ax-form-row__hint">Puts every page back to draft. Requires 2 Super Admins.</div></div>
        <div className="ax-form-row__body"><Button variant="danger" onClick={() => setModal("reset_site")}>Reset website…</Button></div>
      </div>
      <div className="ax-form-row"><div className="ax-form-row__head"><div className="ax-form-row__title">Export &amp; delete all data</div><div className="ax-form-row__hint">Institutional decommission. Not reversible.</div></div>
        <div className="ax-form-row__body"><Button variant="danger" onClick={() => setModal("decommission")}>Request decommission…</Button></div>
      </div>
      <Modal
        open={modal !== null}
        tone="warn"
        title={isReset ? "Request website reset?" : "Request decommission?"}
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="soft" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="danger" disabled={pending} onClick={() => run(() => requestDangerZone({ kind: modal ?? "reset_site" }), () => setModal(null))}>
              {isReset ? "Request reset" : "Request decommission"}
            </Button>
          </>
        }
      >
        <p className="ax-mute" style={{ fontSize: 13 }}>
          {isReset
            ? "This queues a request — nothing changes yet. A second Super Admin must approve before every page returns to draft."
            : "This queues a decommission request — no data is deleted yet. A second Super Admin must approve, after which the export-and-delete workflow begins."}
        </p>
        <ErrorLine error={error} />
      </Modal>
    </>
  );
}

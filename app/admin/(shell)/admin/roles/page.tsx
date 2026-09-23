import type { Metadata } from "next";
import { requirePermission, hasPermission } from "@/platform/auth/permissions";
import { ROLE_LABELS } from "@/platform/auth/roles";
import { ROLE_IDS } from "@/platform/auth/types";
import { Page, PageHead } from "@/admin/ui/Page";
import { Panel } from "@/admin/ui/Panel";
import { Notice } from "@/admin/ui/Notice";
import { DemoTag } from "@/admin/ui/Feedback";
import { getRoleMatrix, isDangerousArea, listPendingApprovals, MATRIX_SECTIONS, roleHeadcounts } from "@/admin/administration/data";
import { PendingApprovals, RoleCell } from "@/admin/administration/AdministrationClient";
import "@/admin/administration/administration.css";

export const metadata: Metadata = { title: "Roles & permissions" };

export default async function RolesPage() {
  const session = await requirePermission("roles", "view");
  const canEdit = hasPermission(session, "roles", "full");
  const matrix = getRoleMatrix();
  const headcounts = roleHeadcounts();
  const approvals = listPendingApprovals();

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § H · 05 · Administration · Governance <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Roles & permissions"
        lede="Nayokan's role model. Permissions here control what every staff member can read, create, approve and publish across the platform."
        actions={
          canEdit ? (
            <>
              <a className="ax-btn ax-btn--soft" href="/admin/admin/roles/export">Export matrix</a>
              <a className="ax-btn ax-btn--primary" href="/admin/admin/users?status=invited" title="Custom roles arrive with Session B's role table — invite with an existing role meanwhile">
                <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>Create role
              </a>
            </>
          ) : undefined
        }
      />

      <Notice tone="soft" title="Permission changes are audited and reversible.">
        Every change on this screen is recorded in the audit log with actor, timestamp, previous value and new value. Dangerous permissions require dual-approval from a second Super Admin.
      </Notice>

      {canEdit && <PendingApprovals approvals={approvals} sessionName={session.fullName} />}

      <Panel>
        <div className="rp-legend">
          <span className="rp-legend__lb">Legend ·</span>
          <span className="rp-cell rp-cell--full">Full</span> <span className="ax-mute">Read + write + publish</span>
          <span className="rp-cell rp-cell--review">Review</span> <span className="ax-mute">Approve or request changes</span>
          <span className="rp-cell rp-cell--view">View</span> <span className="ax-mute">Read only</span>
          <span className="rp-cell rp-cell--none">—</span> <span className="ax-mute">No access</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="rp-matrix">
            <thead>
              <tr>
                <th style={{ minWidth: 260 }}>Area</th>
                {ROLE_IDS.map((role) => (
                  <th className="role" key={role}>
                    <span className="role-name">{ROLE_LABELS[role]}</span>
                    <span className="role-sub">{headcounts[role]} {headcounts[role] === 1 ? "person" : "people"}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX_SECTIONS.map((section) => (
                <>
                  <tr className="section" key={section.label}>
                    <th colSpan={1 + ROLE_IDS.length}>
                      {section.label}
                      {section.label === "Administration" && (
                        <span style={{ color: "#FF7A7A", marginLeft: 12 }}>Dangerous · requires 2FA + dual approval</span>
                      )}
                    </th>
                  </tr>
                  {section.areas.map((a) => (
                    <tr key={a.area}>
                      <th>
                        {a.label} <span className="sub">{a.sub}</span>
                      </th>
                      {ROLE_IDS.map((role) => (
                        <td key={role}>
                          <RoleCell role={role} area={a.area} level={matrix[role][a.area]} dangerous={isDangerousArea(a.area)} canEdit={canEdit} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </Page>
  );
}

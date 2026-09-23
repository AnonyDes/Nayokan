import type { Metadata } from "next";
import { requirePermission, hasPermission } from "@/platform/auth/permissions";
import { ROLE_LABELS } from "@/platform/auth/roles";
import { ROLE_IDS } from "@/platform/auth/types";
import { Page, PageHead } from "@/admin/ui/Page";
import { Panel } from "@/admin/ui/Panel";
import { Table, Th, RowActions } from "@/admin/ui/Table";
import { Pill, type PillTone } from "@/admin/ui/Pill";
import { Avatar, Empty, DemoTag } from "@/admin/ui/Feedback";
import { Stat } from "@/admin/ui/Data";
import { ListControls, PaginationControl } from "@/admin/ui/ListControls";
import { parseListQuery, param } from "@/admin/data/query";
import { listPendingApprovals, listUsers, userStats, userStatusCounts } from "@/admin/administration/data";
import { InviteUserButton, PendingApprovals, UserRowMenu } from "@/admin/administration/AdministrationClient";

export const metadata: Metadata = { title: "Users" };

const ROLE_PILL: Record<string, PillTone> = { super_admin: "dark" };
const STATUS_PILL: Record<string, { tone: PillTone; label: string }> = {
  active: { tone: "active", label: "Active" },
  disabled: { tone: "disabled", label: "Disabled" },
  invited: { tone: "pending", label: "Invited" },
};

const initialsOf = (name: string) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export default async function UsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requirePermission("users", "view");
  const canEdit = hasPermission(session, "users", "full");
  const sp = await searchParams;
  const query = parseListQuery(sp);
  const result = listUsers({ ...query, role: param(sp, "role") });
  const stats = userStats();
  const counts = userStatusCounts();
  const approvals = listPendingApprovals();

  const tabs = [
    { key: "all", label: "All", count: counts.all ?? 0 },
    { key: "active", label: "Active", count: counts.active ?? 0 },
    { key: "disabled", label: "Disabled", count: counts.disabled ?? 0 },
    { key: "invited", label: "Invited", count: counts.invited ?? 0 },
  ];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § H · 04 · Administration · Users <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Users"
        lede="Staff accounts with access to the Nayokan Admin. Adding, disabling and role changes are all audited and require Super Admin authorisation."
        actions={
          canEdit ? (
            <>
              <a className="ax-btn ax-btn--soft" href="/admin/admin/users?status=invited" title="Review pending invitations">Bulk invite</a>
              <InviteUserButton />
            </>
          ) : undefined
        }
      />

      <div className="ax-grid ax-grid-4" style={{ marginBottom: 20 }}>
        <Stat label="Total users" value={stats.total} delta={`${stats.active} active · ${stats.disabled} disabled`} />
        <Stat label="Super admins" value={stats.superAdmins} delta="Dual approval enabled" />
        <Stat label="2FA coverage" value={`${stats.twoFaCoverage}%`} delta="Active accounts enrolled" tone="up" />
        <Stat label="Stale sessions" value={stats.stale} delta="Not active in 30 days" tone={stats.stale > 0 ? "attn" : undefined} />
      </div>

      {canEdit && <PendingApprovals approvals={approvals} sessionName={session.fullName} />}

      <Panel>
        <ListControls
          tabs={tabs}
          activeTab={query.status ?? "all"}
          searchPlaceholder="Search users…"
          filters={[
            {
              key: "role",
              label: "Role",
              options: [{ value: "", label: "Any" }, ...ROLE_IDS.map((r) => ({ value: r, label: ROLE_LABELS[r] }))],
            },
          ]}
        />

        <Table>
          <thead>
            <tr>
              <Th style={{ width: "24%" }}>User</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>2FA</Th>
              <Th>Last active</Th>
              <Th style={{ width: 60 }} />
            </tr>
          </thead>
          <tbody>
            {result.rows.map((u) => {
              const disabled = u.status === "disabled";
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {disabled ? (
                        <span className="ax-avatar" style={{ background: "var(--ws-3)", color: "var(--text-3)" }}>{initialsOf(u.name)}</span>
                      ) : (
                        <Avatar initials={initialsOf(u.name)} />
                      )}
                      <div>
                        <div className="ax-table__title" style={disabled ? { color: "var(--text-3)" } : undefined}>
                          {u.name} {u.provenance.isDemo && <DemoTag />}
                        </div>
                        <span className="ax-table__sub">{u.sub}</span>
                      </div>
                    </div>
                  </td>
                  <td className={disabled ? "is-mono ax-mute" : "is-mono"}>{u.email}</td>
                  <td><Pill tone={ROLE_PILL[u.role] ?? "info"}>{ROLE_LABELS[u.role]}</Pill></td>
                  <td><Pill tone={STATUS_PILL[u.status].tone}>{STATUS_PILL[u.status].label}</Pill></td>
                  <td className={disabled ? "is-mono ax-mute" : "is-mono"}>
                    {u.twoFaEnrolled ? <span style={{ color: "var(--success-ink)" }}>● Enrolled</span> : "—"}
                  </td>
                  <td className={disabled ? "is-mono ax-mute" : "is-mono"}>{u.lastActiveLabel}</td>
                  <td>
                    {canEdit && (
                      <RowActions>
                        <UserRowMenu user={u} sessionName={session.fullName} />
                      </RowActions>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        {result.rows.length === 0 && <Empty title="No users match" lede="Adjust the status tab, role filter or search." />}
        <PaginationControl from={result.from} to={result.to} total={result.total} noun="users" page={result.page} pages={Math.ceil(result.total / result.pageSize)} />
      </Panel>
    </Page>
  );
}

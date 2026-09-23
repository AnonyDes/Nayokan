import type { Metadata } from "next";
import { requireAdminSession } from "@/platform/auth/session";
import { Page, PageHead } from "@/admin/ui/Page";
import { Panel } from "@/admin/ui/Panel";
import { Empty, DemoTag } from "@/admin/ui/Feedback";
import { ListControls } from "@/admin/ui/ListControls";
import { param } from "@/admin/data/query";
import { listNotifications, notificationCounts } from "@/admin/workspace/data";
import { MarkAllReadButton, NotificationRow } from "@/admin/workspace/WorkspaceClient";
import type { NotificationTab } from "@/admin/workspace/types";
import "@/admin/workspace/workspace.css";

export const metadata: Metadata = { title: "Notifications" };

const VALID_TABS: NotificationTab[] = ["all", "unread", "mention", "approval", "system"];

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminSession();
  const sp = await searchParams;
  const tab = (VALID_TABS.includes(param(sp, "status") as NotificationTab) ? param(sp, "status") : "all") as NotificationTab;
  const rows = listNotifications(tab);
  const counts = notificationCounts();

  const tabs = [
    { key: "all", label: "All", count: counts.all ?? 0 },
    { key: "unread", label: "Unread", count: counts.unread ?? 0 },
    { key: "mention", label: "Mentions", count: counts.mention ?? 0 },
    { key: "approval", label: "Approvals", count: counts.approval ?? 0 },
    { key: "system", label: "System", count: counts.system ?? 0 },
  ];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § A · 04 · Notifications <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Notifications"
        lede={
          <>
            Every workflow event that involves you or your role. Configure delivery in{" "}
            <a href="/admin/admin/settings#notifications" style={{ color: "var(--info-ink)", textDecoration: "underline" }}>
              Settings · Notifications
            </a>
            .
          </>
        }
        actions={
          <>
            <MarkAllReadButton />
            <a className="ax-btn ax-btn--soft" href="/admin/admin/settings#notifications">Preferences</a>
          </>
        }
      />

      <Panel>
        <ListControls tabs={tabs} activeTab={tab} />
        {rows.length === 0 ? (
          <Empty title="Nothing here" lede="You're all caught up — no notifications in this view." />
        ) : (
          <div>
            {rows.map((n) => (
              <NotificationRow key={n.id} n={n} />
            ))}
          </div>
        )}
      </Panel>
    </Page>
  );
}

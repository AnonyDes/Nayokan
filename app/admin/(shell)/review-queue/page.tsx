import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminSession } from "@/platform/auth/session";
import { getSiteFilter } from "@/admin/shell/AdminShell";
import { Page, PageHead } from "@/admin/ui/Page";
import { Pill } from "@/admin/ui/Pill";
import { Empty, DemoTag } from "@/admin/ui/Feedback";
import { Notice } from "@/admin/ui/Notice";
import { buttonClassName } from "@/admin/ui/Button";
import { param, siteFromParams } from "@/admin/data/query";
import { listReviewQueue, queueStats } from "@/admin/publishing/data";
import { QueueSecondary } from "@/admin/publishing/PublishingClient";
import type { ReviewQueueItem } from "@/admin/publishing/types";
import "@/admin/publishing/publishing.css";

export const metadata: Metadata = { title: "Review queue" };

function hrefWith(sp: Record<string, string | string[] | undefined>, patch: Record<string, string | null>): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const one = Array.isArray(v) ? v[0] : v;
    if (one) next.set(k, one);
  }
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) next.delete(k);
    else next.set(k, v);
  }
  const qs = next.toString();
  return `/admin/review-queue${qs ? `?${qs}` : ""}`;
}

function QueueCard({ item, sessionName }: { item: ReviewQueueItem; sessionName: string }) {
  const assigned =
    item.assignedTo === sessionName ? " · assigned to you" : item.assignedTo ? ` · assigned to ${item.assignedTo}` : " · leadership review";
  return (
    <div className="rq-card">
      <div>
        <div className="rq-card__type">
          <Pill tone="dark">{item.kindLabel}</Pill> Submitted by <strong style={{ color: "var(--ink)" }}>{item.submittedBy}</strong>
          {assigned}
        </div>
        <div className="rq-card__title">{item.title}</div>
        <div className="rq-card__excerpt">{item.excerpt}</div>
        <div className="rq-card__meta">
          {item.meta.map((m) => (
            <span key={m.label}>
              {m.label} <strong className={m.tone ? `tone-${m.tone}` : undefined}>{m.value}</strong>
            </span>
          ))}
        </div>
      </div>
      <div className="rq-card__actions">
        <div className={`rq-card__aging${item.aging === "stale" ? " is-stale" : item.aging === "fresh" ? " is-fresh" : ""}`}>
          {item.waitingLabel} · {item.aging}
        </div>
        <Link href={item.href} className={buttonClassName("primary")} style={{ justifyContent: "center" }}>
          Open for review
        </Link>
        <QueueSecondary item={item} />
      </div>
    </div>
  );
}

export default async function ReviewQueuePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireAdminSession();
  const sp = await searchParams;
  const site = siteFromParams(sp) ?? (await getSiteFilter());
  const scope = param(sp, "scope") === "all" ? "all" : "mine";
  const sort = param(sp, "sort") === "oldest" ? "oldest" : "queue";
  const items = listReviewQueue({ sessionName: session.fullName, scope, sort, site });
  const stats = queueStats(items);

  return (
    <Page>
      <PageHead
        eyebrow={
          <>
            § H · 01 · Governance · Review queue <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Review queue"
        lede="Content awaiting your review. Only items assigned to you or flagged as leadership-review appear here. Older items are highlighted."
        actions={
          <>
            <Link href={hrefWith(sp, { sort: sort === "oldest" ? null : "oldest" })} className={buttonClassName("soft")}>
              {sort === "oldest" ? "Sort · queue order" : "Sort · oldest first"}
            </Link>
            <Link href={hrefWith(sp, { scope: scope === "all" ? null : "all" })} className={buttonClassName("soft")}>
              {scope === "all" ? "My queue" : "All items"}
            </Link>
          </>
        }
      />

      <div style={{ marginBottom: 20 }}>
        {stats.stale > 0 ? (
          <Notice tone="warn" title={`${stats.assigned} items assigned to you · ${stats.stale} older than 72h`}>
            Items in review for more than 72 hours are surfaced to leadership. Please review or reassign to avoid blocking authors.
          </Notice>
        ) : (
          <Notice tone="soft" title="Queue is fresh">
            No item has waited more than 72 hours.
          </Notice>
        )}
      </div>

      <div>
        {items.length === 0 ? (
          <Empty title="Nothing awaiting review" lede="Items submitted for review — articles, stories, metrics and programme drafts — appear here." />
        ) : (
          items.map((item) => <QueueCard key={item.id} item={item} sessionName={session.fullName} />)
        )}
      </div>
    </Page>
  );
}

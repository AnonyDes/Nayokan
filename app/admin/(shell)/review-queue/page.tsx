import Link from "next/link";
import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, WorldTag, Notice } from "@/admin/components/kit";
import "@/admin/styles/pages/review-queue.css";

export const metadata = { title: "Review queue" };
export const dynamic = "force-dynamic";

const TABLES = [
  { table: "articles", type: "Article", titleCol: "title", subCol: "excerpt" },
  { table: "pages", type: "Page", titleCol: "title", subCol: "path" },
  { table: "programmes", type: "Programme", titleCol: "name", subCol: "summary" },
  { table: "stories", type: "Story", titleCol: "title", subCol: "excerpt" },
  { table: "opportunities", type: "Opportunity", titleCol: "title", subCol: "category" },
] as const;

export default async function ReviewQueuePage() {
  const supabase = await createServerReadClient();

  const results = await Promise.all(
    TABLES.map(async ({ table, type, titleCol, subCol }) => {
      const { data } = await supabase
        .from(table)
        .select(`id,site,world,status,submitted_at,updated_at,${titleCol},${subCol}`)
        .in("status", ["in_review", "changes_requested"])
        .order("submitted_at", { ascending: true })
        .limit(20);
      return (data ?? []).map((raw) => {
        const row = raw as Record<string, unknown>;
        return {
        id: String(row.id),
        table,
        type,
        title: String(row[titleCol] ?? "Untitled"),
        sub: String(row[subCol] ?? ""),
        world: (row.world as string) ?? (row.site as string),
        status: String(row.status),
        waiting: row.submitted_at ? Date.now() - new Date(String(row.submitted_at)).getTime() : null,
      };
      });
    }),
  );

  const items = results.flat().sort((a, b) => (b.waiting ?? 0) - (a.waiting ?? 0));
  const stale = items.filter((i) => (i.waiting ?? 0) > 72 * 3600e3).length;

  const ageLabel = (ms: number | null) => {
    if (ms == null) return "—";
    const h = Math.floor(ms / 3600e3);
    return h >= 48 ? `${Math.floor(h / 24)}d` : `${h}h`;
  };

  return (
    <div className="ax-page">
      <PageHead
        eyebrow="§ H · 01 · Governance · Review queue"
        title="Review queue"
        lede="Content awaiting review. Older items are highlighted."
      />

      {stale > 0 && (
        <Notice kind="warn" title={`${stale} item${stale > 1 ? "s" : ""} older than 72h`}>
          Items in review for more than 72 hours are surfaced to leadership.
        </Notice>
      )}

      {items.map((item) => (
        <div className="rq-card" key={`${item.table}-${item.id}`}>
          <div>
            <div className="rq-card__type">
              <span className="ax-pill ax-pill--dark">{item.type}</span>
              <WorldTag world={item.world} />
            </div>
            <div className="rq-card__title">{item.title}</div>
            <div className="rq-card__excerpt">{item.sub}</div>
            <div className="rq-card__meta">
              <span>Status <strong>{item.status.replace(/_/g, " ")}</strong></span>
              <span>Waiting <strong>{ageLabel(item.waiting)}</strong></span>
            </div>
          </div>
          <div className="rq-card__actions">
            <div className="rq-card__aging">{ageLabel(item.waiting)}</div>
            <Link href={`/admin/${item.table}`} className="ax-btn ax-btn--primary" style={{ justifyContent: "center" }}>
              Open
            </Link>
          </div>
        </div>
      ))}

      {!items.length && (
        <div className="ax-panel"><div className="ax-panel__body">
          <div className="ax-empty">
            <div className="ax-empty__title">Queue is clear</div>
            <div className="ax-empty__lede">Nothing is waiting for review right now.</div>
          </div>
        </div></div>
      )}
    </div>
  );
}

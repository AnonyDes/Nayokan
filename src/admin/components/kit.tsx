import type { ReactNode } from "react";
import Link from "next/link";

// Shared admin primitives mapped to Designs/admin ax-* classes.

export function PageHead({
  eyebrow,
  title,
  lede,
  actions,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="ax-page__head">
      <div className="ax-page__title-block">
        {eyebrow && <div className="ax-page__eyebrow">{eyebrow}</div>}
        <h1 className="ax-page__title">{title}</h1>
        {lede && <p className="ax-page__lede">{lede}</p>}
      </div>
      {actions && <div className="ax-page__actions">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  num,
  actions,
  flush,
  children,
  foot,
}: {
  title?: ReactNode;
  num?: string;
  actions?: ReactNode;
  flush?: boolean;
  children: ReactNode;
  foot?: ReactNode;
}) {
  return (
    <div className="ax-panel">
      {title !== undefined && (
        <div className="ax-panel__head">
          <div className="ax-panel__title">
            {num && <span className="ax-panel__title-num">{num} ·</span>} {title}
          </div>
          {actions}
        </div>
      )}
      <div className={flush ? "ax-panel__body--flush" : "ax-panel__body"}>{children}</div>
      {foot && <div className="ax-panel__foot">{foot}</div>}
    </div>
  );
}

const PILL_MAP: Record<string, string> = {
  draft: "draft",
  in_review: "review",
  changes_requested: "needs",
  approved: "approved",
  scheduled: "scheduled",
  published: "published",
  archived: "archived",
  new: "open",
  under_review: "review",
  shortlisted: "pending",
  accepted: "approved",
  rejected: "rejected",
  withdrawn: "neutral",
  assigned: "info",
  in_progress: "in-progress",
  resolved: "verified",
  open: "open",
  closed: "closed",
  active: "active",
  inactive: "inactive",
  verified: "verified",
  unverified: "needs",
  pending: "pending",
  failed: "failed",
  expired: "expired",
  live: "live",
  upcoming: "upcoming",
  closing: "closing",
  disabled: "disabled",
};

export function StatusPill({ status, label }: { status: string; label?: string }) {
  const cls = PILL_MAP[status] ?? "neutral";
  return <span className={`ax-pill ax-pill--${cls}`}>{label ?? status.replace(/_/g, " ")}</span>;
}

export function Pill({ kind, children }: { kind: string; children: ReactNode }) {
  return <span className={`ax-pill ax-pill--${kind}`}>{children}</span>;
}

export function DataTable({
  head,
  rows,
  empty = "No records.",
}: {
  head: ReactNode[];
  rows: ReactNode[][];
  empty?: string;
}) {
  return (
    <table className="ax-table">
      <thead>
        <tr>
          {head.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={head.length}>
              <div className="ax-empty" style={{ padding: "24px 0" }}>
                <div className="ax-empty__title">{empty}</div>
              </div>
            </td>
          </tr>
        ) : (
          rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export function CellTitle({ title, sub, href }: { title: string; sub?: string; href?: string }) {
  const t = (
    <>
      <div className="ax-table__title">{title}</div>
      {sub && <div className="ax-table__sub">{sub}</div>}
    </>
  );
  return href ? <Link href={href}>{t}</Link> : t;
}

export function Empty({ title, lede }: { title: string; lede?: string }) {
  return (
    <div className="ax-empty">
      <div className="ax-empty__title">{title}</div>
      {lede && <div className="ax-empty__lede">{lede}</div>}
    </div>
  );
}

export function fmtDate(v: string | null | undefined) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const WORLD_CLASS: Record<string, string> = {
  vti: "ax-world--vti",
  startup: "ax-world--sc",
  vc: "ax-world--vc",
  venture_capital: "ax-world--vc",
  hospitality: "ax-world--hos",
  corporate: "",
};
const WORLD_LABEL: Record<string, string> = {
  vti: "VTI",
  startup: "Startup",
  vc: "VC",
  venture_capital: "VC",
  hospitality: "Hospitality",
  corporate: "Corporate",
};

export function WorldTag({ world, site }: { world?: string | null; site?: string | null }) {
  const key = (world || site || "").toLowerCase();
  return <span className={`ax-world ${WORLD_CLASS[key] ?? ""}`}>{WORLD_LABEL[key] ?? (world || site || "All worlds")}</span>;
}

export function FilterTabs({
  base,
  param = "status",
  current,
  tabs,
}: {
  base: string;
  param?: string;
  current: string;
  tabs: { key: string; label: string; count?: number }[];
}) {
  return (
    <div className="ax-tabs">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.key === "all" ? base : `${base}?${param}=${t.key}`}
          className={`ax-tabs__tab${current === t.key ? " is-active" : ""}`}
        >
          {t.label}
          {t.count !== undefined && <span className="ax-tabs__count">{t.count}</span>}
        </Link>
      ))}
    </div>
  );
}

export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return <span className="ax-avatar">{initials || "—"}</span>;
}

export function Notice({ kind, title, children }: { kind: string; title?: string; children?: ReactNode }) {
  return (
    <div className={`ax-notice ax-notice--${kind}`} style={{ marginBottom: 20 }}>
      <div>
        {title && <div className="ax-notice__title">{title}</div>}
        {children}
      </div>
    </div>
  );
}

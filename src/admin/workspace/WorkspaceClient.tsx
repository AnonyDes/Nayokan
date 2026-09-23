"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/admin/ui/Button";
import { markAllRead, markRead } from "./actions";
import type { AdminNotification } from "./types";

/** "Mark all read" page action. */
export function MarkAllReadButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button variant="soft" disabled={pending} onClick={() => startTransition(async () => { await markAllRead(); router.refresh(); })}>
      Mark all read
    </Button>
  );
}

/** One notification row — clicking marks it read, then follows its link. */
export function NotificationRow({ n }: { n: AdminNotification }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="ws-notif"
      style={n.unread ? { background: "var(--ws)" } : undefined}
      onClick={() =>
        startTransition(async () => {
          if (n.unread) await markRead({ id: n.id });
          if (n.href) router.push(n.href);
          else router.refresh();
        })
      }
    >
      <span
        style={{ width: 8, height: 8, borderRadius: "50%", background: n.unread ? "var(--green)" : "transparent" }}
        aria-label={n.unread ? "Unread" : "Read"}
      />
      <span className="ax-mono ax-mute" style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", textAlign: "left" }}>
        {n.label}
      </span>
      <span style={{ fontSize: 13.5, fontWeight: n.unread ? 600 : 500, color: "var(--ink)", textAlign: "left" }}>{n.message}</span>
      <span className="ax-mono ax-mute" style={{ fontSize: 10.5 }}>{n.ago}</span>
    </button>
  );
}

/** Big search input (search.html .ax-search) — writes ?q= on Enter/submit. */
export function SearchBox({ initial }: { initial: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const submit = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value.trim()) next.set("q", value.trim());
    else next.delete("q");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`));
  };

  return (
    <form
      className="ax-search"
      style={{ width: "100%", padding: "12px 16px", height: "auto", maxWidth: 720, marginBottom: 20 }}
      onSubmit={(e) => {
        e.preventDefault();
        submit(new FormData(e.currentTarget).get("q")?.toString() ?? "");
      }}
      role="search"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input name="q" type="text" defaultValue={initial} placeholder="Search pages, articles, programmes, people…" style={{ fontSize: 15 }} aria-label="Global search" />
      <span className="ax-search__kbd">Esc</span>
    </form>
  );
}

/** Kind filter pills (search.html) — writes ?kind=. */
export function KindFilters({ counts, total, active }: { counts: Record<string, number>; total: number; active: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const go = (kind: string) => {
    const next = new URLSearchParams(params.toString());
    if (kind === "all") next.delete("kind");
    else next.set("kind", kind);
    startTransition(() => router.replace(`${pathname}?${next.toString()}`));
  };
  const kinds = Object.keys(counts).filter((k) => counts[k] > 0);
  if (kinds.length === 0 && active === "all") return null;
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
      <button className={`ax-filter${active === "all" ? " is-active" : ""}`} onClick={() => go("all")}>
        <span className="ax-filter__value">All results · {total}</span>
      </button>
      {kinds.map((k) => (
        <button key={k} className={`ax-filter${active === k ? " is-active" : ""}`} onClick={() => go(k)}>
          <span className="ax-filter__value">{PLURAL[k] ?? `${k}s`} · {counts[k]}</span>
        </button>
      ))}
    </div>
  );
}

const PLURAL: Record<string, string> = {
  Page: "Pages",
  Article: "Articles",
  Story: "Stories",
  Programme: "Programmes",
  Opportunity: "Opportunities",
  Application: "Applications",
  Person: "People",
  Partner: "Partners",
  Venture: "Ventures",
  Property: "Properties",
  Metric: "Metrics",
  Evidence: "Evidence",
  Media: "Media",
  Enquiry: "Enquiries",
};

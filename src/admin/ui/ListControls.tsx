"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Toolbar, Tabs, FilterButton, InlineSearch, type TabItem } from "./Toolbar";
import { Select } from "./Data";

/**
 * URL-driven pagination footer. Server components render this with the
 * already-computed range; it writes ?page= like the rest of ListControls.
 */
export function PaginationControl({ from, to, total, noun, page, pages }: {
  from: number;
  to: number;
  total: number;
  noun: string;
  page: number;
  pages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const go = (n: number) => {
    const next = new URLSearchParams(params.toString());
    if (n <= 1) next.delete("page");
    else next.set("page", String(n));
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  return (
    <div className="ax-pagination">
      <div>
        Showing{" "}
        <strong style={{ color: "var(--ink)" }}>
          {total === 0 ? 0 : `${from} – ${to}`}
        </strong>{" "}
        of {total} {noun}
      </div>
      {pages > 1 && (
        <div className="ax-pagination__pages">
          <button disabled={page <= 1} onClick={() => go(page - 1)} aria-label="Previous page">
            ‹
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button key={n} className={n === page ? "is-active" : ""} onClick={() => go(n)} aria-current={n === page ? "page" : undefined}>
              {n}
            </button>
          ))}
          <button disabled={page >= pages} onClick={() => go(page + 1)} aria-label="Next page">
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export interface FilterSpec {
  /** searchParams key, e.g. "world". */
  key: string;
  label: string;
  /** First option should be the "any" value; value "" clears the param. */
  options: { value: string; label: string }[];
}

/**
 * URL-driven list toolbar: status tabs, inline search, select filters.
 * Writes ?status=&q=&<filter>= into the URL so Server Components do the
 * actual filtering (and the state is shareable). Existing params — notably
 * ?site= from nav links — are preserved.
 */
export function ListControls({ tabs, activeTab = "all", searchPlaceholder, filters }: {
  tabs?: TabItem[];
  activeTab?: string;
  searchPlaceholder?: string;
  filters?: FilterSpec[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === "" || value === "all") next.delete(key);
      else next.set(key, value);
      if (key !== "page") next.delete("page"); // any filter change resets paging
      startTransition(() => router.replace(`${pathname}?${next.toString()}`));
    },
    [params, pathname, router],
  );

  const current = (key: string) => params.get(key) ?? "";

  return (
    <Toolbar>
      {tabs && <Tabs items={tabs} active={activeTab} onChange={(k) => setParam("status", k)} />}
      <div style={{ flex: 1 }} />
      {searchPlaceholder && (
        <InlineSearch
          placeholder={searchPlaceholder}
          defaultValue={current("q")}
          onChange={(e) => setParam("q", e.target.value)}
          aria-label={searchPlaceholder}
        />
      )}
      {filters?.map((f) =>
        f.options.length > 2 ? (
          <Select
            key={f.key}
            value={current(f.key)}
            onChange={(e) => setParam(f.key, e.target.value)}
            aria-label={`Filter by ${f.label}`}
            style={{ width: "auto", height: 32 }}
          >
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {f.label}: {o.label}
              </option>
            ))}
          </Select>
        ) : (
          <FilterButton key={f.key} label={f.label} value={f.options.find((o) => o.value === current(f.key))?.label ?? f.options[0].label} />
        ),
      )}
    </Toolbar>
  );
}

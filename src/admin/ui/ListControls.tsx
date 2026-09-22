"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Toolbar, Tabs, FilterButton, InlineSearch, type TabItem } from "./Toolbar";
import { Select } from "./Data";

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

"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

// Toolbar row that sits above every list table: status tabs on the left,
// inline search + filter dropdowns on the right (handoff.html § 03).

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="ax-toolbar">{children}</div>;
}

export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

/** Status tabs — client component because selection drives URL/search params. */
export function Tabs({ items, active, onChange }: { items: TabItem[]; active: string; onChange: (key: string) => void }) {
  return (
    <div className="ax-tabs" role="tablist">
      {items.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={t.key === active}
          className={`ax-tabs__tab${t.key === active ? " is-active" : ""}`}
          onClick={() => onChange(t.key)}
        >
          {t.label}
          {t.count !== undefined && <span className="ax-tabs__count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** Dropdown-styled filter button (label + current value + chevron). */
export function FilterButton({ label, value, active, onClick }: { label: string; value: string; active?: boolean; onClick?: () => void }) {
  return (
    <button className={`ax-filter${active ? " is-active" : ""}`} onClick={onClick} aria-haspopup="listbox">
      <span className="ax-filter__label">{label}</span>
      <span className="ax-filter__value">{value}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

export function InlineSearch(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="ax-inline-search">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input type="search" {...props} />
    </div>
  );
}

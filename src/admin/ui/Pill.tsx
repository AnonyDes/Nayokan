import type { ReactNode } from "react";

// Status vocabulary from design-system.html § 03 / handoff.html § 02. Every
// status pairs colour + label + dot — never colour alone (WCAG 2.2 AA).
export type PillTone =
  | "published"
  | "verified"
  | "approved"
  | "active"
  | "open"
  | "live"
  | "draft"
  | "pending"
  | "review"
  | "needs"
  | "closing"
  | "scheduled"
  | "upcoming"
  | "in-progress"
  | "rejected"
  | "failed"
  | "expired"
  | "closed"
  | "critical"
  | "archived"
  | "disabled"
  | "inactive"
  | "neutral"
  | "info"
  | "dark";

export function Pill({ tone, children }: { tone: PillTone; children: ReactNode }) {
  return <span className={`ax-pill ax-pill--${tone}`}>{children}</span>;
}

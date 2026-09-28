import type { ReactNode } from "react";

// Neutral public note for a slot that genuinely needs real data before it can
// be shown (see platform/content/governance.ts). Use sparingly: when a field
// is optional, hide it instead.
export function Pending({ children = "Details coming soon", onDark = false }: { children?: ReactNode; onDark?: boolean }) {
  return <span className={`pending-note${onDark ? " on-dark" : ""}`}>{children}</span>;
}

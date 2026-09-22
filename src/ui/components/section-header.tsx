import type { ReactNode } from "react";

// Shared `.section-header` — eyebrow + h2 on the left, lede on the right.
export function SectionHeader({
  num,
  title,
  lead,
  onDark = false,
}: {
  num: string;
  title: ReactNode;
  lead?: ReactNode;
  onDark?: boolean;
}) {
  return (
    <header className="section-header">
      <div>
        <span className={`meta-num${onDark ? " on-dark" : ""}`}>{num}</span>
        <h2 className={onDark ? "on-dark" : undefined}>{title}</h2>
      </div>
      {lead && <p className={`lead${onDark ? " on-dark" : ""}`}>{lead}</p>}
    </header>
  );
}

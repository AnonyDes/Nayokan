import type { ReactNode } from "react";

// Shared `.section-header` — h2 on the left, lede on the right. `num` stays
// in the props (call sites still pass a "§ NN — Title" string) but is
// deliberately not rendered: that internal-document-style numbering read as
// CMS scaffolding, not site copy.
export function SectionHeader({
  title,
  lead,
  onDark = false,
}: {
  num?: string;
  title: ReactNode;
  lead?: ReactNode;
  onDark?: boolean;
}) {
  return (
    <header className={`section-header${onDark ? " on-dark" : ""}`}>
      <div>
        <h2 className={onDark ? "on-dark" : undefined}>{title}</h2>
      </div>
      {lead && <p className={`lead${onDark ? " on-dark" : ""}`}>{lead}</p>}
    </header>
  );
}

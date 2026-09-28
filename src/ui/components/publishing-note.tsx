import type { ReactNode } from "react";

// Editorial stand-in for a listing whose records are not yet cleared for
// publication (unconfirmed names, consent pending). It explains what will
// appear and why, and routes the reader on. It never shows placeholder
// records: see platform/content/governance.ts.
export function PublishingNote({
  eyebrow = "Published with consent",
  title,
  children,
  actions,
  onDark = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  onDark?: boolean;
}) {
  return (
    <div className={`publishing-note${onDark ? " on-dark" : ""}`}>
      <span className="publishing-note-eyebrow">{eyebrow}</span>
      <h3 className="publishing-note-title">{title}</h3>
      {children && <div className="publishing-note-body">{children}</div>}
      {actions && <div className="publishing-note-actions">{actions}</div>}
    </div>
  );
}

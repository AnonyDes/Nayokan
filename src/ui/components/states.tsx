import type { ReactNode } from "react";

// Empty / loading / error + full-page status blocks (phase3b designs).

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="state-empty">
      <span className="state-icon" aria-hidden="true">∅</span>
      <h4>{title}</h4>
      {children && <p>{children}</p>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="state-error" role="alert">
      <span className="state-icon" aria-hidden="true">!</span>
      <h4>{title}</h4>
      {children && <p>{children}</p>}
    </div>
  );
}

export function StatusBlock({
  kind,
  title,
  children,
  refCode,
  actions,
}: {
  kind: "ok" | "fail" | "loading";
  title: string;
  children?: ReactNode;
  refCode?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="status-block">
      <span className={`status-mark ${kind}`} aria-hidden="true">
        {kind === "ok" ? "✓" : kind === "fail" ? "!" : ""}
      </span>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
      {refCode && <div className="status-ref">{refCode}</div>}
      {actions && <div className="status-actions">{actions}</div>}
    </div>
  );
}

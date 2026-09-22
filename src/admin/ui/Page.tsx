import type { ReactNode } from "react";

type Width = "default" | "wide" | "narrow";

/** ax-page wrapper — wide for dense tables, narrow for single-column forms. */
export function Page({ width, children }: { width?: Width; children: ReactNode }) {
  const mod = width === "wide" ? " ax-page--wide" : width === "narrow" ? " ax-page--narrow" : "";
  return <div className={`ax-page${mod}`}>{children}</div>;
}

/** Page header block: mono eyebrow, title, lede, right-aligned actions. */
export function PageHead({ eyebrow, title, lede, actions }: { eyebrow?: ReactNode; title: ReactNode; lede?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="ax-page__head">
      <div className="ax-page__title-block">
        {eyebrow && <div className="ax-page__eyebrow">{eyebrow}</div>}
        <h1 className="ax-page__title">{title}</h1>
        {lede && <p className="ax-page__lede">{lede}</p>}
      </div>
      {actions && <div className="ax-page__actions">{actions}</div>}
    </div>
  );
}

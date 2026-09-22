import type { ReactNode } from "react";

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`ax-panel${className ? ` ${className}` : ""}`}>{children}</div>;
}

export function PanelHead({ title, titleNum, actions }: { title: ReactNode; titleNum?: string; actions?: ReactNode }) {
  return (
    <div className="ax-panel__head">
      <div className="ax-panel__title">
        {titleNum && <span className="ax-panel__title-num">{titleNum}</span>}
        {title}
      </div>
      {actions}
    </div>
  );
}

export function PanelBody({ children, flush }: { children: ReactNode; flush?: boolean }) {
  return <div className={flush ? "ax-panel__body--flush" : "ax-panel__body"}>{children}</div>;
}

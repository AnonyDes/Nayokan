import type { CSSProperties, ReactNode } from "react";

export function Panel({ children, className, id, style }: { children: ReactNode; className?: string; id?: string; style?: CSSProperties }) {
  return (
    <div id={id} style={style} className={`ax-panel${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
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

export function PanelBody({ children, flush, className }: { children: ReactNode; flush?: boolean; className?: string }) {
  return <div className={`${flush ? "ax-panel__body--flush" : "ax-panel__body"}${className ? ` ${className}` : ""}`}>{children}</div>;
}

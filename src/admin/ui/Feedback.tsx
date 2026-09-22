import type { CSSProperties, ReactNode } from "react";

/** Empty state (states.html): icon, title, lede, optional action. */
export function Empty({ icon, title, lede, action }: { icon?: ReactNode; title: string; lede?: ReactNode; action?: ReactNode }) {
  return (
    <div className="ax-empty">
      {icon && (
        <div className="ax-empty__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="ax-empty__title">{title}</div>
      {lede && <div className="ax-empty__lede">{lede}</div>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}

/** Skeleton placeholder block — pass width/height via style or a modifier. */
export function Skeleton({ variant, style }: { variant?: "block" | "lg" | "xl"; style?: CSSProperties }) {
  const mod = variant ? ` ax-skeleton--${variant}` : "";
  return <div className={`ax-skeleton${mod}`} style={style} aria-hidden="true" />;
}

/** Initials avatar. */
export function Avatar({ initials, size }: { initials: string; size?: "md" | "lg" }) {
  const mod = size ? ` ax-avatar--${size}` : "";
  return <span className={`ax-avatar${mod}`}>{initials}</span>;
}

/** ax-tag — removable label chip (omit onRemove for a static tag). */
export function Tag({ children, onRemove }: { children: ReactNode; onRemove?: () => void }) {
  return (
    <span className="ax-tag">
      {children}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label="Remove tag">
          ×
        </button>
      )}
    </span>
  );
}

/** ax-demo-tag — marks demo/unconfirmed content inside titles. */
export function DemoTag({ children = "Demo" }: { children?: ReactNode }) {
  return <span className="ax-demo-tag">{children}</span>;
}

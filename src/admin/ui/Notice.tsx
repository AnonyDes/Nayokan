import type { ReactNode } from "react";

type Tone = "warn" | "danger" | "success" | "info" | "soft";

const ICONS: Record<Tone, ReactNode> = {
  warn: (
    <svg viewBox="0 0 24 24">
      <path d="M12 3 2 20h20z" />
      <path d="M12 10v4M12 17.5v.5" />
    </svg>
  ),
  danger: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9 9 15M9 9l6 6" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 24 24">
      <path d="m5 13 4 4L19 7" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 15.5v.5" />
    </svg>
  ),
  soft: (
    <svg viewBox="0 0 24 24">
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
};

export function Notice({ tone, title, children }: { tone: Tone; title?: ReactNode; children: ReactNode }) {
  return (
    <div className={`ax-notice ax-notice--${tone}`}>
      <span className="ax-notice__icon" aria-hidden="true">
        {ICONS[tone]}
      </span>
      <div className="ax-notice__body">
        {title && <div className="ax-notice__title">{title}</div>}
        {children}
      </div>
    </div>
  );
}

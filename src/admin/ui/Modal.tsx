"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Tone = "warn" | "info";

const ICONS: Record<Tone, ReactNode> = {
  warn: (
    <svg viewBox="0 0 24 24">
      <path d="M12 3 2 20h20z" />
      <path d="M12 10v4M12 17.5v.5" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 15.5v.5" />
    </svg>
  ),
};

/**
 * Confirmation modal (states.html): scrim + ax-modal with icon, title, body
 * copy and footer buttons. Renders nothing when closed. Focus moves to the
 * dialog on open and Escape dismisses — restrained, no motion beyond the CSS.
 */
export function Modal({ open, tone = "info", icon, title, children, footer, onClose }: {
  open: boolean;
  tone?: Tone;
  /** Override icon (e.g. the danger ✕ or lock glyph from states.html). */
  icon?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ax-modal-scrim" onClick={onClose}>
      <div
        ref={ref}
        className="ax-modal"
        role="alertdialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ax-modal__head">
          <div className={`ax-modal__icon${tone === "warn" ? " ax-modal__icon--warn" : ""}`}>{icon ?? ICONS[tone]}</div>
          <div className="ax-modal__title">{title}</div>
        </div>
        {children && <div className="ax-modal__body">{children}</div>}
        {footer && <div className="ax-modal__foot">{footer}</div>}
      </div>
    </div>
  );
}

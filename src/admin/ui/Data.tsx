import type { CSSProperties, ReactNode, SelectHTMLAttributes } from "react";

/** ax-select wrapper. */
export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`ax-select${className ? ` ${className}` : ""}`} {...rest}>
      {children}
    </select>
  );
}

/** Pagination footer: range summary + page buttons. */
export function Pagination({ from, to, total, noun, page, pages, onPage }: {
  from: number;
  to: number;
  total: number;
  noun: string;
  page: number;
  pages: number;
  onPage?: (page: number) => void;
}) {
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  return (
    <div className="ax-pagination">
      <div>
        Showing{" "}
        <strong style={{ color: "var(--ink)" }}>
          {total === 0 ? 0 : `${from} – ${to}`}
        </strong>{" "}
        of {total} {noun}
      </div>
      {pages > 1 && (
        <div className="ax-pagination__pages">
          <button disabled={page <= 1} onClick={() => onPage?.(page - 1)} aria-label="Previous page">
            ‹
          </button>
          {nums.map((n) => (
            <button key={n} className={n === page ? "is-active" : ""} onClick={() => onPage?.(n)} aria-current={n === page ? "page" : undefined}>
              {n}
            </button>
          ))}
          <button disabled={page >= pages} onClick={() => onPage?.(page + 1)} aria-label="Next page">
            ›
          </button>
        </div>
      )}
    </div>
  );
}

/** ax-stat summary block. */
export function Stat({ label, value, delta, tone }: { label: ReactNode; value: ReactNode; delta?: ReactNode; tone?: "up" | "attn" }) {
  return (
    <div className="ax-stat">
      <div className="ax-stat__label">{label}</div>
      <div className="ax-stat__value">{value}</div>
      {delta && <div className={`ax-stat__delta${tone ? ` ax-stat__delta--${tone}` : ""}`}>{delta}</div>}
    </div>
  );
}

/** ax-progress bar with tone variants. */
export function Progress({ value, tone }: { value: number; tone?: "warn" | "green" | "danger" }) {
  return (
    <div className="ax-progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={`ax-progress__bar${tone ? ` ax-progress__bar--${tone}` : ""}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

/** Image slot placeholder — editors use it as the media-picker target. */
export function ImgSlot({ label, variant, style }: { label: ReactNode; variant?: "sq" | "wide" | "tall" | "sm"; style?: CSSProperties }) {
  const mod = variant ? ` ax-imgslot--${variant}` : "";
  return (
    <div className={`ax-imgslot${mod}`} style={style}>
      {label}
    </div>
  );
}

type WorldVariant = "vti" | "sc" | "vc" | "hos";

/** World chip — pairs a world glyph with its label (never colour alone). */
export function WorldTag({ world, children }: { world?: WorldVariant; children: ReactNode }) {
  return <span className={`ax-world${world ? ` ax-world--${world}` : ""}`}>{children}</span>;
}

/** Two-column editor row: title + hint on the left, controls on the right. */
export function FormRow({ title, hint, children }: { title: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="ax-form-row">
      <div className="ax-form-row__head">
        <div className="ax-form-row__title">{title}</div>
        {hint && <div className="ax-form-row__hint">{hint}</div>}
      </div>
      <div className="ax-form-row__body">{children}</div>
    </div>
  );
}

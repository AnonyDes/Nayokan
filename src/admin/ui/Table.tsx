import type { ReactNode, ThHTMLAttributes } from "react";

// ax-table ports. Tables stay semantic (<table>/<th scope>) — row-level
// checkboxes use ax-check spans per the design; selection wiring lives in
// the list pages that need it.

export function Table({ children }: { children: ReactNode }) {
  return (
    <table className="ax-table">
      {children}
    </table>
  );
}

export function Th({ className, children, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={className} {...rest}>
      {children}
    </th>
  );
}

/** Stacked title + muted sub-line cell content (title/subtitle pairs). */
export function CellTitle({ title, sub }: { title: ReactNode; sub?: ReactNode }) {
  return (
    <>
      <span className="ax-table__title">{title}</span>
      {sub && <span className="ax-table__sub">{sub}</span>}
    </>
  );
}

/** Row-level overflow actions container. */
export function RowActions({ children }: { children: ReactNode }) {
  return <div className="ax-table__row-actions">{children}</div>;
}

import type { ReactNode } from "react";

// Content-governance marker. Renders the design `.placeholder-tag` ("[tbc]")
// for any field whose value is not confirmed by Nayokan. Never hide it.
export function Tbc({ children = "tbc", onDark = false }: { children?: ReactNode; onDark?: boolean }) {
  return <span className={`placeholder-tag${onDark ? " on-dark" : ""}`}>{children}</span>;
}

/** True when `field` is listed in the record's unconfirmedFields. */
export function isTbc(provenance: { unconfirmedFields?: string[] } | undefined, field: string): boolean {
  return !!provenance?.unconfirmedFields?.includes(field);
}

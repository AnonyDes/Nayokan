import type { Provenance } from "./types";

// Content governance for the public sites. A field the record lists in
// `provenance.unconfirmedFields` is not verified by Nayokan, so it is never
// shown as fact: pages hide it (or the whole element), and only fall back to
// a neutral <Pending> note where a section genuinely needs the slot.
// Editorial notation such as "[tbc]" is never rendered publicly.

type WithUnconfirmed = Pick<Provenance, "unconfirmedFields"> | undefined;

/** True when `field` is listed in the record's unconfirmedFields. */
export function isUnconfirmed(provenance: WithUnconfirmed, field: string): boolean {
  return !!provenance?.unconfirmedFields?.includes(field);
}

/** The value only when it exists and is confirmed; otherwise undefined. */
export function confirmedValue<T>(provenance: WithUnconfirmed, field: string, value: T | null | undefined): T | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  return isUnconfirmed(provenance, field) ? undefined : value;
}

/** Records whose `field` is confirmed, e.g. partners whose name may be published. */
export function onlyConfirmed<T extends { provenance: Provenance }>(records: T[], field: string): T[] {
  return records.filter((r) => !isUnconfirmed(r.provenance, field));
}

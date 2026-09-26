import { Tbc } from "@/ui/components/tbc";

// Structured metadata row (duration, location, format…). Shows only what the
// record states. A missing value renders CONTENT TO BE CONFIRMED; a value the
// record marks as unconfirmed renders with a "tbc" tag. Never a default.

export interface MetaRailItem {
  label: string;
  value?: string;
  unconfirmed?: boolean;
}

export function MetaRail({ items }: { items: MetaRailItem[] }) {
  return (
    <dl className="meta-rail">
      {items.map((it) => (
        <div key={it.label}>
          <dt>{it.label}</dt>
          {it.value ? (
            <dd>
              {it.value} {it.unconfirmed && <Tbc />}
            </dd>
          ) : (
            <dd className="is-tbc">Content to be confirmed</dd>
          )}
        </div>
      ))}
    </dl>
  );
}

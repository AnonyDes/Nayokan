// Structured metadata row (duration, location, format…). Shows only what the
// record states and Nayokan has confirmed: a missing or unconfirmed value
// drops its row entirely, and an empty rail renders nothing. Never a default.

export interface MetaRailItem {
  label: string;
  value?: string;
  unconfirmed?: boolean;
}

export function MetaRail({ items }: { items: MetaRailItem[] }) {
  const shown = items.filter((it) => it.value && !it.unconfirmed);
  if (shown.length === 0) return null;
  return (
    <dl className="meta-rail">
      {shown.map((it) => (
        <div key={it.label}>
          <dt>{it.label}</dt>
          <dd>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

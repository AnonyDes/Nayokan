import type { PublicMetric } from "@/platform/content/types";
import { CountUp } from "@/ui/components/count-up";
import { Tbc } from "@/ui/components/tbc";

// Impact metric rendering — governance rule: value is null unless verified.
// Unverified → em-dash + "figure to be confirmed". Verified → count-up.

export function ImpactCell({ metric, index }: { metric: PublicMetric; index: number }) {
  return (
    <div className="impact-cell">
      <span className="meta">
        {String(index + 1).padStart(2, "0")} · {metric.label}
      </span>
      {metric.verified && metric.value !== null ? (
        <CountUp value={metric.value} className="impact-num" />
      ) : (
        <div className="impact-num impact-num-tbc">—</div>
      )}
      {!metric.verified && (
        <div className="impact-plus">
          <Tbc>figure to be confirmed</Tbc>
        </div>
      )}
      {metric.description && <p className="impact-desc">{metric.description}</p>}
    </div>
  );
}

export function BigMetric({ metric, index, sub }: { metric: PublicMetric; index: number; sub?: string }) {
  return (
    <div className="big-metric">
      <div>
        <span className="meta">
          {String(index + 1).padStart(2, "0")} · {sub ?? metric.label}
        </span>
      </div>
      {metric.verified && metric.value !== null ? (
        <CountUp value={metric.value} className="num-huge" />
      ) : (
        <div className="num-huge num-tbc">—</div>
      )}
      <div className="num-plus">
        {metric.label} · <Tbc>figure to be confirmed</Tbc>
      </div>
      {metric.sourceLabel && <h4>{metric.sourceLabel}</h4>}
      {metric.description && <p>{metric.description}</p>}
    </div>
  );
}

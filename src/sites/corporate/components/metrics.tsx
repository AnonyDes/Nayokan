import type { PublicMetric } from "@/platform/content/types";
import { CountUp } from "@/ui/components/count-up";
import { Pending } from "@/ui/components/pending";

// Impact metric rendering — governance rule: value is null unless verified.
// Unverified → no number at all, a quiet rule and "Published once verified".
// Verified → count-up. An unverified figure is never shown as confirmed.

function isPublished(metric: PublicMetric): metric is PublicMetric & { value: number } {
  return metric.verified && metric.value !== null;
}

export function ImpactCell({ metric, index }: { metric: PublicMetric; index: number }) {
  return (
    <div className={`impact-cell${isPublished(metric) ? "" : " is-pending"}`}>
      <span className="meta">
        {String(index + 1).padStart(2, "0")} · {metric.label}
      </span>
      {isPublished(metric) ? (
        <CountUp value={metric.value} className="impact-num" />
      ) : (
        <div className="impact-num impact-num-pending">
          <span className="impact-pending-rule" aria-hidden="true" />
          <Pending>Published once verified</Pending>
        </div>
      )}
      {metric.description && <p className="impact-desc">{metric.description}</p>}
    </div>
  );
}

export function BigMetric({ metric, index, sub }: { metric: PublicMetric; index: number; sub?: string }) {
  return (
    <div className={`big-metric${isPublished(metric) ? "" : " is-pending"}`}>
      <div>
        <span className="meta">
          {String(index + 1).padStart(2, "0")} · {sub ?? metric.label}
        </span>
      </div>
      {isPublished(metric) ? (
        <CountUp value={metric.value} className="num-huge" />
      ) : (
        <div className="num-huge num-pending">
          <span className="impact-pending-rule" aria-hidden="true" />
          <Pending>Published once verified</Pending>
        </div>
      )}
      <div className="num-plus">{metric.label}</div>
      {metric.sourceLabel && <h4>{metric.sourceLabel}</h4>}
      {metric.description && <p>{metric.description}</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Property } from "@/platform/content/types";
import { Tbc } from "@/ui/components/tbc";
import { MediaSlot } from "@/ui/components/media-slot";

// Property card grid with type filter (hospitality-properties.html).
const MONO = { fontFamily: "var(--font-mono)" } as const;

export function PropertyGrid({ properties }: { properties: Property[] }) {
  const types = [...new Set(properties.map((p) => p.type).filter((t): t is string => Boolean(t)))];
  const [type, setType] = useState<string | null>(null);
  const visible = type ? properties.filter((p) => p.type === type) : properties;

  return (
    <>
      <div className="filter-bar">
        <span className="fb-label">Property type</span>
        <button className={`chip${!type ? " on" : ""}`} aria-pressed={!type} onClick={() => setType(null)}>
          All <span className="count">{properties.length}</span>
        </button>
        {types.map((t) => (
          <button key={t} className={`chip${type === t ? " on" : ""}`} aria-pressed={type === t} onClick={() => setType(type === t ? null : t)}>
            {t}
          </button>
        ))}
        <span style={{ marginLeft: "auto", ...MONO, fontSize: "0.72rem", letterSpacing: "0.14em", color: "var(--muted)", textTransform: "uppercase" }}>
          Location · Yaoundé
        </span>
      </div>

      <div className="pgrid">
        {visible.map((p) => (
          <article className="pcard" key={p.id} style={{ gridColumn: "span 1", minHeight: "auto", padding: 0 }}>
            <MediaSlot slot="property" media={p.gallery[0]} ratio="3:2" tone="sand" variant="compact" />
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 12, borderBottom: "1px solid var(--line)", marginBottom: 12 }}>
                <span style={{ ...MONO, fontSize: "0.72rem", color: "var(--muted)", letterSpacing: "0.14em" }}>{p.code}</span>
                <span style={{ ...MONO, fontSize: "0.7rem", color: "var(--green-deep)", letterSpacing: "0.14em" }}>● Available</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                {p.name}
              </h3>
              <p style={{ color: "var(--muted)", fontSize: "0.92rem", marginTop: 10, lineHeight: 1.55 }}>{p.summary}</p>
              <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 4 }}>
                {p.amenities.map((a) => (
                  <span key={a} style={{ ...MONO, fontSize: "0.66rem", letterSpacing: "0.12em", color: "var(--muted)", padding: "3px 8px", border: "1px solid var(--line)", textTransform: "uppercase" }}>
                    {a}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <span className="meta">From</span>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.01em" }}>
                    —<Tbc>rate tbc</Tbc>
                  </div>
                </div>
                <a href={`/hospitality/properties/${p.slug}`} className="link-inline">
                  Property details <span className="arrow">→</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

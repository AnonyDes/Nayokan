"use client";

import { useState } from "react";
import type { Property } from "@/platform/content/types";
import { Tbc } from "@/ui/components/tbc";

// Property card grid with type filter (hospitality-properties.html).
const MONO = { fontFamily: "var(--font-mono)" } as const;

function CardArt({ code, location, i }: { code: string; location: string; i: number }) {
  return (
    <div style={{ height: 200, background: "linear-gradient(135deg, var(--bone-2) 0%, var(--bone) 100%)", position: "relative", display: "flex", alignItems: "flex-end", padding: 20, overflow: "hidden" }}>
      <div aria-hidden="true" style={{ position: "absolute", top: 24, left: 24, ...MONO, fontSize: "0.7rem", letterSpacing: "0.14em", color: "var(--muted)", textTransform: "uppercase" }}>
        {code} · Photo tbc
      </div>
      <svg aria-hidden="true" viewBox="0 0 400 200" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <defs>
          <pattern id={`hp${i}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(10,10,10,0.05)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="200" fill={`url(#hp${i})`} />
        <g fill="none" stroke="rgba(10,10,10,0.35)" strokeWidth="1">
          <path d="M40 160 Q 40 90 100 90 Q 160 90 160 160 Z" />
          <path d="M180 160 Q 180 90 240 90 Q 300 90 300 160 Z" />
          <path d="M320 160 Q 320 110 360 110 Q 400 110 400 160" />
        </g>
      </svg>
      <div style={{ position: "relative", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.02em", color: "var(--ink)" }}>
        {location}
      </div>
    </div>
  );
}

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
        {visible.map((p, i) => (
          <article className="pcard" key={p.id} style={{ gridColumn: "span 1", minHeight: "auto", padding: 0 }}>
            <CardArt code={p.code ?? "P/—"} location={p.location ?? "Yaoundé"} i={i} />
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

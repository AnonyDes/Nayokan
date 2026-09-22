import type { ReactNode } from "react";
import { siteUrl } from "@/platform/sites/registry";

// Related-worlds strip + final CTA band, shared by corporate pages.

export function RelatedStrip({
  title = "Continue through the ecosystem",
  items,
}: {
  title?: string;
  items: { meta: string; label: string; href: string }[];
}) {
  return (
    <section className="related">
      <div className="wrap">
        <h3>{title}</h3>
        <div className="related-grid">
          {items.map((it) => (
            <a key={it.label} href={it.href} className="related-card">
              <span className="meta">{it.meta}</span>
              <h4>{it.label}</h4>
              <span className="arrow">→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBand({
  sec,
  title,
  lede,
  primary,
  secondary,
  contact,
}: {
  sec: string;
  title: ReactNode;
  lede: ReactNode;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  contact?: ReactNode;
}) {
  return (
    <section className="cta section bg-ink" id="cta">
      <div className="wrap">
        <div className="cta-grid">
          <div className="cta-left">
            <span className="meta on-dark">{sec}</span>
            <h2 className="on-dark cta-title">{title}</h2>
          </div>
          <div className="cta-right">
            <p className="lead on-dark" style={{ color: "var(--muted-invert)", marginBottom: 32 }}>
              {lede}
            </p>
            <div className="hero-actions">
              <a href={primary.href} className="btn btn-accent">
                {primary.label} <span className="arrow">→</span>
              </a>
              {secondary && (
                <a href={secondary.href} className="btn btn-ghost on-dark">
                  {secondary.label}
                </a>
              )}
            </div>
            {contact && <div className="cta-contact">{contact}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

export const WORLD_LINKS = {
  vti: { meta: "World 01", label: "Vocational Training Institute", href: siteUrl("vti") },
  startup: { meta: "World 02", label: "Startup Centre", href: siteUrl("startup") },
  vc: { meta: "World 03", label: "Venture Capital", href: "/venture-capital" },
  hospitality: { meta: "World 04", label: "Hospitality", href: "/hospitality" },
};

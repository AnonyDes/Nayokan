import type { ReactNode } from "react";
import { Reveal } from "@/ui/components/reveal";

// Corporate hero variants — ports of the design header patterns:
//   CorpHero  → `.corp-hero` (institutional subpages: what-we-do, about, contact…)
//   SubHero   → `.sub-hero` (world subpages: vc-*, properties, programme detail)
//   WorldHero → `.world-hero` (world landing pages: venture-capital, hospitality)
//   WorldLocator → `.world-locator` (six-stage position strip)

export interface Crumb {
  label: string;
  href?: string;
}

export function Crumbs() {
  return null;
}

export function CorpHero({ title, lede }: { sec?: string; crumbs?: Crumb[]; title: ReactNode; lede: ReactNode }) {
  return (
    <section className="corp-hero">
      <div className="corp-hero-inner">
        <div>
          <h1 className="corp-hero-title">{title}</h1>
          <p className="corp-hero-lede">{lede}</p>
        </div>
      </div>
    </section>
  );
}

export function SubHero({
  title,
  lede,
}: {
  sec?: string;
  crumbs?: Crumb[];
  title: ReactNode;
  lede: ReactNode;
}) {
  return (
    <section className="sub-hero">
      <div className="sub-hero-inner">
        <div className="sub-hero-body">
          <h1>{title}</h1>
          <p className="lede">{lede}</p>
        </div>
      </div>
    </section>
  );
}

export function WorldHero({
  title,
  lede,
  actions,
  figure,
}: {
  crumbs?: Crumb[];
  title: ReactNode;
  lede: ReactNode;
  actions?: ReactNode;
  figure?: ReactNode;
}) {
  return (
    <section className="world-hero">
      <div className="world-hero-inner">
        <div className="world-hero-left">
          <h1 className="world-hero-title reveal d2">{title}</h1>
          <p className="world-hero-lede reveal d3">{lede}</p>
          {actions && <div className="world-hero-actions reveal d4">{actions}</div>}
        </div>
        <Reveal className="world-hero-right" delay={2}>
          {figure}
        </Reveal>
      </div>
    </section>
  );
}

const SYSTEM_STAGES = ["Capability", "Production", "Markets", "Innovation", "Capital", "Assets"];

export function WorldLocator({ on }: { on: number[] }) {
  return (
    <section className="world-locator">
      <div className="world-locator-inner">
        <span>System position ·</span>
        <div className="world-locator-stages">
          {SYSTEM_STAGES.map((s, i) => (
            <span key={s} className={`world-locator-stage${on.includes(i + 1) ? " on" : ""}`}>
              {String(i + 1).padStart(2, "0")} {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

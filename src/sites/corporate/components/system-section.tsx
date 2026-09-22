"use client";

import { useEffect, useRef } from "react";

// Nayokan System — signature sticky horizontal scroll section.
// Direct port of Designs/scripts/system-scroll.js: the outer section is
// stretched to n*90vh+100vh, the inner wrap is position:sticky, and scroll
// progress drives the track translateX + active stage + progress bar.
// On <=900px or prefers-reduced-motion the CSS renders a static vertical
// list and this effect does nothing (JS no-ops when .system-stage-wrap is
// not sticky).
const STAGES = [
  {
    num: "01",
    title: "Build Capability",
    desc: "Develop practical skills, entrepreneurial capacity and productive knowledge — the foundation of any productive system.",
    tag: "Vocational Training Institute",
  },
  {
    num: "02",
    title: "Organize Production",
    desc: "Convert capability into productive activity through clusters, enterprises and structured production.",
    tag: "VTI · Startup Centre",
  },
  {
    num: "03",
    title: "Create Demand",
    desc: "Connect production to real markets, customers and demand pathways — locally and beyond.",
    tag: "Startup Centre · Hospitality",
  },
  {
    num: "04",
    title: "Commercialize Innovation",
    desc: "Move research, ideas and innovation toward validated products, ventures and adoption at scale.",
    tag: "Startup Centre",
  },
  {
    num: "05",
    title: "Mobilize Capital",
    desc: "Create pathways to investment readiness, funding and financial resources for enterprises with growth potential.",
    tag: "Venture Capital",
  },
  {
    num: "06",
    title: "Build Productive Assets",
    desc: "Develop long-term productive infrastructure — properties, hospitality assets, and platforms of enduring value.",
    tag: "Hospitality",
  },
];

export function SystemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const idxRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!section || !wrap || !track) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stages = Array.from(track.querySelectorAll<HTMLElement>(".system-stage"));
    const n = stages.length;

    // Mobile + reduced motion: static vertical list, no pinning.
    const isStatic = () =>
      reduced || window.matchMedia("(max-width: 900px)").matches;

    const applyHeight = () => {
      if (isStatic()) {
        section.style.height = "";
        return;
      }
      section.style.height = `calc(${n * 90}vh + 100vh)`;
    };
    applyHeight();

    let ticking = false;
    const onScroll = () => {
      if (ticking || isStatic()) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const total = section.offsetHeight - window.innerHeight;
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        const p = total > 0 ? scrolled / total : 0;

        if (barRef.current) barRef.current.style.width = `${p * 100}%`;

        const active = Math.min(n - 1, Math.floor(p * n * 0.999));
        stages.forEach((s, i) => s.classList.toggle("active", i === active));
        if (idxRef.current) idxRef.current.textContent = String(active + 1).padStart(2, "0");

        const stageW = stages[0].getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(track).gap) || 32;
        const padLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
        const step = stageW + gap;
        const targetX = padLeft + step * active + stageW / 2;
        const centeredX = window.innerWidth / 2 - targetX;
        const frac = p * n - active;
        track.style.transform = `translateX(${centeredX - frac * step}px)`;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("resize", applyHeight);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("resize", applyHeight);
      section.style.height = "";
    };
  }, []);

  return (
    <section className="system bg-ink" id="what-we-do" ref={sectionRef}>
      <div className="system-header wrap">
        <div>
          <span className="meta on-dark">§ 02 — The Nayokan System</span>
          <h2 className="on-dark" style={{ marginTop: 16 }}>
            Six stages. One connected pathway.
          </h2>
        </div>
        <p className="on-dark" style={{ color: "var(--muted-invert)", maxWidth: "44ch" }}>
          Nayokan is designed as a system — each stage feeds the next, and each division operates at one
          or more points along the pathway.
        </p>
      </div>

      <div className="system-stage-wrap" ref={wrapRef}>
        <div className="system-progress" aria-hidden="true">
          <div className="system-progress-bar" ref={barRef} />
        </div>
        <div className="system-viewport">
          <div className="system-track" ref={trackRef}>
            {STAGES.map((s) => (
              <article className="system-stage" key={s.num}>
                <div className="stage-num">{s.num}</div>
                <h3 className="stage-title">{s.title}</h3>
                <p className="stage-desc">{s.desc}</p>
                <div className="stage-tag">{s.tag}</div>
              </article>
            ))}
          </div>
        </div>
        <div className="system-controls wrap">
          <div className="system-legend">
            <span className="meta on-dark" ref={idxRef}>
              01
            </span>
            <span className="meta on-dark" style={{ opacity: 0.5 }}>
              / 06
            </span>
          </div>
          <div className="system-hint">
            <span className="meta on-dark">Scroll to advance ↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}

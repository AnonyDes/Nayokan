"use client";

import { useEffect, useRef } from "react";
import { NAYOKAN_STAGES } from "@/platform/content/worlds";

// Nayokan System — signature sticky horizontal scroll section.
// Direct port of Designs/scripts/system-scroll.js: the outer section is
// stretched to n*90vh+100vh, the inner wrap is position:sticky, and scroll
// progress drives the track translateX + active stage + progress bar.
// On <=900px or prefers-reduced-motion the CSS renders a static vertical
// list and this effect does nothing (JS no-ops when .system-stage-wrap is
// not sticky).
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
          <h2 className="on-dark" style={{ marginTop: 16 }}>
            How the pieces fit together.
          </h2>
        </div>
        <p className="on-dark" style={{ color: "var(--muted-invert)", maxWidth: "44ch" }}>
          Nayokan connects training, business support, investment and hospitality in six stages.
        </p>
      </div>

      <div className="system-stage-wrap" ref={wrapRef}>
        <div className="system-progress" aria-hidden="true">
          <div className="system-progress-bar" ref={barRef} />
        </div>
        <div className="system-viewport">
          <div className="system-track" ref={trackRef}>
            {NAYOKAN_STAGES.map((s) => (
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
            <span className="meta on-dark">/ 06</span>
          </div>
          <div className="system-hint">
            <span className="meta on-dark">Scroll to advance ↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}

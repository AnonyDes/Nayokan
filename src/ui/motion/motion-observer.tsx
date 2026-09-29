"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ALL_TARGETS, MOTION } from "@/ui/motion/targets";

// Client half of the scroll motion system (see targets.ts). Watches every
// target, and when a batch enters the viewport reveals it with a stagger in
// document order. State lives in `data-mo`, never in className, so React
// re-renders that change a className cannot wipe it and re-hide an element.

const settleMs = MOTION.maskMs + 300 + MOTION.staggerStepMs * MOTION.staggerCap + 100;

function reveal(el: HTMLElement, index: number) {
  const delay = Math.min(index, MOTION.staggerCap) * MOTION.staggerStepMs;
  el.style.setProperty("--mo-delay", `${delay}ms`);
  el.dataset.mo = "in";
  window.setTimeout(() => {
    el.dataset.mo = "done";
    el.style.removeProperty("--mo-delay");
  }, settleMs);
}

export function MotionObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const canAnimate =
      window.matchMedia("(prefers-reduced-motion: no-preference)").matches && "IntersectionObserver" in window;

    if (!canAnimate) {
      document.querySelectorAll<HTMLElement>(ALL_TARGETS).forEach((el) => {
        el.dataset.mo = "done";
      });
      return;
    }

    const watched = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        let index = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.unobserve(entry.target);
          reveal(entry.target as HTMLElement, index++);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );

    // Already on screen: reveal now rather than waiting for the observer's
    // first callback (which browsers defer in background tabs).
    const scan = () => {
      const fold = window.innerHeight * 0.92;
      let index = 0;
      document.querySelectorAll<HTMLElement>(ALL_TARGETS).forEach((el) => {
        if (el.dataset.mo || watched.has(el)) return;
        watched.add(el);
        const rect = el.getBoundingClientRect();
        if (rect.top < fold && rect.bottom > 0 && rect.width > 0) {
          reveal(el, index++);
        } else {
          io.observe(el);
        }
      });
    };

    scan();

    // Client-rendered lists (filters, pagination) insert new nodes later.
    let frame = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}

"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

import { usePathname } from "next/navigation";

// Global scroll reveal — ports Designs/scripts/system.js IntersectionObserver block.
// Observes all `.reveal:not(.in)` elements in the document and adds `.in` when they
// intersect the viewport (or immediately if already visible above the fold).
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px 200px 0px" },
    );

    const observeAll = () => {
      // Immediate reveal for all hero elements on any page
      document.querySelectorAll<HTMLElement>(
        ".hero .reveal, .world-hero .reveal, .corp-hero .reveal, .sub-hero .reveal"
      ).forEach((el) => {
        el.classList.add("in");
      });

      const windowHeight = window.innerHeight || 900;
      document.querySelectorAll<HTMLElement>(".reveal:not(.in)").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= windowHeight + 200) {
          el.classList.add("in");
        } else {
          io.observe(el);
        }
      });
    };

    observeAll();
    const raf = requestAnimationFrame(observeAll);
    const timer = setTimeout(observeAll, 100);

    const mo = new MutationObserver(() => {
      observeAll();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}

// Wrapper element with .reveal (+ .d1–.d4 delay)
export function Reveal({
  children,
  as: Tag = "div",
  delay,
  className = "",
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("in");
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px 50px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal${delay ? ` d${delay}` : ""}${className ? ` ${className}` : ""}`}>
      {children}
    </Tag>
  );
}

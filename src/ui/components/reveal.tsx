"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

// Scroll reveal — ports Designs/scripts/system.js IntersectionObserver block.
// Renders a wrapper element with .reveal (+ .d1–.d4 delay) and adds .in when
// it enters the viewport. Under prefers-reduced-motion the CSS forces .reveal
// fully visible, so no JS check is needed here.
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
    if (!el || !("IntersectionObserver" in window)) {
      el?.classList.add("in");
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
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
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

"use client";

import { useEffect, useState } from "react";

// Entering a new world: when a corporate link marked data-world-transition
// ("vti" | "startup") is followed, a short full-bleed wipe in that world's
// colour names the destination before the browser leaves for the sub-site.
// Plain navigation still happens (the href is untouched), so the link works
// without JavaScript. Skipped for modified clicks and reduced motion.

const WORLD_NAME: Record<string, { kicker: string; title: string }> = {
  vti: { kicker: "Entering · World 01", title: "Nayokan Vocational Training Institute" },
  startup: { kicker: "Entering · World 02", title: "Nayokan Startup Centre" },
};

const WIPE_MS = 480;

export function WorldTransition() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a[data-world-transition]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const world = a.dataset.worldTransition ?? "";
      if (!WORLD_NAME[world]) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Runs in the window capture phase, before the preview-host link
      // interceptor and React handlers, so the wipe owns this navigation.
      e.preventDefault();
      e.stopImmediatePropagation();
      const href = a.href;
      setTarget(world);
      window.setTimeout(() => window.location.assign(href), WIPE_MS);
    };
    window.addEventListener("click", onClick, { capture: true });
    // Returning via the back/forward cache must not leave the wipe on screen.
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setTarget(null);
    };
    window.addEventListener("pageshow", onShow);
    return () => {
      window.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("pageshow", onShow);
    };
  }, []);

  if (!target) return null;
  const copy = WORLD_NAME[target];
  return (
    <div className="world-transition" data-site={target} role="status" aria-live="polite">
      <div>
        <span className="world-transition-kicker">{copy.kicker}</span>
        <p className="world-transition-title">{copy.title}</p>
      </div>
    </div>
  );
}

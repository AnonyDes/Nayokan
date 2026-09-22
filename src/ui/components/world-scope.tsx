"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Sets body[data-world] from the pathname so world-scoped CSS (VC navy,
// Hospitality terracotta — Designs/styles/vc.css, hospitality.css) can theme
// the shared chrome (nav background, tokens) exactly like the body classes
// in the static design. Corporate site only hosts worlds; other sites use
// their .site-<id> class instead.
const WORLD_PREFIXES: [string, string][] = [
  ["/venture-capital", "vc"],
  ["/hospitality", "hospitality"],
];

export function WorldScope() {
  const pathname = usePathname();
  useEffect(() => {
    const world = WORLD_PREFIXES.find(([p]) => pathname.startsWith(p))?.[1];
    if (world) document.body.dataset.world = world;
    else delete document.body.dataset.world;
    return () => {
      delete document.body.dataset.world;
    };
  }, [pathname]);
  return null;
}

# Design implementation decisions

Where the design package conflicts with itself or with the brief, these rules apply.

1. **Phase 3B conventions everywhere.** The 18 Phase 3 pages lack the working mobile menu and use an older footer. All pages get the 3B nav component with the accessible mobile panel (Escape closes, focus trapped, `aria-modal`) and the v1.1 footer.
2. **Tokens.** Surfaces use the rendered design values from `Designs/styles/system.css` (`--ink #0A0A0A`, `--bone #F3F2ED`) for visual fidelity; brand tokens from the handoff (`--brand-black #000`, `--brand-soft #F3F6F3`) are also defined. See `src/ui/styles/tokens.css`.
3. **Focus rings.** The designs have none (and set `outline: none` on inputs). A 2px green `:focus-visible` ring is added globally (handoff A/08, WCAG 2.2).
4. **Nayokan System.** Desktop: sticky horizontal progression as in `system-scroll.js`, with an IntersectionObserver gate. Mobile (<900px): vertical stepper with a small step indicator (mobile.html R/02). Reduced motion: static list of all six stages, no scroll-driven movement.
5. **Count-up** runs only when the metric is verified, never under reduced motion, and the final value is always in the HTML.
6. **Language toggle** is rendered; FR is marked "coming soon" until translated content exists. When FR ships, `<html lang>` is set per route.
7. **Navigation.** Corporate: the design nav (What we do · VTI ↗ · Startup Centre ↗ · Venture Capital · Hospitality · Impact · Insights · About) + Contact CTA. VTI and Startup navs are derived from their designed pages and flagged for confirmation (see readiness report §5).
8. **Unrendered template text** in `handoff.html`, `states.html` and `data-model.html` is a prototype bug, not content.
9. **Illustrations** (Startup blueprint SVG, VC data panel, Hospitality arches) are ported as components; the VC panel shows no numbers until real, verified data exists.

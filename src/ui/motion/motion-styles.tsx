import { MASK_SELECTOR, MOTION, RISE_SELECTOR, STAGGER_SELECTOR } from "@/ui/motion/targets";

// Server-rendered hidden state for scroll motion. Lives in <head> so targets
// are hidden before first paint, never flashing visible-then-hidden while the
// client hydrates. Gated on screen + scripting + no reduced-motion preference:
// print, no-JS and reduced-motion visitors always get static, visible content.
// `data-mo` is set by MotionObserver: "in" while entering, "done" afterwards
// (so each element's own hover transitions come back once it has arrived).

const hidden = (selector: string) =>
  selector
    .split(",\n")
    .map((s) => `${s}:not([data-mo])`)
    .join(",\n");

export const MOTION_CSS = `
@media screen and (prefers-reduced-motion: no-preference) and (scripting: enabled) {
${hidden(`${RISE_SELECTOR},\n${STAGGER_SELECTOR}`)} {
  opacity: 0;
  transform: translate3d(0, 28px, 0);
  animation: mo-failsafe 0s linear ${MOTION.failsafeMs}ms forwards;
}
${hidden(MASK_SELECTOR)} {
  clip-path: inset(100% 0 0 0);
  animation: mo-failsafe 0s linear ${MOTION.failsafeMs}ms forwards;
}
${hidden(MASK_SELECTOR)
  .split(",\n")
  .map((s) => `${s} img`)
  .join(",\n")} {
  scale: 1.18;
  animation: mo-failsafe 0s linear ${MOTION.failsafeMs}ms forwards;
}
[data-mo="in"] {
  opacity: 1;
  transform: none;
  clip-path: inset(0 0 0 0);
  transition:
    opacity ${MOTION.riseMs}ms var(--mo-ease) var(--mo-delay, 0ms),
    transform ${MOTION.riseMs}ms var(--mo-ease) var(--mo-delay, 0ms),
    clip-path ${MOTION.maskMs}ms var(--mo-ease-mask) var(--mo-delay, 0ms);
}
[data-mo="in"] img {
  scale: 1;
  transition: scale ${MOTION.maskMs + 300}ms var(--mo-ease) var(--mo-delay, 0ms);
}
}
@keyframes mo-failsafe { to { opacity: 1; transform: none; clip-path: inset(0 0 0 0); scale: 1; } }
`;

export function MotionStyles() {
  return (
    <style href="nayokan-motion" precedence="default">
      {MOTION_CSS}
    </style>
  );
}

/* Nayokan — signature scroll-driven system section
   Sticky container + horizontal track advancing per scroll segment */
(function () {
  'use strict';
  const wrap = document.getElementById('systemStageWrap');
  const track = document.getElementById('systemTrack');
  const bar = document.getElementById('systemProgressBar');
  const idxLabel = document.getElementById('systemIdx');
  if (!wrap || !track) return;

  const stages = Array.from(track.querySelectorAll('.system-stage'));
  const n = stages.length;
  const section = wrap.closest('.system');

  // Make section tall enough for scroll segments
  const pinDur = n * 90; // vh per stage * n
  section.style.paddingBottom = 0;
  section.style.height = `calc(${pinDur}vh + 100vh)`;

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();
      const scrolled = Math.min(Math.max(-rect.top, 0), section.offsetHeight - window.innerHeight);
      const totalScrollable = section.offsetHeight - window.innerHeight;
      const p = totalScrollable > 0 ? scrolled / totalScrollable : 0;

      // progress bar
      if (bar) bar.style.width = (p * 100) + '%';

      // active index
      const active = Math.min(n - 1, Math.floor(p * n * 0.999));
      stages.forEach((s, i) => s.classList.toggle('active', i === active));
      if (idxLabel) idxLabel.textContent = String(active + 1).padStart(2, '0');

      // Translate track
      const stageW = stages[0].getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).gap) || 32;
      const paddingLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      const step = stageW + gap;

      // Center active stage: viewport center minus (paddingLeft + step*active + stageW/2)
      const vw = window.innerWidth;
      const targetX = paddingLeft + step * active + stageW / 2;
      const centeredX = vw / 2 - targetX;

      // Add a smooth intra-stage progress (fractional part) to feel continuous
      const frac = (p * n) - active;
      const smoothed = centeredX - frac * step;

      track.style.transform = `translateX(${smoothed}px)`;
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();

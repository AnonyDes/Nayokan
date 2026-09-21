/* Nayokan — shared runtime */
(function () {
  'use strict';

  // ---- Nav scrolled state ----
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---- Reveal on scroll ----
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  // ---- Language toggle ----
  document.querySelectorAll('.lang-toggle').forEach(t => {
    const stored = localStorage.getItem('nayokan-lang') || 'EN';
    t.querySelectorAll('button').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === stored);
      b.addEventListener('click', () => {
        t.querySelectorAll('button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        localStorage.setItem('nayokan-lang', b.dataset.lang);
      });
    });
  });

  // ---- Counter animation (Impact) ----
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        io.unobserve(el);
        const target = parseFloat(el.dataset.count);
        const dur = 1600;
        const t0 = performance.now();
        const step = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = Math.round(target * eased);
          el.textContent = val.toLocaleString();
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    counters.forEach(el => io.observe(el));
  }
})();

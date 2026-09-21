/* Nayokan — mobile nav injector.
   Injects an off-canvas panel next to every .nav bar without needing to
   edit every HTML file. The base script (system.js) handles open/close. */
(function () {
  'use strict';
  const nav = document.querySelector('.nav');
  if (!nav) return;
  if (document.querySelector('.nav-mobile-panel')) return;

  // Read primary links from the desktop nav so the panel stays in sync.
  const links = Array.from(nav.querySelectorAll('.nav-links a')).map(a => ({
    href: a.getAttribute('href'),
    text: a.textContent.trim(),
    active: a.classList.contains('active')
  }));
  const ctaEl = nav.querySelector('.nav-cta');
  const cta = ctaEl ? { href: ctaEl.getAttribute('href'), text: ctaEl.textContent.trim() } : null;

  const panel = document.createElement('aside');
  panel.className = 'nav-mobile-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Site navigation');
  panel.innerHTML = `
    <nav class="nav-mobile-links" aria-label="Primary — mobile">
      ${links.map((l, i) => `
        <a href="${l.href}" ${l.active ? 'aria-current="page"' : ''}>
          <span>${l.text}</span>
          <span class="meta">${String(i + 1).padStart(2, '0')}</span>
        </a>
      `).join('')}
    </nav>
    <div style="padding-top:24px">
      ${cta ? `<a href="${cta.href}" class="btn btn-primary" style="width:100%;justify-content:center;padding:18px 22px">${cta.text} <span class="arrow">→</span></a>` : ''}
    </div>
    <div class="nav-mobile-foot">
      <div class="lang-toggle" role="group" aria-label="Language">
        <button data-lang="EN" class="active">EN</button>
        <button data-lang="FR">FR</button>
      </div>
      <span>© Nayokan · 2026</span>
    </div>
  `;
  document.body.appendChild(panel);

  // Re-bind newly injected lang-toggle to the base handler via storage sync.
  const stored = localStorage.getItem('nayokan-lang') || 'EN';
  panel.querySelectorAll('.lang-toggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === stored);
    b.addEventListener('click', () => {
      panel.querySelectorAll('.lang-toggle button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      localStorage.setItem('nayokan-lang', b.dataset.lang);
      // sync all toggles across page
      document.querySelectorAll('.lang-toggle').forEach(t => {
        t.querySelectorAll('button').forEach(x => x.classList.toggle('active', x.dataset.lang === b.dataset.lang));
      });
    });
  });
})();

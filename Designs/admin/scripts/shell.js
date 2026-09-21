/* =========================================================================
   NAYOKAN ADMIN — Shell renderer
   Injects sidebar + topbar into every admin page.
   Each page sets: window.AX_PAGE = { section, screen, crumbs, badges }
   ========================================================================= */

(function () {
  const PAGE = window.AX_PAGE || {};
  const active = (PAGE.screen || '').toLowerCase();

  const NAV = [
    { label: 'Workspace', items: [
      { id: 'dashboard',    href: 'dashboard.html',    label: 'Dashboard',     icon: 'grid' },
      { id: 'review-queue', href: 'review-queue.html', label: 'Review queue',  icon: 'inbox', count: 4, alert: true },
      { id: 'notifications',href: 'notifications.html',label: 'Notifications', icon: 'bell' },
      { id: 'search',       href: 'search.html',       label: 'Search',        icon: 'search' }
    ]},
    { label: 'Content', items: [
      { id: 'pages',        href: 'pages.html',           label: 'Pages',              icon: 'file' },
      { id: 'articles',     href: 'articles.html',        label: 'Articles / Insights',icon: 'article', count: 24 },
      { id: 'stories',      href: 'stories.html',         label: 'Stories',            icon: 'quote' },
      { id: 'media',        href: 'media-library.html',   label: 'Media library',      icon: 'image' }
    ]},
    { label: 'Programmes', items: [
      { id: 'programmes',   href: 'programmes.html',      label: 'Programmes',      icon: 'layers' },
      { id: 'clusters',     href: 'clusters.html',        label: 'Clusters',        icon: 'hex' },
      { id: 'opportunities',href: 'opportunities.html',   label: 'Opportunities',   icon: 'star' },
      { id: 'applications', href: 'applications.html',   label: 'Applications',    icon: 'inbox-2', count: 12, alert: true }
    ]},
    { label: 'Ecosystem', items: [
      { id: 'people',       href: 'people.html',          label: 'People',          icon: 'user' },
      { id: 'mentors',      href: 'mentors.html',         label: 'Mentors',         icon: 'users' },
      { id: 'partners',     href: 'partners.html',        label: 'Partners',        icon: 'handshake' },
      { id: 'portfolio',    href: 'portfolio.html',       label: 'Portfolio',       icon: 'graph' },
      { id: 'properties',   href: 'properties.html',      label: 'Properties',      icon: 'building' }
    ]},
    { label: 'Impact', items: [
      { id: 'impact-metrics', href: 'impact-metrics.html', label: 'Impact metrics', icon: 'chart' },
      { id: 'evidence',       href: 'evidence.html',       label: 'Evidence',       icon: 'shield' },
      { id: 'impact-stories', href: 'impact-stories.html', label: 'Impact stories', icon: 'book' }
    ]},
    { label: 'Operations', items: [
      { id: 'enquiries',    href: 'enquiries.html',       label: 'Enquiries',       icon: 'mail', count: 7 }
    ]},
    { label: 'Website', items: [
      { id: 'homepage',     href: 'homepage-editor.html', label: 'Homepage',        icon: 'home' },
      { id: 'navigation',   href: 'navigation.html',      label: 'Navigation',      icon: 'sitemap' },
      { id: 'seo',          href: 'seo.html',             label: 'SEO',             icon: 'target' }
    ]},
    { label: 'Administration', items: [
      { id: 'users',        href: 'users.html',           label: 'Users',           icon: 'shield-user' },
      { id: 'roles',        href: 'roles-permissions.html', label: 'Roles & permissions', icon: 'key' },
      { id: 'audit',        href: 'audit-log.html',       label: 'Audit log',       icon: 'log' },
      { id: 'settings',     href: 'settings.html',        label: 'Settings',        icon: 'gear' }
    ]}
  ];

  // Icon library — 1.5px thin line, 16×16 viewport
  const ICONS = {
    grid:      '<rect x="3" y="3" width="7" height="7"/><rect x="3" y="13" width="7" height="7"/><rect x="13" y="3" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>',
    inbox:     '<path d="M3 13v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6"/><path d="M3 13l3-8h12l3 8"/><path d="M3 13h5l1 3h6l1-3h5"/>',
    'inbox-2':'<path d="M4 12h4l2 3h4l2-3h4"/><path d="M4 12V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6"/><path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/>',
    bell:     '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    search:   '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>',
    file:     '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
    article:  '<path d="M4 3h13a2 2 0 0 1 2 2v15l-4-3H6a2 2 0 0 1-2-2z"/><path d="M8 8h9M8 12h9M8 16h6"/>',
    quote:    '<path d="M5 8h4v4a4 4 0 0 1-4 4"/><path d="M13 8h4v4a4 4 0 0 1-4 4"/>',
    image:    '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 15-4-4-8 8"/>',
    layers:   '<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
    hex:      '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/>',
    star:     '<path d="m12 4 2.5 5 5.5.8-4 3.9.9 5.5L12 16.7 7.1 19.2 8 13.7 4 9.8l5.5-.8z"/>',
    user:     '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
    users:    '<circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="17" cy="7" r="2.5"/><path d="M22 20c0-2.5-2-4.5-5-4.5"/>',
    handshake:'<path d="M11 17 8 20a2 2 0 0 1-3-3l4-4"/><path d="m13 15 4 4a2 2 0 0 0 3-3l-6-6a2 2 0 0 0-3 0l-2 2a2 2 0 0 1-3 0L4 10"/><path d="M14 8h4l2 2"/>',
    graph:    '<path d="M4 20V6M4 20h16"/><path d="m8 16 3-4 3 2 5-7"/>',
    building: '<rect x="5" y="3" width="14" height="18"/><path d="M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1"/>',
    chart:    '<path d="M4 20V4M4 20h16"/><rect x="7"  y="12" width="3" height="6"/><rect x="12" y="8"  width="3" height="10"/><rect x="17" y="14" width="3" height="4"/>',
    shield:   '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    book:     '<path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
    mail:     '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    home:     '<path d="m4 11 8-7 8 7v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M10 21v-6h4v6"/>',
    sitemap:  '<rect x="9" y="3" width="6" height="4"/><rect x="3" y="17" width="6" height="4"/><rect x="15" y="17" width="6" height="4"/><path d="M12 7v4M6 17v-2h12v2M12 11v4"/>',
    target:   '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
    'shield-user':'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><circle cx="12" cy="10" r="2"/><path d="M8 17c0-2 1.5-3 4-3s4 1 4 3"/>',
    key:      '<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8.2-8.2m-3 3 3 3m-6 0 3 3"/>',
    log:      '<path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    gear:     '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    help:     '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 4"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/>',
    preview:  '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
    plus:     '<path d="M12 5v14M5 12h14"/>',
    check:    '<path d="m5 13 4 4L19 7"/>',
    x:        '<path d="M6 6l12 12M18 6 6 18"/>',
    chevron:  '<path d="m9 6 6 6-6 6"/>',
    'chevron-d':'<path d="m6 9 6 6 6-6"/>',
    filter:   '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>',
    warn:     '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17.5v.5"/>'
  };

  function svg(name, cls) {
    return `<svg class="${cls||''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  }

  // -------- Sidebar --------
  function renderSidebar() {
    let html = `
      <a href="admin.html" class="ax-sidebar__brand">
        <img src="../assets/logo-mark.svg" alt="" width="26" height="26">
        <div class="ax-sidebar__brand-col">
          <span class="ax-sidebar__brand-name">NAYOKAN</span>
          <span class="ax-sidebar__brand-sub">Admin · CMS</span>
        </div>
      </a>
      <div class="ax-sidebar__scroll">`;

    for (const group of NAV) {
      html += `<div class="ax-nav-group"><div class="ax-nav-group__label">${group.label}</div>`;
      for (const it of group.items) {
        const isActive = it.id === active ? ' is-active' : '';
        const count = it.count ? `<span class="ax-nav__count${it.alert ? ' is-alert' : ''}">${it.count}</span>` : '';
        html += `<a href="${it.href}" class="ax-nav__item${isActive}">
          ${svg(it.icon, 'ax-nav__icon')}
          <span class="ax-nav__label">${it.label}</span>
          ${count}
        </a>`;
      }
      html += `</div>`;
    }

    html += `</div>
      <div class="ax-sidebar__foot">
        <a href="help.html" class="ax-nav__item">${svg('help','ax-nav__icon')}<span class="ax-nav__label">Help &amp; docs</span></a>
        <div class="ax-userchip" title="Maria Ndongo · Super Admin">
          <div class="ax-userchip__av">MN</div>
          <div>
            <div class="ax-userchip__name">Maria Ndongo</div>
            <div class="ax-userchip__role">Super Admin</div>
          </div>
        </div>
      </div>`;
    return html;
  }

  // -------- Topbar --------
  function renderTopbar() {
    const crumbs = PAGE.crumbs || [];
    let crumbHtml = `<a href="admin.html">Nayokan Admin</a>`;
    crumbs.forEach((c, i) => {
      const isLast = i === crumbs.length - 1;
      crumbHtml += `<span class="ax-crumbs__sep">/</span>`;
      if (isLast) {
        crumbHtml += `<span class="ax-crumbs__current">${c.label}</span>`;
      } else if (c.href) {
        crumbHtml += `<a href="${c.href}">${c.label}</a>`;
      } else {
        crumbHtml += `<span>${c.label}</span>`;
      }
    });

    return `
      <div class="ax-crumbs">${crumbHtml}</div>
      <div class="ax-search">
        ${svg('search')}
        <input type="text" placeholder="Search articles, programmes, applications, metrics…" aria-label="Global search">
        <span class="ax-search__kbd">⌘K</span>
      </div>
      <div class="ax-topbar__actions">
        <a href="../index.html" target="_blank" class="ax-preview-btn">${svg('preview')} Preview website</a>
        <button class="ax-iconbtn" aria-label="Help">${svg('help')}</button>
        <button class="ax-iconbtn" aria-label="Notifications">${svg('bell')}<span class="ax-iconbtn__dot"></span></button>
      </div>`;
  }

  // Boot
  document.addEventListener('DOMContentLoaded', () => {
    const sb = document.querySelector('[data-shell="sidebar"]');
    const tb = document.querySelector('[data-shell="topbar"]');
    if (sb) sb.innerHTML = renderSidebar();
    if (tb) tb.innerHTML = renderTopbar();

    // Toggle interactions (checkboxes, toggles, tabs)
    document.addEventListener('click', (e) => {
      const check = e.target.closest('.ax-check');
      if (check) { check.classList.toggle('is-checked'); }
      const toggle = e.target.closest('.ax-toggle');
      if (toggle && !e.target.closest('input')) { toggle.classList.toggle('is-on'); }
      const tab = e.target.closest('.ax-tabs__tab');
      if (tab) {
        const group = tab.parentElement;
        group.querySelectorAll('.ax-tabs__tab').forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
      }
      const radio = e.target.closest('.ax-radio-group button');
      if (radio) {
        radio.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
        radio.classList.add('is-active');
      }
    });

    // Cmd/Ctrl+K -> focus search
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector('.ax-search input');
        if (input) input.focus();
      }
    });
  });
})();

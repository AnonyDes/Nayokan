"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Cta, NavItem } from "@/platform/content/types";
import { handlePreviewClick } from "@/platform/sites/preview-nav";
import { siteUrl } from "@/platform/sites/registry";
import type { SiteId } from "@/platform/sites/types";

// Site navigation — ports Designs/partials/nav.html + scripts/system.js
// (scrolled state) + scripts/mobile-nav.js (off-canvas panel), upgraded for
// WCAG 2.2: role=dialog, aria-modal, Escape, focus trap, scroll lock.
export function SiteNav({
  items,
  cta,
  homeHref = "/",
  homeLabel = "NAYOKAN",
  siteId = "corporate",
}: {
  items: NavItem[];
  cta?: Cta;
  homeHref?: string;
  homeLabel?: string;
  siteId?: SiteId;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<"EN" | "FR">("EN");
  const burgerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Restore the (visual-only) language preference, mirroring the design.
  // Async so it stays a subscription to an external store, not a render-time
  // setState (react-hooks/set-state-in-effect).
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const stored = window.localStorage.getItem("nayokan-lang");
      if (stored === "FR") setLang("FR");
    });
    return () => cancelAnimationFrame(id);
  }, []);
  const pickLang = (l: "EN" | "FR") => {
    setLang(l);
    window.localStorage.setItem("nayokan-lang", l);
  };

  const close = useCallback(() => setOpen(false), []);

  // Close the panel when the route changes (adjust-during-render pattern).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
  }

  // Lock scroll while open.
  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    if (open) {
      const first = panelRef.current?.querySelector<HTMLElement>("a, button");
      first?.focus();
    }
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  // Escape + focus trap.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        burgerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const isActive = (item: NavItem) =>
    !item.crossSite && (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));

  const langToggle = (
    <div className="lang-toggle" role="group" aria-label="Language">
      {(["EN", "FR"] as const).map((l) => (
        <button
          key={l}
          type="button"
          data-lang={l}
          className={lang === l ? "active" : ""}
          aria-pressed={lang === l}
          onClick={() => pickLang(l)}
        >
          {l}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <header className={`nav${scrolled ? " scrolled" : ""}`} role="banner">
        <div className="nav-inner">
          <a href={homeHref} className="nav-logo" aria-label="Nayokan — home" onClick={(e) => handlePreviewClick(e, homeHref)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo-mark.svg" alt="" width={34} height={34} />
            <span className="wordmark">{homeLabel}</span>
          </a>
          <nav className="nav-links" aria-label="Primary">
            {items.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`nav-link${isActive(item) ? " active" : ""}`}
                aria-current={isActive(item) ? "page" : undefined}
                onClick={(e) => handlePreviewClick(e, item.href)}
              >
                {item.label}
                {item.crossSite ? " ↗" : ""}
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            {langToggle}
            {cta && (
              <a href={cta.href} className="nav-cta" onClick={(e) => handlePreviewClick(e, cta.href)}>
                {cta.label}
              </a>
            )}
            <button
              ref={burgerRef}
              type="button"
              className="nav-burger"
              aria-label={open ? "Close menu" : "Menu"}
              aria-expanded={open}
              aria-controls="nav-mobile-panel"
              onClick={() => setOpen((v) => !v)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <aside
        ref={panelRef}
        id="nav-mobile-panel"
        className={`nav-mobile-panel${open ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!open}
        // Keep it out of the tab order and AT tree while closed.
        {...(open ? {} : { inert: true as unknown as boolean })}
      >
        <nav className="nav-mobile-links" aria-label="Primary — mobile">
          {items.map((item, i) => (
            <a
              key={item.id}
              href={item.href}
              aria-current={isActive(item) ? "page" : undefined}
              onClick={(e) => handlePreviewClick(e, item.href)}
            >
              <span>
                {item.label}
                {item.crossSite ? " ↗" : ""}
              </span>
              <span className="meta">{String(i + 1).padStart(2, "0")}</span>
            </a>
          ))}
        </nav>
        {cta && (
          <div style={{ paddingTop: 20 }}>
            <a href={cta.href} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "16px 20px" }} onClick={(e) => handlePreviewClick(e, cta.href)}>
              {cta.label} <span className="arrow">→</span>
            </a>
          </div>
        )}

        {/* Four Worlds / Ecosystem cross-navigation on mobile */}
        <div className="nav-mobile-worlds" style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
            NAYOKAN ECOSYSTEM
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "Main / Corporate", href: siteUrl("corporate", "/"), active: siteId === "corporate" },
              { label: "VTI ↗", href: siteUrl("vti", "/"), active: siteId === "vti" },
              { label: "Startup Centre ↗", href: siteUrl("startup", "/"), active: siteId === "startup" },
              { label: "Venture Capital", href: siteUrl("corporate", "/venture-capital"), active: false },
              { label: "Hospitality", href: siteUrl("corporate", "/hospitality"), active: false },
              { label: "Impact", href: siteUrl("corporate", "/impact"), active: false },
            ].map((eco) => (
              <a
                key={eco.label}
                href={eco.href}
                style={{
                  padding: "10px 12px",
                  fontSize: "0.82rem",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  background: eco.active ? "var(--ink)" : "var(--bone)",
                  color: eco.active ? "var(--paper)" : "var(--ink)",
                  borderRadius: "var(--radius)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onClick={(e) => handlePreviewClick(e, eco.href)}
              >
                {eco.label}
              </a>
            ))}
          </div>
        </div>

        <div className="nav-mobile-foot">
          {langToggle}
          <span>© Nayokan · 2026</span>
        </div>
      </aside>
    </>
  );
}

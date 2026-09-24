"use client";

import type { SiteNavigation, SiteSettings } from "@/platform/content/types";
import { handlePreviewClick } from "@/platform/sites/preview-nav";

// Site footer — ports the shared design footer (brand + columns + bottom bar).
export function SiteFooter({ nav, settings }: { nav: SiteNavigation; settings: SiteSettings }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo-mark.svg"
              alt={settings.name}
              style={{ height: 40, width: "auto", filter: "brightness(0) invert(1)" }}
            />
            <div className="footer-tag">{settings.tagline ?? settings.defaultSeo.description}</div>
          </div>
          {nav.footerColumns.map((col) => (
            <div className="footer-col" key={col.heading}>
              <h4>{col.heading}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l.id}>
                    <a href={l.href} onClick={(e) => handlePreviewClick(e, l.href)}>
                      {l.label}
                      {l.crossSite ? " ↗" : ""}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© Nayokan 2026 · Yaoundé, Cameroon</span>
          <span>Digital ecosystem · v1.0 · Working design</span>
          <span>EN · FR</span>
        </div>
      </div>
    </footer>
  );
}

"use client";

import type { SiteMapGroup } from "@/platform/sites/site-map";
import { handlePreviewClick } from "@/platform/sites/preview-nav";

// Client half of the sitemap page: link clicks need handlePreviewClick
// (single-hostname preview rewriting) and the world-entry transition data
// attribute, both of which require a client component.
export function SiteMapList({ groups }: { groups: SiteMapGroup[] }) {
  return (
    <>
      {groups.map((group) => (
        <div className="sitemap-group" key={group.heading}>
          <h2>{group.heading}</h2>
          <ol className="sitemap-list">
            {group.links.map((link) => (
              <li key={link.href}>
                <a href={link.href} data-world-transition={group.world} onClick={(e) => handlePreviewClick(e, link.href)}>
                  <span className="sitemap-link-name">
                    {link.label}
                    {group.world ? " ↗" : ""}
                  </span>
                  {link.desc && <span className="sitemap-link-desc">{link.desc}</span>}
                  <span className="sitemap-link-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </>
  );
}

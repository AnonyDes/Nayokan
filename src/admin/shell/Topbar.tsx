import { Icon } from "./icons";
import { SiteSelector, type SiteFilter } from "./SiteSelector";

export interface Crumb {
  label: string;
  href?: string;
}

export function Topbar({ crumbs, siteFilter }: { crumbs: Crumb[]; siteFilter: SiteFilter }) {
  return (
    <>
      <nav className="ax-crumbs" aria-label="Breadcrumb">
        <a href="/admin">Nayokan Admin</a>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={`${c.label}-${i}`} style={{ display: "contents" }}>
              <span className="ax-crumbs__sep">/</span>
              {isLast ? <span className="ax-crumbs__current">{c.label}</span> : c.href ? <a href={c.href}>{c.label}</a> : <span>{c.label}</span>}
            </span>
          );
        })}
      </nav>
      <SiteSelector value={siteFilter} />
      <div className="ax-search">
        <Icon name="search" />
        <input type="text" placeholder="Search articles, programmes, applications, metrics…" aria-label="Global search" />
      </div>
      <div className="ax-topbar__actions">
        <a href="/admin/help" className="ax-iconbtn" aria-label="Help">
          <Icon name="help" />
        </a>
        <a href="/admin/notifications" className="ax-iconbtn" aria-label="Notifications">
          <Icon name="bell" />
        </a>
      </div>
    </>
  );
}

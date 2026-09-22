"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV, AxIcon } from "@/admin/nav";

export function AdminSidebar({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname();
  const initials = userName
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="ax-sidebar">
      <Link href="/admin" className="ax-sidebar__brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logo-mark.svg" alt="" width={26} height={26} />
        <div className="ax-sidebar__brand-col">
          <span className="ax-sidebar__brand-name">NAYOKAN</span>
          <span className="ax-sidebar__brand-sub">Admin · CMS</span>
        </div>
      </Link>
      <div className="ax-sidebar__scroll">
        {ADMIN_NAV.map((group) => (
          <div className="ax-nav-group" key={group.label}>
            <div className="ax-nav-group__label">{group.label}</div>
            {group.items.map((item) => {
              const active =
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`ax-nav__item${active ? " is-active" : ""}`}
                >
                  <AxIcon name={item.icon} className="ax-nav__icon" />
                  <span className="ax-nav__label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
      <div className="ax-sidebar__foot">
        <Link href="/admin/help" className="ax-nav__item">
          <AxIcon name="help" className="ax-nav__icon" />
          <span className="ax-nav__label">Help &amp; docs</span>
        </Link>
        <div className="ax-userchip" title={`${userName} · ${userRole}`}>
          <div className="ax-userchip__av">{initials || "NY"}</div>
          <div>
            <div className="ax-userchip__name">{userName}</div>
            <div className="ax-userchip__role">{userRole}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

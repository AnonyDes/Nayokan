"use client";

import { usePathname } from "next/navigation";
import { signOutAction } from "@/platform/auth/actions";
import { Icon } from "./icons";
import type { NavGroup } from "./nav";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Sidebar({ groups, userName, roleLabel }: { groups: NavGroup[]; userName: string; roleLabel: string }) {
  const pathname = usePathname();

  return (
    <>
      <a href="/admin" className="ax-sidebar__brand">
        <div className="ax-sidebar__brand-col">
          <span className="ax-sidebar__brand-name">NAYOKAN</span>
          <span className="ax-sidebar__brand-sub">Admin · CMS</span>
        </div>
      </a>
      <div className="ax-sidebar__scroll">
        {groups.map((group) => (
          <div className="ax-nav-group" key={group.label}>
            <div className="ax-nav-group__label">{group.label}</div>
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href.split("?")[0]));
              return (
                <a key={item.id} href={item.href} className={`ax-nav__item${isActive ? " is-active" : ""}`}>
                  <Icon name={item.icon as never} className="ax-nav__icon" />
                  <span className="ax-nav__label">{item.label}</span>
                </a>
              );
            })}
          </div>
        ))}
      </div>
      <div className="ax-sidebar__foot">
        <a href="/admin/help" className="ax-nav__item">
          <Icon name="help" className="ax-nav__icon" />
          <span className="ax-nav__label">Help &amp; docs</span>
        </a>
        <div className="ax-userchip" title={`${userName} · ${roleLabel}`}>
          <div className="ax-userchip__av">{initials(userName)}</div>
          <div>
            <div className="ax-userchip__name">{userName}</div>
            <div className="ax-userchip__role">{roleLabel}</div>
          </div>
        </div>
        <form action={signOutAction}>
          <button type="submit" className="ax-nav__item" style={{ width: "100%" }}>
            <span className="ax-nav__label">Sign out</span>
          </button>
        </form>
      </div>
    </>
  );
}

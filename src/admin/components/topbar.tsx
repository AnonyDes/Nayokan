"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AxIcon } from "@/admin/nav";
import { SITES } from "@/platform/sites/registry";
import { signOut } from "@/platform/auth/actions";
import { useEffect, useRef } from "react";

function crumbsFor(pathname: string): string[] {
  const parts = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  return parts.map((p) => p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
}

export function AdminTopbar() {
  const pathname = usePathname();
  const crumbs = crumbsFor(pathname);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="ax-topbar">
      <div className="ax-crumbs">
        <Link href="/admin">Nayokan Admin</Link>
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: "contents" }}>
            <span className="ax-crumbs__sep">/</span>
            {i === crumbs.length - 1 ? (
              <span className="ax-crumbs__current">{c}</span>
            ) : (
              <span>{c}</span>
            )}
          </span>
        ))}
      </div>
      <div className="ax-search">
        <AxIcon name="search" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search articles, programmes, applications, metrics…"
          aria-label="Global search"
        />
        <span className="ax-search__kbd">⌘K</span>
      </div>
      <div className="ax-topbar__actions">
        <a href={SITES.corporate.origin} target="_blank" className="ax-preview-btn" rel="noreferrer">
          <AxIcon name="preview" /> Preview website
        </a>
        <button
          className="ax-iconbtn"
          aria-label="Sign out"
          title="Sign out"
          onClick={() => void signOut()}
        >
          <AxIcon name="x" />
        </button>
      </div>
    </header>
  );
}

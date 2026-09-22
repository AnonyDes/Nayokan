// Shared list-query helpers for admin list pages. Filtering happens here (in
// the mock layer today, in SQL tomorrow) so each area's data.ts exposes a
// single listAreaRows(query) seam rather than bespoke filter code.
import type { SiteFilter } from "@/admin/shell/SiteSelector";
import { isSiteId, type SiteId } from "@/platform/sites/types";

export interface ListQuery {
  site?: SiteFilter;
  status?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface Page<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  from: number;
  to: number;
}

const DEFAULT_PAGE_SIZE = 12;

/** Narrow by site — "all" or absent means no narrowing. Never authorization. */
export function filterBySite<T>(rows: T[], site: SiteFilter | undefined, siteOf: (row: T) => SiteId | SiteId[] | null): T[] {
  if (!site || site === "all") return rows;
  return rows.filter((row) => {
    const s = siteOf(row);
    return s === null ? true : Array.isArray(s) ? s.includes(site as SiteId) : s === site;
  });
}

export function filterByStatus<T>(rows: T[], status: string | undefined, statusOf: (row: T) => string): T[] {
  if (!status || status === "all") return rows;
  return rows.filter((row) => statusOf(row) === status);
}

/** Case-insensitive substring match across the given fields. */
export function filterByQuery<T>(rows: T[], q: string | undefined, fields: (row: T) => (string | null | undefined)[]): T[] {
  const needle = q?.trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter((row) => fields(row).some((f) => f?.toLowerCase().includes(needle)));
}

export function paginate<T>(rows: T[], page = 1, pageSize = DEFAULT_PAGE_SIZE): Page<T> {
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const clamped = Math.min(Math.max(1, page), pages);
  const from = (clamped - 1) * pageSize;
  return {
    rows: rows.slice(from, from + pageSize),
    total,
    page: clamped,
    pageSize,
    from: total === 0 ? 0 : from + 1,
    to: Math.min(from + pageSize, total),
  };
}

/** Parse the standard list-page searchParams into a ListQuery. */
export function parseListQuery(params: Record<string, string | string[] | undefined>): ListQuery {
  const one = (k: string) => {
    const v = params[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const page = Number.parseInt(one("page") ?? "1", 10);
  return {
    status: one("status") ?? "all",
    q: one("q") ?? "",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** First string value of a searchParam. */
export function param(params: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const v = params[key];
  return Array.isArray(v) ? v[0] : v;
}

/**
 * ?site= display filter from the URL (nav links carry it explicitly, e.g.
 * /admin/programmes?site=vti). Display narrowing only — never authorization.
 * Returns null when absent/invalid so callers fall back to the cookie filter.
 */
export function siteFromParams(params: Record<string, string | string[] | undefined>): SiteId | null {
  const v = param(params, "site");
  return isSiteId(v) ? v : null;
}

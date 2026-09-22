// MOCK persistence seam — pending Session B's schema (workstreams.md:
// supabase/**, src/platform/db/** and content/supabase/** are Session B's).
// Same pattern as dashboard/data.ts and platform/auth/directory.ts: every
// area's data.ts exposes typed getters/actions built on this store, clearly
// marked MOCK_, so the screens are demoable today and swap to real Supabase
// queries with no component changes once the tables land.
//
// The store lives on globalThis so it survives HMR in dev. It is per-process
// memory only — nothing here is real institutional data (AGENTS.md), every
// seeded record carries isDemo provenance and renders a "Demo" tag.
import "server-only";

export interface Entity {
  id: string;
}

interface StoreShape {
  collections: Map<string, Map<string, Entity>>;
  seeded: Set<string>;
}

const globalStore = globalThis as unknown as { __nayokanAdminMockStore?: StoreShape };

function store(): StoreShape {
  if (!globalStore.__nayokanAdminMockStore) {
    globalStore.__nayokanAdminMockStore = { collections: new Map(), seeded: new Set() };
  }
  return globalStore.__nayokanAdminMockStore;
}

/** Lazily seed and return a named collection's row map. */
export function collection<T extends Entity>(name: string, seed: () => T[]): Map<string, T> {
  const s = store();
  if (!s.seeded.has(name)) {
    s.collections.set(name, new Map(seed().map((row) => [row.id, row])));
    s.seeded.add(name);
  }
  return s.collections.get(name) as Map<string, T>;
}

export function mockList<T extends Entity>(name: string, seed: () => T[]): T[] {
  return [...collection(name, seed).values()];
}

export function mockGet<T extends Entity>(name: string, seed: () => T[], id: string): T | null {
  return collection(name, seed).get(id) ?? null;
}

export function mockInsert<T extends Entity>(name: string, seed: () => T[], row: T): T {
  collection(name, seed).set(row.id, row);
  return row;
}

/** Patch a row in place; returns null when the id doesn't exist. */
export function mockUpdate<T extends Entity>(name: string, seed: () => T[], id: string, patch: Partial<T>): T | null {
  const col = collection(name, seed);
  const existing = col.get(id);
  if (!existing) return null;
  const next = { ...existing, ...patch };
  col.set(id, next);
  return next;
}

export function mockRemove(name: string, id: string): boolean {
  const col = store().collections.get(name);
  return col ? col.delete(id) : false;
}

let counter = 0;
/** Collision-free ids for mock inserts (not cryptographic — display only). */
export function mockId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}

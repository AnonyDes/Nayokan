// Vitest stand-in for the "server-only" package — see vitest.config.ts's
// alias comment. Importing this has no effect, which is exactly right:
// Vitest only ever runs Node-side, so the thing "server-only" guards
// against (accidental client bundling) can't happen here anyway.
export {};

# ADR-001: Three public sites and one admin in a single Next.js app

Status: Accepted (2026-09-22)

## Context
Nayokan has three public websites on distinct hostnames — `nayokan.org` (corporate, including Venture Capital and Hospitality), `vti.nayokan.org` and `startup.nayokan.org` — plus one shared Admin/CMS. They need a shared CMS, database, authentication, design system and publishing workflow, with independent navigation, SEO, content and visual personality. The team is small and hosting is Vercel.

## Options considered
- **A. One Next.js app; `proxy.ts` rewrites each hostname into its own route tree.** One build and deploy, zero duplicated logic, one Vercel project with four domains. Sites share a release train.
- **B. Turborepo with three public apps + admin app + shared packages.** Hard isolation and independent deploys, at the cost of four Vercel projects, four env sets, package plumbing for Tailwind v4/tsconfig, and cross-app auth/preview complexity.
- **C. Next Multi-Zones.** Built for splitting paths under one domain, not hostnames; carries B's cost.

## Decision
Option A.
- `proxy.ts` resolves the hostname via `src/platform/sites/route-request.ts` and rewrites `vti.nayokan.org/programmes` to the internal route `/vti/programmes` (`app/(sites)/vti/programmes`).
- Internal prefixes are not directly reachable: the rewrite double-prefixes them (`/vti/vti/...`), which 404s.
- The admin (`app/admin`) is served only on `admin.nayokan.org`; `/admin` on any public host 404s (see ADR-004).
- Shared code: `src/platform` (data, auth, workflow, SEO, analytics) and `src/ui` (tokens, primitives). Site-only code: `src/sites/<site>`. ESLint `no-restricted-imports` forbids one site importing another and forbids shared layers importing site code.
- Non-production deployments (single `*.vercel.app` host) select a site with `?__site=<id>`, stored in a cookie. Ignored in production. Never a security input.

## Consequences
- Single build, single deploy, shared auth and preview are simple.
- All sites ship together; each site's folder boundary keeps extraction to a Turborepo app possible without rewriting logic.
- Testing is host-aware: Playwright has a project per host on `*.nayokan.localhost`.

## Revisit when
One site needs an independent release cadence or a different runtime.

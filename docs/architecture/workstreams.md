# Parallel workstreams

The build is split into three workstreams that run at the same time in separate Claude sessions, each in its own git worktree and branch. This document is the contract between them. Read it before touching files outside your area.

Integration branch: `develop` (created from the Phase 0/1 foundation). Each workstream merges into `develop` through a PR when a slice is done and green. Rebase on `develop` often.

| Workstream | Branch | Worktree | Dev port |
|---|---|---|---|
| A. Public sites | `feat/public-sites` | `D:\Nayokan-sites` | 3000 |
| B. Data layer and backend | `feat/data-layer` | `D:\Nayokan-data` | 3001 |
| C. Admin/CMS | `feat/admin` | `D:\Nayokan-admin` | 3002 |

Phases 0 and 1 (architecture docs, shared foundation) are done. Remaining phases from `readiness-report.md` §16:

| Workstream | Phases |
|---|---|
| A. Public sites | 3 Corporate site · 4 VTI site · 5 Startup Centre site · 11 (public sites: responsive, a11y, performance) |
| B. Data layer and backend | 2 Content data layer · 8 (backend: submission RPCs, uploads, notifications) · 9 (DB governance: metrics, evidence, verification chain) · 10 (workflow engine, versions, audit, pg_cron, dual approval) · 12 E2E integration QA + deployment |
| C. Admin/CMS | 6 Admin auth + shell + RBAC · 7 CMS for all three sites · 8 (admin UI: applications, enquiries) · 9 (admin UI: impact) · 10 (admin UI: review queue, version history, audit log) · 11 (admin responsive/a11y) |

Each worktree needs its own `npm install` and `.env.local` (copy `.env.example`; set the four `NEXT_PUBLIC_*_ORIGIN` values to your port, e.g. `http://vti.nayokan.localhost:3001`). Run tests with `PORT=<your port>`.

## File ownership

Only the owner edits these paths. Others open a note in `docs/architecture/change-requests.md` (or coordinate through the user) instead.

| Path | Owner |
|---|---|
| `app/(sites)/**`, `src/sites/**`, `src/ui/**` | A |
| `src/platform/content/fixtures/**` | A |
| `src/platform/seo/**`, `src/platform/analytics/**` | A |
| `e2e/corporate/**`, `e2e/vti/**`, `e2e/startup/**`, `scripts/design-compare.ts` | A |
| `supabase/**` (migrations, seeds, config) | B |
| `src/platform/supabase/types.ts` (generated) | B |
| `src/platform/content/supabase/**` | B |
| `src/platform/db/**`, `src/platform/workflow/**`, `src/platform/audit/**`, `src/platform/forms/**` (server actions + RPC callers for public submissions), `src/platform/media/**` | B |
| `test/**/*.rls.test.ts`, `vitest.rls.config.ts`, `test/helpers/rls-*` | B |
| `app/admin/**`, `src/admin/**` | C |
| `src/platform/auth/**` (session, MFA, guards, permissions) | C |
| `proxy.ts` admin branch (session refresh, login redirect) | C |
| `e2e/admin/**` | C |
| `src/platform/content/types.ts`, `src/platform/content/repository.ts` | Shared contract (see below) |
| `src/platform/sites/**`, `proxy.ts` public branches, root configs | Foundation. Change only with a note in the PR. |
| `package.json` | Anyone may add a dependency; commit it alone as `chore(deps): …` so conflicts stay trivial. |

## Shared contracts

1. **Public content contract** (`src/platform/content/types.ts` + `repository.ts`). A renders these shapes; B implements them from Supabase. Changes must be additive (new optional fields, new methods). A breaking change needs both A and B to agree and is merged in one PR.
2. **Database schema** (`supabase/migrations`). B owns it. C reads it through generated types. C requests new columns/tables/RPCs from B rather than writing migrations.
3. **Server-side domain modules** B provides for C: workflow transitions (`src/platform/workflow`), audit writer (`src/platform/audit`), media upload/signing (`src/platform/media`), permission helper SQL (`app.has_permission`). C provides `requirePermission()` in `src/platform/auth`, which B's server code may call.
4. **Public form submission**: A builds the form UI and states; B provides the server actions in `src/platform/forms` (validation schema + RPC call + site attribution). A imports them. Until B lands them, A uses the same Zod schemas with a stub action that returns the designed success/failure states.

## Non-negotiable rules (all workstreams)

- The Genspark designs in `Designs/` are the visual source of truth. Do not redesign. Do not edit `Designs/`.
- No fabricated facts: partners, people, figures, dates, portfolio companies, financials, testimonials, property availability. Demo content is marked `provenance.isDemo` and rendered with "tbc" tags. Impact metrics without verification render an em-dash and "Figure to be confirmed".
- Hostname and the admin site selector are never security boundaries. Authorization = server-side checks + RLS.
- Read `node_modules/next/dist/docs` before using Next 16 APIs (proxy, caching, metadata). This is Next 16, not the version in your training data.
- WCAG 2.2 AA, `prefers-reduced-motion`, 320px minimum width, visible focus.
- Conventional commits, one logical change per commit. Normal prose in code, comments, commits and docs.
- Before a PR: `npm run typecheck && npm run lint && npm test && npm run build`, plus the workstream's e2e/RLS suites.

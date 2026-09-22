<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses Next.js 16 (`proxy.ts`, not middleware). APIs, conventions and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Nayokan platform

One Next.js app serving three public sites and one admin, selected by hostname in `proxy.ts`:

| Host (prod / dev) | Route tree |
|---|---|
| `nayokan.org` / `nayokan.localhost:3000` | `app/(sites)/corporate` (includes Venture Capital and Hospitality) |
| `vti.nayokan.org` / `vti.nayokan.localhost:3000` | `app/(sites)/vti` |
| `startup.nayokan.org` / `startup.nayokan.localhost:3000` | `app/(sites)/startup` |
| `admin.nayokan.org` / `admin.nayokan.localhost:3000` | `app/admin` |

Start here:
- `docs/architecture/readiness-report.md`: full architecture, route maps, data model, phases.
- `docs/architecture/adr/`: decisions (multi-site app, Supabase, site vs world, admin host).
- `docs/architecture/workstreams.md`: parallel workstreams, file ownership, shared contracts. Follow it.
- `docs/architecture/design-decisions.md` and `docs/content-gaps.md`.
- `Designs/`: the approved Genspark design package. Visual source of truth. Read-only.

Rules:
- Do not redesign. Port designs into React components; never iframe or ship the static HTML.
- Never fabricate institutional facts. Demo content carries `provenance.isDemo` and renders "tbc" tags. Unverified impact metrics render an em-dash.
- Hostnames and the admin site selector are never security boundaries; authorization is server-side + RLS.
- Imports: `@/` maps to `src/`. Sites must not import other sites (`src/sites/<site>`); shared code goes to `src/ui` or `src/platform`.
- Commands: `npm run dev`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e`, `npm run build`.
- Skills in `.claude/skills` (caveman, playwright-cli, supabase, accessibility-review, seo-*, motion-design, scroll-experience, frontend-design, etc.). Use `playwright-cli` or the built-in browser to verify UI on the real hostnames.

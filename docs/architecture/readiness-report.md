# Nayokan Platform: Revised Implementation Readiness Report (multi-site)

## Context

Nayokan is a digital ecosystem, not one website. It has three public sites: corporate `nayokan.org` (which includes Venture Capital and Hospitality), VTI at `vti.nayokan.org`, and Startup Centre at `startup.nayokan.org`. One Admin/CMS manages all three, and they share Supabase, auth, RBAC, workflow, audit, media and the design system.

The repo `D:\Nayokan` has no application code. It holds the approved Genspark design package in `Designs/`: 37 public screens and 43 admin screens, plus CSS, JS and LFS photos, all present. It also has the phase docs. The three .docx specs sit in Downloads. `D:\MEMEX` is a working Next 16 + Supabase project, and I will port its patterns rather than import them.

**Confirmed decisions:**
- Backend: Supabase.
- One Next.js codebase at the repo root.
- Hosting: Vercel.
- Copy a relevant subset of the MEMEX skills.
- Corporate nav: keep the design nav, with VTI and Startup Centre as cross-site links.
- VTI and Startup navs: derive them from the designed pages. They can be edited in the CMS and are flagged for confirmation.
- Admin lives on `admin.nayokan.org`.
- Keep the corporate ecosystem `/programmes` directory.

This document is the revised report. No implementation starts until it is approved. Phase 0 writes it into the repo as docs and ADRs.

---

## 1. Final architecture

```
                    NAYOKAN PLATFORM — one Next.js 16 app, one Vercel project
                                      │ proxy.ts: hostname → site
     ┌────────────────┬───────────────┼────────────────┬─────────────────────┐
     ▼                ▼               ▼                ▼                     ▼
 nayokan.org     vti.nayokan.org  startup.nayokan.org  admin.nayokan.org   (www → apex 308)
 app/(sites)/    app/(sites)/     app/(sites)/         app/admin/
   corporate/      vti/             startup/             (shared CMS for all sites)
     │                │               │                    │
     └────────── shared: src/platform (sites registry, content repos, workflow,
                 audit, RBAC, validation, SEO, analytics, media, forms)
                 src/ui (design tokens, primitives, nav/footer shells, states)
                                      │
                         Supabase: Postgres + RLS · Auth (MFA) · Storage · pg_cron
```

## 2. Why this architecture: evaluated options (ADR-001)

| Option | Pros | Cons |
|---|---|---|
| **A. One Next.js app, hostname rewrite to per-site route trees** | One build and deploy. Zero duplicated logic. Shared auth, DB and CMS are trivial. One Vercel project with 4 domains. Each site gets its own layouts, nav, routes, SEO and theme. Cross-site links and preview are simple. | Sites share a release train. The proxy must stop internal `/corporate/...` paths from being reached directly. Bundle size is split per route anyway. |
| B. Turborepo monorepo: 3 public apps + admin app + shared packages | Hard isolation. Each site deploys on its own schedule. | 4 Vercel projects, 4 builds and env sets. Package plumbing (tsconfig, Tailwind v4 sources, transpilePackages). Auth cookie and preview complexity. Slower to iterate. Risks forking shared code. |
| C. Next Multi-Zones | Independent deploys under one domain. | Designed for path-splitting one domain, not hostnames. Adds B's cost plus zone rewrites. |

**Decision: A.** It meets all 11 criteria: one platform, no duplication, independent hostnames, SEO and nav, shared CMS and DB, and easy Vercel. Independent evolution comes from strict folder boundaries: `src/sites/<site>` owns site-only components, and `src/platform` and `src/ui` are the only shared layers.

**Escape hatch:** those boundaries follow package lines. If one site ever needs its own release cadence, `src/sites/<x>` plus `app/(sites)/<x>` can be extracted into a Turborepo app without rewriting logic. ESLint `no-restricted-imports` blocks a site from importing another site's folder.

## 3. The three public sites

Shared by all three:
- Institutional tokens: Nayokan Green #12B82A, Deep Green #08751A, Black #000, Navy #071A46, Soft Neutral #F3F6F3, White.
- Fonts: Manrope, Inter and IBM Plex Mono.
- UI primitives and forms.

Each site has:
- its own `layout.tsx`, which sets the site's theme class, nav, footer, `metadataBase` and JSON-LD `WebSite`/`Organization`;
- its own home page;
- its own sitemap and robots;
- its own analytics `site` dimension.

| Site | Host | Personality / theme source | Worlds shown |
|---|---|---|---|
| corporate | nayokan.org | Institutional, strategic. Uses `corporate.css`, `home.css` and `system.css`. VC sub-theme is navy and analytical (`vc.css`). Hospitality sub-theme is terracotta, clay and sand, refined (`hospitality.css`). | corporate, vc, hospitality |
| vti | vti.nayokan.org | Human, practical, energetic. Uses `vti.css` and `worlds.css`. | vti |
| startup | startup.nayokan.org | Experimental, entrepreneurial. Uses `startup.css` and the blueprint SVG language. | startup |

## 4. Full design-to-site mapping (every public design file)

| Design file | Site | Canonical route |
|---|---|---|
| index.html | corporate | `/` |
| what-we-do.html | corporate | `/what-we-do` |
| about.html | corporate | `/about` |
| impact.html | corporate | `/impact` |
| partners.html | corporate | `/partners` |
| insights.html | corporate | `/insights` |
| article.html | corporate | `/insights/[slug]` |
| contact.html | corporate | `/contact` |
| programmes.html (S/07 ecosystem directory) | corporate | `/programmes`. Cards link to canonical vti./startup. detail URLs. |
| venture-capital.html | corporate | `/venture-capital` |
| vc-approach.html | corporate | `/venture-capital/approach` |
| vc-pipeline.html | corporate | `/venture-capital/pipeline` |
| vc-portfolio.html | corporate | `/venture-capital/portfolio` (no detail page designed, none built) |
| vc-partner.html | corporate | `/venture-capital/partner` |
| hospitality.html | corporate | `/hospitality` |
| hospitality-properties.html | corporate | `/hospitality/properties` |
| property-detail.html | corporate | `/hospitality/properties/[slug]` (booking is an external link only) |
| vti.html | vti | `/` |
| vti-programmes.html | vti | `/programmes` |
| programme-detail.html | vti | `/programmes/[slug]` |
| vti-clusters.html | vti | `/clusters` |
| cluster-detail.html | vti | `/clusters/[slug]` |
| application.html | vti | `/apply` |
| application-success.html | vti | `/apply/success` |
| startup-centre.html | startup | `/` |
| startup-programme.html | startup | `/programme` |
| startup-commercialization.html | startup | `/commercialization` |
| startup-apply.html | startup | `/apply`. The success/failure states are inline, as designed. `/apply/success` reuses the success block for no-JS fallback. |
| startup-university-partnerships.html | startup | `/university-partnerships` |
| startup-mentors.html | startup | `/mentors` |
| startup-opportunities.html | startup | `/opportunities` |
| startup-portfolio.html | startup | `/portfolio` |
| portfolio-detail.html | startup | `/portfolio/[slug]` |
| sitemap.html, handoff.html, states.html, mobile.html | none (reference only) | none |

**Not designed but required:**
- Per-site `/privacy` and `/terms`, marked CONTENT TO BE CONFIRMED and shared from one CMS page.
- Per-site 404, built from the `states.html` patterns.

**Breadcrumbs:** the designs start them at "Nayokan / VTI / …". Keep that, with "Nayokan" as a cross-site link to nayokan.org.

**Legacy redirects** (308, in proxy, static config):
- `nayokan.org/vocational-training/*` → `vti.nayokan.org/*`
- `nayokan.org/startup-centre/*` → `startup.nayokan.org/*`

## 5. Route maps

**Corporate (nayokan.org)** has 17 routes:
- `/`, `/what-we-do`, `/about`, `/impact`, `/partners`
- `/insights`, `/insights/[slug]`, `/contact`, `/programmes`
- `/venture-capital`, `/venture-capital/{approach,pipeline,portfolio,partner}`
- `/hospitality`, `/hospitality/properties`, `/hospitality/properties/[slug]`
- plus `/privacy`, `/terms`, `/sitemap.xml`, `/robots.txt`

**VTI (vti.nayokan.org):**
- `/`, `/programmes`, `/programmes/[slug]`, `/clusters`, `/clusters/[slug]`, `/apply`, `/apply/success`
- plus `/privacy`, `/terms`, `/sitemap.xml`, `/robots.txt`

**Startup (startup.nayokan.org):**
- `/`, `/programme`, `/commercialization`, `/apply` (+ `/apply/success`), `/university-partnerships`
- `/mentors`, `/opportunities`, `/portfolio`, `/portfolio/[slug]`
- plus `/privacy`, `/terms`, `/sitemap.xml`, `/robots.txt`

**Navigation (seeded, editable per site in the CMS).** All three use the Phase 3B nav component with its accessible mobile panel.

| Site | Links | CTA | Notes |
|---|---|---|---|
| Corporate | What we do · VTI ↗ · Startup Centre ↗ · Venture Capital · Hospitality · Impact · Insights · About | Contact | Mirrors the design nav. VTI and Startup Centre are cross-site links. |
| VTI | Programmes · Clusters · How it works (home §Approach anchor) · Nayokan ↗ | Apply | Flagged CONTENT TO BE CONFIRMED |
| Startup | Programme · Commercialization · Universities · Mentors · Opportunities · Portfolio · Nayokan ↗ | Apply | Flagged CONTENT TO BE CONFIRMED |

Each site gets its own footer, using the design's 4 columns (brand / Divisions / Institution / Engage) with site-specific link sets. The EN/FR toggle is shown on every site, with FR marked "coming soon".

## 6. Hostname routing strategy (`proxy.ts`, Next 16)

**Registry.** `src/platform/sites/registry.ts` is a typed `SITES` map with an entry per site `{id, name, origin, theme, analyticsSite, defaultSeo}`. Origins come from Zod-validated env: `SITE_ORIGIN_CORPORATE`, `SITE_ORIGIN_VTI`, `SITE_ORIGIN_STARTUP`, `ADMIN_ORIGIN`.

**Resolving the site.** `resolveSite(host)` checks exact host matches against the configured origins:
- dev: `nayokan.localhost:3000`, `vti.nayokan.localhost:3000`, `startup.nayokan.localhost:3000`, `admin.nayokan.localhost:3000` (`*.localhost` resolves natively in Chromium and Playwright);
- prod: the real domains.

Unknown hosts get a 404 in production.

**Proxy behaviour:**
1. Canonicalise `www.nayokan.org` → apex (308) and apply the legacy redirects.
2. Admin host: pass through to `/admin/**`, refresh the Supabase session, and redirect unauthenticated users to `/admin/login`. Admin paths on any public host return 404.
3. Public host: rewrite `pathname` → `/<siteId>${pathname}` (for example `vti.nayokan.org/programmes` → `/vti/programmes`). Set request header `x-nayokan-site`. No Supabase auth work happens on public hosts.
4. Direct requests for an internal prefix (`/corporate/*`, `/vti/*`, `/startup/*`) coming from the outside get a 404. The proxy tags rewrites so it can tell them apart.

**Preview deployments (single `*.vercel.app` host).** Non-production only: a `?__site=vti` query sets a `nayokan_site` cookie override. It is ignored when `VERCEL_ENV=production`. It is a convenience only, never a security boundary.

**Pages.** Each page reads its site from the route tree it lives in. That is static, so it never depends on a header. Headers are only used for logging and analytics.

**Before writing the proxy:** read `node_modules/next/dist/docs` on proxy, rewrites, `metadataBase`, metadata files in nested segments, and caching in Next 16. Verify three things there: that `sitemap.ts` can live in nested segments, that a `robots.txt` route handler can be nested, and how rewrites interact with ISR tags.

## 7. Shared Admin architecture (`admin.nayokan.org`)

**Shell.** One shell from `Designs/admin`: 248px sidebar, 56px topbar. The topbar gets a **site selector**: Corporate / VTI / Startup Centre / All sites. The choice is stored in a cookie and URL param, and filters lists and dashboards. It is **not** authorization.

**Sidebar groups, filtered by permission:**
- **Workspace:** Dashboard, Review queue, Notifications, Search.
- **Sites:** a per-site Pages, Homepage, Navigation and SEO editor for each site.
- **Corporate:** Insights (articles), Stories, Partners, People, Venture Capital (portfolio placements, pipeline content), Hospitality (properties).
- **VTI:** Programmes, Clusters.
- **Startup Centre:** Programme(s), Opportunities, Mentors, Portfolio.
- **Shared:** Media, Impact (metrics, evidence, impact stories), Applications, Enquiries, Version history.
- **Administration:** Users, Roles & permissions, Audit log, Settings (org and per-site).

**Routes** stay under `/admin/...` as in the prompt, for example `/admin/content/articles/[id]`, `/admin/impact/metrics/[id]` and `/admin/applications/[id]`. Site-owned lists accept `?site=`. Site editors live at `/admin/sites/[site]/{pages,homepage,navigation,seo}`.

**Dashboard** uses real queries only, filterable by site:
- attention rules
- pending review
- applications pipeline, split by site
- enquiries by site
- verification issues
- recent audit activity
- quick actions

**Preview.** A signed, short-lived token renders drafts on the owning site's host at `/__preview/...`, with a "PREVIEW · NOT LIVE" badge.

## 8. Site/content data model

**Enums:**
- `site_id`: corporate, vti, startup
- `world`: corporate, vti, startup, venture_capital, hospitality

Valid (site, world) pairs are enforced by CHECK: corporate→{corporate, venture_capital, hospitality}, vti→{vti}, startup→{startup}.

**Status enums:**
- `content_status`: draft, in_review, changes_requested, approved, scheduled, published, archived
- `metric_status`: draft, needs_verification, verified, approved, published
- `application_status`: new, under_review, shortlisted, accepted, rejected, withdrawn, archived
- `enquiry_status`: new, assigned, in_progress, resolved, archived

**Common content columns:**
- identity and ownership: `id`, `site`, `world`
- workflow: `status`, `is_public`, `published_at`, `scheduled_at`, `submitted_at`, `reviewer_id`, `approved_by/at`, `archived_at`
- audit stamps: `created_*`, `updated_*`
- versioning: `current_version`
- SEO: `seo jsonb` (title, description, canonical_override, og_media_id, noindex)
- i18n: `locale default 'en'`, `translation_of`

Slugs are unique per `(site, slug, locale)`.

## 9. Shared vs site-specific entities

| Scope | Entities |
|---|---|
| **Site-owned (`site` NOT NULL)** | pages, navigation_items, site_home_sections (fixed section keys per site: corporate = hero, system, worlds, flagship, impact, stories, partners, final_cta; VTI and startup keys derived from their home designs), site_settings (name, default SEO, OG image, analytics key, contact routing), articles (corporate insights, open to other sites later), stories, programmes (vti or startup), clusters (vti), opportunities (startup), mentors (startup), properties (corporate / hospitality) |
| **Shared record + per-site placement** (no duplication) | partners + `partner_placements(site, context, featured, order)` (e.g. the corporate partners wall and the startup university wall). ventures + `venture_placements(site, world, listing_status, order)`, so one venture can graduate from the startup portfolio to the VC portfolio. people + `person_placements` (corporate leadership, VTI staff if needed). impact_metrics are global with a `world`; sites show them through home-section references. |
| **Global / platform** | profiles, roles, role_permissions, user_site_scopes, media, media_collections, media_usages, evidence, metric_evidence, impact_metric_values, content_versions, review_comments, audit_log, approval_requests, notifications, org_settings, rate_limits |
| **Operational, site-attributed** | applications (`site`, `programme_id` or `opportunity_id`, `source_url`, `source_host`, reference `APP/VTI/2026/0001`), enquiries (`site`, `category`, `source_page`, `source_host`, optional `property_id`/`programme_id`, reference `ENQ/CORP/2026/0001`) |

Supporting tables:
- applications: `application_documents` (private bucket) and `application_notes`
- enquiries: `enquiry_notes`

**Governance, enforced in the DB with CHECK constraints and triggers:**
- A metric can only be public if it is approved or published, has `verified_by` and `verified_at`, and has at least one evidence link. Otherwise the change is rejected with a `ContentGovernanceError`.
- Public reads require `status='published' and is_public and published_at<=now()`.
- `evidence` and `audit_log` are append-only: no UPDATE or DELETE grants.
- A partner placement can only be public if `consent_recorded` is set.
- ventures have no financial columns.

**Key relationships:**
- Programme → site / world → clusters, opportunities, applications, stories, mentors (m:n)
- Article → author, category, site / world, cover media, related programme
- ImpactMetric ↔ evidence (m:n), and ImpactMetric → values by period

## 10. Auth / RBAC (site-scoped)

**Sign-in:**
- Supabase Auth, invite-only.
- Mandatory TOTP MFA: all admin routes require `aal2`.
- Password reset.
- 60-minute idle expiry.
- Auth cookies are host-only on `admin.nayokan.org`. Public sites never carry an admin session.

**Roles and scopes:**
- Six roles, seeded from the `roles-permissions.html` matrix (area × full/review/view/none): super_admin, content_editor, programme_manager, communications, impact_manager, reviewer.
- `user_site_scopes(user_id, site | 'all')`. Example: a Programme Manager scoped to VTI can only touch VTI programmes and applications.

**Enforcement:**
- `app.has_permission(area, level, site)` is used in **RLS** and in every server action through `requirePermission(area, level, site)`, after Zod validation.
- UI hiding is advisory only.
- The site selector and hostname are never security inputs.

**Dangerous actions** (roles, users, integrations) go through `approval_requests`, which needs a second super_admin. Applicant PII is visible only to in-scope programme managers, the assigned reviewer and super admins.

## 11. Site-aware CMS strategy

**Public reads.** Each site's pages call `src/platform/content/*` repositories with the `site` fixed by the route tree. Repositories use the anon RLS-scoped client and read published rows only. Cache tags look like `site:vti:programmes` and `site:vti:programme:<slug>`, so publish and unpublish revalidate only that site (≤60s). Unpublishing turns the page into a 404.

**Admin writes.** Server actions go through repository → Supabase server client (the user's RLS) → `audit_log` + `content_versions`.

**Workflow.** A single engine in `src/platform/workflow` handles transitions and roles:
- submit, recall
- request changes (comment required)
- approve, schedule, publish, unpublish, archive, restore

It runs publish preflight checks: cover image, SEO fields, alt text, and a deadline for programmes.

**Scheduling.** `pg_cron` runs scheduled publishing and opportunity auto-close every 5 minutes. That avoids depending on the Vercel plan's cron limits.

**Media.** Supabase Storage uses two buckets:
- `public-media`: published imagery.
- `private`: application documents and evidence, served via short-lived signed URLs.

Uploads go through server-signed URLs with a MIME and size allowlist, and alt text is required.

**Seeding.** Real brand assets and design photos go in as media. Copy-doc and design demo content is seeded as draft, non-public and `[DEMO]`, and never published. Impact metrics are seeded as drafts with no values, so the public sites show an em-dash and "Figure to be confirmed".

**i18n.** EN routes have no prefix. Content rows carry `locale` and `translation_of`, and UI text lives in a typed dictionary. FR lives at `/fr/...` per host, behind a flag, later. No fake translations.

## 12. Site-aware SEO strategy

**Metadata:**
- Each site layout sets `metadataBase = SITES[site].origin` and a title template (`%s · Nayokan VTI` and similar).
- `generateMetadata` reads content `seo` with fallbacks to `site_settings`.
- Canonical is always the owning site's origin plus the path. A `canonical_override` may only point to that site's own origin, validated server-side.

**Per-site files:**
- `sitemap.xml` lists only that site's published URLs.
- `robots.txt` points to that site's sitemap.
- The admin host and all non-production envs are `noindex` with `Disallow: /`.

**Cross-site:**
- The corporate `/programmes` directory links to canonical subdomain detail pages and never duplicates them.
- Internal `/vti/...` paths return 404, which prevents duplicate content.
- Legacy paths return 308.

**Social and structured data:**
- Open Graph uses the site's default image or the content's image.
- JSON-LD: `Organization` (corporate, with `subOrganization` VTI/Startup), `EducationalOrganization` + `Course` (VTI), `Article`, `LodgingBusiness` (hospitality), `BreadcrumbList`.
- The admin SEO screen shows a SERP/OG preview with the correct site origin.

## 13. Site-aware analytics

- `src/platform/analytics/track(event, props)` always injects `site` and `world`. Events: page_view, cta_click, form_start, form_submit, outbound_click, programme_view, application_start/complete, booking_click.
- The provider is TBD (privacy-conscious; for example Vercel Web Analytics, which already splits by hostname, plus custom events carrying `site`). The adapter interface means changing vendor touches one file.
- There is no cross-site tracking cookie. Consent follows the privacy notice.

## 14. Application and enquiry site attribution

There is one pipeline for all sites. Public forms are server actions that call a SECURITY DEFINER RPC. The RPC:
- derives `site` from the route tree (not from client input);
- validates `programme_id`/`opportunity_id` belongs to that site and is open;
- records `source_url` and `source_host`;
- applies a honeypot and a DB rate limit;
- stores uploads in `private/applications/<site>/<id>/`.

The Admin can filter both applications and enquiries by All / Corporate / VTI / Startup Centre, plus programme and status. Reference numbers encode the site.

## 15. Deployment / Vercel strategy

**Vercel:**
- One project with domains `nayokan.org` (+`www` redirect), `vti.nayokan.org`, `startup.nayokan.org` and `admin.nayokan.org`.
- Env vars per environment: site origins, Supabase URL/anon/service keys, `PREVIEW_SECRET`, Resend key.
- Preview deploys use the `?__site=` override.
- Optionally, Vercel Deployment Protection or a firewall rule on the admin domain.

**Supabase:** three projects (dev/test, staging if needed, and prod). Migrations go through the Supabase CLI. RLS and e2e tests never run against prod.

**CI** (GitHub Actions): typecheck, lint, unit tests, build. RLS and e2e tests run against the test project when secrets are available.

## 16. Revised phase plan (dependency-justified)

The data layer moves earlier than your suggested order. The public sites should render through the same repository interfaces that the CMS writes to, so there is no rewrite later. Building sites on fixtures first and swapping to the DB later would mean doing the content layer twice.

Each phase runs on its own branch with conventional commits and a PR.

0. **Architecture + audit docs:**
   - Copy the skills subset: caveman, playwright-cli, supabase ×2, accessibility-review, SEO ×4, og-images, motion-design, scroll-experience, frontend-design, design-taste-frontend, high-end-visual-design, ui-design-system, web-design-guidelines, react-best-practices, senior-frontend/backend/security, copywriting, humanize, stop-slop, image-to-code, chrome-devtools, agent-browser, code-reviewer, fresh-eyes, red-pen.
   - Add `.claude/launch.json` and settings (playwright plugin), plus `CLAUDE.md`/`AGENTS.md`.
   - Write `docs/architecture/`: readiness-report, ADR-001 multi-site single app, ADR-002 Supabase, ADR-003 site vs world model, ADR-004 admin host, route-maps, design-mapping, data-model.
   - Write `docs/content-gaps.md`.
1. **Shared platform foundation:**
   - Scaffold Next 16 / TS / Tailwind v4 at the root; `Designs/` stays untouched.
   - Site registry, `proxy.ts` hostname resolution and redirects.
   - Tokens as CSS variables with per-site and per-world theme classes; fonts through `next/font`.
   - Env validation, Supabase clients, UI primitives and state components.
   - Site layout shells: nav, mobile panel, footer.
   - SEO utilities, analytics adapter, ESLint boundaries.
   - Vitest, Playwright (a project per host), design-compare script, CI.
2. **Content data layer:**
   - Supabase migrations for §8–9, RLS, helper functions, the governance triggers and the roles matrix seed.
   - Media buckets and seeds (brand/design photos, `[DEMO]` drafts).
   - Generated types, `src/platform/content` repositories, RLS tests and the grant-matrix test.
   - This is the minimum the public sites need, plus the governance constraints from day one.
3. **Corporate site:** all 17 routes, including the homepage Nayokan System (desktop sticky horizontal, mobile vertical stepper, static under reduced motion), VC and Hospitality sub-themes, the contact/VC/hospitality enquiry forms (UI and states, submitting through the RPC), and per-site SEO files.
4. **VTI site:** all routes, the multi-step application UI (states per the designs) and SEO.
5. **Startup Centre site:** all routes, the application with the designed state set, and SEO.
6. **Admin auth + shell + RBAC:** admin host, login, MFA enrol and verify, reset, idle expiry, site-scoped guards, site selector, permission-filtered nav, dashboard, denied/not-found/session-expired states.
7. **CMS for all three sites:** per-site pages, homepage sections, navigation and SEO; articles (block editor), stories, media library, programmes, clusters, opportunities, people, mentors, partners and placements, ventures and placements, properties, preview.
8. **Applications + enquiries admin:** pipeline (kanban and table), detail, notes, decisions with reasons, document access, enquiry inbox and assignment, Resend notifications, site filters.
9. **Impact governance:** metrics, value history, evidence (append-only, supersede), verification/approval chain, public gating, impact stories.
10. **Publishing, versions, audit:** workflow engine UI, review queue and diff, pg_cron scheduling, version compare and restore, audit viewer and export, dual approval, notifications.
11. **Cross-site responsive / a11y / performance:** 320–1440 on all three sites, admin tablet/mobile priority screens, axe, keyboard, focus rings, reduced motion, Core Web Vitals.
12. **E2E QA + deployment:**
    - Run the Definition-of-Done matrix per site and per phase.
    - Security review.
    - Vercel domain setup, a production Supabase project, and a smoke test on each host.

Every phase gate:
- typecheck, lint, unit tests
- RLS tests (from phase 2)
- Playwright e2e on the affected hosts
- design-compare review
- code-reviewer and security-reviewer passes
- a commit

## 17. Remaining blockers (not blocking Phases 0–1)

- **Supabase:** create the dev/test project and add keys to `.env.local`, or authorize the Supabase MCP through `/mcp` in an interactive `claude`. Needed from Phase 2.
- **Domains:** DNS for the 4 hosts and the Vercel project. Needed in Phase 12; dev uses `*.nayokan.localhost`.
- **Real content** (see `docs/content-gaps.md`): partner consents and logos, leadership, VTI programme facts, mentors, ventures, properties, contact details, impact figures, privacy policy, and confirmation of the VTI and Startup navs. Placeholders ship until then.
- **Analytics vendor choice:** the adapter defaults to Vercel Web Analytics.

## 18. ADR-001 (to be committed as `docs/architecture/adr/001-multi-site-single-app.md`)

**Status:** Proposed.

**Context:** there are three public sites on distinct hostnames plus one admin. They need a shared CMS, DB, auth, design system and workflow, with independent nav, SEO, content and personality. The team is small, and Vercel is the host.

**Decision:**
- One Next.js 16 app.
- `proxy.ts` resolves the hostname to a site through a typed registry and rewrites to per-site route trees `app/(sites)/{corporate,vti,startup}`.
- Admin lives at `app/admin`, served only on `admin.nayokan.org`.
- Shared code lives in `src/platform` and `src/ui`. Site-only code lives in `src/sites/<site>`, with lint-enforced boundaries.
- The content model carries an explicit `site` enum, separate from the `world` classification. Placements handle cross-site shared records.

**Consequences:**
- Upsides: a single build and deploy; zero duplicated business logic; simple shared auth and preview.
- Costs: all sites share a release train; the proxy must block internal prefixes; host-aware testing is needed (a Playwright project per host).

**Rejected alternatives:**
- Turborepo multi-app: the operational cost of 4 projects isn't justified yet, and it can be extracted later.
- Multi-Zones: path-oriented, and has the same cost as the monorepo.
- Separate codebases: duplication.

**Revisit if** one site needs an independent release cadence or a different runtime.

## Verification (end to end, once built)

- `npm run typecheck && npm run lint && npm test` pass.
- **Proxy unit tests:** host→site resolution, internal prefix blocked, legacy 308s, admin paths 404 on public hosts, the preview override is ignored in production.
- **`npm run test:rls`:**
  - anon sees only published and public rows;
  - drafts, unverified metrics, applications, enquiries and private media are denied;
  - site-scoped roles can't touch other sites;
  - the governance trigger rejects a public unverified metric.
- **`npm run test:e2e`** (Playwright projects for nayokan / vti / startup / admin on `*.nayokan.localhost`, chromium + mobile):
  - every route renders with the correct nav and footer;
  - the canonical URL and sitemap are per host;
  - forms submit with correct `site` attribution;
  - admin login + MFA per role;
  - a publish on VTI appears only on VTI; an unpublish gives 404;
  - the site selector does not grant access.
- **`npm run design:compare`** for every mapped design at 390/768/1280/1440.
- **Manual pass** with `playwright-cli` or the built-in browser: keyboard only, reduced motion, 320px, Nayokan System on desktop and mobile.
- **axe:** zero serious or critical issues on all three sites and the admin.

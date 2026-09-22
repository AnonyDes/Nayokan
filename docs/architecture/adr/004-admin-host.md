# ADR-004: Admin on its own hostname

Status: Accepted (2026-09-22)

## Decision
The shared Admin/CMS is served only on `admin.nayokan.org` (dev: `admin.nayokan.localhost`). Auth cookies are host-only there, so the public sites never carry a staff session. The whole host is `noindex`. It can receive extra edge protection independently.

The admin's site selector (Corporate / VTI / Startup Centre / All sites) is a filtering convenience only. Authorization is enforced server-side by `requirePermission(area, level, site)` in every server action and by RLS (`app.has_permission`), including per-user site scopes.

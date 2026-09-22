-- Reverses 20260922130001_helpers_and_enums.sql.
-- Blocked while any table uses these types (2b+); drop dependents first.
drop function if exists app.is_valid_site_world(public.site_id, public.world);
drop function if exists app.set_updated_at();
drop type if exists public.permission_area;
drop type if exists public.permission_level;
drop type if exists public.enquiry_status;
drop type if exists public.application_status;
drop type if exists public.metric_status;
drop type if exists public.content_status;
drop type if exists public.world;
drop type if exists public.site_id;
drop schema if exists app;
-- pgcrypto intentionally kept: shared extension, other features may use it.

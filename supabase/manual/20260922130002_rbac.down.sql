-- Reverses 20260922130002_rbac.sql. DANGER: destroys all staff/scope data.
drop function if exists app.has_permission(public.permission_area, public.permission_level, public.site_id);
drop function if exists app.user_has_site_scope(public.site_id);
drop function if exists app.current_role_key();
drop table if exists public.user_site_scopes;
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists app.handle_new_user();
drop table if exists public.profiles;
drop table if exists public.role_permissions;
drop table if exists public.roles;

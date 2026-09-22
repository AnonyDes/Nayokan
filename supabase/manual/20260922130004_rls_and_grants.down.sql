-- Reverses 20260922130004_rls_and_grants.sql. Leaves tables WITHOUT RLS —
-- only ever run immediately before the phase's table drops.
drop policy if exists roles_select_staff on public.roles;
drop policy if exists roles_insert_super_admin on public.roles;
drop policy if exists roles_update_super_admin on public.roles;
drop policy if exists roles_delete_super_admin on public.roles;
drop policy if exists role_permissions_select_staff on public.role_permissions;
drop policy if exists role_permissions_insert_super_admin on public.role_permissions;
drop policy if exists role_permissions_update_super_admin on public.role_permissions;
drop policy if exists role_permissions_delete_super_admin on public.role_permissions;
drop policy if exists profiles_select_self_or_admin on public.profiles;
drop policy if exists profiles_update_self_name on public.profiles;
drop policy if exists profiles_update_admin on public.profiles;
drop policy if exists user_site_scopes_select_self_or_admin on public.user_site_scopes;
drop policy if exists user_site_scopes_insert_admin on public.user_site_scopes;
drop policy if exists user_site_scopes_update_admin on public.user_site_scopes;
drop policy if exists user_site_scopes_delete_admin on public.user_site_scopes;
drop policy if exists audit_log_select_staff on public.audit_log;
drop policy if exists audit_log_insert_own on public.audit_log;

grant execute on function app.set_updated_at() to public;
grant execute on function app.handle_new_user() to public;
grant execute on function app.reject_append_only_mutation() to public;
grant execute on function app.is_valid_site_world(public.site_id, public.world) to public, anon;
grant execute on function app.current_role_key() to public, anon;
grant execute on function app.user_has_site_scope(public.site_id) to public, anon;
grant execute on function app.has_permission(public.permission_area, public.permission_level, public.site_id) to public, anon;
grant execute on function app.log_audit(text, text, uuid, uuid, public.site_id, jsonb, jsonb, jsonb) to public, anon;

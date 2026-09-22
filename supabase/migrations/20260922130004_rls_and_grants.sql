-- Phase 2a, slice 4: RLS policies and privilege lockdown.
--
-- Conventions (MEMEX port, verified there against has_function_privilege):
--   * RLS enabled on every public table; anon gets NO policies, so zero rows.
--   * One policy per operation, named <table>_<operation>_<who>.
--   * auth function calls are wrapped in (select ...) so Postgres can cache
--     them per-statement instead of re-evaluating per row.
--   * CREATE FUNCTION grants EXECUTE to PUBLIC by default and Supabase adds
--     default privileges for anon/authenticated — so every function below is
--     explicitly revoked from public/anon, then granted narrowly.

alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profiles enable row level security;
alter table public.user_site_scopes enable row level security;
alter table public.audit_log enable row level security;

-- roles / role_permissions: every staff member reads the matrix (the admin
-- Roles screen renders from it); only Super Admin writes.
create policy roles_select_staff on public.roles
  for select to authenticated
  using (app.current_role_key() is not null);

create policy role_permissions_select_staff on public.role_permissions
  for select to authenticated
  using (app.current_role_key() is not null);

create policy roles_insert_super_admin on public.roles
  for insert to authenticated
  with check ((select app.has_permission('roles', 'full')));

create policy roles_update_super_admin on public.roles
  for update to authenticated
  using ((select app.has_permission('roles', 'full')))
  with check ((select app.has_permission('roles', 'full')));

create policy roles_delete_super_admin on public.roles
  for delete to authenticated
  using ((select app.has_permission('roles', 'full')));

create policy role_permissions_insert_super_admin on public.role_permissions
  for insert to authenticated
  with check ((select app.has_permission('roles', 'full')));

create policy role_permissions_update_super_admin on public.role_permissions
  for update to authenticated
  using ((select app.has_permission('roles', 'full')))
  with check ((select app.has_permission('roles', 'full')));

create policy role_permissions_delete_super_admin on public.role_permissions
  for delete to authenticated
  using ((select app.has_permission('roles', 'full')));

-- profiles: staff read their own row; only someone with users-area access
-- (Super Admin) reads or changes others. New profiles come from the
-- auth trigger (SECURITY DEFINER), so there is intentionally no insert policy.
create policy profiles_select_self_or_admin on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or (select app.has_permission('users', 'view'))
  );

create policy profiles_update_self_name on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy profiles_update_admin on public.profiles
  for update to authenticated
  using ((select app.has_permission('users', 'full')))
  with check ((select app.has_permission('users', 'full')));

-- user_site_scopes: visible to the owner and Super Admin; writable by Super
-- Admin only (goes through dual approval in the app layer).
create policy user_site_scopes_select_self_or_admin on public.user_site_scopes
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select app.has_permission('users', 'view'))
  );

create policy user_site_scopes_insert_admin on public.user_site_scopes
  for insert to authenticated
  with check ((select app.has_permission('users', 'full')));

create policy user_site_scopes_update_admin on public.user_site_scopes
  for update to authenticated
  using ((select app.has_permission('users', 'full')))
  with check ((select app.has_permission('users', 'full')));

create policy user_site_scopes_delete_admin on public.user_site_scopes
  for delete to authenticated
  using ((select app.has_permission('users', 'full')));

-- audit_log: every active staff role has at least 'view' on the audit_log
-- area per the matrix (Reviewer/PM/etc. see it read-only). Insert is open to
-- authenticated callers but the WITH CHECK mirrors app.log_audit's hardening:
-- actor is yourself or null (system). No UPDATE/DELETE policies exist, and
-- the append-only trigger blocks them regardless of role.
create policy audit_log_select_staff on public.audit_log
  for select to authenticated
  using ((select app.has_permission('audit_log', 'view')));

create policy audit_log_insert_own on public.audit_log
  for insert to authenticated
  with check (actor_id is null or actor_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Function EXECUTE lockdown
-- ---------------------------------------------------------------------------

revoke all on function app.set_updated_at() from public, anon, authenticated;
revoke all on function app.handle_new_user() from public, anon, authenticated;
revoke all on function app.reject_append_only_mutation() from public, anon, authenticated;

revoke all on function app.is_valid_site_world(public.site_id, public.world) from public, anon;
grant execute on function app.is_valid_site_world(public.site_id, public.world) to authenticated, service_role;

revoke all on function app.current_role_key() from public, anon;
grant execute on function app.current_role_key() to authenticated, service_role;

revoke all on function app.user_has_site_scope(public.site_id) from public, anon;
grant execute on function app.user_has_site_scope(public.site_id) to authenticated, service_role;

revoke all on function app.has_permission(public.permission_area, public.permission_level, public.site_id) from public, anon;
grant execute on function app.has_permission(public.permission_area, public.permission_level, public.site_id) to authenticated, service_role;

revoke all on function app.log_audit(text, text, uuid, uuid, public.site_id, jsonb, jsonb, jsonb) from public, anon;
grant execute on function app.log_audit(text, text, uuid, uuid, public.site_id, jsonb, jsonb, jsonb) to authenticated, service_role;

notify pgrst, 'reload schema';

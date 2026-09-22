-- Phase 2a, slice 5: self-update was opening a privilege-escalation hole.
-- profiles_update_self_name let a staff member rewrite ANY column of their
-- own row — including role_key and status — because RLS policies cannot
-- restrict columns. Fix:
--   1. column grants: authenticated can only UPDATE display_name and
--      last_active_at on profiles, ever;
--   2. a guard trigger as defence in depth: privileged columns (role_key,
--      status, email, id) can only change when the caller holds
--      users/full (Super Admin) or is the service role;
--   3. admin updates keep row-level full access via profiles_update_admin.

create or replace function app.guard_profile_privileged_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.role()) = 'service_role' then
    return new;
  end if;
  if (new.role_key is distinct from old.role_key)
     or (new.status is distinct from old.status)
     or (new.email is distinct from old.email)
     or (new.id is distinct from old.id) then
    if not (select app.has_permission('users', 'full')) then
      raise exception 'Only a Super Admin can change role, status, email or id';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_guard_privileged_columns
  before update on public.profiles
  for each row execute function app.guard_profile_privileged_columns();

revoke update on public.profiles from authenticated;
grant update (display_name, last_active_at, updated_at) on public.profiles to authenticated;
grant update on public.profiles to service_role;

revoke all on function app.guard_profile_privileged_columns() from public, anon, authenticated;

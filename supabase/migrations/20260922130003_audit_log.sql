-- Phase 2a, slice 3: append-only audit log.
--
-- Design (Designs/admin/data-model.html, AuditEntry): actor, action,
-- object, previous/next snapshots, timestamp. Append-only is enforced twice:
-- no UPDATE/DELETE grants anywhere (RLS slice), and a trigger that rejects
-- mutations even for privileged roles. Corrections are new rows, never edits.

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  object_type text not null,
  object_id uuid,
  site public.site_id,
  previous jsonb,
  next jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_created_idx on public.audit_log (created_at desc);
create index audit_log_object_idx on public.audit_log (object_type, object_id);
create index audit_log_actor_idx on public.audit_log (actor_id, created_at desc);

create or replace function app.reject_append_only_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'append_only: % rows cannot be %', tg_table_name, tg_op
    using errcode = 'raise_exception';
end;
$$;

create trigger audit_log_no_update
  before update or delete on public.audit_log
  for each row execute function app.reject_append_only_mutation();

-- Write path. Ported from MEMEX log_audit_hardening: p_actor_id must be null
-- (system entries: cron, public submission RPCs) or the caller's own uid —
-- no forging entries in someone else's name. service_role bypasses.
create or replace function app.log_audit(
  p_action text,
  p_object_type text,
  p_object_id uuid default null,
  p_actor_id uuid default null,
  p_site public.site_id default null,
  p_previous jsonb default null,
  p_next jsonb default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if (select auth.role()) <> 'service_role'
     and p_actor_id is not null
     and p_actor_id is distinct from (select auth.uid()) then
    raise exception 'actor_id must be null or match the authenticated caller';
  end if;

  insert into public.audit_log (actor_id, action, object_type, object_id, site, previous, next, metadata)
  values (p_actor_id, p_action, p_object_type, p_object_id, p_site, p_previous, p_next, p_metadata)
  returning id into v_id;
  return v_id;
end;
$$;

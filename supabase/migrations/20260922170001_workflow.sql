-- Phase 10, slice 1: workflow engine (readiness §10 + data-model.html).
--
-- Status on every content table is a governed field: direct UPDATE of the
-- status column is rejected unless the transaction went through
-- public.transition_content, which owns the transition map, the role
-- requirements, the required-comment rule, preflight checks, version
-- snapshots, notifications and the audit entry. Field edits (title, body…)
-- stay normal RLS-gated updates; only the status column is RPC-only.
--
-- Tables and their status column:
--   status          pages, articles, stories, partners, people, ventures
--   status_content  programmes, clusters, opportunities, mentors, properties

create table public.content_versions (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  version int not null,
  snapshot jsonb not null,
  saved_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (table_name, record_id, version)
);
create index content_versions_record_idx on public.content_versions (table_name, record_id, version desc);

create table public.review_comments (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  action text not null,
  author_id uuid references public.profiles (id),
  body text not null,
  created_at timestamptz not null default now()
);
create index review_comments_record_idx on public.review_comments (table_name, record_id, created_at);

create table public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  table_name text,
  record_id uuid,
  payload jsonb not null default '{}'::jsonb,
  reason text not null,
  requested_by uuid not null references public.profiles (id),
  required_approvals int not null default 2,
  approved_by uuid[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'executed', 'cancelled')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null default 'info',
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, read_at, created_at desc);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Content table → permission area. Every table in the transition whitelist
-- maps to a matrix area; unknown names return null (callers reject).
create or replace function app.area_for_table(p_table text)
returns public.permission_area
language sql
immutable
set search_path = ''
as $$
  select case p_table
    when 'pages' then 'pages'::public.permission_area
    when 'articles' then 'articles'::public.permission_area
    when 'stories' then 'stories'::public.permission_area
    when 'programmes' then 'programmes'::public.permission_area
    when 'clusters' then 'programmes'::public.permission_area
    when 'opportunities' then 'programmes'::public.permission_area
    when 'mentors' then 'people'::public.permission_area
    when 'partners' then 'partners'::public.permission_area
    when 'people' then 'people'::public.permission_area
    when 'ventures' then 'ventures'::public.permission_area
    when 'properties' then 'properties'::public.permission_area
    else null
  end;
$$;

-- Status column name per whitelisted table.
create or replace function app.status_column_for_table(p_table text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_table in ('programmes', 'clusters', 'opportunities', 'mentors', 'properties')
      then 'status_content'
    else 'status'
  end;
$$;

-- Guard: the status column is RPC-only. transition_content and the cron
-- publisher set a transaction-local flag before touching status; anything
-- else trying to change it gets rejected, service role included.
create or replace function app.guard_status_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_col text := app.status_column_for_table(TG_TABLE_NAME);
  v_old text;
  v_new text;
begin
  -- Compare through jsonb: the two column names differ across tables and
  -- SQL does not guarantee short-circuit evaluation of AND, so a direct
  -- NEW.status_content reference would fail on tables without that column.
  if current_setting('app.content_transition', true) is distinct from 'on' then
    v_old := to_jsonb(OLD) ->> v_col;
    v_new := to_jsonb(NEW) ->> v_col;
    if v_old is distinct from v_new then
      raise exception 'ContentGovernanceError: % changes must go through public.transition_content', v_col;
    end if;
  end if;
  return NEW;
end;
$$;

create trigger pages_status_guard before update on public.pages
  for each row execute function app.guard_status_write();
create trigger articles_status_guard before update on public.articles
  for each row execute function app.guard_status_write();
create trigger stories_status_guard before update on public.stories
  for each row execute function app.guard_status_write();
create trigger programmes_status_guard before update on public.programmes
  for each row execute function app.guard_status_write();
create trigger clusters_status_guard before update on public.clusters
  for each row execute function app.guard_status_write();
create trigger opportunities_status_guard before update on public.opportunities
  for each row execute function app.guard_status_write();
create trigger mentors_status_guard before update on public.mentors
  for each row execute function app.guard_status_write();
create trigger partners_status_guard before update on public.partners
  for each row execute function app.guard_status_write();
create trigger people_status_guard before update on public.people
  for each row execute function app.guard_status_write();
create trigger ventures_status_guard before update on public.ventures
  for each row execute function app.guard_status_write();
create trigger properties_status_guard before update on public.properties
  for each row execute function app.guard_status_write();

-- Version snapshot: every UPDATE stores the OLD row and bumps the row's
-- current_version counter, so snapshot numbering stays dense and unique.
create or replace function app.snapshot_version()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.content_versions (table_name, record_id, version, snapshot, saved_by)
  values (TG_TABLE_NAME, OLD.id, OLD.current_version, to_jsonb(OLD), OLD.updated_by);
  NEW.current_version := OLD.current_version + 1;
  return NEW;
end;
$$;

create trigger pages_version before update on public.pages
  for each row execute function app.snapshot_version();
create trigger articles_version before update on public.articles
  for each row execute function app.snapshot_version();
create trigger stories_version before update on public.stories
  for each row execute function app.snapshot_version();
create trigger programmes_version before update on public.programmes
  for each row execute function app.snapshot_version();
create trigger clusters_version before update on public.clusters
  for each row execute function app.snapshot_version();
create trigger opportunities_version before update on public.opportunities
  for each row execute function app.snapshot_version();
create trigger mentors_version before update on public.mentors
  for each row execute function app.snapshot_version();
create trigger partners_version before update on public.partners
  for each row execute function app.snapshot_version();
create trigger people_version before update on public.people
  for each row execute function app.snapshot_version();
create trigger ventures_version before update on public.ventures
  for each row execute function app.snapshot_version();
create trigger properties_version before update on public.properties
  for each row execute function app.snapshot_version();

create or replace function app.notify(p_user uuid, p_kind text, p_title text, p_body text default null, p_link text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_user is null then return; end if;
  insert into public.notifications (user_id, kind, title, body, link)
  values (p_user, p_kind, p_title, p_body, p_link);
end;
$$;

-- ---------------------------------------------------------------------------
-- transition_content: the single status-change entry point
-- ---------------------------------------------------------------------------

create or replace function public.transition_content(
  p_table text,
  p_id uuid,
  p_action text,
  p_comment text default null,
  p_scheduled_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_area public.permission_area;
  v_col text;
  v_row jsonb;
  v_site public.site_id;
  v_old public.content_status;
  v_new public.content_status;
  v_role text;
  v_actor uuid := (select auth.uid());
begin
  v_area := app.area_for_table(p_table);
  if v_area is null then
    raise exception 'unknown content table: %', p_table;
  end if;
  v_col := app.status_column_for_table(p_table);
  v_role := app.current_role_key();

  execute format('select to_jsonb(t) from public.%I t where t.id = $1', p_table)
    into v_row using p_id;
  if v_row is null then
    raise exception 'record not found';
  end if;
  v_site := nullif(v_row->>'site', '')::public.site_id;
  v_old := (v_row->>v_col)::public.content_status;

  -- Transition map.
  v_new := case
    when p_action = 'submit'          and v_old in ('draft', 'changes_requested') then 'in_review'
    when p_action = 'recall'          and v_old = 'in_review'                     then 'draft'
    when p_action = 'request_changes' and v_old = 'in_review'                     then 'changes_requested'
    when p_action = 'approve'         and v_old in ('in_review', 'changes_requested') then 'approved'
    when p_action = 'schedule'        and v_old = 'approved'                      then 'scheduled'
    when p_action = 'publish'         and v_old in ('approved', 'scheduled')      then 'published'
    when p_action = 'unpublish'       and v_old = 'published'                     then 'approved'
    when p_action = 'archive'         and v_old <> 'archived'                     then 'archived'
    when p_action = 'restore'         and v_old = 'archived'                      then 'draft'
    else null
  end;
  if v_new is null then
    raise exception 'transition % is not allowed from %', p_action, v_old;
  end if;

  -- Role requirements: submit/recall are authoring actions (full on the
  -- area+site). The review path — request_changes, approve, schedule,
  -- publish, unpublish — requires reviewer or super_admin (the matrix
  -- grants reviewers 'review'; editors with 'full' cannot self-approve).
  if p_action in ('submit', 'recall') then
    if not (select app.has_permission(v_area, 'full', v_site)) then
      raise exception 'permission denied: % on % requires full on %', p_action, p_table, v_area;
    end if;
  elsif p_action in ('request_changes', 'approve', 'schedule', 'publish', 'unpublish') then
    if v_role not in ('reviewer', 'super_admin')
       or not (select app.has_permission(v_area, 'review', v_site)) then
      raise exception 'permission denied: % requires reviewer or super_admin', p_action;
    end if;
  else -- archive, restore
    if not (select app.has_permission(v_area, 'full', v_site)) then
      raise exception 'permission denied: % requires full on %', p_action, v_area;
    end if;
  end if;

  if p_action = 'request_changes' and coalesce(btrim(p_comment), '') = '' then
    raise exception 'request_changes requires a comment';
  end if;
  if p_action = 'schedule' and (p_scheduled_at is null or p_scheduled_at <= now()) then
    raise exception 'schedule requires a future scheduled_at';
  end if;

  -- Publish preflight (readiness §10): SEO title + description for every
  -- site-owned record; cover image on articles/stories/programmes/clusters;
  -- programmes cannot publish with applications open past deadline.
  if p_action = 'publish' then
    if v_site is not null then
      if coalesce(btrim(v_row->'seo'->>'title'), '') = ''
         or coalesce(btrim(v_row->'seo'->>'description'), '') = '' then
        raise exception 'PublishPreflightError: seo.title and seo.description are required';
      end if;
    end if;
    if p_table in ('articles', 'stories') and v_row->>'cover_media_id' is null then
      raise exception 'PublishPreflightError: cover image is required';
    end if;
    if p_table in ('programmes', 'clusters') and v_row->>'hero_media_id' is null then
      raise exception 'PublishPreflightError: hero image is required';
    end if;
    if p_table = 'programmes'
       and coalesce((v_row->>'application_open')::boolean, false)
       and v_row->>'application_deadline' is not null
       and (v_row->>'application_deadline')::date < current_date then
      raise exception 'PublishPreflightError: applications are open but the deadline has passed';
    end if;
  end if;

  perform set_config('app.content_transition', 'on', true);

  execute format(
    'update public.%I set %I = $1,
       is_public = case when $1 = ''published'' then true when $1 = ''archived'' then false else is_public end,
       published_at = case when $1 = ''published'' then now() when $1 = ''archived'' then published_at else published_at end,
       submitted_at = case when $2 = ''submit'' then now() else submitted_at end,
       approved_by = case when $2 = ''approve'' then $3 when $2 = ''publish'' then $3 else approved_by end,
       approved_at = case when $2 in (''approve'', ''publish'') then now() else approved_at end,
       reviewer_id = case when $2 in (''request_changes'', ''approve'', ''publish'', ''unpublish'') then $3 else reviewer_id end,
       scheduled_at = case when $2 = ''schedule'' then $4 when $2 in (''publish'', ''unpublish'', ''archive'') then null else scheduled_at end,
       archived_at = case when $2 = ''archive'' then now() when $2 = ''restore'' then null else archived_at end,
       updated_by = $3
     where id = $5',
    p_table, v_col
  ) using v_new, p_action, v_actor, p_scheduled_at, p_id;

  if p_comment is not null and btrim(p_comment) <> '' then
    insert into public.review_comments (table_name, record_id, action, author_id, body)
    values (p_table, p_id, p_action, v_actor, btrim(p_comment));
  end if;

  perform app.log_audit(
    'content.' || p_action, p_table, p_id, v_actor, v_site,
    jsonb_build_object(v_col, v_old), jsonb_build_object(v_col, v_new),
    jsonb_build_object('comment', nullif(btrim(p_comment), ''))
  );

  -- Notifications: author hears outcomes on their work; on submit every
  -- reviewer gets notified.
  if p_action in ('request_changes', 'approve', 'publish', 'unpublish', 'archive', 'restore') then
    perform app.notify(
      nullif(v_row->>'created_by', '')::uuid, 'workflow',
      format('%s %s on %s', p_action, p_table, v_row->>'name' || coalesce(v_row->>'title', '')),
      p_comment, null
    );
  elsif p_action = 'submit' then
    perform app.notify(p.id, 'workflow', format('Review requested: %s', p_table), null, null)
    from public.profiles p where p.role_key = 'reviewer' and p.status = 'active';
  end if;

  return jsonb_build_object('id', p_id, 'status', v_new, 'previous', v_old);
end;
$$;

-- Cron target: flip scheduled → published once their time arrives. Runs the
-- same flag the transition RPC uses so the status guard lets it through.
create or replace function public.publish_scheduled_content()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  t text;
  n int := 0;
  c int;
begin
  perform set_config('app.content_transition', 'on', true);
  foreach t in array array[
    'pages', 'articles', 'stories', 'programmes', 'clusters',
    'opportunities', 'mentors', 'partners', 'people', 'ventures', 'properties'
  ] loop
    execute format(
      'update public.%I set %I = ''published'', is_public = true, published_at = now()
       where %I = ''scheduled'' and scheduled_at is not null and scheduled_at <= now()',
      t, app.status_column_for_table(t), app.status_column_for_table(t)
    );
    get diagnostics c = row_count;
    n := n + c;
  end loop;
  return n;
end;
$$;

-- Audit write path for app code (authenticated staff only).
create or replace function public.record_audit(
  p_action text,
  p_object_type text,
  p_object_id uuid default null,
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
begin
  return app.log_audit(p_action, p_object_type, p_object_id, (select auth.uid()), p_site, p_previous, p_next, p_metadata);
end;
$$;

-- ---------------------------------------------------------------------------
-- approval_requests: dual super_admin approval for dangerous actions
-- ---------------------------------------------------------------------------

create or replace function public.request_approval(
  p_action text,
  p_table text default null,
  p_record_id uuid default null,
  p_payload jsonb default '{}'::jsonb,
  p_reason text default ''
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if app.current_role_key() is null then
    raise exception 'permission denied: staff only';
  end if;
  if coalesce(btrim(p_reason), '') = '' then
    raise exception 'a reason is required';
  end if;
  insert into public.approval_requests (action, table_name, record_id, payload, reason, requested_by)
  values (p_action, p_table, p_record_id, p_payload, p_reason, (select auth.uid()))
  returning id into v_id;

  perform app.notify(p.id, 'approval', format('Approval requested: %s', p_action), p_reason, null)
  from public.profiles p where p.role_key = 'super_admin' and p.status = 'active';

  return v_id;
end;
$$;

create or replace function public.approve_request(p_request_id uuid, p_approve boolean default true)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_req public.approval_requests%rowtype;
begin
  if app.current_role_key() <> 'super_admin' then
    raise exception 'permission denied: super_admin only';
  end if;

  select * into v_req from public.approval_requests where id = p_request_id for update;
  if not found then raise exception 'request not found'; end if;
  if v_req.status <> 'pending' then raise exception 'request is no longer pending'; end if;

  if not p_approve then
    update public.approval_requests set status = 'rejected', resolved_at = now() where id = p_request_id;
    return jsonb_build_object('status', 'rejected');
  end if;

  -- Two DISTINCT super_admins, and the requester can never be one of them.
  if v_req.requested_by = (select auth.uid()) then
    raise exception 'the requester cannot approve their own request';
  end if;
  if (select auth.uid()) = any (v_req.approved_by) then
    raise exception 'already approved by this admin';
  end if;

  v_req.approved_by := v_req.approved_by || (select auth.uid());
  update public.approval_requests
  set approved_by = v_req.approved_by,
      status = case when array_length(v_req.approved_by, 1) >= v_req.required_approvals
                    then 'approved' else 'pending' end,
      resolved_at = case when array_length(v_req.approved_by, 1) >= v_req.required_approvals
                         then now() else null end
  where id = p_request_id;

  perform app.log_audit(
    'approval.' || case when array_length(v_req.approved_by, 1) >= v_req.required_approvals then 'granted' else 'recorded' end,
    'approval_request', p_request_id, (select auth.uid()), null,
    null, to_jsonb(v_req), jsonb_build_object('action', v_req.action)
  );

  return jsonb_build_object(
    'status', case when array_length(v_req.approved_by, 1) >= v_req.required_approvals then 'approved' else 'pending' end,
    'approvals', array_length(v_req.approved_by, 1)
  );
end;
$$;

grant execute on function public.transition_content(text, uuid, text, text, timestamptz) to authenticated;
grant execute on function public.record_audit(text, text, uuid, public.site_id, jsonb, jsonb, jsonb) to authenticated;
grant execute on function public.request_approval(text, text, uuid, jsonb, text) to authenticated;
grant execute on function public.approve_request(uuid, boolean) to authenticated;
grant execute on function public.publish_scheduled_content() to service_role;

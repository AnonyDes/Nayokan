-- Phase 10, slice 3: restore a content_versions snapshot onto its row.
-- Applies every stored column except the workflow-owned ones, which are
-- forced back to draft so a restore can never silently republish.

create or replace function public.restore_content_version(
  p_table text,
  p_id uuid,
  p_version int
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_area public.permission_area;
  v_col text;
  v_snapshot jsonb;
  v_site public.site_id;
  v_cols text;
  v_found boolean;
begin
  v_area := app.area_for_table(p_table);
  if v_area is null then
    raise exception 'unknown content table: %', p_table;
  end if;
  v_col := app.status_column_for_table(p_table);

  select snapshot into v_snapshot
  from public.content_versions
  where table_name = p_table and record_id = p_id and version = p_version;
  if not found then
    raise exception 'version % not found for % %', p_version, p_table, p_id;
  end if;

  -- Shared tables (partners, people, ventures) have no site column; a null
  -- site just means "not site-scoped" for the permission check below.
  execute format('select exists(select 1 from public.%I t where t.id = $1)', p_table)
    into v_found using p_id;
  if not v_found then
    raise exception 'record not found';
  end if;
  execute format('select (to_jsonb(t)->>''site'')::public.site_id from public.%I t where t.id = $1', p_table)
    into v_site using p_id;

  if not (select app.has_permission(v_area, 'review', v_site)) then
    raise exception 'permission denied: restore requires review on %', v_area;
  end if;

  -- Every stored column except identity and workflow fields comes back.
  select string_agg(format('%I = v.%I', k, k), ', ')
  into v_cols
  from (select jsonb_object_keys(v_snapshot) as k) keys
  where k not in (
    'id', 'status', 'status_content', 'is_public', 'published_at',
    'scheduled_at', 'submitted_at', 'reviewer_id', 'approved_by',
    'approved_at', 'archived_at', 'created_at', 'created_by'
  );

  perform set_config('app.content_transition', 'on', true);

  execute format(
    'update public.%I t set %s,
       %I = ''draft'', is_public = false, scheduled_at = null,
       archived_at = null, updated_by = $2
     from (select * from jsonb_populate_record(null::public.%I, $1)) v
     where t.id = $3',
    p_table, v_cols, v_col, p_table
  ) using v_snapshot, (select auth.uid()), p_id;

  perform app.log_audit(
    'content.version_restored', p_table, p_id, (select auth.uid()), v_site,
    null, jsonb_build_object('restored_version', p_version), null
  );

  return jsonb_build_object('id', p_id, 'restored_version', p_version);
end;
$$;

grant execute on function public.restore_content_version(text, uuid, int) to authenticated;

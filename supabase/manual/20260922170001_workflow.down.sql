-- Reverses 20260922170001_workflow.sql. DANGER: destroys version history,
-- review comments, approval requests and notifications, and re-opens
-- direct status writes (the guard triggers drop with the functions).
do $$
declare
  t text;
begin
  foreach t in array array[
    'pages', 'articles', 'stories', 'programmes', 'clusters',
    'opportunities', 'mentors', 'partners', 'people', 'ventures', 'properties'
  ] loop
    execute format('drop trigger if exists %I_status_guard on public.%I', t, t);
    execute format('drop trigger if exists %I_version on public.%I', t, t);
  end loop;
end $$;

drop function if exists public.approve_request(uuid, boolean);
drop function if exists public.request_approval(text, text, uuid, jsonb, text);
drop function if exists public.record_audit(text, text, uuid, public.site_id, jsonb, jsonb, jsonb);
drop function if exists public.publish_scheduled_content();
drop function if exists public.transition_content(text, uuid, text, text, timestamptz);
drop function if exists app.notify(uuid, text, text, text, text);
drop function if exists app.snapshot_version();
drop function if exists app.guard_status_write();
drop function if exists app.status_column_for_table(text);
drop function if exists app.area_for_table(text);
drop table if exists public.notifications;
drop table if exists public.approval_requests;
drop table if exists public.review_comments;
drop table if exists public.content_versions;

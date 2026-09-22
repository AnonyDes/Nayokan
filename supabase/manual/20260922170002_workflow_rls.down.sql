-- Reverses 20260922170002_workflow_rls.sql. Leaves workflow tables WITHOUT
-- policies — only run before dropping those tables.
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('content_versions', 'review_comments', 'approval_requests', 'notifications')
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

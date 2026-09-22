-- Reverses 20260922150003_submission_rls.sql. Leaves submission tables
-- WITHOUT staff policies — only run before dropping those tables.
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'applications', 'application_documents', 'application_notes',
        'enquiries', 'enquiry_notes', 'submission_attempts', 'submission_counters'
      )
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

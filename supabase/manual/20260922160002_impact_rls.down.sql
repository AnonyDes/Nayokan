-- Reverses 20260922160002_impact_rls.sql. Leaves impact tables WITHOUT
-- policies — only run before dropping those tables.
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('impact_metrics', 'impact_metric_values', 'evidence', 'metric_evidence')
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

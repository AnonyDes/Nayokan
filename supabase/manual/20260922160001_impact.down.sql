-- Reverses 20260922160001_impact.sql. DANGER: destroys all impact metrics,
-- values and evidence metadata. Evidence files in the private bucket are
-- untouched; orphan them deliberately.
drop table if exists public.metric_evidence;
drop table if exists public.evidence;
drop table if exists public.impact_metric_values;
drop table if exists public.impact_metrics;
drop function if exists app.guard_metric_state();
drop function if exists app.reject_mutation();
-- Restore the 1400005 body of can_read_private_object (without evidence/):
create or replace function app.can_read_private_object(p_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_top text := split_part(p_name, '/', 1);
  v_second text := split_part(p_name, '/', 2);
begin
  if (select auth.role()) = 'service_role' then
    return true;
  end if;
  if v_top = 'applications' and v_second in ('corporate', 'vti', 'startup') then
    return (select app.has_permission('applications', 'view', v_second::public.site_id));
  end if;
  return false;
end;
$$;
drop type if exists public.evidence_type;
drop type if exists public.metric_unit;

-- Phase 10, slice 4: pg_cron jobs (readiness §10).
-- Every 5 minutes: publish scheduled content, auto-expire opportunities
-- past deadline. pg_cron may need enabling in the Supabase dashboard on
-- some plans — the DO block degrades to a warning instead of failing the
-- migration, and Phase 12 verification asserts the jobs exist.

do $$
begin
  begin
    create extension if not exists pg_cron;
  exception when insufficient_privilege or feature_not_supported then
    raise warning 'pg_cron not available; scheduled publishing requires it';
  end;
end $$;

do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise warning 'pg_cron extension absent; skipping job registration';
    return;
  end if;

  perform cron.schedule(
    'nayokan-publish-scheduled',
    '*/5 * * * *',
    'select public.publish_scheduled_content()'
  );
  perform cron.schedule(
    'nayokan-expire-opportunities',
    '*/5 * * * *',
    'select app.expire_opportunities()'
  );
exception when others then
  raise warning 'pg_cron job registration failed: %', sqlerrm;
end $$;

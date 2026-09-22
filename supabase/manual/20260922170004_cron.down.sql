-- Reverses 20260922170004_cron.sql. Stops scheduled publishing and
-- opportunity auto-expiry.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('nayokan-publish-scheduled');
    perform cron.unschedule('nayokan-expire-opportunities');
  end if;
end $$;

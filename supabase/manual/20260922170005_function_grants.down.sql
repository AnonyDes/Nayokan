-- Reverses 20260922170005_function_grants.sql. Restores default PUBLIC
-- execute on app-schema functions (Postgres default) — only run while
-- unwinding the phase.
grant execute on all functions in schema app to public;
grant execute on function public.transition_content(text, uuid, text, text, timestamptz) to public;
grant execute on function public.record_audit(text, text, uuid, public.site_id, jsonb, jsonb, jsonb) to public;
grant execute on function public.request_approval(text, text, uuid, jsonb, text) to public;
grant execute on function public.approve_request(uuid, boolean) to public;
grant execute on function public.restore_content_version(text, uuid, int) to public;
grant execute on function public.publish_scheduled_content() to public;

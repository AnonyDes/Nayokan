-- Phase 10, slice 5: tighten function EXECUTE grants.
--
-- `app.*` helpers are RLS/RPC internals — never callable by anon. They
-- stay callable by `authenticated` because staff-facing policies evaluate
-- them per-row under the caller's identity. The public-schema RPCs keep
-- their intended grants: submission endpoints for anon, workflow/audit
-- endpoints for authenticated, the cron publisher for service_role only.

revoke execute on all functions in schema app from public, anon;
grant execute on all functions in schema app to authenticated;

revoke execute on function public.transition_content(text, uuid, text, text, timestamptz)
  from public, anon;
revoke execute on function public.record_audit(text, text, uuid, public.site_id, jsonb, jsonb, jsonb)
  from public, anon;
revoke execute on function public.request_approval(text, text, uuid, jsonb, text)
  from public, anon;
revoke execute on function public.approve_request(uuid, boolean)
  from public, anon;
revoke execute on function public.restore_content_version(text, uuid, int)
  from public, anon;
revoke execute on function public.publish_scheduled_content()
  from public, anon, authenticated;

-- Re-state the intentional anon surface so this file is self-contained:
grant execute on function public.submit_application(
  public.site_id, text, text, text, uuid, uuid, text, text, text, text,
  text, text, uuid, text[], jsonb, text, text, text, text
) to anon, authenticated;
grant execute on function public.submit_enquiry(
  public.site_id, text, text, text, text, text, uuid, uuid, text, text, text, text, text
) to anon, authenticated;
grant execute on function public.register_application_document(uuid, text, text, int) to anon, authenticated;
grant execute on function public.confirm_application_document(uuid) to anon, authenticated;

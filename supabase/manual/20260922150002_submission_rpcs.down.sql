-- Reverses 20260922150002_submission_rpcs.sql. Public submissions stop
-- working the moment these functions drop.
drop function if exists public.confirm_application_document(uuid);
drop function if exists public.register_application_document(uuid, text, text, int);
drop function if exists public.submit_enquiry(
  public.site_id, text, text, text, text, text, uuid, uuid, text, text, text, text, text
);
drop function if exists public.submit_application(
  public.site_id, text, text, text, uuid, uuid, text, text, text, text,
  text, text, uuid, text[], jsonb, text, text, text, text
);
drop function if exists app.check_submission_rate_limit(text, text);

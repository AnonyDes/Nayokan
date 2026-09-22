-- Reverses 20260922130003_audit_log.sql. DANGER: destroys the audit trail.
drop function if exists app.log_audit(text, text, uuid, uuid, public.site_id, jsonb, jsonb, jsonb);
drop trigger if exists audit_log_no_update on public.audit_log;
drop function if exists app.reject_append_only_mutation();
drop table if exists public.audit_log;

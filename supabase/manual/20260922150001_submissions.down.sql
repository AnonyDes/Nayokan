-- Reverses 20260922150001_submissions.sql. DANGER: destroys applications,
-- enquiries, their notes/documents metadata and reference counters.
drop table if exists public.enquiry_notes;
drop table if exists public.enquiries;
drop table if exists public.application_notes;
drop table if exists public.application_documents;
drop table if exists public.applications;
drop table if exists public.submission_attempts;
drop table if exists public.submission_counters;
drop function if exists app.next_reference(text, public.site_id);
drop function if exists app.site_code(public.site_id);

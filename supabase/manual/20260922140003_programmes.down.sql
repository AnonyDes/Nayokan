-- Reverses 20260922140003_programmes.sql. DANGER: destroys programme data.
drop table if exists public.mentor_programmes;
drop table if exists public.mentors;
drop table if exists public.opportunities;
drop table if exists public.clusters;
drop table if exists public.programmes;
drop function if exists app.guard_programme_open();
drop function if exists app.expire_opportunities();
drop type if exists public.programme_status;
drop type if exists public.opportunity_category;
drop type if exists public.opportunity_status;
drop type if exists public.mentor_availability;

-- Phase 8, slice 3: RLS on submission tables.
--
-- anon gets nothing — submissions arrive only via the SECURITY DEFINER
-- RPCs. Staff see applications/enquiries for their scoped sites per the
-- 'applications'/'enquiries' permission areas. Notes are insert+read only
-- (no correction history rewriting; a wrong note gets a follow-up note).
-- submission_counters/submission_attempts are internal to the RPCs.

alter table public.submission_counters enable row level security;
alter table public.submission_attempts enable row level security;
alter table public.applications enable row level security;
alter table public.application_documents enable row level security;
alter table public.application_notes enable row level security;
alter table public.enquiries enable row level security;
alter table public.enquiry_notes enable row level security;

-- applications ----------------------------------------------------------------

create policy applications_select_staff on public.applications
  for select to authenticated
  using ((select app.has_permission('applications', 'view', site)));
create policy applications_insert_staff on public.applications
  for insert to authenticated
  with check ((select app.has_permission('applications', 'full', site)));
create policy applications_update_staff on public.applications
  for update to authenticated
  using ((select app.has_permission('applications', 'review', site)))
  with check ((select app.has_permission('applications', 'review', site)));
create policy applications_delete_staff on public.applications
  for delete to authenticated
  using ((select app.has_permission('applications', 'full', site)));

create policy application_documents_select_staff on public.application_documents
  for select to authenticated
  using (exists (
    select 1 from public.applications a
    where a.id = application_id
      and (select app.has_permission('applications', 'view', a.site))
  ));
create policy application_documents_delete_staff on public.application_documents
  for delete to authenticated
  using (exists (
    select 1 from public.applications a
    where a.id = application_id
      and (select app.has_permission('applications', 'full', a.site))
  ));

create policy application_notes_select_staff on public.application_notes
  for select to authenticated
  using (exists (
    select 1 from public.applications a
    where a.id = application_id
      and (select app.has_permission('applications', 'view', a.site))
  ));
create policy application_notes_insert_staff on public.application_notes
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (
      select 1 from public.applications a
      where a.id = application_id
        and (select app.has_permission('applications', 'review', a.site))
    )
  );

-- enquiries -------------------------------------------------------------------

create policy enquiries_select_staff on public.enquiries
  for select to authenticated
  using ((select app.has_permission('enquiries', 'view', site)));
create policy enquiries_insert_staff on public.enquiries
  for insert to authenticated
  with check ((select app.has_permission('enquiries', 'full', site)));
create policy enquiries_update_staff on public.enquiries
  for update to authenticated
  using ((select app.has_permission('enquiries', 'review', site)))
  with check ((select app.has_permission('enquiries', 'review', site)));
create policy enquiries_delete_staff on public.enquiries
  for delete to authenticated
  using ((select app.has_permission('enquiries', 'full', site)));

create policy enquiry_notes_select_staff on public.enquiry_notes
  for select to authenticated
  using (exists (
    select 1 from public.enquiries e
    where e.id = enquiry_id
      and (select app.has_permission('enquiries', 'view', e.site))
  ));
create policy enquiry_notes_insert_staff on public.enquiry_notes
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (
      select 1 from public.enquiries e
      where e.id = enquiry_id
        and (select app.has_permission('enquiries', 'review', e.site))
    )
  );

-- Private bucket reads for application documents are already covered by
-- app.can_read_private_object (storage migration 20260922140005), which
-- gates applications/<site>/… on has_permission('applications','view',site).

-- Phase 10, slice 2: RLS on workflow tables.
-- content_versions / review_comments / approval_requests / notifications
-- are never exposed to anon. Writes go through the definer functions
-- (transition_content, request_approval, snapshot triggers); the policies
-- below govern direct reads and the few allowed writes.

alter table public.content_versions enable row level security;
alter table public.review_comments enable row level security;
alter table public.approval_requests enable row level security;
alter table public.notifications enable row level security;

create policy content_versions_select_staff on public.content_versions
  for select to authenticated
  using ((select app.has_permission(app.area_for_table(table_name), 'view')));
-- No insert/update/delete policies: snapshots are written by the definer
-- trigger and are immutable history.

create policy review_comments_select_staff on public.review_comments
  for select to authenticated
  using ((select app.has_permission(app.area_for_table(table_name), 'view')));

create policy approval_requests_select_admin on public.approval_requests
  for select to authenticated
  using (app.current_role_key() = 'super_admin' or requested_by = (select auth.uid()));
-- insert/update happen inside request_approval / approve_request (definer).

create policy notifications_select_own on public.notifications
  for select to authenticated
  using (user_id = (select auth.uid()));
create policy notifications_update_own on public.notifications
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
-- No insert/delete: notifications are system-written; read receipts only.

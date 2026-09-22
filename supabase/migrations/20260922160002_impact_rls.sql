-- Phase 9, slice 2: RLS on impact/evidence tables.
--
-- anon sees only published + public metrics — and the governance trigger
-- already guarantees those are verified with evidence. Unverified metrics
-- never leave the database for anon; the UI renders an em-dash only for
-- fields the repo layer withholds, not because anon can see drafts.
-- Metric values/evidence rows are staff-only (they contain the underlying
-- numbers and private documents).

alter table public.impact_metrics enable row level security;
alter table public.impact_metric_values enable row level security;
alter table public.evidence enable row level security;
alter table public.metric_evidence enable row level security;

create policy impact_metrics_public_read on public.impact_metrics
  for select to anon
  using (status = 'published' and is_public and published_at <= now());

create policy impact_metrics_select_staff on public.impact_metrics
  for select to authenticated
  using ((select app.has_permission('impact_metrics', 'view')));
create policy impact_metrics_insert_staff on public.impact_metrics
  for insert to authenticated
  with check ((select app.has_permission('impact_metrics', 'full')));
create policy impact_metrics_update_staff on public.impact_metrics
  for update to authenticated
  using ((select app.has_permission('impact_metrics', 'review')))
  with check ((select app.has_permission('impact_metrics', 'review')));
create policy impact_metrics_delete_staff on public.impact_metrics
  for delete to authenticated
  using ((select app.has_permission('impact_metrics', 'full')));

create policy impact_metric_values_select_staff on public.impact_metric_values
  for select to authenticated
  using ((select app.has_permission('impact_metrics', 'view')));
create policy impact_metric_values_insert_staff on public.impact_metric_values
  for insert to authenticated
  with check ((select app.has_permission('impact_metrics', 'review')));
create policy impact_metric_values_update_staff on public.impact_metric_values
  for update to authenticated
  using ((select app.has_permission('impact_metrics', 'review')))
  with check ((select app.has_permission('impact_metrics', 'review')));
create policy impact_metric_values_delete_staff on public.impact_metric_values
  for delete to authenticated
  using ((select app.has_permission('impact_metrics', 'full')));

create policy evidence_select_staff on public.evidence
  for select to authenticated
  using ((select app.has_permission('evidence', 'view')));
create policy evidence_insert_staff on public.evidence
  for insert to authenticated
  with check ((select app.has_permission('evidence', 'full')));
-- No UPDATE/DELETE policies: the append-only trigger would fire anyway, and
-- no policy means PostgREST can't even attempt the statement.

create policy metric_evidence_select_staff on public.metric_evidence
  for select to authenticated
  using ((select app.has_permission('evidence', 'view')));
create policy metric_evidence_insert_staff on public.metric_evidence
  for insert to authenticated
  with check ((select app.has_permission('evidence', 'full')));

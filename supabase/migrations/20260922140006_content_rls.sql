-- Phase 2b, slice 6: RLS for every content table.
--
-- Read model for anon (public sites): published + public + published_at in
-- the past — anything else is invisible.
-- Staff model: area permission from the roles matrix + site scope, via
-- app.has_permission. Update needs at least 'review' (reviewers change
-- status); insert/delete need 'full'.

alter table public.media enable row level security;
alter table public.media_collections enable row level security;
alter table public.media_usages enable row level security;
alter table public.site_settings enable row level security;
alter table public.navigation_items enable row level security;
alter table public.site_home_sections enable row level security;
alter table public.pages enable row level security;
alter table public.articles enable row level security;
alter table public.stories enable row level security;
alter table public.programmes enable row level security;
alter table public.clusters enable row level security;
alter table public.opportunities enable row level security;
alter table public.mentors enable row level security;
alter table public.mentor_programmes enable row level security;
alter table public.partners enable row level security;
alter table public.partner_placements enable row level security;
alter table public.people enable row level security;
alter table public.person_placements enable row level security;
alter table public.ventures enable row level security;
alter table public.venture_placements enable row level security;
alter table public.properties enable row level security;
alter table public.property_media enable row level security;

-- ---------------------------------------------------------------------------
-- Anon SELECT policies (one per table, per convention)
-- ---------------------------------------------------------------------------

create policy media_public_read on public.media
  for select to anon
  using (bucket = 'public-media');

create policy site_settings_public_read on public.site_settings
  for select to anon
  using (true);

create policy navigation_items_public_read on public.navigation_items
  for select to anon
  using (is_live);

create policy site_home_sections_public_read on public.site_home_sections
  for select to anon
  using (is_live);

create policy pages_public_read on public.pages
  for select to anon
  using (status = 'published' and is_public and published_at <= now());

create policy articles_public_read on public.articles
  for select to anon
  using (status = 'published' and is_public and published_at <= now());

create policy stories_public_read on public.stories
  for select to anon
  using (status = 'published' and is_public and published_at <= now());

create policy programmes_public_read on public.programmes
  for select to anon
  using (status_content = 'published' and is_public and published_at <= now());

create policy clusters_public_read on public.clusters
  for select to anon
  using (status_content = 'published' and is_public and published_at <= now());

create policy opportunities_public_read on public.opportunities
  for select to anon
  using (status_content = 'published' and is_public and published_at <= now());

create policy mentors_public_read on public.mentors
  for select to anon
  using (status_content = 'published' and is_public and published_at <= now());

-- mentor_programmes rows are join data; visible when both ends are public.
create policy mentor_programmes_public_read on public.mentor_programmes
  for select to anon
  using (
    exists (select 1 from public.mentors m
            where m.id = mentor_id and m.status_content = 'published' and m.is_public and m.published_at <= now())
    and exists (select 1 from public.programmes p
                where p.id = programme_id and p.status_content = 'published' and p.is_public and p.published_at <= now())
  );

create policy partners_public_read on public.partners
  for select to anon
  using (status = 'published' and published_at <= now());

create policy partner_placements_public_read on public.partner_placements
  for select to anon
  using (
    is_public
    and exists (select 1 from public.partners p
                where p.id = partner_id and p.status = 'published' and p.published_at <= now())
  );

create policy people_public_read on public.people
  for select to anon
  using (status = 'published' and published_at <= now());

create policy person_placements_public_read on public.person_placements
  for select to anon
  using (
    is_public
    and exists (select 1 from public.people p
                where p.id = person_id and p.status = 'published' and p.published_at <= now())
  );

create policy ventures_public_read on public.ventures
  for select to anon
  using (status = 'published' and published_at <= now());

create policy venture_placements_public_read on public.venture_placements
  for select to anon
  using (
    is_public
    and exists (select 1 from public.ventures v
                where v.id = venture_id and v.status = 'published' and v.published_at <= now())
  );

create policy properties_public_read on public.properties
  for select to anon
  using (status_content = 'published' and is_public and published_at <= now());

create policy property_media_public_read on public.property_media
  for select to anon
  using (
    exists (select 1 from public.properties p
            where p.id = property_id and p.status_content = 'published' and p.is_public and p.published_at <= now())
  );

-- ---------------------------------------------------------------------------
-- Staff policies
-- ---------------------------------------------------------------------------

-- Global (no site scope) entities: media, collections, usages, partners,
-- people, ventures.
create policy media_select_staff on public.media
  for select to authenticated
  using ((select app.has_permission('media', 'view')));
create policy media_insert_staff on public.media
  for insert to authenticated
  with check ((select app.has_permission('media', 'full')));
create policy media_update_staff on public.media
  for update to authenticated
  using ((select app.has_permission('media', 'review')))
  with check ((select app.has_permission('media', 'review')));
create policy media_delete_staff on public.media
  for delete to authenticated
  using ((select app.has_permission('media', 'full')));

create policy media_collections_select_staff on public.media_collections
  for select to authenticated
  using ((select app.has_permission('media', 'view')));
create policy media_collections_insert_staff on public.media_collections
  for insert to authenticated
  with check ((select app.has_permission('media', 'full')));
create policy media_collections_update_staff on public.media_collections
  for update to authenticated
  using ((select app.has_permission('media', 'full')))
  with check ((select app.has_permission('media', 'full')));
create policy media_collections_delete_staff on public.media_collections
  for delete to authenticated
  using ((select app.has_permission('media', 'full')));

create policy media_usages_select_staff on public.media_usages
  for select to authenticated
  using ((select app.has_permission('media', 'view')));
create policy media_usages_insert_staff on public.media_usages
  for insert to authenticated
  with check ((select app.has_permission('media', 'full')));
create policy media_usages_update_staff on public.media_usages
  for update to authenticated
  using ((select app.has_permission('media', 'full')))
  with check ((select app.has_permission('media', 'full')));
create policy media_usages_delete_staff on public.media_usages
  for delete to authenticated
  using ((select app.has_permission('media', 'full')));

create policy partners_select_staff on public.partners
  for select to authenticated
  using ((select app.has_permission('partners', 'view')));
create policy partners_insert_staff on public.partners
  for insert to authenticated
  with check ((select app.has_permission('partners', 'full')));
create policy partners_update_staff on public.partners
  for update to authenticated
  using ((select app.has_permission('partners', 'review')))
  with check ((select app.has_permission('partners', 'review')));
create policy partners_delete_staff on public.partners
  for delete to authenticated
  using ((select app.has_permission('partners', 'full')));

create policy people_select_staff on public.people
  for select to authenticated
  using ((select app.has_permission('people', 'view')));
create policy people_insert_staff on public.people
  for insert to authenticated
  with check ((select app.has_permission('people', 'full')));
create policy people_update_staff on public.people
  for update to authenticated
  using ((select app.has_permission('people', 'review')))
  with check ((select app.has_permission('people', 'review')));
create policy people_delete_staff on public.people
  for delete to authenticated
  using ((select app.has_permission('people', 'full')));

create policy ventures_select_staff on public.ventures
  for select to authenticated
  using ((select app.has_permission('ventures', 'view')));
create policy ventures_insert_staff on public.ventures
  for insert to authenticated
  with check ((select app.has_permission('ventures', 'full')));
create policy ventures_update_staff on public.ventures
  for update to authenticated
  using ((select app.has_permission('ventures', 'review')))
  with check ((select app.has_permission('ventures', 'review')));
create policy ventures_delete_staff on public.ventures
  for delete to authenticated
  using ((select app.has_permission('ventures', 'full')));

-- Site-scoped entities. The (site) argument ties the row to the caller's
-- user_site_scopes; super_admin is exempt inside app.has_permission.

-- site_config: site_settings, navigation_items, site_home_sections
create policy site_settings_select_staff on public.site_settings
  for select to authenticated
  using ((select app.has_permission('site_config', 'view', site)));
create policy site_settings_update_staff on public.site_settings
  for update to authenticated
  using ((select app.has_permission('site_config', 'review', site)))
  with check ((select app.has_permission('site_config', 'review', site)));
create policy site_settings_insert_staff on public.site_settings
  for insert to authenticated
  with check ((select app.has_permission('site_config', 'full', site)));

create policy navigation_items_select_staff on public.navigation_items
  for select to authenticated
  using ((select app.has_permission('site_config', 'view', site)));
create policy navigation_items_insert_staff on public.navigation_items
  for insert to authenticated
  with check ((select app.has_permission('site_config', 'full', site)));
create policy navigation_items_update_staff on public.navigation_items
  for update to authenticated
  using ((select app.has_permission('site_config', 'review', site)))
  with check ((select app.has_permission('site_config', 'review', site)));
create policy navigation_items_delete_staff on public.navigation_items
  for delete to authenticated
  using ((select app.has_permission('site_config', 'full', site)));

create policy site_home_sections_select_staff on public.site_home_sections
  for select to authenticated
  using ((select app.has_permission('site_config', 'view', site)));
create policy site_home_sections_insert_staff on public.site_home_sections
  for insert to authenticated
  with check ((select app.has_permission('site_config', 'full', site)));
create policy site_home_sections_update_staff on public.site_home_sections
  for update to authenticated
  using ((select app.has_permission('site_config', 'review', site)))
  with check ((select app.has_permission('site_config', 'review', site)));
create policy site_home_sections_delete_staff on public.site_home_sections
  for delete to authenticated
  using ((select app.has_permission('site_config', 'full', site)));

-- pages
create policy pages_select_staff on public.pages
  for select to authenticated
  using ((select app.has_permission('pages', 'view', site)));
create policy pages_insert_staff on public.pages
  for insert to authenticated
  with check ((select app.has_permission('pages', 'full', site)));
create policy pages_update_staff on public.pages
  for update to authenticated
  using ((select app.has_permission('pages', 'review', site)))
  with check ((select app.has_permission('pages', 'review', site)));
create policy pages_delete_staff on public.pages
  for delete to authenticated
  using ((select app.has_permission('pages', 'full', site)));

-- articles
create policy articles_select_staff on public.articles
  for select to authenticated
  using ((select app.has_permission('articles', 'view', site)));
create policy articles_insert_staff on public.articles
  for insert to authenticated
  with check ((select app.has_permission('articles', 'full', site)));
create policy articles_update_staff on public.articles
  for update to authenticated
  using ((select app.has_permission('articles', 'review', site)))
  with check ((select app.has_permission('articles', 'review', site)));
create policy articles_delete_staff on public.articles
  for delete to authenticated
  using ((select app.has_permission('articles', 'full', site)));

-- stories
create policy stories_select_staff on public.stories
  for select to authenticated
  using ((select app.has_permission('stories', 'view', site)));
create policy stories_insert_staff on public.stories
  for insert to authenticated
  with check ((select app.has_permission('stories', 'full', site)));
create policy stories_update_staff on public.stories
  for update to authenticated
  using ((select app.has_permission('stories', 'review', site)))
  with check ((select app.has_permission('stories', 'review', site)));
create policy stories_delete_staff on public.stories
  for delete to authenticated
  using ((select app.has_permission('stories', 'full', site)));

-- programmes
create policy programmes_select_staff on public.programmes
  for select to authenticated
  using ((select app.has_permission('programmes', 'view', site)));
create policy programmes_insert_staff on public.programmes
  for insert to authenticated
  with check ((select app.has_permission('programmes', 'full', site)));
create policy programmes_update_staff on public.programmes
  for update to authenticated
  using ((select app.has_permission('programmes', 'review', site)))
  with check ((select app.has_permission('programmes', 'review', site)));
create policy programmes_delete_staff on public.programmes
  for delete to authenticated
  using ((select app.has_permission('programmes', 'full', site)));

-- clusters
create policy clusters_select_staff on public.clusters
  for select to authenticated
  using ((select app.has_permission('programmes', 'view', site)));
create policy clusters_insert_staff on public.clusters
  for insert to authenticated
  with check ((select app.has_permission('programmes', 'full', site)));
create policy clusters_update_staff on public.clusters
  for update to authenticated
  using ((select app.has_permission('programmes', 'review', site)))
  with check ((select app.has_permission('programmes', 'review', site)));
create policy clusters_delete_staff on public.clusters
  for delete to authenticated
  using ((select app.has_permission('programmes', 'full', site)));

-- opportunities
create policy opportunities_select_staff on public.opportunities
  for select to authenticated
  using ((select app.has_permission('programmes', 'view', site)));
create policy opportunities_insert_staff on public.opportunities
  for insert to authenticated
  with check ((select app.has_permission('programmes', 'full', site)));
create policy opportunities_update_staff on public.opportunities
  for update to authenticated
  using ((select app.has_permission('programmes', 'review', site)))
  with check ((select app.has_permission('programmes', 'review', site)));
create policy opportunities_delete_staff on public.opportunities
  for delete to authenticated
  using ((select app.has_permission('programmes', 'full', site)));

-- mentors (+ join)
create policy mentors_select_staff on public.mentors
  for select to authenticated
  using ((select app.has_permission('people', 'view', site)));
create policy mentors_insert_staff on public.mentors
  for insert to authenticated
  with check ((select app.has_permission('people', 'full', site)));
create policy mentors_update_staff on public.mentors
  for update to authenticated
  using ((select app.has_permission('people', 'review', site)))
  with check ((select app.has_permission('people', 'review', site)));
create policy mentors_delete_staff on public.mentors
  for delete to authenticated
  using ((select app.has_permission('people', 'full', site)));

create policy mentor_programmes_select_staff on public.mentor_programmes
  for select to authenticated
  using ((select app.has_permission('people', 'view')));
create policy mentor_programmes_insert_staff on public.mentor_programmes
  for insert to authenticated
  with check ((select app.has_permission('people', 'full')));
create policy mentor_programmes_delete_staff on public.mentor_programmes
  for delete to authenticated
  using ((select app.has_permission('people', 'full')));

-- placements (site-scoped)
create policy partner_placements_select_staff on public.partner_placements
  for select to authenticated
  using ((select app.has_permission('partners', 'view', site)));
create policy partner_placements_insert_staff on public.partner_placements
  for insert to authenticated
  with check ((select app.has_permission('partners', 'full', site)));
create policy partner_placements_update_staff on public.partner_placements
  for update to authenticated
  using ((select app.has_permission('partners', 'review', site)))
  with check ((select app.has_permission('partners', 'review', site)));
create policy partner_placements_delete_staff on public.partner_placements
  for delete to authenticated
  using ((select app.has_permission('partners', 'full', site)));

create policy person_placements_select_staff on public.person_placements
  for select to authenticated
  using ((select app.has_permission('people', 'view', site)));
create policy person_placements_insert_staff on public.person_placements
  for insert to authenticated
  with check ((select app.has_permission('people', 'full', site)));
create policy person_placements_update_staff on public.person_placements
  for update to authenticated
  using ((select app.has_permission('people', 'review', site)))
  with check ((select app.has_permission('people', 'review', site)));
create policy person_placements_delete_staff on public.person_placements
  for delete to authenticated
  using ((select app.has_permission('people', 'full', site)));

create policy venture_placements_select_staff on public.venture_placements
  for select to authenticated
  using ((select app.has_permission('ventures', 'view', site)));
create policy venture_placements_insert_staff on public.venture_placements
  for insert to authenticated
  with check ((select app.has_permission('ventures', 'full', site)));
create policy venture_placements_update_staff on public.venture_placements
  for update to authenticated
  using ((select app.has_permission('ventures', 'review', site)))
  with check ((select app.has_permission('ventures', 'review', site)));
create policy venture_placements_delete_staff on public.venture_placements
  for delete to authenticated
  using ((select app.has_permission('ventures', 'full', site)));

-- properties (+ gallery)
create policy properties_select_staff on public.properties
  for select to authenticated
  using ((select app.has_permission('properties', 'view', site)));
create policy properties_insert_staff on public.properties
  for insert to authenticated
  with check ((select app.has_permission('properties', 'full', site)));
create policy properties_update_staff on public.properties
  for update to authenticated
  using ((select app.has_permission('properties', 'review', site)))
  with check ((select app.has_permission('properties', 'review', site)));
create policy properties_delete_staff on public.properties
  for delete to authenticated
  using ((select app.has_permission('properties', 'full', site)));

create policy property_media_select_staff on public.property_media
  for select to authenticated
  using ((select app.has_permission('properties', 'view')));
create policy property_media_insert_staff on public.property_media
  for insert to authenticated
  with check ((select app.has_permission('properties', 'full')));
create policy property_media_delete_staff on public.property_media
  for delete to authenticated
  using ((select app.has_permission('properties', 'full')));

-- Function EXECUTE lockdown for new helpers.
revoke all on function app.guard_programme_open() from public, anon, authenticated;
revoke all on function app.expire_opportunities() from public, anon;
grant execute on function app.expire_opportunities() to service_role;
revoke all on function app.guard_partner_placement_public() from public, anon, authenticated;
revoke all on function app.can_read_private_object(text) from public, anon;
grant execute on function app.can_read_private_object(text) to authenticated, service_role;

notify pgrst, 'reload schema';

-- Phase 2b, slice 5: storage buckets and object policies.
--
-- public-media: published imagery, served by public URL.
-- private: application documents and evidence, served by short-lived signed
-- URLs created server-side (phase 8 RPC callers). Uploads to `private` go
-- through server-created signed upload URLs, which bypass RLS by design —
-- so anon intentionally gets no policies on storage.objects at all.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-media', 'public-media', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/svg+xml']),
  ('private', 'private', false, 20971520, array['application/pdf', 'image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- public-media: world-readable; written only by staff with media/full.
create policy storage_public_media_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'public-media');

create policy storage_public_media_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'public-media' and (select app.has_permission('media', 'full')));

create policy storage_public_media_update on storage.objects
  for update to authenticated
  using (bucket_id = 'public-media' and (select app.has_permission('media', 'full')))
  with check (bucket_id = 'public-media' and (select app.has_permission('media', 'full')));

create policy storage_public_media_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'public-media' and (select app.has_permission('media', 'full')));

-- private: staff reads gated by folder convention and permission.
--   applications/<site>/<id>/<file> -> applications area, site-scoped
--   evidence/<metric>/<file>        -> evidence area
create or replace function app.can_read_private_object(p_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_top text := split_part(p_name, '/', 1);
  v_second text := split_part(p_name, '/', 2);
begin
  if (select auth.role()) = 'service_role' then
    return true;
  end if;
  if v_top = 'applications' and v_second in ('corporate', 'vti', 'startup') then
    return (select app.has_permission('applications', 'view', v_second::public.site_id));
  end if;
  if v_top = 'evidence' then
    return (select app.has_permission('evidence', 'view'));
  end if;
  return (select app.has_permission('settings', 'full')); -- super_admin fallback
end;
$$;

create policy storage_private_read on storage.objects
  for select to authenticated
  using (bucket_id = 'private' and (select app.can_read_private_object(name)));

-- No anon policies on storage.objects: anon never touches storage directly.
-- Signed upload/signed download URLs are minted by server code and are not
-- subject to these policies.

-- Reverses 20260922140005_storage_buckets.sql. DANGER: buckets contain
-- uploaded objects; empty or migrate them first.
drop policy if exists storage_public_media_read on storage.objects;
drop policy if exists storage_public_media_insert on storage.objects;
drop policy if exists storage_public_media_update on storage.objects;
drop policy if exists storage_public_media_delete on storage.objects;
drop policy if exists storage_private_read on storage.objects;
drop function if exists app.can_read_private_object(text);
delete from storage.buckets where id in ('public-media', 'private');

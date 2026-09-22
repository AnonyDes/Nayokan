-- Reverses 20260922140001_media_and_site_config.sql. DANGER: destroys media
-- metadata, site settings, navigation and home sections. Storage objects are
-- untouched; orphan them deliberately.
drop table if exists public.site_home_sections;
drop table if exists public.navigation_items;
drop table if exists public.site_settings;
drop table if exists public.media_usages;
drop table if exists public.media;
drop table if exists public.media_collections;

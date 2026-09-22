-- Reverses 20260922140002_editorial_content.sql. DANGER: destroys content.
alter table public.articles drop constraint if exists articles_related_programme_fk;
drop table if exists public.stories;
drop table if exists public.articles;
drop table if exists public.pages;
drop type if exists public.story_type;

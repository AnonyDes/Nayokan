-- Phase 2b, slice 2: editorial content — pages, articles, stories.
-- Shared column set per readiness report §8: identity/ownership, workflow,
-- audit stamps, versioning, SEO, i18n, provenance.

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  site public.site_id not null,
  world public.world,
  path text not null,
  title text not null,
  sections jsonb not null default '[]'::jsonb,
  status public.content_status not null default 'draft',
  is_public boolean not null default false,
  published_at timestamptz,
  scheduled_at timestamptz,
  submitted_at timestamptz,
  reviewer_id uuid references public.profiles (id),
  approved_by uuid references public.profiles (id),
  approved_at timestamptz,
  archived_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  current_version int not null default 1,
  seo jsonb not null default '{}'::jsonb,
  locale text not null default 'en',
  translation_of uuid references public.pages (id),
  provenance jsonb not null default '{"isDemo": false}'::jsonb,
  unique (site, path, locale),
  check (world is null or app.is_valid_site_world(site, world))
);

create trigger pages_set_updated_at
  before update on public.pages
  for each row execute function app.set_updated_at();

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  site public.site_id not null,
  world public.world not null,
  slug text not null,
  title text not null,
  excerpt text not null default '',
  category text,
  author_id uuid references public.profiles (id),
  -- Snapshot of the display name at publish time; survives account changes.
  author_name text,
  published_display_at date,
  reading_minutes int check (reading_minutes is null or reading_minutes > 0),
  cover_media_id uuid references public.media (id),
  body jsonb not null default '[]'::jsonb,
  related_programme_id uuid, -- FK added in slice 3 once programmes exists
  status public.content_status not null default 'draft',
  is_public boolean not null default false,
  published_at timestamptz,
  scheduled_at timestamptz,
  submitted_at timestamptz,
  reviewer_id uuid references public.profiles (id),
  approved_by uuid references public.profiles (id),
  approved_at timestamptz,
  archived_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  current_version int not null default 1,
  seo jsonb not null default '{}'::jsonb,
  locale text not null default 'en',
  translation_of uuid references public.articles (id),
  provenance jsonb not null default '{"isDemo": false}'::jsonb,
  unique (site, slug, locale),
  check (app.is_valid_site_world(site, world))
);

create index articles_site_status_idx on public.articles (site, status, published_at desc);
create index articles_category_idx on public.articles (site, category);

create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function app.set_updated_at();

create type public.story_type as enum ('beneficiary', 'enterprise', 'cohort');

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  site public.site_id not null,
  world public.world not null,
  slug text not null,
  title text not null,
  excerpt text not null default '',
  type public.story_type not null,
  cover_media_id uuid references public.media (id),
  body jsonb not null default '[]'::jsonb,
  status public.content_status not null default 'draft',
  is_public boolean not null default false,
  published_at timestamptz,
  scheduled_at timestamptz,
  submitted_at timestamptz,
  reviewer_id uuid references public.profiles (id),
  approved_by uuid references public.profiles (id),
  approved_at timestamptz,
  archived_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  current_version int not null default 1,
  seo jsonb not null default '{}'::jsonb,
  locale text not null default 'en',
  translation_of uuid references public.stories (id),
  provenance jsonb not null default '{"isDemo": false}'::jsonb,
  unique (site, slug, locale),
  check (app.is_valid_site_world(site, world))
);

create index stories_site_status_idx on public.stories (site, status, published_at desc);

create trigger stories_set_updated_at
  before update on public.stories
  for each row execute function app.set_updated_at();

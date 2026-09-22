-- Phase 2b, slice 1: media library and per-site configuration.
-- Global media metadata lives here; the binaries live in Storage buckets
-- (public-media / private), created in 20260922140005_storage_buckets.sql.

create table public.media_collections (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null check (bucket in ('public-media', 'private')),
  path text not null,
  filename text not null,
  mime_type text not null,
  size_bytes bigint,
  width int,
  height int,
  -- Alt text is required on every asset (WCAG); publish preflight also
  -- checks every usage, but the column itself can never be empty.
  alt_text text not null check (length(btrim(alt_text)) > 0),
  caption text,
  source_credit text,
  collection_id uuid references public.media_collections (id) on delete set null,
  uploaded_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, path)
);

create trigger media_set_updated_at
  before update on public.media
  for each row execute function app.set_updated_at();

-- Where an asset is used, for unused-media cleanup and preflight checks.
create table public.media_usages (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media (id) on delete cascade,
  object_type text not null,
  object_id uuid not null,
  created_at timestamptz not null default now(),
  unique (media_id, object_type, object_id)
);

-- ---------------------------------------------------------------------------
-- Per-site settings, navigation and home sections (site-owned, area
-- 'site_config'). No `world`: these describe the site itself.
-- ---------------------------------------------------------------------------

create table public.site_settings (
  site public.site_id primary key,
  name text not null,
  tagline text,
  contact_email text,
  address text,
  social jsonb not null default '[]'::jsonb,
  default_seo jsonb not null default '{}'::jsonb,
  -- VTI and Startup navs are design-derived and flagged for confirmation.
  navigation_pending_confirmation boolean not null default false,
  provenance jsonb not null default '{"isDemo": false}'::jsonb,
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function app.set_updated_at();

create table public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  site public.site_id not null,
  area text not null check (area in ('primary', 'cta', 'footer')),
  parent_id uuid references public.navigation_items (id) on delete cascade,
  footer_column int check (footer_column between 1 and 4),
  footer_heading text,
  label text not null,
  href text not null,
  cross_site boolean not null default false,
  sort_order int not null default 0,
  is_live boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now()
);

create index navigation_items_site_area_idx on public.navigation_items (site, area, sort_order);

create trigger navigation_items_set_updated_at
  before update on public.navigation_items
  for each row execute function app.set_updated_at();

-- Fixed section keys per site (no page builder). Corporate keys from the
-- readiness report; VTI/Startup keys derived from their home designs.
create table public.site_home_sections (
  id uuid primary key default gen_random_uuid(),
  site public.site_id not null,
  key text not null,
  sort_order int not null default 0,
  is_live boolean not null default false,
  data jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site, key),
  check (
    (site = 'corporate' and key in (
      'hero', 'system', 'worlds', 'flagship', 'impact', 'stories', 'partners', 'final_cta'))
    or (site = 'vti' and key in (
      'hero', 'approach', 'programmes_preview', 'clusters_preview', 'impact', 'cta'))
    or (site = 'startup' and key in (
      'hero', 'programme', 'commercialization', 'ecosystem', 'opportunities', 'cta'))
  )
);

create trigger site_home_sections_set_updated_at
  before update on public.site_home_sections
  for each row execute function app.set_updated_at();

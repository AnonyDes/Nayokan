-- Phase 2b, slice 3: programmes, clusters, opportunities, mentors.

create type public.programme_status as enum (
  'open', 'closing_soon', 'upcoming', 'closed', 'pilot', 'under_development'
);

create table public.programmes (
  id uuid primary key default gen_random_uuid(),
  site public.site_id not null check (site in ('vti', 'startup')),
  world public.world not null,
  slug text not null,
  code text,
  name text not null,
  summary text not null default '',
  body jsonb not null default '[]'::jsonb,
  type text,
  status public.programme_status not null default 'under_development',
  duration text,
  delivery_mode text,
  location text,
  certification text,
  application_deadline date,
  application_open boolean not null default false,
  places int check (places is null or places >= 0),
  hero_media_id uuid references public.media (id),
  status_content public.content_status not null default 'draft',
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
  translation_of uuid references public.programmes (id),
  provenance jsonb not null default '{"isDemo": false}'::jsonb,
  unique (site, slug, locale),
  check (app.is_valid_site_world(site, world))
);

-- A programme can only be open for applications while published.
create or replace function app.guard_programme_open()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.application_open and new.status_content <> 'published' then
    raise exception 'programme must be published before applications can open';
  end if;
  return new;
end;
$$;

create trigger programmes_guard_open
  before insert or update on public.programmes
  for each row execute function app.guard_programme_open();

create index programmes_site_status_idx on public.programmes (site, status_content, published_at desc);

create trigger programmes_set_updated_at
  before update on public.programmes
  for each row execute function app.set_updated_at();

-- Deferred FK from articles.
alter table public.articles
  add constraint articles_related_programme_fk
  foreign key (related_programme_id) references public.programmes (id) on delete set null;

create table public.clusters (
  id uuid primary key default gen_random_uuid(),
  site public.site_id not null default 'vti' check (site = 'vti'),
  world public.world not null default 'vti',
  slug text not null,
  code text,
  name text not null,
  sector text not null default '',
  location text,
  summary text not null default '',
  body jsonb not null default '[]'::jsonb,
  member_count int check (member_count is null or member_count >= 0),
  status_label text,
  programme_id uuid references public.programmes (id) on delete set null,
  hero_media_id uuid references public.media (id),
  status_content public.content_status not null default 'draft',
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
  translation_of uuid references public.clusters (id),
  provenance jsonb not null default '{"isDemo": false}'::jsonb,
  unique (site, slug, locale),
  check (app.is_valid_site_world(site, world))
);

create trigger clusters_set_updated_at
  before update on public.clusters
  for each row execute function app.set_updated_at();

create type public.opportunity_category as enum ('residency', 'grant', 'programme', 'competition', 'other');
create type public.opportunity_status as enum ('open', 'closing_soon', 'upcoming', 'expired');

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  site public.site_id not null default 'startup' check (site = 'startup'),
  world public.world not null default 'startup',
  slug text not null,
  code text,
  title text not null,
  category public.opportunity_category not null default 'other',
  status public.opportunity_status not null default 'upcoming',
  deadline date,
  opens_at date,
  eligibility text,
  external_url text,
  status_content public.content_status not null default 'draft',
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
  translation_of uuid references public.opportunities (id),
  provenance jsonb not null default '{"isDemo": false}'::jsonb,
  unique (site, slug, locale),
  check (app.is_valid_site_world(site, world))
);

-- Auto-flip open opportunities to expired once the deadline passes. The
-- pg_cron job (phase 10) calls this; it also runs inside submission RPCs so
-- a just-expired opportunity can never accept a race-day application.
create or replace function app.expire_opportunities()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int;
begin
  update public.opportunities
  set status = 'expired', updated_at = now()
  where status in ('open', 'closing_soon')
    and deadline is not null
    and deadline < current_date;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create index opportunities_status_idx on public.opportunities (status, deadline);

create trigger opportunities_set_updated_at
  before update on public.opportunities
  for each row execute function app.set_updated_at();

create type public.mentor_availability as enum ('open', 'limited', 'by_request');

create table public.mentors (
  id uuid primary key default gen_random_uuid(),
  site public.site_id not null default 'startup' check (site = 'startup'),
  world public.world not null default 'startup',
  name text not null,
  initials text not null,
  role text,
  expertise text[] not null default '{}',
  sector text,
  availability public.mentor_availability,
  photo_media_id uuid references public.media (id),
  bio text,
  status_content public.content_status not null default 'draft',
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
  locale text not null default 'en',
  translation_of uuid references public.mentors (id),
  provenance jsonb not null default '{"isDemo": false}'::jsonb,
  check (app.is_valid_site_world(site, world))
);

-- Mentor <-> programme is many-to-many.
create table public.mentor_programmes (
  mentor_id uuid not null references public.mentors (id) on delete cascade,
  programme_id uuid not null references public.programmes (id) on delete cascade,
  primary key (mentor_id, programme_id)
);

create trigger mentors_set_updated_at
  before update on public.mentors
  for each row execute function app.set_updated_at();

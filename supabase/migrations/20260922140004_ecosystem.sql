-- Phase 2b, slice 4: shared records with per-site placements, and
-- hospitality properties.
--
-- Placement tables carry the site and visibility; the entity carries the
-- facts. One record, many sites, no duplication (ADR-003).

create type public.partner_category as enum (
  'university', 'corporate', 'development', 'government', 'investor', 'community'
);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category public.partner_category not null,
  logo_media_id uuid references public.media (id),
  website text,
  relationship text,
  -- Governance: a placement can only be public when consent is recorded
  -- (trigger below + readiness report §9).
  consent_recorded boolean not null default false,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  current_version int not null default 1,
  provenance jsonb not null default '{"isDemo": false}'::jsonb
);

create trigger partners_set_updated_at
  before update on public.partners
  for each row execute function app.set_updated_at();

create table public.partner_placements (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners (id) on delete cascade,
  site public.site_id not null,
  context text not null,
  featured boolean not null default false,
  sort_order int not null default 0,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (partner_id, site, context)
);

create index partner_placements_site_idx on public.partner_placements (site, context, sort_order);

create or replace function app.guard_partner_placement_public()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_consent boolean;
begin
  if new.is_public then
    select consent_recorded into v_consent from public.partners where id = new.partner_id;
    if not coalesce(v_consent, false) then
      raise exception 'partner placement cannot be public: consent_recorded is not set for partner %', new.partner_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger partner_placements_guard_public
  before insert or update on public.partner_placements
  for each row execute function app.guard_partner_placement_public();

-- ---------------------------------------------------------------------------

create table public.people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  initials text not null default '',
  position text,
  division text,
  bio text,
  photo_media_id uuid references public.media (id),
  links jsonb not null default '[]'::jsonb,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  current_version int not null default 1,
  provenance jsonb not null default '{"isDemo": false}'::jsonb
);

create trigger people_set_updated_at
  before update on public.people
  for each row execute function app.set_updated_at();

create table public.person_placements (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people (id) on delete cascade,
  site public.site_id not null,
  context text not null, -- e.g. 'leadership', 'team'
  sort_order int not null default 0,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  unique (person_id, site, context)
);

-- ---------------------------------------------------------------------------

create type public.listing_status as enum ('pipeline', 'active', 'alumni', 'exited');

-- No financial columns on ventures, ever (readiness report §9).
create table public.ventures (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  code text,
  name text not null,
  description text not null default '',
  body jsonb not null default '[]'::jsonb,
  sector text,
  stage text,
  location text,
  website text,
  related_programme_id uuid references public.programmes (id) on delete set null,
  logo_media_id uuid references public.media (id),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  current_version int not null default 1,
  seo jsonb not null default '{}'::jsonb,
  locale text not null default 'en',
  translation_of uuid references public.ventures (id),
  provenance jsonb not null default '{"isDemo": false}'::jsonb
);

create trigger ventures_set_updated_at
  before update on public.ventures
  for each row execute function app.set_updated_at();

create table public.venture_placements (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references public.ventures (id) on delete cascade,
  site public.site_id not null,
  world public.world not null,
  listing_status public.listing_status not null default 'pipeline',
  sort_order int not null default 0,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (venture_id, site, world),
  check (app.is_valid_site_world(site, world))
);

create index venture_placements_site_idx on public.venture_placements (site, world, sort_order);

-- ---------------------------------------------------------------------------

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  site public.site_id not null default 'corporate' check (site = 'corporate'),
  world public.world not null default 'hospitality',
  slug text not null,
  code text,
  name text not null,
  location text,
  type text,
  summary text not null default '',
  body jsonb not null default '[]'::jsonb,
  amenities text[] not null default '{}',
  capacity int check (capacity is null or capacity >= 0),
  external_booking_url text, -- external booking only; no reservations stored
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
  translation_of uuid references public.properties (id),
  provenance jsonb not null default '{"isDemo": false}'::jsonb,
  unique (site, slug, locale),
  check (app.is_valid_site_world(site, world))
);

create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function app.set_updated_at();

create table public.property_media (
  property_id uuid not null references public.properties (id) on delete cascade,
  media_id uuid not null references public.media (id) on delete cascade,
  position int not null default 0,
  primary key (property_id, media_id)
);

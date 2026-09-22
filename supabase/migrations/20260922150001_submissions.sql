-- Phase 8, slice 1: public submission tables (readiness §9, §14).
--
-- applications + enquiries are operational, site-attributed records. The
-- anonymous role gets NO table grants — public writes happen only through
-- the SECURITY DEFINER RPCs in 20260922150002. Staff access is RLS-gated
-- on the 'applications'/'enquiries' permission areas plus site scope.

-- Reference counter: one row per (kind, site, year), incremented atomically
-- by app.next_reference. Keeps APP/VTI/2026/0001-style numbering gap-free
-- enough for humans without exposing a sequence to anon.
create table public.submission_counters (
  kind text not null check (kind in ('APP', 'ENQ')),
  site public.site_id not null,
  year int not null,
  last int not null default 0,
  primary key (kind, site, year)
);

create table public.submission_attempts (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  kind text not null check (kind in ('application', 'enquiry')),
  created_at timestamptz not null default now()
);
create index submission_attempts_ip_kind_idx
  on public.submission_attempts (ip_hash, kind, created_at desc);

-- Site code used inside references: APP/VTI/2026/0001, ENQ/CORP/2026/0001.
create or replace function app.site_code(p_site public.site_id)
returns text
language sql
immutable
set search_path = ''
as $$
  select case p_site
    when 'corporate' then 'CORP'
    when 'vti' then 'VTI'
    when 'startup' then 'START'
  end;
$$;

create or replace function app.next_reference(p_kind text, p_site public.site_id)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_year int := extract(year from now())::int;
  v_last int;
begin
  insert into public.submission_counters (kind, site, year, last)
  values (p_kind, p_site, v_year, 1)
  on conflict (kind, site, year)
  do update set last = submission_counters.last + 1
  returning last into v_last;

  return p_kind || '/' || app.site_code(p_site) || '/' || v_year || '/' || lpad(v_last::text, 4, '0');
end;
$$;

-- ---------------------------------------------------------------------------
-- applications
-- ---------------------------------------------------------------------------

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  site public.site_id not null,
  world public.world not null,
  programme_id uuid references public.programmes (id),
  opportunity_id uuid references public.opportunities (id),
  full_name text not null,
  email text not null,
  phone text,
  city_region text,
  age_band text,
  education_level text,
  occupation text,
  motivation text not null,
  plans text,
  preferred_cluster_id uuid references public.clusters (id),
  secondary_interests text[],
  consents jsonb not null default '{}'::jsonb,
  status public.application_status not null default 'new',
  source_url text,
  source_host text,
  submitted_at timestamptz not null default now(),
  assigned_to uuid references public.profiles (id),
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  decision_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(programme_id, opportunity_id) = 1),
  check (app.is_valid_site_world(site, world))
);
create index applications_site_status_idx on public.applications (site, status, submitted_at desc);
create index applications_programme_idx on public.applications (programme_id) where programme_id is not null;
create trigger applications_updated_at before update on public.applications
  for each row execute function app.set_updated_at();

-- Upload metadata only; objects live in the private bucket under
-- applications/<site>/<application_id>/. uploaded_at null = ticket issued,
-- file not confirmed yet.
create table public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes int not null check (size_bytes > 0),
  uploaded_at timestamptz,
  created_at timestamptz not null default now()
);
create index application_documents_application_idx on public.application_documents (application_id);

create table public.application_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  body text not null,
  created_at timestamptz not null default now()
);
create index application_notes_application_idx on public.application_notes (application_id, created_at);

-- ---------------------------------------------------------------------------
-- enquiries
-- ---------------------------------------------------------------------------

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  site public.site_id not null,
  world public.world not null,
  category text not null check (category in (
    'general', 'partnership', 'media', 'careers', 'property', 'programme', 'other'
  )),
  name text not null,
  email text not null,
  organization text,
  message text not null,
  property_id uuid references public.properties (id),
  programme_id uuid references public.programmes (id),
  source_page text,
  source_url text,
  source_host text,
  status public.enquiry_status not null default 'new',
  assigned_to uuid references public.profiles (id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (app.is_valid_site_world(site, world))
);
create index enquiries_site_status_idx on public.enquiries (site, status, created_at desc);
create trigger enquiries_updated_at before update on public.enquiries
  for each row execute function app.set_updated_at();

create table public.enquiry_notes (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  body text not null,
  created_at timestamptz not null default now()
);
create index enquiry_notes_enquiry_idx on public.enquiry_notes (enquiry_id, created_at);

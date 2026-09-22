-- Phase 2a, slice 1: extensions, private `app` schema, shared enums and the
-- valid (site, world) pair helper. Mirrors the MEMEX conventions ported under
-- ADR-002: helpers live in a non-exposed schema, run SECURITY DEFINER with a
-- fixed search_path, and are the single place authorization rules live.

create extension if not exists pgcrypto;

create schema if not exists app;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.site_id as enum ('corporate', 'vti', 'startup');

create type public.world as enum ('corporate', 'vti', 'startup', 'venture_capital', 'hospitality');

create type public.content_status as enum (
  'draft', 'in_review', 'changes_requested', 'approved', 'scheduled', 'published', 'archived'
);

create type public.metric_status as enum (
  'draft', 'needs_verification', 'verified', 'approved', 'published'
);

create type public.application_status as enum (
  'new', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn', 'archived'
);

create type public.enquiry_status as enum (
  'new', 'assigned', 'in_progress', 'resolved', 'archived'
);

-- Permission levels from Designs/admin/roles-permissions.html. Declaration
-- order defines rank, so views compare with plain operators.
create type public.permission_level as enum ('none', 'view', 'review', 'full');

-- Permission areas, one per row of the roles matrix: 18 areas.
create type public.permission_area as enum (
  'pages',
  'articles',
  'stories',
  'media',
  'programmes',
  'applications',
  'people',
  'partners',
  'ventures',
  'properties',
  'impact_metrics',
  'evidence',
  'site_config',
  'enquiries',
  'users',
  'roles',
  'audit_log',
  'settings'
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Valid (site, world) pairs per ADR-003. Used as a CHECK constraint on every
-- site-owned content table so invalid pairs can never be stored.
-- IMMUTABLE so it is usable in CHECK constraints.
create or replace function app.is_valid_site_world(p_site public.site_id, p_world public.world)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select (p_site = 'corporate' and p_world in ('corporate', 'venture_capital', 'hospitality'))
      or (p_site = 'vti'      and p_world = 'vti')
      or (p_site = 'startup'  and p_world = 'startup');
$$;

-- updated_at maintenance trigger (MEMEX port).
create or replace function app.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Phase 2a, slice 2: staff profiles, roles, the permissions matrix (seeded
-- exactly from Designs/admin/roles-permissions.html), per-user site scopes,
-- and app.has_permission — the single function RLS policies and server
-- actions (requirePermission) both rely on.

create table public.roles (
  key text primary key,
  label text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

insert into public.roles (key, label, description) values
  ('super_admin',       'Super Admin',       'Full platform access. Dangerous actions need dual approval from a second Super Admin.'),
  ('content_editor',    'Content Editor',    'Pages, articles, media and site configuration.'),
  ('programme_manager', 'Programme Manager', 'Programmes, clusters, opportunities and applications for their sites.'),
  ('communications',    'Communications',    'Editorial, partners, properties and enquiries.'),
  ('impact_manager',    'Impact Manager',    'Impact metrics, evidence and the verification chain.'),
  ('reviewer',          'Reviewer',          'Approves or requests changes on submitted content.');

-- The matrix, transcribed cell-by-cell from roles-permissions.html
-- (area x role -> none|view|review|full). Every cell is stored, including
-- 'none', so the admin UI renders the matrix straight from this table and
-- app.has_permission has one lookup path.
create table public.role_permissions (
  role_key text not null references public.roles (key) on delete cascade,
  area public.permission_area not null,
  level public.permission_level not null,
  primary key (role_key, area)
);

insert into public.role_permissions (area, level, role_key) values
  -- Content
  ('pages',          'full', 'super_admin'), ('pages',          'full', 'content_editor'), ('pages',          'view', 'programme_manager'), ('pages',          'full', 'communications'), ('pages',          'view', 'impact_manager'), ('pages',          'review', 'reviewer'),
  ('articles',       'full', 'super_admin'), ('articles',       'full', 'content_editor'), ('articles',       'view', 'programme_manager'), ('articles',       'full', 'communications'), ('articles',       'view', 'impact_manager'), ('articles',       'review', 'reviewer'),
  ('stories',        'full', 'super_admin'), ('stories',        'full', 'content_editor'), ('stories',        'full', 'programme_manager'), ('stories',        'full', 'communications'), ('stories',        'full', 'impact_manager'), ('stories',        'review', 'reviewer'),
  ('media',          'full', 'super_admin'), ('media',          'full', 'content_editor'), ('media',          'full', 'programme_manager'), ('media',          'full', 'communications'), ('media',          'full', 'impact_manager'), ('media',          'view', 'reviewer'),
  -- Programmes
  ('programmes',     'full', 'super_admin'), ('programmes',     'view', 'content_editor'), ('programmes',     'full', 'programme_manager'), ('programmes',     'view', 'communications'), ('programmes',     'view', 'impact_manager'), ('programmes',     'review', 'reviewer'),
  ('applications',   'full', 'super_admin'), ('applications',   'none', 'content_editor'), ('applications',   'full', 'programme_manager'), ('applications',   'none', 'communications'), ('applications',   'none', 'impact_manager'), ('applications',   'review', 'reviewer'),
  -- Ecosystem
  ('people',         'full', 'super_admin'), ('people',         'full', 'content_editor'), ('people',         'full', 'programme_manager'), ('people',         'full', 'communications'), ('people',         'view', 'impact_manager'), ('people',         'review', 'reviewer'),
  ('partners',       'full', 'super_admin'), ('partners',       'view', 'content_editor'), ('partners',       'view', 'programme_manager'), ('partners',       'full', 'communications'), ('partners',       'view', 'impact_manager'), ('partners',       'review', 'reviewer'),
  ('ventures',       'full', 'super_admin'), ('ventures',       'none', 'content_editor'), ('ventures',       'view', 'programme_manager'), ('ventures',       'view', 'communications'), ('ventures',       'view', 'impact_manager'), ('ventures',       'review', 'reviewer'),
  ('properties',     'full', 'super_admin'), ('properties',     'view', 'content_editor'), ('properties',     'view', 'programme_manager'), ('properties',     'full', 'communications'), ('properties',     'view', 'impact_manager'), ('properties',     'review', 'reviewer'),
  -- Impact governance
  ('impact_metrics', 'full', 'super_admin'), ('impact_metrics', 'view', 'content_editor'), ('impact_metrics', 'view', 'programme_manager'), ('impact_metrics', 'view', 'communications'), ('impact_metrics', 'full', 'impact_manager'), ('impact_metrics', 'review', 'reviewer'),
  ('evidence',       'full', 'super_admin'), ('evidence',       'view', 'content_editor'), ('evidence',       'view', 'programme_manager'), ('evidence',       'view', 'communications'), ('evidence',       'full', 'impact_manager'), ('evidence',       'review', 'reviewer'),
  -- Website
  ('site_config',    'full', 'super_admin'), ('site_config',    'full', 'content_editor'), ('site_config',    'view', 'programme_manager'), ('site_config',    'full', 'communications'), ('site_config',    'none', 'impact_manager'), ('site_config',    'review', 'reviewer'),
  ('enquiries',      'full', 'super_admin'), ('enquiries',      'view', 'content_editor'), ('enquiries',      'view', 'programme_manager'), ('enquiries',      'full', 'communications'), ('enquiries',      'none', 'impact_manager'), ('enquiries',      'view', 'reviewer'),
  -- Administration
  ('users',          'full', 'super_admin'), ('users',          'none', 'content_editor'), ('users',          'none', 'programme_manager'), ('users',          'none', 'communications'), ('users',          'none', 'impact_manager'), ('users',          'none', 'reviewer'),
  ('roles',          'full', 'super_admin'), ('roles',          'none', 'content_editor'), ('roles',          'none', 'programme_manager'), ('roles',          'none', 'communications'), ('roles',          'none', 'impact_manager'), ('roles',          'none', 'reviewer'),
  ('audit_log',      'full', 'super_admin'), ('audit_log',      'view', 'content_editor'), ('audit_log',      'view', 'programme_manager'), ('audit_log',      'view', 'communications'), ('audit_log',      'view', 'impact_manager'), ('audit_log',      'view', 'reviewer'),
  ('settings',       'full', 'super_admin'), ('settings',       'none', 'content_editor'), ('settings',       'none', 'programme_manager'), ('settings',       'none', 'communications'), ('settings',       'none', 'impact_manager'), ('settings',       'none', 'reviewer');

-- Staff profiles, 1:1 with auth.users. Email is mirrored for admin listing;
-- authorization never reads user_metadata (it is user-editable).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null default '',
  role_key text references public.roles (key),
  status text not null default 'invited' check (status in ('invited', 'active', 'suspended')),
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function app.set_updated_at();

-- Create a stub profile for every new auth user. Runs as the table owner
-- (SECURITY DEFINER) so no INSERT policy on profiles is needed.
create or replace function app.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app.handle_new_user();

-- Per-user site scopes. A row with site 'all' covers every site; otherwise
-- the user may only act on content owned by a listed site. Super admins are
-- exempt (checked inside app.has_permission).
create table public.user_site_scopes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  site text not null check (site in ('corporate', 'vti', 'startup', 'all')),
  created_at timestamptz not null default now(),
  unique (user_id, site)
);

-- ---------------------------------------------------------------------------
-- Authorization helpers (MEMEX pattern: SECURITY DEFINER, fixed search path,
-- plpgsql so policies on profiles/role_permissions never recurse).
-- ---------------------------------------------------------------------------

create or replace function app.current_role_key()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return (
    select p.role_key from public.profiles p
    where p.id = (select auth.uid()) and p.status = 'active'
  );
end;
$$;

-- Does the caller's site scope cover p_site? p_site null means "not a
-- site-owned check" and always passes the scope leg.
create or replace function app.user_has_site_scope(p_site public.site_id)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_site is null then
    return true;
  end if;
  return exists (
    select 1 from public.user_site_scopes s
    where s.user_id = (select auth.uid())
      and (s.site = 'all' or s.site = p_site::text)
  );
end;
$$;

-- Single authorization entry point. True when the caller's role grants at
-- least p_level on p_area and the caller is scoped to p_site. Suspended and
-- role-less users get nothing. Super admins pass the scope leg implicitly.
create or replace function app.has_permission(
  p_area public.permission_area,
  p_level public.permission_level,
  p_site public.site_id default null
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_role text;
  v_level public.permission_level;
begin
  v_role := app.current_role_key();
  if v_role is null then
    return false;
  end if;

  select rp.level into v_level
  from public.role_permissions rp
  where rp.role_key = v_role and rp.area = p_area;

  if v_level is null or v_level < p_level then
    return false;
  end if;

  if v_role = 'super_admin' then
    return true;
  end if;

  return app.user_has_site_scope(p_site);
end;
$$;

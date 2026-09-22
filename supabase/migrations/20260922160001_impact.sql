-- Phase 9, slice 1: impact metrics + evidence (readiness §9, governance).
--
-- impact_metrics are GLOBAL rows with a `world` — sites surface them through
-- home-section references, never by duplicating rows. Values live in
-- impact_metric_values (one row per reporting period); the metric carries
-- the verification chain and the public gate. evidence is append-only:
-- corrections create a new row with supersedes_id, never an update.

create type public.metric_unit as enum (
  'people', 'enterprises', 'certificates', 'percent', 'ventures', 'partnerships', 'count'
);

create type public.evidence_type as enum (
  'report', 'document', 'dataset', 'photo', 'letter', 'other'
);

create table public.impact_metrics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  unit public.metric_unit not null default 'count',
  world public.world,
  programme_id uuid references public.programmes (id),
  reporting_scope text,
  status public.metric_status not null default 'draft',
  is_public boolean not null default false,
  verified_by uuid references public.profiles (id),
  verified_at timestamptz,
  approved_by uuid references public.profiles (id),
  approved_at timestamptz,
  published_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  provenance jsonb not null default '{"isDemo": false}'::jsonb
);
create index impact_metrics_status_idx on public.impact_metrics (status, is_public);
create index impact_metrics_world_idx on public.impact_metrics (world);
create trigger impact_metrics_updated_at before update on public.impact_metrics
  for each row execute function app.set_updated_at();

create table public.impact_metric_values (
  id uuid primary key default gen_random_uuid(),
  metric_id uuid not null references public.impact_metrics (id) on delete cascade,
  period text not null,
  value numeric,
  note text,
  recorded_by uuid references public.profiles (id),
  recorded_at timestamptz not null default now(),
  unique (metric_id, period)
);
create index impact_metric_values_metric_idx on public.impact_metric_values (metric_id);

create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type public.evidence_type not null default 'document',
  source text,
  evidence_date date,
  file_media_id uuid references public.media (id),
  uploaded_by uuid references public.profiles (id),
  verified_by uuid references public.profiles (id),
  supersedes_id uuid references public.evidence (id),
  created_at timestamptz not null default now()
);

create table public.metric_evidence (
  metric_id uuid not null references public.impact_metrics (id) on delete cascade,
  evidence_id uuid not null references public.evidence (id),
  added_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  primary key (metric_id, evidence_id)
);

-- ---------------------------------------------------------------------------
-- Governance
-- ---------------------------------------------------------------------------

-- Append-only: corrections supersede, never rewrite. Raised for every role
-- including service_role, same pattern as audit_log.
create or replace function app.reject_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'append-only table: % on % is not allowed', TG_OP, TG_TABLE_NAME;
end;
$$;

create trigger evidence_append_only before update or delete on public.evidence
  for each row execute function app.reject_mutation();
create trigger metric_evidence_append_only before update or delete on public.metric_evidence
  for each row execute function app.reject_mutation();

-- Verification chain + public gate. Order of checks mirrors the metric
-- status chain: draft → needs_verification → verified → approved → published.
create or replace function app.guard_metric_state()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if TG_OP = 'UPDATE' and NEW.status is distinct from OLD.status then
    if NEW.status = 'verified'
       and (NEW.verified_by is null or NEW.verified_at is null) then
      raise exception 'ContentGovernanceError: metric cannot be verified without verified_by and verified_at';
    end if;
    if NEW.status = 'verified'
       and not exists (select 1 from public.metric_evidence me where me.metric_id = NEW.id) then
      raise exception 'ContentGovernanceError: metric cannot be verified without at least one evidence record';
    end if;
    if NEW.status = 'approved' and OLD.status <> 'verified' then
      raise exception 'ContentGovernanceError: metric must be verified before approval';
    end if;
    if NEW.status = 'published' and OLD.status <> 'approved' then
      raise exception 'ContentGovernanceError: metric must be approved before publishing';
    end if;
  end if;

  if NEW.is_public
     and not (
       NEW.status in ('approved', 'published')
       and NEW.verified_by is not null
       and NEW.verified_at is not null
       and exists (select 1 from public.metric_evidence me where me.metric_id = NEW.id)
     ) then
    raise exception 'ContentGovernanceError: a public metric must be approved/published, verified, and linked to evidence';
  end if;

  if NEW.status = 'published' and NEW.published_at is null then
    NEW.published_at := now();
  end if;
  return NEW;
end;
$$;

create trigger impact_metrics_guard before insert or update on public.impact_metrics
  for each row execute function app.guard_metric_state();

-- Private bucket: evidence files live under evidence/<evidence_id>/… and are
-- readable by staff with the 'evidence' area at view or better.
create or replace function app.can_read_private_object(p_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_top text := split_part(p_name, '/', 1);
  v_second text := split_part(p_name, '/', 2);
begin
  if (select auth.role()) = 'service_role' then
    return true;
  end if;
  if v_top = 'applications' and v_second in ('corporate', 'vti', 'startup') then
    return (select app.has_permission('applications', 'view', v_second::public.site_id));
  end if;
  if v_top = 'evidence' then
    return (select app.has_permission('evidence', 'view'));
  end if;
  return false;
end;
$$;

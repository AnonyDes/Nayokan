-- Phase 8 fix: `returns table (reference text, id uuid)` makes `id` an OUT
-- variable, so bare `where id = …` inside submit_application was ambiguous
-- (PL/pgSQL 42702). Qualify the lookups.

create or replace function public.submit_application(
  p_site public.site_id,
  p_full_name text,
  p_email text,
  p_motivation text,
  p_programme_id uuid default null,
  p_opportunity_id uuid default null,
  p_phone text default null,
  p_city_region text default null,
  p_age_band text default null,
  p_education_level text default null,
  p_occupation text default null,
  p_plans text default null,
  p_preferred_cluster_id uuid default null,
  p_secondary_interests text[] default null,
  p_consents jsonb default '{}'::jsonb,
  p_source_url text default null,
  p_source_host text default null,
  p_ip text default null,
  p_honeypot text default null
)
returns table (reference text, id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_programme public.programmes%rowtype;
  v_opportunity public.opportunities%rowtype;
  v_world public.world;
  v_id uuid;
  v_reference text;
begin
  -- Honeypot: bots see a plausible reference, nothing is stored.
  if p_honeypot is not null and length(trim(p_honeypot)) > 0 then
    return query select app.next_reference('APP', p_site), null::uuid;
    return;
  end if;

  perform app.check_submission_rate_limit(p_ip, 'application');

  if length(trim(p_full_name)) = 0 or length(trim(p_email)) = 0 or length(trim(p_motivation)) = 0 then
    raise exception 'full_name, email and motivation are required';
  end if;
  if p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'email is not valid';
  end if;
  if coalesce(p_consents->>'accuracy', 'false') <> 'true'
     or coalesce(p_consents->>'contact', 'false') <> 'true' then
    raise exception 'required consents are missing';
  end if;
  if num_nonnulls(p_programme_id, p_opportunity_id) <> 1 then
    raise exception 'exactly one of programme_id or opportunity_id is required';
  end if;

  if p_programme_id is not null then
    select * into v_programme from public.programmes pr where pr.id = p_programme_id;
    if not found or v_programme.site <> p_site then
      raise exception 'programme does not belong to this site';
    end if;
    if not v_programme.application_open
       or v_programme.status not in ('open', 'closing_soon')
       or (v_programme.application_deadline is not null and v_programme.application_deadline < current_date) then
      raise exception 'this programme is not open for applications';
    end if;
    v_world := v_programme.world;
  else
    select * into v_opportunity from public.opportunities o where o.id = p_opportunity_id;
    if not found or v_opportunity.site <> p_site then
      raise exception 'opportunity does not belong to this site';
    end if;
    if v_opportunity.status <> 'open'
       or (v_opportunity.opens_at is not null and v_opportunity.opens_at > current_date)
       or (v_opportunity.deadline is not null and v_opportunity.deadline < current_date) then
      raise exception 'this opportunity is not open';
    end if;
    v_world := v_opportunity.world;
  end if;

  v_reference := app.next_reference('APP', p_site);

  insert into public.applications (
    reference, site, world, programme_id, opportunity_id,
    full_name, email, phone, city_region, age_band,
    education_level, occupation, motivation, plans,
    preferred_cluster_id, secondary_interests, consents,
    source_url, source_host
  ) values (
    v_reference, p_site, v_world, p_programme_id, p_opportunity_id,
    trim(p_full_name), lower(trim(p_email)), nullif(trim(p_phone), ''),
    nullif(trim(p_city_region), ''), nullif(trim(p_age_band), ''),
    nullif(trim(p_education_level), ''), nullif(trim(p_occupation), ''),
    trim(p_motivation), nullif(trim(p_plans), ''),
    p_preferred_cluster_id, p_secondary_interests, p_consents,
    nullif(trim(p_source_url), ''), nullif(trim(p_source_host), '')
  )
  returning applications.id into v_id;

  perform app.log_audit(
    'application.submitted', 'application', v_id, null, p_site,
    null, to_jsonb((select a from public.applications a where a.id = v_id)),
    jsonb_build_object('reference', v_reference, 'source_host', p_source_host)
  );

  return query select v_reference, v_id;
end;
$$;

-- Same shadowing in submit_enquiry: `id` is an OUT variable there too, so
-- qualify the existence checks even though they already use aliases.
create or replace function public.submit_enquiry(
  p_site public.site_id,
  p_category text,
  p_name text,
  p_email text,
  p_message text,
  p_organization text default null,
  p_property_id uuid default null,
  p_programme_id uuid default null,
  p_source_page text default null,
  p_source_url text default null,
  p_source_host text default null,
  p_ip text default null,
  p_honeypot text default null
)
returns table (reference text, id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_world public.world;
  v_id uuid;
  v_reference text;
begin
  if p_honeypot is not null and length(trim(p_honeypot)) > 0 then
    return query select app.next_reference('ENQ', p_site), null::uuid;
    return;
  end if;

  perform app.check_submission_rate_limit(p_ip, 'enquiry');

  if length(trim(p_name)) = 0 or length(trim(p_email)) = 0 or length(trim(p_message)) = 0 then
    raise exception 'name, email and message are required';
  end if;
  if p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'email is not valid';
  end if;

  v_world := case p_site
    when 'corporate' then 'corporate'::public.world
    when 'vti' then 'vti'::public.world
    when 'startup' then 'startup'::public.world
  end;

  if p_property_id is not null and not exists (
    select 1 from public.properties pr where pr.id = p_property_id and pr.site = p_site
  ) then
    raise exception 'property does not belong to this site';
  end if;
  if p_programme_id is not null and not exists (
    select 1 from public.programmes pr where pr.id = p_programme_id and pr.site = p_site
  ) then
    raise exception 'programme does not belong to this site';
  end if;

  v_reference := app.next_reference('ENQ', p_site);

  insert into public.enquiries (
    reference, site, world, category, name, email, organization, message,
    property_id, programme_id, source_page, source_url, source_host
  ) values (
    v_reference, p_site, v_world, p_category, trim(p_name), lower(trim(p_email)),
    nullif(trim(p_organization), ''), trim(p_message),
    p_property_id, p_programme_id,
    nullif(trim(p_source_page), ''), nullif(trim(p_source_url), ''),
    nullif(trim(p_source_host), '')
  )
  returning enquiries.id into v_id;

  perform app.log_audit(
    'enquiry.submitted', 'enquiry', v_id, null, p_site,
    null, to_jsonb((select e from public.enquiries e where e.id = v_id)),
    jsonb_build_object('reference', v_reference, 'source_host', p_source_host)
  );

  return query select v_reference, v_id;
end;
$$;

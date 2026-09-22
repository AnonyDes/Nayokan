-- Phase 8, slice 2: public submission RPCs (readiness §14).
--
-- anon has no table grants on applications/enquiries/documents — every
-- public write goes through these SECURITY DEFINER functions. They own:
-- honeypot (silent accept, no row), per-IP DB rate limit, target ownership
-- + open-state validation, reference minting, and the audit entry. `site`
-- is always passed by the server action from the route tree, never read
-- from client input — but the RPC still validates it is a real site enum.

-- Rate limit: 10 submissions per IP per 10 minutes per kind. Generous
-- enough for shared venue Wi-Fi, tight enough to stop a flood bot.
create or replace function app.check_submission_rate_limit(p_ip text, p_kind text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ip_hash text;
  v_recent int;
begin
  if p_ip is null or length(trim(p_ip)) = 0 then
    return;
  end if;
  v_ip_hash := md5(trim(p_ip));

  delete from public.submission_attempts where created_at < now() - interval '1 day';

  select count(*) into v_recent
  from public.submission_attempts
  where ip_hash = v_ip_hash and kind = p_kind and created_at > now() - interval '10 minutes';

  if v_recent >= 10 then
    raise exception 'Too many submissions from this connection recently. Please try again later.';
  end if;

  insert into public.submission_attempts (ip_hash, kind) values (v_ip_hash, p_kind);
end;
$$;

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
    select * into v_programme from public.programmes where id = p_programme_id;
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
    select * into v_opportunity from public.opportunities where id = p_opportunity_id;
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

  -- World defaults to the site's own world; corporate enquiries about a
  -- specific world can refine it later in the admin. Ownership of any
  -- linked entity is checked against the site.
  v_world := case p_site
    when 'corporate' then 'corporate'::public.world
    when 'vti' then 'vti'::public.world
    when 'startup' then 'startup'::public.world
  end;

  if p_property_id is not null and not exists (
    select 1 from public.properties p where p.id = p_property_id and p.site = p_site
  ) then
    raise exception 'property does not belong to this site';
  end if;
  if p_programme_id is not null and not exists (
    select 1 from public.programmes p where p.id = p_programme_id and p.site = p_site
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

-- Upload tickets: the server action asks for a path, then signs an upload
-- URL for it with the service key. The RPC enforces the MIME/size allowlist
-- and a per-application document cap so a leaked application id can't fill
-- the bucket. Applications only accept documents while fresh (< 24h old).
create or replace function public.register_application_document(
  p_application_id uuid,
  p_file_name text,
  p_mime_type text,
  p_size_bytes int
)
returns table (document_id uuid, storage_path text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_app public.applications%rowtype;
  v_count int;
  v_doc_id uuid;
  v_path text;
  v_safe_name text;
begin
  select * into v_app from public.applications where id = p_application_id;
  if not found then
    raise exception 'application not found';
  end if;
  if v_app.submitted_at < now() - interval '24 hours' then
    raise exception 'the upload window for this application has closed';
  end if;

  if p_mime_type not in (
    'application/pdf', 'image/jpeg', 'image/png', 'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) then
    raise exception 'file type not allowed';
  end if;
  if p_size_bytes is null or p_size_bytes <= 0 or p_size_bytes > 10485760 then
    raise exception 'file size not allowed (max 10 MB)';
  end if;

  select count(*) into v_count from public.application_documents
  where application_id = p_application_id;
  if v_count >= 5 then
    raise exception 'too many documents for this application (max 5)';
  end if;

  v_doc_id := gen_random_uuid();
  v_safe_name := regexp_replace(coalesce(nullif(trim(p_file_name), ''), 'file'), '[^A-Za-z0-9._-]', '_', 'g');
  v_path := 'applications/' || v_app.site || '/' || p_application_id || '/' || v_doc_id || '-' || v_safe_name;

  insert into public.application_documents (id, application_id, storage_path, file_name, mime_type, size_bytes)
  values (v_doc_id, p_application_id, v_path, p_file_name, p_mime_type, p_size_bytes);

  return query select v_doc_id, v_path;
end;
$$;

create or replace function public.confirm_application_document(p_document_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.application_documents
  set uploaded_at = now()
  where id = p_document_id and uploaded_at is null;
end;
$$;

grant execute on function public.submit_application(
  public.site_id, text, text, text, uuid, uuid, text, text, text, text,
  text, text, uuid, text[], jsonb, text, text, text, text
) to anon, authenticated;
grant execute on function public.submit_enquiry(
  public.site_id, text, text, text, text, text, uuid, uuid, text, text, text, text, text
) to anon, authenticated;
grant execute on function public.register_application_document(uuid, text, text, int) to anon, authenticated;
grant execute on function public.confirm_application_document(uuid) to anon, authenticated;

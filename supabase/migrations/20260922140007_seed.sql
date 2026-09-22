-- Phase 2b, slice 7: seeds.
--
-- Rules (non-negotiable, workstreams.md):
--   * No fabricated facts. Everything unconfirmed ships as status 'draft',
--     is_public = false, and provenance.isDemo = true with unconfirmed
--     fields listed. [DEMO] names stay out of any published page.
--   * Metrics get no values anywhere (phase 9 seeds draft metrics only).
--   * Media binaries are uploaded by scripts/db-seed-media.mjs; this file
--     seeds content rows only.
--
-- Idempotent: re-runnable via ON CONFLICT where a natural key exists; rows
-- without natural keys use NOT EXISTS guards.

-- ---------------------------------------------------------------------------
-- Site settings
-- ---------------------------------------------------------------------------

insert into public.site_settings (site, name, tagline, navigation_pending_confirmation, default_seo, provenance)
values
  ('corporate', 'Nayokan', 'Building productive capability.',
   false,
   '{"title": "Nayokan", "description": "Nayokan builds capability, organizes production, creates demand, commercializes innovation, mobilizes capital and builds productive assets."}'::jsonb,
   '{"isDemo": false}'::jsonb),
  ('vti', 'Nayokan VTI', 'Vocational training that leads to production.',
   true,
   '{"title": "Nayokan VTI", "description": "Vocational Training Institute — design-derived, awaiting confirmation."}'::jsonb,
   '{"isDemo": true, "unconfirmedFields": ["tagline"]}'::jsonb),
  ('startup', 'Nayokan Startup Centre', 'From idea to venture.',
   true,
   '{"title": "Nayokan Startup Centre", "description": "Startup Centre — design-derived, awaiting confirmation."}'::jsonb,
   '{"isDemo": true, "unconfirmedFields": ["tagline"]}'::jsonb)
on conflict (site) do nothing;

-- ---------------------------------------------------------------------------
-- Navigation (seeded per readiness report §5; editable in the CMS)
-- ---------------------------------------------------------------------------

insert into public.navigation_items (site, area, sort_order, label, href, cross_site)
select * from (values
  -- Corporate
  ('corporate'::public.site_id, 'primary', 1, 'What we do', '/what-we-do', false),
  ('corporate', 'primary', 2, 'VTI', 'https://vti.nayokan.org', true),
  ('corporate', 'primary', 3, 'Startup Centre', 'https://startup.nayokan.org', true),
  ('corporate', 'primary', 4, 'Venture Capital', '/venture-capital', false),
  ('corporate', 'primary', 5, 'Hospitality', '/hospitality', false),
  ('corporate', 'primary', 6, 'Impact', '/impact', false),
  ('corporate', 'primary', 7, 'Insights', '/insights', false),
  ('corporate', 'primary', 8, 'About', '/about', false),
  ('corporate', 'cta', 1, 'Contact', '/contact', false),
  -- VTI (flagged pending confirmation in site_settings)
  ('vti', 'primary', 1, 'Programmes', '/programmes', false),
  ('vti', 'primary', 2, 'Clusters', '/clusters', false),
  ('vti', 'primary', 3, 'How it works', '/#approach', false),
  ('vti', 'primary', 4, 'Nayokan', 'https://nayokan.org', true),
  ('vti', 'cta', 1, 'Apply', '/apply', false),
  -- Startup
  ('startup', 'primary', 1, 'Programme', '/programme', false),
  ('startup', 'primary', 2, 'Commercialization', '/commercialization', false),
  ('startup', 'primary', 3, 'Universities', '/university-partnerships', false),
  ('startup', 'primary', 4, 'Mentors', '/mentors', false),
  ('startup', 'primary', 5, 'Opportunities', '/opportunities', false),
  ('startup', 'primary', 6, 'Portfolio', '/portfolio', false),
  ('startup', 'primary', 7, 'Nayokan', 'https://nayokan.org', true),
  ('startup', 'cta', 1, 'Apply', '/apply', false)
) as v(site, area, sort_order, label, href, cross_site)
where not exists (
  select 1 from public.navigation_items n
  where n.site = v.site and n.area = v.area and n.sort_order = v.sort_order
);

-- ---------------------------------------------------------------------------
-- Home sections (fixed keys; not live until edited in the CMS)
-- ---------------------------------------------------------------------------

insert into public.site_home_sections (site, key, sort_order, is_live)
select * from (values
  ('corporate'::public.site_id, 'hero'::text, 1, false), ('corporate', 'system', 2, false), ('corporate', 'worlds', 3, false),
  ('corporate', 'flagship', 4, false), ('corporate', 'impact', 5, false), ('corporate', 'stories', 6, false),
  ('corporate', 'partners', 7, false), ('corporate', 'final_cta', 8, false),
  ('vti', 'hero', 1, false), ('vti', 'approach', 2, false), ('vti', 'programmes_preview', 3, false),
  ('vti', 'clusters_preview', 4, false), ('vti', 'impact', 5, false), ('vti', 'cta', 6, false),
  ('startup', 'hero', 1, false), ('startup', 'programme', 2, false), ('startup', 'commercialization', 3, false),
  ('startup', 'ecosystem', 4, false), ('startup', 'opportunities', 5, false), ('startup', 'cta', 6, false)
) as k(site, key, ord, is_live)
on conflict (site, key) do nothing;

-- ---------------------------------------------------------------------------
-- VTI programmes (names from the design package; every fact unconfirmed)
-- ---------------------------------------------------------------------------

insert into public.programmes (site, world, slug, name, summary, status, provenance)
select * from (values
  ('vti'::public.site_id, 'vti'::public.world, 'compressed-earth-brick', '[DEMO] Compressed Earth Brick', 'Programme summary to be confirmed.', 'under_development'::public.programme_status, '{"isDemo": true, "unconfirmedFields": ["summary", "duration", "certification"]}'::jsonb),
  ('vti', 'vti', 'plumbing', '[DEMO] Plumbing', 'Programme summary to be confirmed.', 'under_development', '{"isDemo": true, "unconfirmedFields": ["summary", "duration", "certification"]}'),
  ('vti', 'vti', 'food-processing', '[DEMO] Food Processing', 'Programme summary to be confirmed.', 'under_development', '{"isDemo": true, "unconfirmedFields": ["summary", "duration", "certification"]}'),
  ('vti', 'vti', 'electrical-works', '[DEMO] Electrical Works', 'Programme summary to be confirmed.', 'under_development', '{"isDemo": true, "unconfirmedFields": ["summary", "duration", "certification"]}'),
  ('vti', 'vti', 'professional-growth-engineering', '[DEMO] Professional Growth Engineering', 'Design item; existence unconfirmed.', 'under_development', '{"isDemo": true, "unconfirmedFields": ["name", "summary"]}')
) as v(site, world, slug, name, summary, status, provenance)
where not exists (select 1 from public.programmes p where p.site = v.site and p.slug = v.slug);

-- Startup programme (single flagship; 26 weeks / 6 milestones unconfirmed)
insert into public.programmes (site, world, slug, name, summary, duration, status, provenance)
select 'startup', 'startup', 'startup-programme', '[DEMO] Startup Centre Programme',
  'Incubation programme — details to be confirmed (designs indicate 26 weeks, 6 milestones).',
  null, 'under_development',
  '{"isDemo": true, "unconfirmedFields": ["summary", "duration", "summary"]}'
where not exists (select 1 from public.programmes p where p.site = 'startup' and p.slug = 'startup-programme');

-- VTI clusters
insert into public.clusters (site, world, slug, name, sector, summary, provenance)
select * from (values
  ('vti'::public.site_id, 'vti'::public.world, 'food-processing', '[DEMO] Food Processing', 'Agri-food', 'Cluster details to be confirmed.', '{"isDemo": true, "unconfirmedFields": ["summary", "member_count", "location"]}'::jsonb),
  ('vti', 'vti', 'earth-brick', '[DEMO] Earth Brick', 'Construction', 'Cluster details to be confirmed.', '{"isDemo": true, "unconfirmedFields": ["summary", "member_count", "location"]}'),
  ('vti', 'vti', 'plumbing-water-services', '[DEMO] Plumbing and Water Services', 'Water services', 'Cluster details to be confirmed.', '{"isDemo": true, "unconfirmedFields": ["summary", "member_count", "location"]}'),
  ('vti', 'vti', 'agri-food-production', '[DEMO] Agri-Food & Production', 'Agri-food', 'Design item; existence unconfirmed.', '{"isDemo": true, "unconfirmedFields": ["name", "summary"]}')
) as v(site, world, slug, name, sector, summary, provenance)
where not exists (select 1 from public.clusters c where c.site = v.site and c.slug = v.slug);

-- Startup opportunities (demo drafts only)
insert into public.opportunities (site, world, slug, title, category, status, provenance)
select * from (values
  ('startup'::public.site_id, 'startup'::public.world, 'demo-residency', '[DEMO] Founder Residency', 'residency'::public.opportunity_category, 'upcoming'::public.opportunity_status, '{"isDemo": true, "unconfirmedFields": ["eligibility", "deadline"]}'::jsonb),
  ('startup', 'startup', 'demo-grant', '[DEMO] Prototype Grant', 'grant', 'upcoming', '{"isDemo": true, "unconfirmedFields": ["eligibility", "deadline"]}'),
  ('startup', 'startup', 'demo-competition', '[DEMO] Pitch Competition', 'competition', 'upcoming', '{"isDemo": true, "unconfirmedFields": ["eligibility", "deadline"]}')
) as v(site, world, slug, title, category, status, provenance)
where not exists (select 1 from public.opportunities o where o.site = v.site and o.slug = v.slug);

-- Mentors (placeholders; real mentors unconfirmed)
insert into public.mentors (site, world, name, initials, expertise, availability, provenance)
select * from (values
  ('startup'::public.site_id, 'startup'::public.world, '[DEMO] Mentor One', 'M1', array['Product', 'Go to market'], 'by_request'::public.mentor_availability, '{"isDemo": true}'::jsonb),
  ('startup', 'startup', '[DEMO] Mentor Two', 'M2', array['Operations'], 'by_request', '{"isDemo": true}'),
  ('startup', 'startup', '[DEMO] Mentor Three', 'M3', array['Finance'], 'by_request', '{"isDemo": true}')
) as v(site, world, name, initials, expertise, availability, provenance)
where not exists (select 1 from public.mentors m where m.name = v.name);

-- Partners (names from designs / content-gaps; consent NOT recorded, so no
-- placement can ever become public — governance trigger enforces it).
insert into public.partners (name, category, consent_recorded, status, provenance)
select v.name, v.category, false, 'draft', '{"isDemo": true, "unconfirmedFields": ["relationship", "website"]}'::jsonb
from (values
  ('[DEMO] Gloway', 'corporate'::public.partner_category),
  ('[DEMO] NAMACS', 'development'),
  ('[DEMO] Scino360', 'corporate'),
  ('[DEMO] MINEFOP', 'government'),
  ('[DEMO] MINPMEESA', 'government'),
  ('[DEMO] i-DREAMS', 'development'),
  ('[DEMO] University of Yaoundé I', 'university'),
  ('[DEMO] MINRESI', 'government'),
  ('[DEMO] Conception X', 'corporate'),
  ('[DEMO] Enovation', 'corporate'),
  ('[DEMO] MINESUP', 'government')
) as v(name, category)
where not exists (select 1 from public.partners p where p.name = v.name);

-- People (leadership placeholder only; office holders unconfirmed)
insert into public.people (name, initials, position, status, provenance)
select '[DEMO] Leadership', 'LD', 'Leadership — to be confirmed', 'draft',
  '{"isDemo": true, "unconfirmedFields": ["name", "position", "bio"]}'::jsonb
where not exists (select 1 from public.people where name = '[DEMO] Leadership');

-- Ventures (design inventions; no financial fields ever)
insert into public.ventures (slug, name, description, status, provenance)
select * from (values
  ('demo-venture-one', '[DEMO] Venture One', 'Portfolio venture to be confirmed.', 'draft'::public.content_status, '{"isDemo": true}'::jsonb),
  ('demo-venture-two', '[DEMO] Venture Two', 'Portfolio venture to be confirmed.', 'draft', '{"isDemo": true}')
) as v(slug, name, description, status, provenance)
where not exists (select 1 from public.ventures vn where vn.slug = v.slug);

-- Properties (copy-doc demo names)
insert into public.properties (site, world, slug, name, location, summary, provenance)
select * from (values
  ('corporate'::public.site_id, 'hospitality'::public.world, 'urban-guesthouse-yaounde', '[DEMO] Urban Guesthouse Yaoundé', 'Yaoundé (tbc)', 'Property details to be confirmed.', '{"isDemo": true, "unconfirmedFields": ["location", "summary", "amenities", "external_booking_url"]}'::jsonb),
  ('corporate', 'hospitality', 'business-stay-residence', '[DEMO] Business Stay Residence', 'Yaoundé (tbc)', 'Property details to be confirmed.', '{"isDemo": true, "unconfirmedFields": ["location", "summary", "amenities", "external_booking_url"]}'),
  ('corporate', 'hospitality', 'family-short-stay-apartment', '[DEMO] Family Short-Stay Apartment', 'Yaoundé (tbc)', 'Property details to be confirmed.', '{"isDemo": true, "unconfirmedFields": ["location", "summary", "amenities", "external_booking_url"]}')
) as v(site, world, slug, name, location, summary, provenance)
where not exists (select 1 from public.properties p where p.site = v.site and p.slug = v.slug);

-- Demo editorial drafts
insert into public.articles (site, world, slug, title, excerpt, category, status, provenance)
select * from (values
  ('corporate'::public.site_id, 'corporate'::public.world, 'demo-insight-one', '[DEMO] Insight article', 'Placeholder insight article pending editorial.', 'News', 'draft'::public.content_status, '{"isDemo": true}'::jsonb),
  ('corporate', 'corporate', 'demo-insight-two', '[DEMO] Insight article two', 'Placeholder insight article pending editorial.', 'News', 'draft', '{"isDemo": true}')
) as v(site, world, slug, title, excerpt, category, status, provenance)
where not exists (select 1 from public.articles a where a.site = v.site and a.slug = v.slug);

insert into public.stories (site, world, slug, title, excerpt, type, status, provenance)
select * from (values
  ('vti'::public.site_id, 'vti'::public.world, 'demo-story-trainee', '[DEMO] Trainee story', 'Beneficiary story to be collected and verified.', 'beneficiary'::public.story_type, 'draft'::public.content_status, '{"isDemo": true}'::jsonb),
  ('corporate', 'corporate', 'demo-story-enterprise', '[DEMO] Enterprise story', 'Enterprise case study to be collected and verified.', 'enterprise', 'draft', '{"isDemo": true}')
) as v(site, world, slug, title, excerpt, type, status, provenance)
where not exists (select 1 from public.stories s where s.site = v.site and s.slug = v.slug);

-- Legal placeholder pages per §4 (CONTENT TO BE CONFIRMED)
insert into public.pages (site, world, path, title, sections, status, provenance)
select s.site, s.world, p.path, p.title, '[]'::jsonb, 'draft',
  '{"isDemo": true, "unconfirmedFields": ["sections"]}'::jsonb
from (values
  ('corporate'::public.site_id, 'corporate'::public.world),
  ('vti', 'vti'),
  ('startup', 'startup')
) as s(site, world)
cross join (values ('/privacy'::text, '[CONTENT TO BE CONFIRMED] Privacy'::text), ('/terms', '[CONTENT TO BE CONFIRMED] Terms')) as p(path, title)
on conflict (site, path, locale) do nothing;

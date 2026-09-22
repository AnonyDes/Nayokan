-- Phase 9, slice 3: seed impact metrics as DRAFTS with no values
-- (readiness §9 governance note: "metrics are seeded as drafts with no
-- values"). Every figure on the public site must earn verification first;
-- these rows exist so the admin list has shape, not so they can publish.

insert into public.impact_metrics (slug, name, description, unit, world, reporting_scope, status, is_public, provenance)
values
  ('people-trained', 'People trained', 'Total learners completing a VTI programme.', 'people', 'vti', 'Cameroon · nationwide', 'draft', false, '{"isDemo": true, "unconfirmedFields": ["description", "reporting_scope"]}'::jsonb),
  ('enterprises-supported', 'Enterprises supported', 'Enterprises receiving structured support.', 'enterprises', 'startup', 'Cameroon · nationwide', 'draft', false, '{"isDemo": true, "unconfirmedFields": ["description"]}'::jsonb),
  ('cluster-members', 'Cluster members', 'Active members across VTI clusters.', 'people', 'vti', 'Cameroon · nationwide', 'draft', false, '{"isDemo": true, "unconfirmedFields": ["description"]}'::jsonb),
  ('active-mentors', 'Active mentors', 'Mentors currently engaged with founders.', 'people', 'startup', 'Cameroon · nationwide', 'draft', false, '{"isDemo": true, "unconfirmedFields": ["description"]}'::jsonb),
  ('ventures-in-portfolio', 'Ventures in portfolio', 'Ventures held in the venture capital portfolio.', 'ventures', 'venture_capital', 'Cameroon · nationwide', 'draft', false, '{"isDemo": true, "unconfirmedFields": ["description"]}'::jsonb),
  ('certificates-awarded', 'Certificates awarded', 'Certificates issued on programme completion.', 'certificates', 'vti', 'Cameroon · nationwide', 'draft', false, '{"isDemo": true, "unconfirmedFields": ["description"]}'::jsonb);

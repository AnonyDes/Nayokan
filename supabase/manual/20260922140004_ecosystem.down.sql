-- Reverses 20260922140004_ecosystem.sql. DANGER: destroys partner/people/
-- venture/property data and placements.
drop table if exists public.property_media;
drop table if exists public.properties;
drop table if exists public.venture_placements;
drop table if exists public.ventures;
drop table if exists public.person_placements;
drop table if exists public.people;
drop table if exists public.partner_placements;
drop table if exists public.partners;
drop function if exists app.guard_partner_placement_public();
drop type if exists public.listing_status;
drop type if exists public.partner_category;

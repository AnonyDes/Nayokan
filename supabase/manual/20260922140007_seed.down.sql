-- Reverses 20260922140007_seed.sql. Removes seeded rows only.
delete from public.pages where (provenance->>'isDemo')::boolean;
delete from public.stories where (provenance->>'isDemo')::boolean;
delete from public.articles where (provenance->>'isDemo')::boolean;
delete from public.properties where (provenance->>'isDemo')::boolean;
delete from public.ventures where (provenance->>'isDemo')::boolean;
delete from public.people where (provenance->>'isDemo')::boolean;
delete from public.partner_placements;
delete from public.partners where (provenance->>'isDemo')::boolean;
delete from public.mentors where (provenance->>'isDemo')::boolean;
delete from public.opportunities where (provenance->>'isDemo')::boolean;
delete from public.clusters where (provenance->>'isDemo')::boolean;
delete from public.programmes where (provenance->>'isDemo')::boolean;
delete from public.site_home_sections;
delete from public.navigation_items;
delete from public.site_settings;

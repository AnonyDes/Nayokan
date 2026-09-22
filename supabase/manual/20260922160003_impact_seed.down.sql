-- Reverses 20260922160003_impact_seed.sql. Removes seeded demo metrics.
delete from public.impact_metrics where (provenance->>'isDemo')::boolean;

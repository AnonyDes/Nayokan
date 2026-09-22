# ADR-002: Supabase as database, auth, storage and scheduler

Status: Accepted (2026-09-22)

## Context
The design package specifies a full custom Admin/CMS (editorial workflow, six roles, impact verification chain, append-only evidence and audit log, applications and enquiries). The docx specs suggested a headless CMS (Sanity/Strapi), which would need heavy customisation to express these governance rules.

## Decision
Supabase: Postgres with row-level security as the enforced authorization boundary, Supabase Auth with mandatory TOTP MFA for staff, Storage (`public-media` and `private` buckets), and `pg_cron` for scheduled publishing and opportunity auto-close. Patterns are ported from the MEMEX project (RLS helper functions in an `app` schema, one policy per operation, SECURITY DEFINER RPCs for anonymous submissions with DB rate limiting, RLS test suite with two-fixture isolation tests, grant-matrix test).

## Consequences
- Governance rules (unverified metrics can never be public; evidence and audit log are append-only) live in the database, not only in UI code.
- Tests that need a database run against a dedicated test project, never production.

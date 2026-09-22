-- Dry-run of 20260922130001_helpers_and_enums.sql: validates against a live
-- project and rolls back. Run with: node scripts/db-dryrun.mjs <file> (or
-- paste into the SQL editor and abandon the transaction).
begin;
\ir ../migrations/20260922130001_helpers_and_enums.sql
rollback;

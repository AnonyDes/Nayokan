-- Reverses 20260922140006_content_rls.sql. Leaves every content table
-- WITHOUT policies — only ever run before dropping those tables.
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and policyname like '%_public_read' or policyname like '%_staff'
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

grant execute on function app.expire_opportunities() to public, anon;
grant execute on function app.can_read_private_object(text) to public, anon;
grant execute on function app.guard_programme_open() to public, anon, authenticated;
grant execute on function app.guard_partner_placement_public() to public, anon, authenticated;

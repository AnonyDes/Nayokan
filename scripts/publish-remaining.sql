do $$
declare
  r record;
  t text;
begin
  perform set_config('request.jwt.claims', '{"sub":"b06edce7-fa69-4960-9fff-e8dcf4f023da"}', true);
  foreach t in array array['mentors','ventures','partners','people'] loop
    for r in execute 'select id from public.' || t loop
      begin
        perform transition_content(t, r.id, 'submit');
        perform transition_content(t, r.id, 'approve');
        perform transition_content(t, r.id, 'publish');
      exception when others then
        raise notice '% %: %', t, r.id, sqlerrm;
      end;
    end loop;
  end loop;
end $$;

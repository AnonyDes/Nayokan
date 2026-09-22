-- Reverses 20260922130005_profiles_self_update_guard.sql.
grant update on public.profiles to authenticated;
drop trigger if exists profiles_guard_privileged_columns on public.profiles;
drop function if exists app.guard_profile_privileged_columns();

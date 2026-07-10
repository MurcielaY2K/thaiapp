-- Sanuk Thai — self-serve account deletion (App Store / Google Play requirement)
-- Run in Supabase: SQL Editor → New query → paste → Run
--
-- Deleting the auth.users row cascades through every user table via the
-- existing foreign keys:
--   profiles (auth_id … on delete cascade) → scores (profile_id … cascade)
--   progress_sync (auth_id … cascade)
--   entitlements (auth_id … cascade)
--
-- NOTE: this does NOT cancel an active Stripe subscription — Stripe keeps
-- billing a customer that no longer maps to an account. The in-app deletion
-- screen warns the user to cancel first; watch for orphaned webhook updates
-- ("update … eq stripe_subscription_id" simply matching zero rows is fine).

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
-- Empty search path: with SECURITY DEFINER, never resolve names through a
-- caller-controlled path. All references below are schema-qualified.
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

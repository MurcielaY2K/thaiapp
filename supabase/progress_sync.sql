-- Thai App — cloud progress sync + account recovery
-- Run in Supabase: SQL Editor → New query → paste → Run
--
-- ALSO REQUIRED (dashboard, once):
--   Authentication → URL Configuration →
--     Site URL:          https://murcielay2k.github.io/sanuk-thai/
--     Redirect URLs: add https://murcielay2k.github.io/sanuk-thai/
--   Authentication → Providers → Email: enabled (magic link / OTP).
--
-- The app stores each user's learning progress as a single JSON snapshot,
-- owner-readable and owner-writable only. A SECURITY DEFINER function lets a
-- signed-in user fetch their own profile row even though profiles.auth_id is
-- hidden from clients (see hardening.sql H1).

-- ---------------------------------------------------------------------------
-- 1. Snapshot table
-- ---------------------------------------------------------------------------
create table if not exists public.progress_sync (
  auth_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.progress_sync enable row level security;

drop policy if exists "owner select" on public.progress_sync;
create policy "owner select" on public.progress_sync
  for select using (auth.uid() = auth_id);

drop policy if exists "owner insert" on public.progress_sync;
create policy "owner insert" on public.progress_sync
  for insert with check (auth.uid() = auth_id);

drop policy if exists "owner update" on public.progress_sync;
create policy "owner update" on public.progress_sync
  for update using (auth.uid() = auth_id) with check (auth.uid() = auth_id);

drop policy if exists "owner delete" on public.progress_sync;
create policy "owner delete" on public.progress_sync
  for delete using (auth.uid() = auth_id);

-- Size guard: a legit snapshot (2,700 SRS entries + lesson map) is well under
-- 300 KB; reject anything bigger so the table can't be used as free storage.
create or replace function public.progress_sync_size_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if pg_column_size(new.data) > 300 * 1024 then
    raise exception 'progress snapshot too large';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists progress_sync_size_trg on public.progress_sync;
create trigger progress_sync_size_trg
  before insert or update on public.progress_sync
  for each row execute function public.progress_sync_size_guard();

-- ---------------------------------------------------------------------------
-- 2. Fetch own profile despite the hidden auth_id column (new-device restore)
-- ---------------------------------------------------------------------------
create or replace function public.my_profile()
returns table (
  id            uuid,
  username      text,
  display_name  text,
  avatar_emoji  text,
  country_flag  text,
  bio           text,
  profile_frame text
)
language sql
security definer
stable
set search_path = public
as $$
  select p.id, p.username, p.display_name, p.avatar_emoji,
         p.country_flag, p.bio, p.profile_frame
  from public.profiles p
  where p.auth_id = auth.uid();
$$;

revoke all on function public.my_profile() from public, anon;
grant execute on function public.my_profile() to authenticated;

-- ============================================================================
-- Sanuk Thai — ONE-PASTE Supabase setup
-- ============================================================================
-- Paste this whole file into the Supabase SQL Editor and press Run. It creates
-- every table, policy, constraint, function and index the app needs, in the
-- right order. Safe to re-run (idempotent).
--
-- It combines: schema.sql + hardening.sql + entitlements.sql +
-- progress_sync.sql + delete_account.sql. You do NOT need to run those
-- separately if you run this file.
--
-- AFTER running this, finish in the dashboard (can't be done in SQL):
--   Authentication → Providers → Anonymous  → Enable
--   Authentication → Providers → Email       → Enable (magic link / OTP)
--   Authentication → URL Configuration →
--       Site URL:      https://murcielay2k.github.io/sanuk-thai/
--       Redirect URLs: https://murcielay2k.github.io/sanuk-thai/
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key default uuid_generate_v4(),
  auth_id       uuid references auth.users(id) on delete cascade,
  username      text unique not null,
  display_name  text not null,
  avatar_emoji  text not null default 'px:naga',
  country_flag  text not null default 'world',
  bio           text default '',
  profile_frame text default 'default',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists public.scores (
  id                uuid primary key default uuid_generate_v4(),
  profile_id        uuid references public.profiles(id) on delete cascade unique,
  xp                integer default 0,
  streak            integer default 0,
  words_mastered    integer default 0,
  lessons_completed integer default 0,
  updated_at        timestamptz default now()
);

create table if not exists public.entitlements (
  auth_id                uuid primary key references auth.users(id) on delete cascade,
  status                 text not null default 'none'
                         check (status in ('none', 'active', 'past_due', 'canceled')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_end     timestamptz,
  updated_at             timestamptz default now()
);

create table if not exists public.progress_sync (
  auth_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.scores        enable row level security;
alter table public.entitlements  enable row level security;
alter table public.progress_sync enable row level security;

-- profiles: public row read, owner writes, owner delete
drop policy if exists "public read profiles" on public.profiles;
create policy "public read profiles" on public.profiles for select using (true);
drop policy if exists "owner insert profile" on public.profiles;
create policy "owner insert profile" on public.profiles for insert with check (auth.uid() = auth_id);
drop policy if exists "owner update profile" on public.profiles;
create policy "owner update profile" on public.profiles for update using (auth.uid() = auth_id);
drop policy if exists "owner delete profile" on public.profiles;
create policy "owner delete profile" on public.profiles for delete using (auth.uid() = auth_id);

-- scores: public read, owner writes
drop policy if exists "public read scores" on public.scores;
create policy "public read scores" on public.scores for select using (true);
drop policy if exists "owner insert score" on public.scores;
create policy "owner insert score" on public.scores for insert
  with check (profile_id in (select id from public.profiles where auth_id = auth.uid()));
drop policy if exists "owner update score" on public.scores;
create policy "owner update score" on public.scores for update
  using (profile_id in (select id from public.profiles where auth_id = auth.uid()));

-- entitlements: owner may READ only. No client write policy — the Stripe
-- webhook uses the service role (bypasses RLS). Clients can't self-grant.
drop policy if exists "owner read entitlement" on public.entitlements;
create policy "owner read entitlement" on public.entitlements for select using (auth.uid() = auth_id);

-- progress_sync: owner full access to own row only
drop policy if exists "owner select" on public.progress_sync;
create policy "owner select" on public.progress_sync for select using (auth.uid() = auth_id);
drop policy if exists "owner insert" on public.progress_sync;
create policy "owner insert" on public.progress_sync for insert with check (auth.uid() = auth_id);
drop policy if exists "owner update" on public.progress_sync;
create policy "owner update" on public.progress_sync for update using (auth.uid() = auth_id) with check (auth.uid() = auth_id);
drop policy if exists "owner delete" on public.progress_sync;
create policy "owner delete" on public.progress_sync for delete using (auth.uid() = auth_id);

-- ---------------------------------------------------------------------------
-- H1: hide profiles.auth_id from clients (row read stays public, column doesn't)
-- ---------------------------------------------------------------------------
revoke select on public.profiles from anon, authenticated;
grant select (id, username, display_name, avatar_emoji, country_flag,
              bio, profile_frame, created_at)
  on public.profiles to anon, authenticated;

-- ---------------------------------------------------------------------------
-- C3a: server-side input limits (idempotent — drop then add)
-- ---------------------------------------------------------------------------
do $$
begin
  alter table public.profiles drop constraint if exists username_length;
  alter table public.profiles drop constraint if exists username_format;
  alter table public.profiles drop constraint if exists display_name_len;
  alter table public.profiles drop constraint if exists bio_len;
  alter table public.profiles drop constraint if exists avatar_len;
  alter table public.profiles drop constraint if exists flag_len;
  alter table public.profiles drop constraint if exists frame_len;
  alter table public.profiles
    add constraint username_length  check (char_length(username) between 3 and 20) not valid,
    add constraint username_format  check (username ~ '^[a-z0-9_.-]+$')            not valid,
    add constraint display_name_len check (char_length(display_name) <= 40)        not valid,
    add constraint bio_len          check (char_length(bio) <= 140)                not valid,
    add constraint avatar_len       check (char_length(avatar_emoji) <= 8)         not valid,
    add constraint flag_len         check (char_length(country_flag) <= 8)         not valid,
    add constraint frame_len        check (char_length(profile_frame) <= 32)       not valid;
end $$;

-- ---------------------------------------------------------------------------
-- C3b: clamp leaderboard scores to plausible values
-- ---------------------------------------------------------------------------
create or replace function public.clamp_score()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.xp                := least(greatest(coalesce(new.xp, 0), 0), 1000000);
  new.streak            := least(greatest(coalesce(new.streak, 0), 0), 3650);
  new.words_mastered    := least(greatest(coalesce(new.words_mastered, 0), 0), 5000);
  new.lessons_completed := least(greatest(coalesce(new.lessons_completed, 0), 0), 1000);
  if tg_op = 'UPDATE' and new.xp > old.xp + 2000 then
    new.xp := old.xp + 2000;
  end if;
  return new;
end;
$$;

drop trigger if exists clamp_score_trg on public.scores;
create trigger clamp_score_trg
  before insert or update on public.scores
  for each row execute function public.clamp_score();

-- ---------------------------------------------------------------------------
-- progress_sync: size guard (reject snapshots > 300 KB)
-- ---------------------------------------------------------------------------
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
-- Leaderboard view (public; excludes auth_id)
-- ---------------------------------------------------------------------------
create or replace view public.leaderboard as
select
  p.id            as profile_id,
  p.username,
  p.display_name,
  p.avatar_emoji,
  p.country_flag,
  p.profile_frame,
  s.xp,
  s.streak,
  s.words_mastered,
  s.lessons_completed,
  rank() over (order by s.xp desc) as rank
from public.profiles p
join public.scores s on s.profile_id = p.id;

-- ---------------------------------------------------------------------------
-- Fetch own profile despite the hidden auth_id column (new-device restore)
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

-- ---------------------------------------------------------------------------
-- Self-serve account deletion (App Store / Google Play requirement).
-- Deleting the auth user cascades to profile → scores, progress_sync,
-- entitlements. Does NOT cancel a Stripe subscription (the app warns first).
-- ---------------------------------------------------------------------------
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
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

-- ---------------------------------------------------------------------------
-- Lookup indexes for the Stripe webhook
-- ---------------------------------------------------------------------------
create index if not exists entitlements_subscription_idx on public.entitlements (stripe_subscription_id);
create index if not exists entitlements_customer_idx     on public.entitlements (stripe_customer_id);

-- Done. Now enable Anonymous + Email auth and set the URL config (see top).

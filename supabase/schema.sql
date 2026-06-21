-- Thai App — Supabase schema
-- Run this in your Supabase project: SQL Editor → New query → paste → Run

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Profiles
create table public.profiles (
  id            uuid primary key default uuid_generate_v4(),
  auth_id       uuid references auth.users(id) on delete cascade,
  username      text unique not null,
  display_name  text not null,
  avatar_emoji  text not null default '🐉',
  country_flag  text not null default '🌍',
  bio           text default '',
  profile_frame text default 'default',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 3. Scores (one row per user, upserted on sync)
create table public.scores (
  id                uuid primary key default uuid_generate_v4(),
  profile_id        uuid references public.profiles(id) on delete cascade unique,
  xp                integer default 0,
  streak            integer default 0,
  words_mastered    integer default 0,
  lessons_completed integer default 0,
  updated_at        timestamptz default now()
);

-- 4. Row Level Security
alter table public.profiles enable row level security;
alter table public.scores   enable row level security;

-- Anyone can read (leaderboard is public)
create policy "public read profiles" on public.profiles for select using (true);
create policy "public read scores"   on public.scores   for select using (true);

-- Owner can insert/update their own profile
create policy "owner insert profile" on public.profiles for insert
  with check (auth.uid() = auth_id);
create policy "owner update profile" on public.profiles for update
  using (auth.uid() = auth_id);

-- Owner can insert/update their score
create policy "owner insert score" on public.scores for insert
  with check (
    profile_id in (select id from public.profiles where auth_id = auth.uid())
  );
create policy "owner update score" on public.scores for update
  using (
    profile_id in (select id from public.profiles where auth_id = auth.uid())
  );

-- 5. Leaderboard view
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

-- 6. Enable anonymous sign-in
-- Go to: Authentication → Providers → Anonymous → Enable

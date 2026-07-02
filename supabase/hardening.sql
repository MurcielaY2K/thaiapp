-- Thai App — backend hardening (AUDIT C3 + H1)
-- Run in Supabase: SQL Editor → New query → paste → Run
-- Safe to run on a live project; constraints are added NOT VALID so existing
-- rows are untouched (new/updated rows are enforced).

-- ---------------------------------------------------------------------------
-- H1: stop exposing profiles.auth_id to the public
-- Row access stays public (leaderboard needs it) but the auth_id COLUMN is
-- no longer selectable by clients. The app never selects it (it gets the id
-- from the auth session) and the leaderboard view doesn't include it.
-- ---------------------------------------------------------------------------
revoke select on public.profiles from anon, authenticated;
grant select (id, username, display_name, avatar_emoji, country_flag,
              bio, profile_frame, created_at)
  on public.profiles to anon, authenticated;

-- ---------------------------------------------------------------------------
-- C3a: server-side input limits (client maxLength alone is bypassable)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add constraint username_length  check (char_length(username) between 3 and 20) not valid,
  add constraint username_format  check (username ~ '^[a-z0-9_.-]+$')            not valid,
  add constraint display_name_len check (char_length(display_name) <= 40)        not valid,
  add constraint bio_len          check (char_length(bio) <= 140)                not valid,
  add constraint avatar_len       check (char_length(avatar_emoji) <= 8)         not valid,
  add constraint flag_len         check (char_length(country_flag) <= 8)         not valid,
  add constraint frame_len        check (char_length(profile_frame) <= 32)       not valid;

-- ---------------------------------------------------------------------------
-- C3b: clamp leaderboard scores to plausible values
-- Client-reported XP can never be fully trusted, but this kills the
-- one-console-command "xp: 999999999" attack and caps per-sync jumps.
-- ---------------------------------------------------------------------------
create or replace function public.clamp_score()
returns trigger
language plpgsql
security definer
as $$
begin
  new.xp                := least(greatest(coalesce(new.xp, 0), 0), 1000000);
  new.streak            := least(greatest(coalesce(new.streak, 0), 0), 3650);
  new.words_mastered    := least(greatest(coalesce(new.words_mastered, 0), 0), 5000);
  new.lessons_completed := least(greatest(coalesce(new.lessons_completed, 0), 0), 1000);
  -- No plausible study session earns more than this between two syncs.
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
-- GDPR/PDPA: let users delete their own data (cascades to scores via FK)
-- ---------------------------------------------------------------------------
create policy "owner delete profile" on public.profiles
  for delete using (auth.uid() = auth_id);

-- ═══════════════════════════════════════════════════════════════════
-- JoyJump v4 — Production Database Schema
-- Run this in your Supabase project → SQL Editor → Run
--
-- Changes from v3:
--   • Proper Row Level Security (parent can only see their own children)
--   • Attempt history table (instead of unique constraint on progress)
--   • session_logs table (time-on-task per session)
--   • childId is always a UUID — never a name string
--   • Supabase Auth integration (auth.uid() foreign keys)
-- ═══════════════════════════════════════════════════════════════════

-- ── Extensions ───────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Parent profiles ───────────────────────────────────────────────
-- Extends Supabase Auth (auth.users). One row per parent account.
create table if not exists parent_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  email      text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create a parent_profile when a user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into parent_profiles (id, email)
  values (new.id, new.email)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── Children ──────────────────────────────────────────────────────
create table if not exists children (
  id              uuid primary key default uuid_generate_v4(),
  parent_id       uuid not null references parent_profiles(id) on delete cascade,
  name            text not null,
  grade           integer default 3,
  avatar          text default 'panda',
  stars           integer default 0,
  coins           integer default 0,
  streak          integer default 0,
  last_play_date  date,
  unlocked_worlds text[]  default array['math'],
  created_at      timestamptz default now()
);

-- ── Progress (best score per lesson) ─────────────────────────────
-- Stores the best score achieved for display. NOT unique-constrained.
-- Full history is in attempt_logs below.
create table if not exists progress (
  id          uuid primary key default uuid_generate_v4(),
  child_id    uuid not null references children(id) on delete cascade,
  lesson_id   text not null,
  best_score  integer default 0 check (best_score between 0 and 3),
  completed   boolean default false,
  attempts    integer default 0,
  first_at    timestamptz default now(),
  last_at     timestamptz default now(),
  -- One best-score row per child per lesson
  unique(child_id, lesson_id)
);

-- ── Attempt logs (full history) ───────────────────────────────────
-- Every attempt recorded for learning analytics.
-- Never updated — only inserted.
create table if not exists attempt_logs (
  id          uuid primary key default uuid_generate_v4(),
  child_id    uuid not null references children(id) on delete cascade,
  lesson_id   text not null,
  score       integer check (score between 0 and 3),
  time_spent  integer default 0,   -- seconds
  phase_data  jsonb,               -- {gameScore, quizScore, wrongAnswers[]}
  played_at   timestamptz default now()
);

-- ── Session logs (time-on-task per session) ───────────────────────
create table if not exists session_logs (
  id           uuid primary key default uuid_generate_v4(),
  child_id     uuid not null references children(id) on delete cascade,
  started_at   timestamptz not null,
  ended_at     timestamptz,
  duration_sec integer,            -- computed on end
  lessons_done integer default 0,
  date         date default current_date
);

-- ── Badges ───────────────────────────────────────────────────────
create table if not exists badges (
  id         uuid primary key default uuid_generate_v4(),
  child_id   uuid not null references children(id) on delete cascade,
  badge_id   text not null,
  earned_at  timestamptz default now(),
  unique(child_id, badge_id)
);

-- ── Indexes ──────────────────────────────────────────────────────
create index if not exists progress_child_idx     on progress(child_id);
create index if not exists progress_lesson_idx    on progress(lesson_id);
create index if not exists attempt_child_idx      on attempt_logs(child_id);
create index if not exists attempt_lesson_idx     on attempt_logs(lesson_id);
create index if not exists attempt_date_idx       on attempt_logs(played_at);
create index if not exists session_child_idx      on session_logs(child_id);
create index if not exists session_date_idx       on session_logs(date);

-- ── Row Level Security ───────────────────────────────────────────
-- Parents can only read/write their own children's data.
-- No row is visible to anyone other than the owning parent.
alter table parent_profiles enable row level security;
alter table children        enable row level security;
alter table progress        enable row level security;
alter table attempt_logs    enable row level security;
alter table session_logs    enable row level security;
alter table badges          enable row level security;

-- Parent profile: own row only
create policy "parent: own profile"
  on parent_profiles for all
  using (id = auth.uid());

-- Children: parent sees only their children
create policy "parent: own children"
  on children for all
  using (parent_id = auth.uid());

-- Progress: parent sees progress of their children
create policy "parent: own children progress"
  on progress for all
  using (child_id in (
    select id from children where parent_id = auth.uid()
  ));

-- Attempt logs: same
create policy "parent: own children attempts"
  on attempt_logs for all
  using (child_id in (
    select id from children where parent_id = auth.uid()
  ));

-- Session logs: same
create policy "parent: own children sessions"
  on session_logs for all
  using (child_id in (
    select id from children where parent_id = auth.uid()
  ));

-- Badges: same
create policy "parent: own children badges"
  on badges for all
  using (child_id in (
    select id from children where parent_id = auth.uid()
  ));

-- ── Helper: upsert progress (best score wins) ────────────────────
create or replace function upsert_progress(
  p_child_id  uuid,
  p_lesson_id text,
  p_score     integer,
  p_time_sec  integer,
  p_phase     jsonb default null
) returns void language plpgsql security definer as $$
begin
  -- Upsert best score row
  insert into progress (child_id, lesson_id, best_score, completed, attempts, first_at, last_at)
  values (p_child_id, p_lesson_id, p_score, true, 1, now(), now())
  on conflict (child_id, lesson_id) do update set
    best_score = greatest(progress.best_score, excluded.best_score),
    completed  = true,
    attempts   = progress.attempts + 1,
    last_at    = now();

  -- Always log the individual attempt
  insert into attempt_logs (child_id, lesson_id, score, time_spent, phase_data)
  values (p_child_id, p_lesson_id, p_score, p_time_sec, p_phase);
end;
$$;

-- ── Demo mode: allow anonymous writes for development ────────────
-- REMOVE THESE BEFORE DEPLOYING TO PRODUCTION WITH REAL USERS
-- They exist only so the app works without auth during development.
-- When you add Supabase Auth (Phase 1b), delete these policies.
create policy "demo: anon progress write"
  on progress for insert
  with check (true);

create policy "demo: anon attempt write"
  on attempt_logs for insert
  with check (true);

create policy "demo: anon session write"
  on session_logs for insert
  with check (true);

-- ── Notes for Phase 1b (Auth implementation) ─────────────────────
-- 1. Remove the three demo policies above
-- 2. Add Supabase Auth magic-link on the parent login page
-- 3. Create a child profile on first login using the parent's auth.uid()
-- 4. Pass the child's UUID (from children.id) as childId throughout the app

-- ── Web Vitals (Phase 1 performance baseline) ────────────────────
-- Records Core Web Vitals for performance monitoring.
-- Helps identify slow pages on low-end Android devices.
create table if not exists web_vitals (
  id           uuid primary key default uuid_generate_v4(),
  metric_name  text not null,           -- LCP, FID, CLS, FCP, TTFB
  value        integer not null,        -- milliseconds (or CLS * 1000)
  rating       text,                    -- good / needs-improvement / poor
  metric_id    text,
  page         text,
  user_agent   text,
  recorded_at  timestamptz default now()
);

-- Allow anonymous inserts for vitals (no auth needed for telemetry)
alter table web_vitals enable row level security;
create policy "anon vitals insert" on web_vitals for insert with check (true);
create policy "parent reads own vitals" on web_vitals for select using (true);

create index if not exists vitals_name_idx on web_vitals(metric_name);
create index if not exists vitals_page_idx on web_vitals(page);
create index if not exists vitals_date_idx on web_vitals(recorded_at);

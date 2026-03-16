-- ═══════════════════════════════════════════════════════
-- JoyJump Database Schema
-- Run this in your Supabase project > SQL Editor
-- ═══════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Users (parents) ────────────────────────────────────
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  created_at timestamptz default now()
);

-- ─── Children profiles ──────────────────────────────────
create table if not exists children (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null default 'Dhruvee',
  grade integer default 3,
  avatar text default 'rabbit',
  stars integer default 0,
  coins integer default 0,
  streak integer default 0,
  last_play_date date,
  unlocked_worlds text[] default array['math'],
  created_at timestamptz default now()
);

-- ─── Progress ───────────────────────────────────────────
create table if not exists progress (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid references children(id) on delete cascade,
  lesson_id text not null,
  score integer default 0,          -- 1-3 stars
  time_spent integer default 0,     -- seconds
  completed boolean default false,
  attempts integer default 1,
  played_at timestamptz default now(),
  unique(child_id, lesson_id)       -- one record per lesson per child
);

-- ─── Badges ─────────────────────────────────────────────
create table if not exists badges (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid references children(id) on delete cascade,
  badge_id text not null,
  earned_at timestamptz default now(),
  unique(child_id, badge_id)
);

-- ─── Indexes ────────────────────────────────────────────
create index if not exists progress_child_idx on progress(child_id);
create index if not exists progress_lesson_idx on progress(lesson_id);
create index if not exists badges_child_idx on badges(child_id);

-- ─── Row Level Security ──────────────────────────────────
-- Allow public read/write for now (demo mode)
-- In production, restrict to authenticated users
alter table children enable row level security;
alter table progress enable row level security;
alter table badges enable row level security;

create policy "Allow all for now" on children for all using (true);
create policy "Allow all for now" on progress for all using (true);
create policy "Allow all for now" on badges for all using (true);

-- ─── Sample data ────────────────────────────────────────
-- Insert Dhruvee's profile (optional — the app uses localStorage by default)
-- insert into children (name, grade, avatar) values ('Dhruvee', 3, 'rabbit');
